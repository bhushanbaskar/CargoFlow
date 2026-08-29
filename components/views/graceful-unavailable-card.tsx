'use client';

import React, { useState } from 'react';
import { useCargoFlow } from '@/components/context/cargoflow-context';
import { AlertCircle, RefreshCw, Database, Clock, HardDrive, Info } from 'lucide-react';

export function GracefulUnavailableCard({
  waybillNumber,
  onRetry,
  onViewLastKnown,
  hasCachedData = false,
  lastKnownTimestamp,
}: {
  waybillNumber?: string;
  onRetry?: () => void;
  onViewLastKnown?: () => void;
  hasCachedData?: boolean;
  lastKnownTimestamp?: string;
}) {
  const { restoreConnection, backendStatus } = useCargoFlow();
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);

  const handleRetryClick = async () => {
    setIsRetrying(true);
    setRetryMessage(null);

    // Simulate contacting backend
    await new Promise((r) => setTimeout(r, 600));

    if (backendStatus === 'SIMULATED_OFFLINE') {
      setIsRetrying(false);
      setRetryMessage('Primary datastore is still unavailable. Please retry once connection is restored.');
      setTimeout(() => setRetryMessage(null), 4000);
      if (onRetry) onRetry();
    } else {
      setIsRetrying(false);
      if (onRetry) onRetry();
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm space-y-6 text-center max-w-lg mx-auto font-sans">
      <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
        <Database className="w-7 h-7 text-amber-600" />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-bold text-zinc-900">Oops, something went wrong.</h3>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          Unable to retrieve the latest information for{' '}
          <strong className="text-zinc-800 font-mono">{waybillNumber || 'this record'}</strong> while the primary datastore is unavailable.
        </p>
      </div>

      {/* Information Banner */}
      <div className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200 text-left text-xs text-zinc-600 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-zinc-800 text-[11px]">
          <Info className="w-3.5 h-3.5 text-blue-600" />
          <span>Operational Continuity Notice</span>
        </div>
        <p className="text-[11px] text-zinc-500">
          In-flight active tasks remain fully protected on your device. Older archival records require a live backend connection.
        </p>
      </div>

      {retryMessage && (
        <div className="bg-amber-50 text-amber-900 border border-amber-200 p-3 rounded-xl text-xs font-semibold animate-in fade-in">
          {retryMessage}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={handleRetryClick}
          disabled={isRetrying}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isRetrying ? 'Checking connection...' : 'Retry'}</span>
        </button>

        {hasCachedData && onViewLastKnown && (
          <button
            onClick={onViewLastKnown}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            <span>View last known data ({lastKnownTimestamp || 'Cached'})</span>
          </button>
        )}
      </div>
    </div>
  );
}
