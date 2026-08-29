'use client';

import {
  BackendStatus,
  QueuedOperation,
  DataFetchResult,
  IncidentReport,
  DataClassification,
  NetworkMetricsState,
} from './continuity-types';
import { Shipment, ShipmentStatus, ScheduledTrip, Stop, Route, Bus, Depot, CourierCompany } from './types';
import {
  DEMO_ACTIVE_TASK_ID,
  DEMO_CACHED_TASK_ID,
  DEMO_UNCACHED_TASK_IDS,
  DEMO_ACTIVE_SHIPMENT,
  DEMO_CACHED_SHIPMENT,
} from './mock-data';
import {
  getStoredBackendStatus,
  getAllActiveTasks,
  saveActiveTask,
  getAllActiveTrips,
  saveActiveTrips,
  saveActiveTrip,
  clearActiveTrips,
  getAllQueuedOperations,
  enqueueOperation,
  updateQueuedOperation,
  removeQueuedOperation,
  getCachedRecord,
  saveCachedRecord,
  getAllIncidents,
  saveIncident,
  setStoredLastSyncTime,
} from './continuity-db';

/**
 * Generate a unique idempotency key
 */
export function generateIdempotencyKey(prefix = 'idem'): string {
  const rand = Math.random().toString(36).substring(2, 9);
  const time = Date.now().toString(36);
  return `${prefix}_${time}_${rand}`;
}

/**
 * Generate unique operation ID
 */
export function generateOperationId(): string {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `OP-${num}`;
}

/**
 * Resilient Data Access Layer
 * Enforces Read & Write policy across STATIC_CACHE, ACTIVE_LOCAL, and SERVER_ONLY data.
 */
export class DataRepository {
  /**
   * Classify a shipment entity into STATIC_CACHE, ACTIVE_LOCAL, or SERVER_ONLY
   */
  static classifyShipment(shipmentId: string, activeTaskIds: string[]): DataClassification {
    if (
      shipmentId === DEMO_ACTIVE_TASK_ID ||
      activeTaskIds.includes(shipmentId) ||
      shipmentId.startsWith('shp-local-') ||
      shipmentId.startsWith('shp-17') ||
      shipmentId.startsWith('shp-') && !DEMO_UNCACHED_TASK_IDS.includes(shipmentId) && shipmentId !== DEMO_CACHED_TASK_ID
    ) {
      return 'ACTIVE_LOCAL';
    }
    if (shipmentId === DEMO_CACHED_TASK_ID) {
      return 'STATIC_CACHE';
    }
    return 'SERVER_ONLY';
  }

  /**
   * Snapshot all IN_TRANSIT trips across the entire network at blackout time
   */
  static snapshotActiveTrips(allTrips: ScheduledTrip[]): ScheduledTrip[] {
    return allTrips
      .filter((t) => t.tripStatus === 'IN_TRANSIT')
      .map((t) => ({
        ...t,
        currentLocation: t.currentLocation || {
          latitude: 19.6012,
          longitude: 74.2114,
          betweenStopIds: ['STP001', 'STP004'] as [string, string],
        },
      }));
  }

  /**
   * Fetch all visible shipments according to Blackout Read Policy
   * When OFFLINE: Returns ONLY ACTIVE_LOCAL tasks and STATIC_CACHE (cached snapshot).
   * SERVER_ONLY records are withheld to model complete datastore unavailability.
   */
  static async getVisibleShipments(
    allShipments: Shipment[],
    backendStatus: BackendStatus
  ): Promise<{
    visibleShipments: Shipment[];
    activeCount: number;
    cachedCount: number;
    hiddenServerOnlyCount: number;
  }> {
    if (backendStatus === 'ONLINE') {
      return {
        visibleShipments: allShipments,
        activeCount: allShipments.filter((s) => s.id === DEMO_ACTIVE_TASK_ID).length,
        cachedCount: 0,
        hiddenServerOnlyCount: 0,
      };
    }

    // OFFLINE: Read strictly from local continuity store & static cache
    const activeTasks = await getAllActiveTasks();
    const activeMap = new Map(activeTasks.map((t) => [t.id, t]));

    // Ensure baseline active task is available
    if (!activeMap.has(DEMO_ACTIVE_TASK_ID)) {
      activeMap.set(DEMO_ACTIVE_TASK_ID, DEMO_ACTIVE_SHIPMENT);
    }

    const visible: Shipment[] = Array.from(activeMap.values());

    // Add cached snapshot (Shipment #470)
    const cachedSnap = await getCachedRecord(DEMO_CACHED_TASK_ID);
    const cachedData = cachedSnap?.data || DEMO_CACHED_SHIPMENT;
    if (!visible.some((s) => s.id === cachedData.id)) {
      visible.push(cachedData);
    }

    const hiddenCount = allShipments.filter(
      (s) => !visible.some((v) => v.id === s.id)
    ).length;

    return {
      visibleShipments: visible,
      activeCount: activeMap.size,
      cachedCount: 1,
      hiddenServerOnlyCount: hiddenCount,
    };
  }

