'use client';

import React, { useState } from 'react';
import { useCargoFlow } from '@/components/context/cargoflow-context';
import {
  Activity,
  X,
  Database,
  Layers,
  HardDrive,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Zap,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  FileCode,
  Check,
  Eye,
  Trash2,
  Bus as BusIcon,
} from 'lucide-react';
import { QueuedOperation } from '@/lib/continuity-types';

export function RecoveryCenterModal() {
  const {
    backendStatus,
    continuityMode,
    pendingQueue,
    activeProtectedTasks,
    activeProtectedTrips,
    protectedTripsCount,
    buses,
    routes,
    lastSyncTimestamp,
    syncProgressMessage,
    syncStepLogs,
    conflictItems,
    isRecoveryCenterOpen,
    setIsRecoveryCenterOpen,
    restoreConnection,
    simulateDatabaseFailure,
    syncQueueNow,
    resolveConflict,
    simulateConflictOnNextOperation,
  } = useCargoFlow();

  const [selectedOp, setSelectedOp] = useState<QueuedOperation | null>(null);
  const [conflictModalOp, setConflictModalOp] = useState<QueuedOperation | null>(null);

  if (!isRecoveryCenterOpen) return null;

  const isOffline = backendStatus === 'SIMULATED_OFFLINE';
  const isSyncing = continuityMode === 'SYNCING';
  const pendingCount = pendingQueue.filter((q) => q.status === 'PENDING' || q.status === 'NEEDS_REVIEW').length;
  const needsReviewCount = conflictItems.length;

  const busesMap = new Map(buses.map((b) => [b.id, b]));
  const routesMap = new Map(routes.map((r) => [r.id, r]));

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="bg-white text-zinc-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-zinc-200 flex flex-col font-sans">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-100 flex items-start justify-between bg-zinc-50/50">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[11px] font-bold">
              <Activity className="w-3.5 h-3.5 text-blue-700" />
              <span>Operational Recovery Center & Synchronization Ledger</span>
            </div>
            <h2 className="text-2xl font-extrabold text-zinc-950 tracking-tight">
              Datastore Resilience Status
            </h2>
            <p className="text-xs text-zinc-500">
              Audit local in-flight operations, inspect idempotent write queues, and manage multi-bus restoration states.
            </p>
          </div>

          <button
            onClick={() => setIsRecoveryCenterOpen(false)}
            className="p-2 rounded-xl hover:bg-zinc-200/60 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Key Metrics Cards (Section 18) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            
            {/* Primary Datastore */}
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-1">
              <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Primary Datastore</div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOffline ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                  }`}
                />
                <span className={`text-xs font-mono font-bold ${isOffline ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {isOffline ? 'OFFLINE' : 'ONLINE'}
                </span>
              </div>
            </div>

            {/* Continuity Mode */}
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-1">
              <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Continuity Mode</div>
              <div className={`text-xs font-mono font-bold ${isOffline ? 'text-amber-700' : 'text-zinc-700'}`}>
                {isOffline ? '● ACTIVE' : 'READY'}
              </div>
            </div>

            {/* Active Protected Tasks */}
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-1">
              <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Protected Operations</div>
              <div className="text-sm font-extrabold text-zinc-900 font-mono">
                {protectedTripsCount} trips, {activeProtectedTasks.length} task
              </div>
            </div>

            {/* Pending Synchronization */}
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-1">
              <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Pending Sync</div>
              <div className={`text-base font-extrabold ${pendingCount > 0 ? 'text-amber-600' : 'text-zinc-900'}`}>
                {pendingCount}
              </div>
            </div>

            {/* Last Successful Sync */}
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-1">
              <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Last Sync</div>
              <div className="text-xs font-mono font-bold text-zinc-800">
                {lastSyncTimestamp || 'Just now'}
              </div>
            </div>

            {/* Needs Review (Conflicts) */}
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-1">
              <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Needs Review</div>
              <div className={`text-base font-extrabold ${needsReviewCount > 0 ? 'text-rose-600' : 'text-zinc-500'}`}>
                {needsReviewCount}
              </div>
            </div>

          </div>

          {/* Data Classification & Blackout Policy Panel */}
          <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>Resilient Data Availability Classification</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* STATIC_CACHE */}
              <div className="p-3 bg-white rounded-xl border border-zinc-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900 font-mono">STATIC_CACHE</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    AVAILABLE
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Routes, stops, road geometries, depot coordinates, timetables.
                </p>
                <div className="text-[10px] text-emerald-700 font-mono font-semibold pt-1">
                  ✓ Served from local cache
                </div>
              </div>

              {/* ACTIVE_LOCAL */}
              <div className="p-3 bg-white rounded-xl border border-zinc-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900 font-mono">ACTIVE_LOCAL</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isOffline ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {isOffline ? 'PROTECTED' : 'SYNCHRONIZED'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  All {protectedTripsCount} in-transit buses, Shipment #482, local bookings, route logs.
                </p>
                <div className="text-[10px] text-amber-700 font-mono font-semibold pt-1">
                  ✓ Protected in IndexedDB
                </div>
              </div>

              {/* SERVER_ONLY */}
              <div className="p-3 bg-white rounded-xl border border-zinc-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900 font-mono">SERVER_ONLY</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isOffline ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {isOffline ? 'WITHHELD' : 'AVAILABLE'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Old historical waybills (#471), live GPS stream, server metrics, analytics.
                </p>
                <div className={`text-[10px] font-mono font-semibold pt-1 ${isOffline ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {isOffline ? '✕ Unavailable (Datastore offline)' : '✓ Live central datastore'}
                </div>
              </div>
            </div>
          </div>

          {/* Active Protected Fleet Snapshots (All In-Transit Trips) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <BusIcon className="w-4 h-4 text-amber-600" />
                <span>Active Protected In-Transit Fleet ({activeProtectedTrips.length} Buses)</span>
              </h3>
              <span className="text-[11px] font-mono text-zinc-500">
                {isOffline ? 'Preserved as Last Known 10:31 AM' : 'Live Fleet State'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeProtectedTrips.map((trip) => {
                const bus = busesMap.get(trip.busId);
                const route = routesMap.get(trip.routeId);

                return (
                  <div
                    key={trip.id}
                    className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-extrabold text-zinc-900 bg-white px-2 py-0.5 rounded border border-zinc-200">
                        {bus?.registration || trip.busId}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        ● {trip.tripStatus}
                      </span>
                    </div>

                    <div className="font-bold text-zinc-800 line-clamp-1">
                      {route?.name || `Route ${trip.routeId}`}
                    </div>

                    <div className="pt-1 border-t border-zinc-200/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                      <span>Hold: {trip.availableCargoCapacityKg}kg free</span>
                      <span className="text-amber-800 font-semibold">{isOffline ? '10:31 AM' : 'Live'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sync Progress Banner if syncing */}
          {isSyncing && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                <span>{syncProgressMessage || 'Synchronizing queued write operations with server...'}</span>
              </div>
              <div className="space-y-1 pl-6 text-[11px] font-mono text-blue-800">
                {syncStepLogs.map((log, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conflict Notice if any exist */}
          {conflictItems.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span className="text-xs font-bold text-rose-900">
                    {conflictItems.length} Operation Conflict Detected
                  </span>
                </div>
                <span className="text-[11px] text-rose-600 font-mono">Manual Review Required</span>
              </div>

              <div className="space-y-2">
                {conflictItems.map((conflictOp) => (
                  <div
                    key={conflictOp.operation_id}
                    className="p-3 bg-white border border-rose-200 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-zinc-900">{conflictOp.operation_id}</span>
                      <span className="text-zinc-500 ml-2 font-medium">{conflictOp.entity_name}</span>
                      <div className="text-[11px] text-rose-700 italic mt-0.5">
                        {conflictOp.conflict_reason || 'Conflicting state found on server.'}
                      </div>
                    </div>

                    <button
                      onClick={() => setConflictModalOp(conflictOp)}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer"
                    >
                      Review & Resolve
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Offline Queue Inspector (Section 9) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Local Pending Operation Queue ({pendingQueue.length})</span>
              </h3>

              <div className="flex items-center gap-2">
                {isOffline ? (
                  <button
                    onClick={restoreConnection}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Restore & Sync</span>
                  </button>
                ) : (
                  <button
                    onClick={syncQueueNow}
                    disabled={isSyncing || pendingCount === 0}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Sync Queue Now</span>
                  </button>
                )}
              </div>
            </div>

            {pendingQueue.length === 0 ? (
              <div className="bg-zinc-50 rounded-2xl p-8 text-center border border-zinc-200/80 space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <div className="font-bold text-zinc-900 text-xs">Offline Queue is Clean</div>
                <div className="text-zinc-500 text-[11px]">
                  All state changes are synchronized with the central database ledger.
                </div>
              </div>
            ) : (
              <div className="border border-zinc-200 rounded-2xl overflow-hidden divide-y divide-zinc-100">
                {pendingQueue.map((op) => {
                  const isPending = op.status === 'PENDING';
                  const isSyncingOp = op.status === 'SYNCING';
                  const isSynced = op.status === 'SYNCED';
                  const isConflict = op.status === 'NEEDS_REVIEW';

                  return (
                    <div
                      key={op.operation_id}
                      className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
                        isConflict
                          ? 'bg-rose-50/50'
                          : isPending
                          ? 'bg-amber-50/20'
                          : 'bg-white'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                            {op.operation_id}
                          </span>

                          <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-bold border border-zinc-200">
                            {op.operation_type}
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                              isSynced
                                ? 'bg-emerald-100 text-emerald-800'
                                : isSyncingOp
                                ? 'bg-blue-100 text-blue-800'
                                : isConflict
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {op.status}
                          </span>
                        </div>

                        <div className="font-bold text-zinc-900 text-xs">
                          {op.entity_name}
                        </div>

                        <div className="text-[11px] font-mono text-zinc-400">
                          Idempotency Key: <span className="text-zinc-600">{op.idempotency_key}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedOp(op)}
                          className="px-2.5 py-1 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-zinc-500" />
                          <span>Inspect Payload</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans">
          <div className="flex items-center gap-2">
            <button
              onClick={() => simulateConflictOnNextOperation()}
              className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs transition-colors cursor-pointer border border-amber-300"
            >
              ⚡ Arm Conflict for Next Mutation
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRecoveryCenterOpen(false)}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Close Inspector
            </button>
          </div>
        </div>
      </div>

      {/* JSON Payload Inspector Sub-Modal */}
      {selectedOp && (
        <div className="fixed inset-0 z-60 bg-zinc-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 text-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-zinc-700 space-y-4 font-sans">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs text-lime-400 font-bold">{selectedOp.operation_id}</span>
                <h3 className="text-base font-bold text-white">{selectedOp.entity_name}</h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">Key: {selectedOp.idempotency_key}</p>
              </div>
              <button
                onClick={() => setSelectedOp(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 font-mono text-xs text-emerald-400 max-h-72 overflow-y-auto">
              <pre>{JSON.stringify(selectedOp.payload, null, 2)}</pre>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedOp(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs cursor-pointer"
              >
                Close Payload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Merge Conflict Resolution Modal */}
      {conflictModalOp && (
        <div className="fixed inset-0 z-60 bg-zinc-950/80 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-rose-300 space-y-4">
            <div className="flex items-start justify-between border-b border-zinc-100 pb-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Merge Conflict Resolution</span>
                </div>
                <h3 className="text-lg font-bold text-zinc-950">{conflictModalOp.entity_name}</h3>
              </div>
              <button
                onClick={() => setConflictModalOp(null)}
                className="p-1 text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              {/* Local Device Version */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                <div className="font-bold text-amber-900 font-mono flex items-center justify-between">
                  <span>LOCAL VERSION</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200">Device</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-amber-100 font-mono text-[11px] text-zinc-700 max-h-40 overflow-y-auto">
                  <pre>{JSON.stringify(conflictModalOp.local_snapshot || conflictModalOp.payload, null, 2)}</pre>
                </div>
                <button
                  onClick={async () => {
                    await resolveConflict(conflictModalOp.operation_id, 'USE_LOCAL');
                    setConflictModalOp(null);
                  }}
                  className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Accept Local Version
                </button>
              </div>

              {/* Central Server Version */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
                <div className="font-bold text-blue-900 font-mono flex items-center justify-between">
                  <span>SERVER VERSION</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-200">Database</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-blue-100 font-mono text-[11px] text-zinc-700 max-h-40 overflow-y-auto">
                  <pre>{JSON.stringify(conflictModalOp.server_snapshot || { status: 'MODIFIED_ON_SERVER' }, null, 2)}</pre>
                </div>
                <button
                  onClick={async () => {
                    await resolveConflict(conflictModalOp.operation_id, 'USE_SERVER');
                    setConflictModalOp(null);
                  }}
                  className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Accept Server Version
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
