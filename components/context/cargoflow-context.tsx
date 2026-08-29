'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { interpolatePositionAlongRoad } from '@/lib/routing-service';
import PRECOMPUTED_ROUTES from '@/lib/precomputed-routes.json';
import {
  UserRole,
  UserProfile,
  ScheduledTrip,
  Shipment,
  Bus,
  Route,
  Stop,
  Depot,
  CourierCompany,
  ShipmentStatus,
  CourierRegistrationInput,
  AuthSession,
} from '@/lib/types';
import {
  INITIAL_STOPS,
  INITIAL_DEPOTS,
  INITIAL_ROUTES,
  INITIAL_BUSES,
  INITIAL_SCHEDULED_TRIPS,
  INITIAL_SHIPMENTS,
  INITIAL_COURIER_COMPANIES,
  DEMO_USER_PROFILES,
  DEMO_ACTIVE_TASK_ID,
  DEMO_ACTIVE_SHIPMENT,
  DEMO_CACHED_SHIPMENT,
} from '@/lib/mock-data';
import {
  getCurrentAuthSession,
  loginWithEmailPassword,
  registerCourierPartner,
  signOutAuth,
  fetchAllCourierCompanies,
  updateCourierCompanyStatus,
} from '@/lib/auth-service';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  BackendStatus,
  ContinuityMode,
  QueuedOperation,
  IncidentReport,
  DataClassification,
} from '@/lib/continuity-types';
import {
  getStoredBackendStatus,
  setStoredBackendStatus,
  getStoredLastSyncTime,
  setStoredLastSyncTime,
  getAllActiveTasks,
  saveActiveTask,
  saveAllActiveTasks,
  getAllActiveTrips,
  saveActiveTrips,
  saveActiveTrip,
  saveAllActiveTrips,
  clearActiveTrips,
  getAllQueuedOperations,
  enqueueOperation,
  updateQueuedOperation,
  removeQueuedOperation,
  clearAllQueuedOperations,
  getAllIncidents,
  saveIncident,
  resetContinuityStore,
} from '@/lib/continuity-db';
import { DataRepository } from '@/lib/data-repository';

interface CargoFlowContextType {
  currentRole: UserRole;
  currentProfile: UserProfile;
  currentCompany: CourierCompany | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  switchRole: (role: UserRole) => void;

  // Auth actions
  login: (email: string, pass: string) => Promise<{ success: boolean; session?: AuthSession; error?: string }>;
  registerCourier: (input: CourierRegistrationInput) => Promise<{ success: boolean; session?: AuthSession; error?: string }>;
  logout: () => Promise<void>;
  
  // Company management for Super Admin
  approveCompany: (companyId: string) => Promise<void>;
  rejectCompany: (companyId: string, reason?: string) => Promise<void>;
  refreshCompanies: () => Promise<void>;

  // Data Collections (Filtered dynamically by Data Resilience Layer)
  stops: Stop[];
  depots: Depot[];
  routes: Route[];
  buses: Bus[];
  trips: ScheduledTrip[];
  allMasterTrips: ScheduledTrip[];
  shipments: Shipment[];
  allMasterShipments: Shipment[];
  courierCompanies: CourierCompany[];

  createShipment: (shipmentData: Omit<Shipment, 'id' | 'waybillNumber' | 'createdAt' | 'statusHistory' | 'status'>) => Promise<Shipment>;
  updateShipmentStatus: (shipmentId: string, newStatus: ShipmentStatus, locationRemarks?: string) => Promise<void>;
  
  // Realtime Simulation State (Bus GPS animation)
  isSimulating: boolean;
  toggleSimulation: () => void;
  selectedTripId: string | null;
  setSelectedTripId: (tripId: string | null) => void;
  selectedShipmentId: string | null;
  setSelectedShipmentId: (shipmentId: string | null) => void;

  // Stats calculation (Enforcing Read Blackout Policy)
  isServerDataAvailable: boolean;
  totalRevenue: number | null; // null during blackout (renders as "—")
  totalCapacityKg: number;
  utilizedCapacityKg: number | null;
  networkUtilizationPercentage: number | null; // null during blackout (renders as "—")
  activeFleetTripsCount: number | null; // null during blackout
  protectedTripsCount: number; // count of all in-transit protected buses
  hiddenServerOnlyCount: number;