  /**
   * Fetch an individual shipment by ID with strict Blackout Read Policy
   */
  static async getShipmentById(
    id: string,
    allShipments: Shipment[],
    backendStatus: BackendStatus
  ): Promise<DataFetchResult<Shipment>> {
    // 1. If Online, fetch directly from master state
    if (backendStatus === 'ONLINE') {
      const match = allShipments.find((s) => s.id === id);
      if (match) {
        return { data: match, classification: 'SERVER_ONLY', isAvailable: true };
      }
      return { error: 'Shipment record not found.' };
    }

    // 2. If Offline / Continuity Mode:
    const activeTasks = await getAllActiveTasks();
    const activeMatch =
      activeTasks.find((t) => t.id === id) ||
      (id === DEMO_ACTIVE_TASK_ID ? DEMO_ACTIVE_SHIPMENT : null);

    if (activeMatch) {
      return {
        data: activeMatch,
        classification: 'ACTIVE_LOCAL',
        isAvailable: true,
        isProtectedLocally: true,
        freshnessLabel: 'Protected locally on this device',
      };
    }

    // Check if it is a Cached Older Task (Shipment #470)
    if (id === DEMO_CACHED_TASK_ID) {
      const cached = await getCachedRecord(id);
      const snapshotData = cached?.data || DEMO_CACHED_SHIPMENT;
      return {
        data: snapshotData,
        classification: 'STATIC_CACHE',
        isAvailable: true,
        isCached: true,
        lastKnownTimestamp: '10:18 AM',
        freshnessLabel: 'Last known information · 10:18 AM',
      };
    }

    // All other records are SERVER_ONLY and UNAVAILABLE during blackout
    return {
      classification: 'SERVER_ONLY',
      isAvailable: false,
      isBackendUnavailable: true,
      error: 'The latest information is unavailable while the datastore is offline.',
    };
  }

  /**
   * Get Network Metrics with strict Blackout Read Policy
   * During blackout: Live server aggregates are withheld (null), local metrics remain.
   */
  static getNetworkMetrics(
    allShipments: Shipment[],
    backendStatus: BackendStatus,
    activeTasks: Shipment[],
    activeTrips: ScheduledTrip[],
    pendingQueue: QueuedOperation[]
  ): NetworkMetricsState {
    const pendingCount = pendingQueue.filter(
      (q) => q.status === 'PENDING' || q.status === 'NEEDS_REVIEW'
    ).length;

    if (backendStatus === 'SIMULATED_OFFLINE') {
      return {
        isLiveAvailable: false,
        totalRevenue: null, // Displays as "—"
        networkUtilizationPercentage: null, // Displays as "—"
        totalActiveTrips: null, // Displays as "—"
        activeProtectedTripsCount: activeTrips.length, // All in-transit buses protected
        activeProtectedTasksCount: Math.max(1, activeTasks.length),
        pendingSyncCount: pendingCount,
        freshnessLabel: `Continuity active · ${activeTrips.length} active in-transit trip(s) protected locally`,
      };
    }

    // ONLINE: Live calculations
    const revenue = allShipments.reduce(
      (sum, s) => sum + (s.status !== 'CANCELLED' ? s.fareAmount : 0),
      14300
    );

    return {
      isLiveAvailable: true,
      totalRevenue: revenue,
      networkUtilizationPercentage: 68,
      totalActiveTrips: 15,
      activeProtectedTripsCount: activeTrips.length,
      activeProtectedTasksCount: activeTasks.length,
      pendingSyncCount: pendingCount,
      freshnessLabel: 'Live server telemetry synchronized',
    };
  }

