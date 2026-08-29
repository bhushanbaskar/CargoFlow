'use client';

import {
  BackendStatus,
  QueuedOperation,
  IncidentReport,
  CachedRecordSnapshot,
} from './continuity-types';
import { Shipment, ScheduledTrip } from './types';

const DB_NAME = 'CargoFlow_Continuity_DB';
const DB_VERSION = 2;

const STORES = {
  APP_STATE: 'app_state',
  ACTIVE_TASKS: 'active_tasks',
  ACTIVE_TRIPS: 'active_trips',
  OFFLINE_QUEUE: 'offline_queue',
  CONTINUITY_CACHE: 'continuity_cache',
  INCIDENTS: 'incidents',
} as const;

let dbInstance: IDBDatabase | null = null;

// In-Memory Fallback for Node.js / SSR / Non-DOM environments
const inMemoryStore = {
  app_state: new Map<string, any>([['backend_status', 'ONLINE']]),
  active_tasks: new Map<string, Shipment>(),
  active_trips: new Map<string, ScheduledTrip>(),
  offline_queue: new Map<string, QueuedOperation>(),
  continuity_cache: new Map<string, CachedRecordSnapshot>(),
  incidents: new Map<string, IncidentReport>(),
};

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
}

function hasLocalStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/**
 * Initialize or retrieve the IndexedDB database instance
 */
export async function getDB(): Promise<IDBDatabase | null> {
  if (!isBrowser()) return null;
  if (dbInstance) return dbInstance;

  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(STORES.APP_STATE)) {
          db.createObjectStore(STORES.APP_STATE, { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains(STORES.ACTIVE_TASKS)) {
          db.createObjectStore(STORES.ACTIVE_TASKS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.ACTIVE_TRIPS)) {
          db.createObjectStore(STORES.ACTIVE_TRIPS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.OFFLINE_QUEUE)) {
          db.createObjectStore(STORES.OFFLINE_QUEUE, { keyPath: 'operation_id' });
        }
        if (!db.objectStoreNames.contains(STORES.CONTINUITY_CACHE)) {
          db.createObjectStore(STORES.CONTINUITY_CACHE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.INCIDENTS)) {
          db.createObjectStore(STORES.INCIDENTS, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event: Event) => {
        dbInstance = (event.target as IDBOpenDBRequest).result;
        resolve(dbInstance);
      };

      request.onerror = (event: Event) => {
        console.error('IndexedDB open error:', (event.target as IDBOpenDBRequest).error);
        resolve(null);
      };
    } catch (err) {
      console.error('IndexedDB initialization exception:', err);
      resolve(null);
    }
  });
}

// ----------------------------------------------------
// APP STATE (Backend Status, Last Sync, Metadata)
// ----------------------------------------------------

export async function getStoredBackendStatus(): Promise<BackendStatus> {
  const db = await getDB();
  if (!db) {
    if (hasLocalStorage()) {
      return (localStorage.getItem('cargoflow_backend_status') as BackendStatus) || 'ONLINE';
    }
    return inMemoryStore.app_state.get('backend_status') || 'ONLINE';
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORES.APP_STATE, 'readonly');
      const store = tx.objectStore(STORES.APP_STATE);
      const req = store.get('backend_status');
      req.onsuccess = () => {
        resolve(req.result?.value || 'ONLINE');
      };
      req.onerror = () => resolve('ONLINE');
    } catch {
      resolve('ONLINE');
    }
  });
}