  // ==========================================
  // CONTINUITY & DATABASE BLACKOUT SIMULATION
  // ==========================================
  backendStatus: BackendStatus;
  continuityMode: ContinuityMode;
  pendingQueue: QueuedOperation[];
  activeProtectedTasks: Shipment[];
  activeProtectedTrips: ScheduledTrip[]; // ALL in-transit trips protected locally
  lastSyncTimestamp: string | null;
  syncProgressMessage: string | null;
  syncStepLogs: string[];
  conflictItems: QueuedOperation[];
  incidents: IncidentReport[];

  // Simulation Actions
  simulateDatabaseFailure: () => Promise<void>;
  restoreConnection: () => Promise<void>;
  syncQueueNow: () => Promise<void>;
  resolveConflict: (operationId: string, resolution: 'USE_LOCAL' | 'USE_SERVER') => Promise<void>;
  simulateConflictOnNextOperation: () => void;
  resetContinuityDemo: () => Promise<void>;
  logConductorIncident: (report: Omit<IncidentReport, 'id' | 'timestamp' | 'status' | 'isProtectedLocally'>) => Promise<IncidentReport>;
  
  // Modals & Panels Control
  isRecoveryCenterOpen: boolean;
  setIsRecoveryCenterOpen: (open: boolean) => void;
  statusNotification: { message: string; type: 'info' | 'warning' | 'success' | 'sync' } | null;
  dismissStatusNotification: () => void;
}

const CargoFlowContext = createContext<CargoFlowContextType | undefined>(undefined);