  /**
   * Get Scheduled Trips with strict Blackout Read Policy
   * During blackout: ALL IN_TRANSIT trips are retained from the local continuity store.
   * Remote moving GPS telemetry is halted; all active buses are rendered at their last confirmed positions.
   */
  static getVisibleTrips(
    allTrips: ScheduledTrip[],
    backendStatus: BackendStatus,
    storedActiveTrips: ScheduledTrip[] = []
  ): {
    trips: ScheduledTrip[];
    isLiveGps: boolean;
    activeTripId: string;
    telemetryNotice?: string;
  } {
    if (backendStatus === 'ONLINE') {
      return {
        trips: allTrips,
        isLiveGps: true,
        activeTripId: 'TRP001',
      };
    }

    // OFFLINE: Read ALL in-transit trips protected locally
    const inTransitSnapshot =
      storedActiveTrips.length > 0
        ? storedActiveTrips
        : allTrips.filter((t) => t.tripStatus === 'IN_TRANSIT');

    const staticTrips: ScheduledTrip[] = inTransitSnapshot.map((trip) => ({
      ...trip,
      currentLocation: trip.currentLocation || {
        latitude: 19.6012,
        longitude: 74.2114,
        betweenStopIds: ['STP001', 'STP004'] as [string, string],
      },
    }));

    return {
      trips: staticTrips,
      isLiveGps: false,
      activeTripId: staticTrips[0]?.id || 'TRP001',
      telemetryNotice: `Live GPS stream offline · Showing Last known position (10:31 AM) for ${staticTrips.length} active in-transit trip(s)`,
    };
  }

  /**
   * Check availability of historical modules
   */
  static checkModuleAvailability(
    moduleName: 'ANALYTICS' | 'INVOICES' | 'PARTNERS' | 'FLEET_DIAGNOSTICS',
    backendStatus: BackendStatus
  ): { isAvailable: boolean; message?: string } {
    if (backendStatus === 'ONLINE') {
      return { isAvailable: true };
    }

    const messages = {
      ANALYTICS: 'Live network analytics and historical revenue metrics are unavailable while the primary datastore is offline.',
      INVOICES: 'Historical invoice ledger and corporate billing records are unavailable while the primary datastore is offline.',
      PARTNERS: 'Partner onboarding records and verification database are unavailable while the primary datastore is offline.',
      FLEET_DIAGNOSTICS: 'Real-time vehicle hardware diagnostics and engine telemetry are unavailable while the datastore is offline.',
    };

    return {
      isAvailable: false,
      message: messages[moduleName] || 'Data is unavailable while the datastore is offline.',
    };
  }

