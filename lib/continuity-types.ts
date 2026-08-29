export type BackendStatus = 'ONLINE' | 'SIMULATED_OFFLINE';

export type ContinuityMode = 'READY' | 'ACTIVE' | 'SYNCING' | 'CONFLICT';

export type DataClassification = 'STATIC_CACHE' | 'ACTIVE_LOCAL' | 'SERVER_ONLY';

export type OperationType =
  | 'CREATE_SHIPMENT'
  | 'UPDATE_SHIPMENT_STATUS'
  | 'UPDATE_TRIP_STATUS'
  | 'ADD_TASK_NOTE'
  | 'LOG_INCIDENT'
  | 'COMPLETE_TASK'
  | 'ASSIGN_TRIP';

export type OperationStatus =
  | 'PENDING'
  | 'SYNCING'
  | 'SYNCED'
  | 'FAILED'
  | 'NEEDS_REVIEW';

export interface QueuedOperation {
  operation_id: string; // e.g. "OP-92821"
  operation_type: OperationType;
  entity_id: string; // e.g. "shp-482" or "TRP001"
  entity_name: string; // e.g. "Shipment #482 (WB-2026-KPG-0482)"
  payload: any;
  created_at: string;
  status: OperationStatus;
  idempotency_key: string; // e.g. "idem_92821_..."
  error_message?: string;
  server_snapshot?: any;
  local_snapshot?: any;
  conflict_reason?: string;
}

export interface ContinuityMetadata {
  backend_status: BackendStatus;
  last_successful_sync: string | null;
  active_protected_task_ids: string[];
  active_protected_trip_ids: string[];
  cached_record_ids: string[];
  sync_progress_message?: string | null;
  needs_review_count: number;
}

export interface IncidentReport {
  id: string;
  shipmentId?: string;
  tripId?: string;
  type: 'DELAY' | 'CAPACITY_OVERFLOW' | 'ROUTE_DIVERSION' | 'ROAD_BLOCK' | 'DAMAGE_INSPECTION';
  title: string;
  notes: string;
  timestamp: string;
  conductorName: string;
  depotLocation: string;
  isProtectedLocally: boolean;
  status: 'PENDING' | 'CONFIRMED';
}

export interface CachedRecordSnapshot {
  id: string;
  lastUpdated: string;
  cachedAt: string;
  data: any;
  label: string;
}

export interface DataFetchResult<T> {
  data?: T;
  classification?: DataClassification;
  isAvailable?: boolean;
  isCached?: boolean;
  isProtectedLocally?: boolean;
  isBackendUnavailable?: boolean;
  lastKnownTimestamp?: string;
  freshnessLabel?: string;
  error?: string;
}

export interface NetworkMetricsState {
  isLiveAvailable: boolean;
  totalRevenue: number | null; // null during blackout
  networkUtilizationPercentage: number | null; // null during blackout
  totalActiveTrips: number | null; // null during blackout
  activeProtectedTripsCount: number; // all in-transit buses protected locally
  activeProtectedTasksCount: number;
  pendingSyncCount: number;
  freshnessLabel: string;
}