export function CargoFlowProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('SUPER_ADMIN');
  const [currentProfile, setCurrentProfile] = useState<UserProfile>(DEMO_USER_PROFILES[0]);
  const [currentCompany, setCurrentCompany] = useState<CourierCompany | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  const [activeTab, setActiveTab] = useState<string>('fleet-map');

  // Master Raw State
  const [stops] = useState<Stop[]>(INITIAL_STOPS);
  const [depots] = useState<Depot[]>(INITIAL_DEPOTS);
  const [routes] = useState<Route[]>(INITIAL_ROUTES);
  const [buses] = useState<Bus[]>(INITIAL_BUSES);
  const [masterTrips, setMasterTrips] = useState<ScheduledTrip[]>(INITIAL_SCHEDULED_TRIPS);
  const [masterShipments, setMasterShipments] = useState<Shipment[]>(INITIAL_SHIPMENTS);
  const [courierCompanies, setCourierCompanies] = useState<CourierCompany[]>(INITIAL_COURIER_COMPANIES);

  // Realtime Simulation State
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [selectedTripId, setSelectedTripId] = useState<string | null>('TRP001');
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(DEMO_ACTIVE_TASK_ID);

  // ==========================================
  // CONTINUITY & SIMULATION STATE
  // ==========================================
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('ONLINE');
  const [continuityMode, setContinuityMode] = useState<ContinuityMode>('READY');
  const [pendingQueue, setPendingQueue] = useState<QueuedOperation[]>([]);
  const [activeProtectedTasks, setActiveProtectedTasks] = useState<Shipment[]>([DEMO_ACTIVE_SHIPMENT]);
  
  // ALL active IN_TRANSIT trips protected locally
  const [activeProtectedTrips, setActiveProtectedTrips] = useState<ScheduledTrip[]>(() =>
    INITIAL_SCHEDULED_TRIPS.filter((t) => t.tripStatus === 'IN_TRANSIT')
  );

  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<string | null>('10:31 AM');
  const [syncProgressMessage, setSyncProgressMessage] = useState<string | null>(null);
  const [syncStepLogs, setSyncStepLogs] = useState<string[]>([]);
  const [conflictItems, setConflictItems] = useState<QueuedOperation[]>([]);
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [shouldSimulateConflictNext, setShouldSimulateConflictNext] = useState<boolean>(false);

  // UI Notification Bar State
  const [statusNotification, setStatusNotification] = useState<{
    message: string;
    type: 'info' | 'warning' | 'success' | 'sync';
  } | null>(null);

  const [isRecoveryCenterOpen, setIsRecoveryCenterOpen] = useState<boolean>(false);

  const showNotification = useCallback(
    (message: string, type: 'info' | 'warning' | 'success' | 'sync' = 'info') => {
      setStatusNotification({ message, type });
      if (type === 'success' || type === 'info') {
        setTimeout(() => {
          setStatusNotification((prev) => (prev?.message === message ? null : prev));
        }, 5000);
      }
    },
    []
  );

  const dismissStatusNotification = useCallback(() => {
    setStatusNotification(null);
  }, []);

  // ----------------------------------------------------
  // INITIALIZATION & PERSISTENCE LOAD (Survives Page Refresh)
  // ----------------------------------------------------
  useEffect(() => {
    async function loadContinuityState() {
      try {
        const storedStatus = await getStoredBackendStatus();
        const storedQueue = await getAllQueuedOperations();
        const storedTasks = await getAllActiveTasks();
        const storedTrips = await getAllActiveTrips();
        const storedIncidents = await getAllIncidents();
        const storedSyncTime = await getStoredLastSyncTime();

        setBackendStatus(storedStatus);
        setPendingQueue(storedQueue);
        setIncidents(storedIncidents);
        if (storedSyncTime) setLastSyncTimestamp(storedSyncTime);

        if (storedStatus === 'SIMULATED_OFFLINE') {
          setContinuityMode(storedQueue.length > 0 ? 'ACTIVE' : 'READY');
          if (storedTasks.length > 0) {
            setActiveProtectedTasks(storedTasks);
          } else {
            setActiveProtectedTasks([DEMO_ACTIVE_SHIPMENT]);
            await saveActiveTask(DEMO_ACTIVE_SHIPMENT);
          }

          if (storedTrips.length > 0) {
            setActiveProtectedTrips(storedTrips);
          } else {
            const inTransitSnapshot = DataRepository.snapshotActiveTrips(INITIAL_SCHEDULED_TRIPS);
            setActiveProtectedTrips(inTransitSnapshot);
            await saveAllActiveTrips(inTransitSnapshot);
          }
        } else {
          setContinuityMode('READY');
          if (storedTasks.length > 0) {
            setActiveProtectedTasks(storedTasks);
          }
          if (storedTrips.length > 0) {
            setActiveProtectedTrips(storedTrips);
          }
        }
      } catch (err) {
        console.error('Error loading continuity state from IndexedDB:', err);
      }
    }

    loadContinuityState();
  }, []);

  useEffect(() => {
    async function loadInitialData() {
      setIsLoadingAuth(true);
      try {
        const session = await getCurrentAuthSession();
        if (session) {
          setCurrentProfile(session.user);
          setCurrentRole(session.user.role);
          setCurrentCompany(session.company || null);
          setIsAuthenticated(true);
        } else {
          setCurrentProfile(DEMO_USER_PROFILES[0]);
          setCurrentRole('SUPER_ADMIN');
          setIsAuthenticated(false);
        }

        const companiesList = await fetchAllCourierCompanies();
        setCourierCompanies(companiesList);
      } catch (err) {
        console.error('Error loading initial auth context:', err);
      } finally {
        setIsLoadingAuth(false);
      }
    }

    loadInitialData();

    if (isSupabaseConfigured) {
      try {
        const supabase = getSupabase();
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event) => {
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            const authSession = await getCurrentAuthSession();
            if (authSession) {
              setCurrentProfile(authSession.user);
              setCurrentRole(authSession.user.role);
              setCurrentCompany(authSession.company || null);
              setIsAuthenticated(true);
            }
          } else if (event === 'SIGNED_OUT') {
            setIsAuthenticated(false);
            setCurrentCompany(null);
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (e) {
        console.error('Supabase auth state listener error:', e);
      }
    }
  }, []);

  const refreshCompanies = async () => {
    const list = await fetchAllCourierCompanies();
    setCourierCompanies(list);
  };

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    const profile = DEMO_USER_PROFILES.find((p) => p.role === role) || DEMO_USER_PROFILES[0];
    setCurrentProfile(profile);

    if (role === 'SUPER_ADMIN') {
      setActiveTab('fleet-map');
      setCurrentCompany(null);
    } else if (role === 'COURIER_PARTNER') {
      setActiveTab('book-capacity');
      const comp = courierCompanies.find((c) => c.id === profile.companyId) || courierCompanies[0] || null;
      setCurrentCompany(comp);
    } else if (role === 'CONDUCTOR') {
      setActiveTab('today-trips');
      setCurrentCompany(null);
    }
  };

  const login = async (email: string, pass: string) => {
    const res = await loginWithEmailPassword(email, pass);
    if (res.session) {
      setCurrentProfile(res.session.user);
      setCurrentRole(res.session.user.role);
      setCurrentCompany(res.session.company || null);
      setIsAuthenticated(true);

      if (res.session.user.role === 'SUPER_ADMIN') {
        setActiveTab('fleet-map');
      } else if (res.session.user.role === 'COURIER_PARTNER') {
        setActiveTab('book-capacity');
      } else if (res.session.user.role === 'CONDUCTOR') {
        setActiveTab('today-trips');
      }

      await refreshCompanies();
      return { success: true, session: res.session };
    }
    return { success: false, error: res.error || 'Login failed.' };
  };

  const registerCourier = async (input: CourierRegistrationInput) => {
    const res = await registerCourierPartner(input);
    if (res.session) {
      setCurrentProfile(res.session.user);
      setCurrentRole(res.session.user.role);
      setCurrentCompany(res.session.company || null);
      setIsAuthenticated(true);
      await refreshCompanies();
      return { success: true, session: res.session };
    }
    return { success: false, error: res.error || 'Registration failed.' };
  };

  const logout = async () => {
    await signOutAuth();
    setIsAuthenticated(false);
    setCurrentCompany(null);
    setCurrentRole('SUPER_ADMIN');
    setCurrentProfile(DEMO_USER_PROFILES[0]);
  };

  const approveCompany = async (companyId: string) => {
    setCourierCompanies((prev) =>
      prev.map((c) =>
        c.id === companyId ? { ...c, status: 'ACTIVE' as const, rejectionReason: undefined } : c
      )
    );

    if (currentCompany && currentCompany.id === companyId) {
      setCurrentCompany((prev) => (prev ? { ...prev, status: 'ACTIVE', rejectionReason: undefined } : null));
      setCurrentProfile((prev) => ({ ...prev, companyStatus: 'ACTIVE' }));
    }

    try {
      await updateCourierCompanyStatus(companyId, 'ACTIVE');
    } catch (e) {
      console.error('Failed to update company status in database:', e);
    }
    await refreshCompanies();
  };

  const rejectCompany = async (companyId: string, reason?: string) => {
    setCourierCompanies((prev) =>
      prev.map((c) =>
        c.id === companyId ? { ...c, status: 'REJECTED' as const, rejectionReason: reason } : c
      )
    );

    if (currentCompany && currentCompany.id === companyId) {
      setCurrentCompany((prev) => (prev ? { ...prev, status: 'REJECTED', rejectionReason: reason } : null));
      setCurrentProfile((prev) => ({ ...prev, companyStatus: 'REJECTED' }));
    }

    try {
      await updateCourierCompanyStatus(companyId, 'REJECTED', reason);
    } catch (e) {
      console.error('Failed to reject company in database:', e);
    }
    await refreshCompanies();
  };

  // ====================================================
  // SIMULATION ACTIONS & CONTINUITY WORKFLOWS
  // ====================================================

  /**
   * Simulate Database Failure (Snapshots ALL IN_TRANSIT trips across fleet)
   */
  const simulateDatabaseFailure = async () => {
    setBackendStatus('SIMULATED_OFFLINE');
    setContinuityMode('ACTIVE');
    await setStoredBackendStatus('SIMULATED_OFFLINE');

    // 1. Collect and snapshot ALL currently active IN_TRANSIT trips
    const inTransitSnapshot = DataRepository.snapshotActiveTrips(masterTrips);
    setActiveProtectedTrips(inTransitSnapshot);
    await saveAllActiveTrips(inTransitSnapshot);

    // 2. Ensure active shipments are stored in IndexedDB
    const activeTasks = await getAllActiveTasks();
    if (activeTasks.length === 0) {
      await saveActiveTask(DEMO_ACTIVE_SHIPMENT);
      setActiveProtectedTasks([DEMO_ACTIVE_SHIPMENT]);
    }

    // Set selected shipment to active task if currently on an unavailable record
    setSelectedShipmentId(DEMO_ACTIVE_TASK_ID);

    showNotification(
      `⚠ CONTINUITY MODE ACTIVE: Primary datastore offline. ${inTransitSnapshot.length} active in-transit trip(s) protected locally.`,
      'warning'
    );
  };

  /**
   * Restore Database Connection & Trigger Synchronization
   */
  const restoreConnection = async () => {
    setBackendStatus('ONLINE');
    await setStoredBackendStatus('ONLINE');

    showNotification('● Primary datastore re-established. Synchronizing local continuity operations...', 'info');

    // Trigger automatic synchronization
    await syncQueueNow();
  };

  /**
   * Synchronize Pending Queue
   */
  const syncQueueNow = async () => {
    setContinuityMode('SYNCING');
    setSyncStepLogs([]);
    setSyncProgressMessage('Reading local continuity queue...');

    try {
      const { syncedCount, failedCount, conflictOps } = await DataRepository.syncPendingQueue(
        (stepMsg) => {
          setSyncProgressMessage(stepMsg);
          setSyncStepLogs((prev) => [...prev, stepMsg]);
        }
      );

      const refreshedQueue = await getAllQueuedOperations();
      setPendingQueue(refreshedQueue);

      const refreshedSyncTime =
        (await getStoredLastSyncTime()) ||
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSyncTimestamp(refreshedSyncTime);

      if (conflictOps.length > 0) {
        setContinuityMode('CONFLICT');
        setConflictItems(conflictOps);
        showNotification(
          `⚠ ${conflictOps.length} conflict(s) detected during replay. Review required in Recovery Center.`,
          'warning'
        );
      } else {
        setContinuityMode('READY');
        setSyncProgressMessage(null);
        showNotification(`✓ All changes saved · ${syncedCount} operation(s) reconciled with central datastore.`, 'success');
      }
    } catch (err: any) {
      console.error('Synchronization failed:', err);
      setContinuityMode('READY');
      showNotification(`Sync encountered an error: ${err.message}`, 'warning');
    }
  };

  /**
   * Resolve a Conflict
   */
  const resolveConflict = async (operationId: string, resolution: 'USE_LOCAL' | 'USE_SERVER') => {
    const targetOp = pendingQueue.find((q) => q.operation_id === operationId);
    if (!targetOp) return;

    if (resolution === 'USE_LOCAL') {
      targetOp.status = 'SYNCED';
      targetOp.conflict_reason = undefined;
      await updateQueuedOperation(targetOp);
      showNotification(`Resolved: Local version accepted and synchronized.`, 'success');
    } else {
      await removeQueuedOperation(operationId);
      showNotification(`Resolved: Local change discarded in favor of central server state.`, 'info');
    }

    const refreshed = await getAllQueuedOperations();
    setPendingQueue(refreshed);
    setConflictItems(refreshed.filter((q) => q.status === 'NEEDS_REVIEW'));

    if (refreshed.filter((q) => q.status === 'NEEDS_REVIEW').length === 0) {
      setContinuityMode('READY');
    }
  };

  /**
   * Simulate a Conflict on Next Mutated Operation
   */
  const simulateConflictOnNextOperation = () => {
    setShouldSimulateConflictNext(true);
    showNotification('Conflict Simulation Armed: Next local operation will produce a merge conflict upon restoration.', 'info');
  };

  /**
   * Reset the Entire Continuity Demo to Initial State
   */
  const resetContinuityDemo = async () => {
    await resetContinuityStore();
    setBackendStatus('ONLINE');
    setContinuityMode('READY');
    setPendingQueue([]);
    setConflictItems([]);
    setSyncStepLogs([]);
    setSyncProgressMessage(null);
    setLastSyncTimestamp('10:31 AM');
    setSelectedShipmentId(DEMO_ACTIVE_TASK_ID);
    setMasterShipments(INITIAL_SHIPMENTS);
    setMasterTrips(INITIAL_SCHEDULED_TRIPS);
    setActiveProtectedTasks([DEMO_ACTIVE_SHIPMENT]);
    setActiveProtectedTrips(INITIAL_SCHEDULED_TRIPS.filter((t) => t.tripStatus === 'IN_TRANSIT'));
    await saveActiveTask(DEMO_ACTIVE_SHIPMENT);
    showNotification('Demo state reset to clean baseline (ONLINE).', 'info');
  };

  /**
   * Create Shipment Function (Supports Offline Continuity Queue)
   */
  const createShipment = async (
    data: Omit<Shipment, 'id' | 'waybillNumber' | 'createdAt' | 'statusHistory' | 'status'>
  ): Promise<Shipment> => {
    const { newShipment, queuedOp, isLocal } = await DataRepository.createShipment(data, backendStatus);

    if (isLocal && queuedOp) {
      if (shouldSimulateConflictNext) {
        queuedOp.conflict_reason = 'Server record was modified by another operator during disconnection window.';
        queuedOp.server_snapshot = { ...newShipment, weightKg: newShipment.weightKg + 10 };
        await updateQueuedOperation(queuedOp);
        setShouldSimulateConflictNext(false);
      }

      setPendingQueue((prev) => [queuedOp, ...prev.filter((q) => q.operation_id !== queuedOp.operation_id)]);
      setActiveProtectedTasks((prev) => [newShipment, ...prev]);
      showNotification(`✓ Saved on this device (${newShipment.waybillNumber}) · Pending synchronization`, 'warning');
    }

    setMasterShipments((prev) => [newShipment, ...prev]);
    setSelectedShipmentId(newShipment.id);

    // Deduct capacity from the trip
    setMasterTrips((prev) =>
      prev.map((t) => {
        if (t.id === data.tripId) {
          const newAvail = Math.max(0, t.availableCargoCapacityKg - data.weightKg);
          return { ...t, availableCargoCapacityKg: newAvail };
        }
        return t;
      })
    );

    return newShipment;
  };

  /**
   * Update Shipment Status Function (Supports Offline Continuity Queue)
   */
  const updateShipmentStatus = async (
    shipmentId: string,
    newStatus: ShipmentStatus,
    locationRemarks?: string
  ) => {
    const targetShipment =
      activeProtectedTasks.find((t) => t.id === shipmentId) ||
      masterShipments.find((s) => s.id === shipmentId) ||
      DEMO_ACTIVE_SHIPMENT;

    const { updatedShipment, queuedOp, isLocal } = await DataRepository.updateShipmentStatus(
      shipmentId,
      newStatus,
      locationRemarks,
      targetShipment,
      backendStatus,
      currentProfile.fullName,
      currentProfile.depotName || 'Depot Bay Station'
    );

    if (isLocal && queuedOp) {
      if (shouldSimulateConflictNext) {
        queuedOp.conflict_reason = 'Central server logged status as IN_TRANSIT while local device marked DELIVERED.';
        queuedOp.server_snapshot = { ...targetShipment, status: 'IN_TRANSIT' };
        await updateQueuedOperation(queuedOp);
        setShouldSimulateConflictNext(false);
      }

      setPendingQueue((prev) => [queuedOp, ...prev.filter((q) => q.operation_id !== queuedOp.operation_id)]);
      setActiveProtectedTasks((prev) => [updatedShipment, ...prev.filter((t) => t.id !== updatedShipment.id)]);
      showNotification(`✓ Saved on this device: Status updated to ${newStatus} · Pending synchronization`, 'warning');
    }

    setMasterShipments((prev) =>
      prev.map((shp) => (shp.id === shipmentId ? updatedShipment : shp))
    );

    // Capacity restoration on delivery/cancellation
    if (newStatus === 'DELIVERED' || newStatus === 'CANCELLED') {
      if (targetShipment) {
        setMasterTrips((prev) =>
          prev.map((t) => {
            if (t.id === targetShipment.tripId) {
              const restoredAvail = Math.min(t.totalCargoCapacityKg, t.availableCargoCapacityKg + targetShipment.weightKg);
              return { ...t, availableCargoCapacityKg: restoredAvail };
            }
            return t;
          })
        );
      }
    }
  };

  /**
   * Log an operational incident/delay during blackout
   */
  const logConductorIncident = async (
    report: Omit<IncidentReport, 'id' | 'timestamp' | 'status' | 'isProtectedLocally'>
  ): Promise<IncidentReport> => {
    const { incident, queuedOp, isLocal } = await DataRepository.logIncident(report, backendStatus);

    if (isLocal && queuedOp) {
      setPendingQueue((prev) => [queuedOp, ...prev]);
      showNotification(`✓ Incident logged on device · Pending synchronization`, 'warning');
    }

    setIncidents((prev) => [incident, ...prev]);
    return incident;
  };

  // Realtime vehicle simulation advancing along physical road geometry (Active when online)
  const tripProgressRef = useRef<{ [tripId: string]: number }>({
    TRP001: 0.35,
    TRP003: 0.52,
    TRP005: 0.65,
    TRP006: 0.40,
    TRP008: 0.28,
    TRP010: 0.72,
    TRP013: 0.45,
    TRP014: 0.58,
    TRP015: 0.60,
  });

  useEffect(() => {
    if (!isSimulating || backendStatus === 'SIMULATED_OFFLINE') return;

    const interval = setInterval(() => {
      setMasterTrips((prevTrips) =>
        prevTrips.map((trip) => {
          if (trip.tripStatus === 'IN_TRANSIT') {
            const precomputed = (PRECOMPUTED_ROUTES as Record<string, any>)[trip.routeId];
            if (precomputed && precomputed.coordinates && precomputed.coordinates.length > 0) {
              const currentProgress = tripProgressRef.current[trip.id] ?? 0.35;
              const nextProgress = currentProgress >= 0.95 ? 0.05 : currentProgress + 0.004;
              tripProgressRef.current[trip.id] = nextProgress;

              const [lat, lng] = interpolatePositionAlongRoad(
                precomputed.coordinates,
                nextProgress
              );

              return {
                ...trip,
                currentLocation: {
                  latitude: lat,
                  longitude: lng,
                  betweenStopIds: trip.currentLocation?.betweenStopIds || ['STP001', 'STP004'],
                },
              };
            }
          }
          return trip;
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, [isSimulating, backendStatus]);

  // ----------------------------------------------------
  // STRICT READ BLACKOUT POLICY: DYNAMIC EXPOSURE
  // ----------------------------------------------------

  // Visible Shipments: Filtered to ACTIVE_LOCAL + STATIC_CACHE when offline
  const visibleShipments = useMemo(() => {
    if (backendStatus === 'ONLINE') {
      return masterShipments;
    }

    // OFFLINE: Only active protected tasks and cached snapshot
    const activeMap = new Map(activeProtectedTasks.map((t) => [t.id, t]));
    if (!activeMap.has(DEMO_ACTIVE_TASK_ID)) {
      activeMap.set(DEMO_ACTIVE_TASK_ID, DEMO_ACTIVE_SHIPMENT);
    }

    const list: Shipment[] = Array.from(activeMap.values());
    if (!list.some((s) => s.id === DEMO_CACHED_SHIPMENT.id)) {
      list.push(DEMO_CACHED_SHIPMENT);
    }
    return list;
  }, [backendStatus, masterShipments, activeProtectedTasks]);

  const hiddenServerOnlyCount = useMemo(() => {
    if (backendStatus === 'ONLINE') return 0;
    return masterShipments.filter((s) => !visibleShipments.some((v) => v.id === s.id)).length;
  }, [backendStatus, masterShipments, visibleShipments]);

  // Visible Trips: When offline, ALL IN_TRANSIT protected buses are rendered at last known position
  const visibleTrips = useMemo(() => {
    if (backendStatus === 'ONLINE') {
      return masterTrips;
    }

    // Return all protected in-transit trips
    if (activeProtectedTrips.length > 0) {
      return activeProtectedTrips.map((trip) => ({
        ...trip,
        currentLocation: trip.currentLocation || {
          latitude: 19.6012,
          longitude: 74.2114,
          betweenStopIds: ['STP001', 'STP004'] as [string, string],
        },
      }));
    }

    // Fallback: in-transit trips from master
    return masterTrips
      .filter((t) => t.tripStatus === 'IN_TRANSIT')
      .map((trip) => ({
        ...trip,
        currentLocation: trip.currentLocation || {
          latitude: 19.6012,
          longitude: 74.2114,
          betweenStopIds: ['STP001', 'STP004'] as [string, string],
        },
      }));
  }, [backendStatus, masterTrips, activeProtectedTrips]);

  // Metrics: Withheld (null) during blackout
  const isServerDataAvailable = backendStatus === 'ONLINE';
  const totalRevenue = useMemo(() => {
    if (!isServerDataAvailable) return null;
    return masterShipments.reduce(
      (sum, s) => sum + (s.status !== 'CANCELLED' ? s.fareAmount : 0),
      14300
    );
  }, [isServerDataAvailable, masterShipments]);

  const totalCapacityKg = useMemo(() => {
    return masterTrips.reduce((sum, t) => sum + t.totalCargoCapacityKg, 0);
  }, [masterTrips]);

  const utilizedCapacityKg = useMemo(() => {
    if (!isServerDataAvailable) return null;
    const avail = masterTrips.reduce((sum, t) => sum + t.availableCargoCapacityKg, 0);
    return Math.max(0, totalCapacityKg - avail);
  }, [isServerDataAvailable, masterTrips, totalCapacityKg]);

  const networkUtilizationPercentage = useMemo(() => {
    if (!isServerDataAvailable || utilizedCapacityKg === null) return null;
    return Math.round((utilizedCapacityKg / (totalCapacityKg || 1)) * 100);
  }, [isServerDataAvailable, utilizedCapacityKg, totalCapacityKg]);

  const activeFleetTripsCount = useMemo(() => {
    if (!isServerDataAvailable) return null;
    return masterTrips.length;
  }, [isServerDataAvailable, masterTrips]);

  const protectedTripsCount = useMemo(() => {
    return activeProtectedTrips.length;
  }, [activeProtectedTrips]);

  return (
    <CargoFlowContext.Provider
      value={{
        currentRole,
        currentProfile,
        currentCompany,
        isAuthenticated,
        isLoadingAuth,
        activeTab,
        setActiveTab,
        switchRole,
        login,
        registerCourier,
        logout,
        approveCompany,
        rejectCompany,
        refreshCompanies,
        stops,
        depots,
        routes,
        buses,
        trips: visibleTrips,
        allMasterTrips: masterTrips,
        shipments: visibleShipments,
        allMasterShipments: masterShipments,
        courierCompanies,
        createShipment,
        updateShipmentStatus,
        isSimulating: isSimulating && backendStatus === 'ONLINE',
        toggleSimulation: () => setIsSimulating(!isSimulating),
        selectedTripId,
        setSelectedTripId,
        selectedShipmentId,
        setSelectedShipmentId,

        // Network Metrics
        isServerDataAvailable,
        totalRevenue,
        totalCapacityKg,
        utilizedCapacityKg,
        networkUtilizationPercentage,
        activeFleetTripsCount,
        protectedTripsCount,
        hiddenServerOnlyCount,

        // Continuity & Database Failure Simulation
        backendStatus,
        continuityMode,
        pendingQueue,
        activeProtectedTasks,
        activeProtectedTrips,
        lastSyncTimestamp,
        syncProgressMessage,
        syncStepLogs,
        conflictItems,
        incidents,
        simulateDatabaseFailure,
        restoreConnection,
        syncQueueNow,
        resolveConflict,
        simulateConflictOnNextOperation,
        resetContinuityDemo,
        logConductorIncident,

        // Modal Controls
        isRecoveryCenterOpen,
        setIsRecoveryCenterOpen,
        statusNotification,
        dismissStatusNotification,
      }}
    >
      {children}
    </CargoFlowContext.Provider>
  );
}

export function useCargoFlow() {
  const context = useContext(CargoFlowContext);
  if (!context) {
    throw new Error('useCargoFlow must be used within a CargoFlowProvider');
  }
  return context;
}