  /**
   * Update shipment status (Mutations during Blackout)
   */
  static async updateShipmentStatus(
    shipmentId: string,
    newStatus: ShipmentStatus,
    locationRemarks: string | undefined,
    currentShipment: Shipment,
    backendStatus: BackendStatus,
    conductorName: string,
    depotLocation: string,
    verificationData?: {
      photoUrl?: string;
      latitude?: number;
      longitude?: number;
    }
  ): Promise<{ updatedShipment: Shipment; queuedOp?: QueuedOperation; isLocal: boolean }> {
    const timestamp = new Date().toISOString();
    const newHistoryItem = {
      status: newStatus,
      timestamp,
      location: depotLocation || 'Operational Bay',
      remarks: locationRemarks || `Status updated to ${newStatus} (${backendStatus === 'ONLINE' ? 'Server confirmed' : 'Protected locally'})`,
      photoUrl: verificationData?.photoUrl,
      latitude: verificationData?.latitude,
      longitude: verificationData?.longitude,
    };

    const updatedShipment: Shipment = {
      ...currentShipment,
      status: newStatus,
      statusHistory: [...currentShipment.statusHistory, newHistoryItem],
    };

    if (backendStatus === 'SIMULATED_OFFLINE') {
      // Save to IndexedDB active tasks
      await saveActiveTask(updatedShipment);

      // Create queued operation with unique idempotency key
      const operationId = generateOperationId();
      const idempotencyKey = generateIdempotencyKey(`status_${shipmentId}_${newStatus.toLowerCase()}`);

      const queuedOp: QueuedOperation = {
        operation_id: operationId,
        operation_type: 'UPDATE_SHIPMENT_STATUS',
        entity_id: shipmentId,
        entity_name: `Shipment #${shipmentId.replace('shp-', '')} (${updatedShipment.waybillNumber})`,
        payload: {
          shipmentId,
          newStatus,
          locationRemarks,
          timestamp,
        },
        created_at: timestamp,
        status: 'PENDING',
        idempotency_key: idempotencyKey,
        local_snapshot: updatedShipment,
      };

      await enqueueOperation(queuedOp);

      return {
        updatedShipment,
        queuedOp,
        isLocal: true,
      };
    }

    // Online path
    return {
      updatedShipment,
      isLocal: false,
    };
  }

  /**
   * Update trip status during blackout (e.g. marking a trip DELIVERED or COMPLETED)
   */
  static async updateTripStatus(
    tripId: string,
    newStatus: 'SCHEDULED' | 'IN_TRANSIT' | 'COMPLETED',
    currentTrip: ScheduledTrip,
    backendStatus: BackendStatus
  ): Promise<{ updatedTrip: ScheduledTrip; queuedOp?: QueuedOperation; isLocal: boolean }> {
    const timestamp = new Date().toISOString();
    const updatedTrip: ScheduledTrip = {
      ...currentTrip,
      tripStatus: newStatus,
    };

    if (backendStatus === 'SIMULATED_OFFLINE') {
      await saveActiveTrip(updatedTrip);

      const operationId = generateOperationId();
      const idempotencyKey = generateIdempotencyKey(`trip_${tripId}_${newStatus.toLowerCase()}`);

      const queuedOp: QueuedOperation = {
        operation_id: operationId,
        operation_type: 'UPDATE_TRIP_STATUS',
        entity_id: tripId,
        entity_name: `Trip ${tripId} (${newStatus})`,
        payload: { tripId, newStatus, timestamp },
        created_at: timestamp,
        status: 'PENDING',
        idempotency_key: idempotencyKey,
        local_snapshot: updatedTrip,
      };

      await enqueueOperation(queuedOp);
      return { updatedTrip, queuedOp, isLocal: true };
    }

    return { updatedTrip, isLocal: false };
  }

  /**
   * Create a new shipment (Mutations during Blackout)
   */
  static async createShipment(
    data: Omit<Shipment, 'id' | 'waybillNumber' | 'createdAt' | 'statusHistory' | 'status'>,
    backendStatus: BackendStatus
  ): Promise<{ newShipment: Shipment; queuedOp?: QueuedOperation; isLocal: boolean }> {
    const timestamp = new Date().toISOString();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const waybillNumber = `WB-${new Date().getFullYear()}-MSR-${randomSuffix}`;
    const qrCodeHash = `CF-QR-${randomSuffix}-${data.tripId}`;
    const newId = `shp-${Date.now()}`;

    const newShipment: Shipment = {
      ...data,
      id: newId,
      waybillNumber,
      qrCodeHash,
      status: 'RESERVED',
      createdAt: timestamp,
      statusHistory: [
        {
          status: 'RESERVED',
          timestamp,
          location: 'Origin Depot Station',
          remarks: `Capacity reserved on Bus Trip ${data.tripId} (${backendStatus === 'ONLINE' ? 'Server confirmed' : 'Protected locally on device'})`,
        },
      ],
    };

    if (backendStatus === 'SIMULATED_OFFLINE') {
      // Save locally to IndexedDB
      await saveActiveTask(newShipment);

      // Create queued operation with unique idempotency key
      const operationId = generateOperationId();
      const idempotencyKey = generateIdempotencyKey(`create_${newId}`);

      const queuedOp: QueuedOperation = {
        operation_id: operationId,
        operation_type: 'CREATE_SHIPMENT',
        entity_id: newId,
        entity_name: `Shipment #${newId.slice(-4)} (${waybillNumber})`,
        payload: newShipment,
        created_at: timestamp,
        status: 'PENDING',
        idempotency_key: idempotencyKey,
        local_snapshot: newShipment,
      };

      await enqueueOperation(queuedOp);

      return {
        newShipment,
        queuedOp,
        isLocal: true,
      };
    }

    return {
      newShipment,
      isLocal: false,
    };
  }

