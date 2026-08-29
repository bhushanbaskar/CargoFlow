'use client';

import React from 'react';
import { useCargoFlow } from '@/components/context/cargoflow-context';
import {
  RefreshCw,
  Zap,
  RotateCcw,
  HardDrive,
  Layers,
  WifiOff,
} from 'lucide-react';

export function SimulationController() {
  const {
    backendStatus,
    continuityMode,
    pendingQueue,
    activeProtectedTasks,
    protectedTripsCount,
    simulateDatabaseFailure,
    restoreConnection,
    resetContinuityDemo,
    setIsRecoveryCenterOpen,
  } = useCargoFlow();

  const isOffline = backendStatus === 'SIMULATED_OFFLINE';
  const isSyncing = continuityMode === 'SYNCING';
  const pendingCount = pendingQueue.filter((q) => q.status === 'PENDING' || q.status === 'NEEDS_REVIEW').length;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-4xl w-[95%] sm:w-auto font-sans">
      <div className="bg-zinc-950/95 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl border border-zinc-800 shadow-2xl flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Continuity & Datastore Status Group */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Primary Datastore */}
          <div className="flex items-center gap-2 bg-zinc-900/90 px-2.5 py-1 rounded-xl border border-zinc-800">
            <span className={`w-2 h-2 rounded-full ${isOffline ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">PRIMARY DATASTORE</span>
              <span className="text-[11px] font-mono font-bold text-white">
                {isOffline ? 'OFFLINE' : 'ONLINE'}
              </span>
            </div>
          </div>

          {/* Continuity Store */}
          <div className="flex items-center gap-1.5 bg-zinc-900/90 px-2.5 py-1 rounded-xl border border-zinc-800">
            <HardDrive className={`w-3 h-3 ${isOffline ? 'text-amber-400' : 'text-zinc-500'}`} />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">CONTINUITY STORE</span>
              <span className="text-[11px] font-mono font-bold text-white">
                {isOffline
                  ? `ACTIVE (${protectedTripsCount} trips, ${activeProtectedTasks.length} task)`
                  : 'READY'}
              </span>
            </div>
          </div>

          {/* Server Data Status */}
          {isOffline && (
            <div className="flex items-center gap-1.5 bg-zinc-900/90 px-2.5 py-1 rounded-xl border border-zinc-800">
              <WifiOff className="w-3 h-3 text-rose-400" />
              <span className="text-[10px] font-mono text-rose-400 font-bold uppercase">SERVER DATA OFFLINE</span>
            </div>
          )}

          {/* Pending Queue Count */}
          {pendingCount > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-xl font-mono text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>{pendingCount} PENDING SYNC</span>
            </div>
          )}
        </div>

        {/* Scalable Action Group */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Primary Operational Utility: Recovery Center */}
          <button
            onClick={() => setIsRecoveryCenterOpen(true)}
            className="h-8.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold text-xs flex items-center gap-1.5 border border-zinc-700/80 transition-colors cursor-pointer active:scale-[0.98]"
          >
            <Layers className="w-3.5 h-3.5 text-lime-400" />
            <span>Recovery Center</span>
          </button>

          {/* Secondary Demo/Testing Utility: Simulate Blackout / Restore Connection */}
          {isOffline ? (
            <button
              onClick={restoreConnection}
              disabled={isSyncing}
              className="h-8.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 border border-emerald-500/50 transition-all cursor-pointer active:scale-[0.98]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Restore Connection'}</span>
            </button>
          ) : (
            <button
              onClick={simulateDatabaseFailure}
              className="h-8.5 px-3 rounded-xl bg-amber-500/90 hover:bg-amber-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5 border border-amber-400/50 transition-all cursor-pointer active:scale-[0.98]"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Simulate Blackout</span>
            </button>
          )}

          {/* Tertiary Utility: Reset Demo */}
          <button
            onClick={resetContinuityDemo}
            title="Reset Demo State to Baseline"
            className="h-8.5 w-8.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 flex items-center justify-center transition-colors cursor-pointer active:scale-[0.98]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