export async function setStoredBackendStatus(status: BackendStatus): Promise<void> {
  inMemoryStore.app_state.set('backend_status', status);
  if (hasLocalStorage()) {
    localStorage.setItem('cargoflow_backend_status', status);
  }
  const db = await getDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORES.APP_STATE, 'readwrite');
      const store = tx.objectStore(STORES.APP_STATE);
      store.put({ key: 'backend_status', value: status, updatedAt: new Date().toISOString() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function getStoredLastSyncTime(): Promise<string | null> {
  const db = await getDB();
  if (!db) {
    if (hasLocalStorage()) {
      return localStorage.getItem('cargoflow_last_sync_time');
    }
    return inMemoryStore.app_state.get('last_sync_time') || null;
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORES.APP_STATE, 'readonly');
      const store = tx.objectStore(STORES.APP_STATE);
      const req = store.get('last_sync_time');
      req.onsuccess = () => resolve(req.result?.value || null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function setStoredLastSyncTime(timestamp: string): Promise<void> {
  inMemoryStore.app_state.set('last_sync_time', timestamp);
  if (hasLocalStorage()) {
    localStorage.setItem('cargoflow_last_sync_time', timestamp);
  }
  const db = await getDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORES.APP_STATE, 'readwrite');
      const store = tx.objectStore(STORES.APP_STATE);
      store.put({ key: 'last_sync_time', value: timestamp });
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

// ----------------------------------------------------
// ACTIVE TASKS (In-progress shipments protected locally)
// ----------------------------------------------------

export async function getAllActiveTasks(): Promise<Shipment[]> {
  const db = await getDB();
  if (!db) {
    if (hasLocalStorage()) {
      const raw = localStorage.getItem('cargoflow_active_tasks');
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {}
      }
    }
    return Array.from(inMemoryStore.active_tasks.values());
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORES.ACTIVE_TASKS, 'readonly');
      const store = tx.objectStore(STORES.ACTIVE_TASKS);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

export async function saveActiveTask(task: Shipment): Promise<void> {
  inMemoryStore.active_tasks.set(task.id, task);
  if (hasLocalStorage()) {
    const all = await getAllActiveTasks();
    const updated = [task, ...all.filter((t) => t.id !== task.id)];
    localStorage.setItem('cargoflow_active_tasks', JSON.stringify(updated));
  }
  const db = await getDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORES.ACTIVE_TASKS, 'readwrite');
      const store = tx.objectStore(STORES.ACTIVE_TASKS);
      store.put(task);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function saveAllActiveTasks(tasks: Shipment[]): Promise<void> {
  inMemoryStore.active_tasks.clear();
  tasks.forEach((t) => inMemoryStore.active_tasks.set(t.id, t));
  if (hasLocalStorage()) {
    localStorage.setItem('cargoflow_active_tasks', JSON.stringify(tasks));
  }
  const db = await getDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORES.ACTIVE_TASKS, 'readwrite');
      const store = tx.objectStore(STORES.ACTIVE_TASKS);
      store.clear();
      tasks.forEach((t) => store.put(t));
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

// ----------------------------------------------------
// ACTIVE TRIPS (All IN_TRANSIT buses protected locally)
// ----------------------------------------------------

export async function getAllActiveTrips(): Promise<ScheduledTrip[]> {
  const db = await getDB();
  if (!db) {
    if (hasLocalStorage()) {
      const raw = localStorage.getItem('cargoflow_active_trips');
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {}
      }
    }
    return Array.from(inMemoryStore.active_trips.values());
  }

  return new Promise((resolve) => {
    try {
      if (!db.objectStoreNames.contains(STORES.ACTIVE_TRIPS)) {
        resolve(Array.from(inMemoryStore.active_trips.values()));
        return;
      }
      const tx = db.transaction(STORES.ACTIVE_TRIPS, 'readonly');
      const store = tx.objectStore(STORES.ACTIVE_TRIPS);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

export async function saveActiveTrip(trip: ScheduledTrip): Promise<void> {
  inMemoryStore.active_trips.set(trip.id, trip);
  if (hasLocalStorage()) {
    const all = await getAllActiveTrips();
    const updated = [trip, ...all.filter((t) => t.id !== trip.id)];
    localStorage.setItem('cargoflow_active_trips', JSON.stringify(updated));
  }
  const db = await getDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      if (!db.objectStoreNames.contains(STORES.ACTIVE_TRIPS)) {
        resolve();
        return;
      }
      const tx = db.transaction(STORES.ACTIVE_TRIPS, 'readwrite');
      const store = tx.objectStore(STORES.ACTIVE_TRIPS);
      store.put(trip);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function saveAllActiveTrips(trips: ScheduledTrip[]): Promise<void> {
  inMemoryStore.active_trips.clear();
  trips.forEach((t) => inMemoryStore.active_trips.set(t.id, t));
  if (hasLocalStorage()) {
    localStorage.setItem('cargoflow_active_trips', JSON.stringify(trips));
  }
  const db = await getDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      if (!db.objectStoreNames.contains(STORES.ACTIVE_TRIPS)) {
        resolve();
        return;
      }
      const tx = db.transaction(STORES.ACTIVE_TRIPS, 'readwrite');
      const store = tx.objectStore(STORES.ACTIVE_TRIPS);
      store.clear();
      trips.forEach((t) => store.put(t));
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export const saveActiveTrips = saveAllActiveTrips;

export async function clearActiveTrips(): Promise<void> {
  inMemoryStore.active_trips.clear();
  if (hasLocalStorage()) {
    localStorage.removeItem('cargoflow_active_trips');
  }
  const db = await getDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      if (!db.objectStoreNames.contains(STORES.ACTIVE_TRIPS)) {
        resolve();
        return;
      }
      const tx = db.transaction(STORES.ACTIVE_TRIPS, 'readwrite');
      const store = tx.objectStore(STORES.ACTIVE_TRIPS);
      store.clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

// ----------------------------------------------------
// OFFLINE QUEUE (Idempotent Pending Operations)
// ----------------------------------------------------

export async function getAllQueuedOperations(): Promise<QueuedOperation[]> {
  const db = await getDB();
  if (!db) {
    if (hasLocalStorage()) {
      const raw = localStorage.getItem('cargoflow_offline_queue');
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {}
      }
    }
    return Array.from(inMemoryStore.offline_queue.values());
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORES.OFFLINE_QUEUE, 'readonly');
      const store = tx.objectStore(STORES.OFFLINE_QUEUE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

export async function enqueueOperation(op: QueuedOperation): Promise<void> {
  inMemoryStore.offline_queue.set(op.operation_id, op);
  if (hasLocalStorage()) {
    const queue = await getAllQueuedOperations();
    const existingIndex = queue.findIndex(
      (q) => q.operation_id === op.operation_id || q.idempotency_key === op.idempotency_key
    );
    let updated: QueuedOperation[];
    if (existingIndex >= 0) {
      updated = [...queue];
      updated[existingIndex] = op;
    } else {
      updated = [...queue, op];
    }
    localStorage.setItem('cargoflow_offline_queue', JSON.stringify(updated));
  }
  const db = await getDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORES.OFFLINE_QUEUE, 'readwrite');
      const store = tx.objectStore(STORES.OFFLINE_QUEUE);
      store.put(op);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function updateQueuedOperation(op: QueuedOperation): Promise<void> {
  return enqueueOperation(op);
}

export async function removeQueuedOperation(operationId: string): Promise<void> {
  inMemoryStore.offline_queue.delete(operationId);
  if (hasLocalStorage()) {
    const queue = await getAllQueuedOperations();
    const updated = queue.filter((q) => q.operation_id !== operationId);
    localStorage.setItem('cargoflow_offline_queue', JSON.stringify(updated));
  }
  const db = await getDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORES.OFFLINE_QUEUE, 'readwrite');
      const store = tx.objectStore(STORES.OFFLINE_QUEUE);
      store.delete(operationId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function clearAllQueuedOperations(): Promise<void> {
  inMemoryStore.offline_queue.clear();
  if (hasLocalStorage()) {
    localStorage.removeItem('cargoflow_offline_queue');
  }
  const db = await getDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORES.OFFLINE_QUEUE, 'readwrite');
      const store = tx.objectStore(STORES.OFFLINE_QUEUE);
      store.clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

// ----------------------------------------------------
// CONTINUITY CACHE (Last known data for cached older records)
// ----------------------------------------------------

export async function getCachedRecord(id: string): Promise<CachedRecordSnapshot | null> {
  const db = await getDB();
  if (!db) {
    if (hasLocalStorage()) {
      const raw = localStorage.getItem(`cargoflow_cache_${id}`);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {}
      }
    }
    return inMemoryStore.continuity_cache.get(id) || null;
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORES.CONTINUITY_CACHE, 'readonly');
      const store = tx.objectStore(STORES.CONTINUITY_CACHE);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function saveCachedRecord(snapshot: CachedRecordSnapshot): Promise<void> {
  inMemoryStore.continuity_cache.set(snapshot.id, snapshot);
  if (hasLocalStorage()) {
    localStorage.setItem(`cargoflow_cache_${snapshot.id}`, JSON.stringify(snapshot));
  }
  const db = await getDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORES.CONTINUITY_CACHE, 'readwrite');
      const store = tx.objectStore(STORES.CONTINUITY_CACHE);
      store.put(snapshot);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

// ----------------------------------------------------
// INCIDENTS (Route delays, damage, complaints during blackout)
// ----------------------------------------------------

export async function getAllIncidents(): Promise<IncidentReport[]> {
  const db = await getDB();
  if (!db) {
    if (hasLocalStorage()) {
      const raw = localStorage.getItem('cargoflow_incidents');
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {}
      }
    }
    return Array.from(inMemoryStore.incidents.values());
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORES.INCIDENTS, 'readonly');
      const store = tx.objectStore(STORES.INCIDENTS);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

export async function saveIncident(incident: IncidentReport): Promise<void> {
  inMemoryStore.incidents.set(incident.id, incident);
  if (hasLocalStorage()) {
    const all = await getAllIncidents();
    const updated = [incident, ...all.filter((i) => i.id !== incident.id)];
    localStorage.setItem('cargoflow_incidents', JSON.stringify(updated));
  }
  const db = await getDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORES.INCIDENTS, 'readwrite');
      const store = tx.objectStore(STORES.INCIDENTS);
      store.put(incident);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

// ----------------------------------------------------
// DEMO RESET HELPER
// ----------------------------------------------------

export async function resetContinuityStore(): Promise<void> {
  inMemoryStore.app_state.clear();
  inMemoryStore.active_tasks.clear();
  inMemoryStore.active_trips.clear();
  inMemoryStore.offline_queue.clear();
  inMemoryStore.continuity_cache.clear();
  inMemoryStore.incidents.clear();

  if (hasLocalStorage()) {
    localStorage.removeItem('cargoflow_backend_status');
    localStorage.removeItem('cargoflow_last_sync_time');
    localStorage.removeItem('cargoflow_active_tasks');
    localStorage.removeItem('cargoflow_active_trips');
    localStorage.removeItem('cargoflow_offline_queue');
    localStorage.removeItem('cargoflow_incidents');
  }
  const db = await getDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const storeNames: string[] = [
        STORES.APP_STATE,
        STORES.ACTIVE_TASKS,
        STORES.OFFLINE_QUEUE,
        STORES.CONTINUITY_CACHE,
        STORES.INCIDENTS,
      ];
      if (db.objectStoreNames.contains(STORES.ACTIVE_TRIPS)) {
        storeNames.push(STORES.ACTIVE_TRIPS);
      }
      const tx = db.transaction(storeNames, 'readwrite');
      storeNames.forEach((s) => tx.objectStore(s).clear());
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}