  /**
   * Log an incident/delay report
   */
  static async logIncident(
    report: Omit<IncidentReport, 'id' | 'timestamp' | 'status' | 'isProtectedLocally'>,
    backendStatus: BackendStatus
  ): Promise<{ incident: IncidentReport; queuedOp?: QueuedOperation; isLocal: boolean }> {
    const timestamp = new Date().toISOString();
    const id = `inc-${Date.now()}`;

    const incident: IncidentReport = {
      ...report,
      id,
      timestamp,
      isProtectedLocally: backendStatus === 'SIMULATED_OFFLINE',
      status: backendStatus === 'ONLINE' ? 'CONFIRMED' : 'PENDING',
    };

    if (backendStatus === 'SIMULATED_OFFLINE') {
      await saveIncident(incident);

      const operationId = generateOperationId();
      const idempotencyKey = generateIdempotencyKey(`inc_${id}`);

      const queuedOp: QueuedOperation = {
        operation_id: operationId,
        operation_type: 'LOG_INCIDENT',
        entity_id: id,
        entity_name: `Incident: ${report.title}`,
        payload: incident,
        created_at: timestamp,
        status: 'PENDING',
        idempotency_key: idempotencyKey,
      };

      await enqueueOperation(queuedOp);

      return { incident, queuedOp, isLocal: true };
    }

    await saveIncident(incident);
    return { incident, isLocal: false };
  }

  /**
   * Execute idempotent synchronization of pending operations
   */
  static async syncPendingQueue(
    onStepProgress?: (stepMsg: string, opId: string) => void
  ): Promise<{
    syncedCount: number;
    failedCount: number;
    conflictOps: QueuedOperation[];
  }> {
    const queue = await getAllQueuedOperations();
    const pendingOps = queue.filter((q) => q.status === 'PENDING' || q.status === 'NEEDS_REVIEW');

    if (pendingOps.length === 0) {
      await setStoredLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      return { syncedCount: 0, failedCount: 0, conflictOps: [] };
    }

    let syncedCount = 0;
    let failedCount = 0;
    const conflictOps: QueuedOperation[] = [];

    for (const op of pendingOps) {
      // Mark as SYNCING
      op.status = 'SYNCING';
      await updateQueuedOperation(op);

      if (onStepProgress) {
        onStepProgress(`Synchronizing ${op.entity_name}...`, op.operation_id);
      }

      // Short delay for realistic sync animation step
      await new Promise((r) => setTimeout(r, 400));

      // Conflict Check: If marked as intentional conflict simulation
      if (op.conflict_reason) {
        op.status = 'NEEDS_REVIEW';
        await updateQueuedOperation(op);
        conflictOps.push(op);
        continue;
      }

      // Mark as SYNCED
      op.status = 'SYNCED';
      await updateQueuedOperation(op);
      syncedCount++;

      if (onStepProgress) {
        let label = 'Change';
        if (op.operation_type === 'CREATE_SHIPMENT') label = 'Shipment creation';
        else if (op.operation_type === 'UPDATE_SHIPMENT_STATUS') label = 'Shipment status update';
        else if (op.operation_type === 'UPDATE_TRIP_STATUS') label = 'Trip operational state';
        else if (op.operation_type === 'LOG_INCIDENT') label = 'Route incident report';

        onStepProgress(`✓ ${label} synchronized with server`, op.operation_id);
      }
    }

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    await setStoredLastSyncTime(nowStr);

    return {
      syncedCount,
      failedCount,
      conflictOps,
    };
  }
}
