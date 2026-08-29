'use client';

import React from 'react';
import { useCargoFlow } from '@/components/context/cargoflow-context';
import {
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Activity,
  Layers,
} from 'lucide-react';

export function ContinuityStatusBar() {
  const {
    backendStatus,
    continuityMode,
    pendingQueue,
    activeProtectedTasks,
    lastSyncTimestamp,
    syncProgressMessage,
    conflictItems,
    setIsRecoveryCenterOpen,
  } = useCargoFlow();

  const pendingCount = pendingQueue.filter(
    (q) => q.status === 'PENDING' || q.status === 'NEEDS_REVIEW'
  ).length;

  const isOffline = backendStatus === 'SIMULATED_OFFLINE';
  const isSyncing = continuityMode === 'SYNCING';
  const hasConflict = conflictItems.length > 0;

  return (
    <div
      className={`border-b transition-colors duration-300 px-4 py-1.5 text-xs font-mono select-none ${
        isOffline
          ? 'bg-amber-950/90 text-amber-200 border-amber-800/80 shadow-inner'
          : isSyncing
          ? 'bg-blue-950/90 text-blue-200 border-blue-800/80'
          : hasConflict
          ? 'bg-rose-950/90 text-rose-200 border-rose-800/80'
          : 'bg-zinc-900 text-zinc-300 border-zinc-800'
      }`}
    >
      <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        {/* Left: Operational State Message */}
        <div className="flex items-center gap-3">
          {/* Pulsing Status Dot */}
          <div className="flex items-center gap-2">
            {isOffline ? (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 animate-pulse">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>CONTINUITY MODE ACTIVE</span>
              </span>
            ) : isSyncing ? (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/40">
                <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                <span>SYNCHRONIZING</span>
              </span>
            ) : hasConflict ? (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>NEEDS REVIEW ({conflictItems.length})</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>ONLINE</span>
              </span>
            )}
          </div>

          {/* Simple Language Status Statement */}
          <div className="text-[11px] font-sans">
            {isOffline ? (
              <span className="text-amber-100 font-medium">
                ● Primary datastore unavailable · Changes saved locally on this device
                {pendingCount > 0 && (
                  <strong className="ml-1 text-amber-300">
                    ({pendingCount} pending synchronization)
                  </strong>
                )}
              </span>
            ) : isSyncing ? (
              <span className="text-blue-100 font-medium">
                {syncProgressMessage || `↻ Syncing ${pendingCount} changes...`}
              </span>
            ) : hasConflict ? (
              <span className="text-rose-100 font-medium">
                ⚠ Conflict detected on server restoration · Requires operator review
              </span>
            ) : (
              <span className="text-zinc-400 font-medium">
                ● Online · All changes saved · Last synchronized {lastSyncTimestamp || 'just now'}
              </span>
            )}
          </div>
        </div>

        {/* Right: Telemetry Counts & Quick Recovery Center Trigger */}
        <div className="flex items-center gap-3 text-[11px]">
          <div className="hidden md:flex items-center gap-4 text-zinc-400">
            <span className="flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-zinc-400" />
              <span>Protected Tasks: <strong>{activeProtectedTasks.length}</strong></span>
            </span>

            <span>•</span>

            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3 text-zinc-400" />
              <span>Pending Queue: <strong className={pendingCount > 0 ? (isOffline ? 'text-amber-300' : 'text-blue-300') : 'text-zinc-300'}>{pendingCount}</strong></span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRecoveryCenterOpen(true)}
              className={`px-2.5 py-1 rounded-lg font-sans font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer ${
                isOffline || pendingCount > 0 || hasConflict
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-xs'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
              }`}
            >
              <Activity className="w-3 h-3" />
              <span>Recovery Center</span>
              {pendingCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 bg-black/40 rounded-full text-[9px]">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
