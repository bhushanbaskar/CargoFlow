'use client';

import React from 'react';
import { useCargoFlow } from '@/components/context/cargoflow-context';
import {
  TrendingUp,
  DollarSign,
  Bus as BusIcon,
  Package,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  PieChart,
  BarChart3,
  MapPin,
  Activity,
  AlertTriangle,
  RefreshCw,
  HardDrive,
} from 'lucide-react';

export function AnalyticsView() {
  const {
    totalRevenue,
    networkUtilizationPercentage,
    trips,
    buses,
    shipments,
    courierCompanies,
    backendStatus,
    isServerDataAvailable,
    activeProtectedTasks,
    pendingQueue,
    restoreConnection,
  } = useCargoFlow();

  const isOffline = backendStatus === 'SIMULATED_OFFLINE';

  const topRoutes = [
    { name: 'Nashik to Pune (Shivaji Nagar)', revenue: 4850, volume: '185 kg', fillPct: 82 },
    { name: 'Nashik to Chhatrapati Sambhajinagar', revenue: 3400, volume: '140 kg', fillPct: 74 },
    { name: 'Nashik to Borivali (Mumbai)', revenue: 2900, volume: '110 kg', fillPct: 68 },
    { name: 'Nashik to Dhule', revenue: 1700, volume: '75 kg', fillPct: 55 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 font-sans">
      
      {/* Executive Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            MSRTC Network Executive Analytics
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            {isOffline
              ? 'Primary datastore is offline. Server-only historical analytics and live aggregates are suspended.'
              : 'Real-time hold capacity monetization performance across Nashik Division.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isOffline ? (
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-mono text-xs font-bold border border-amber-300 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-amber-600" />
              <span>Continuity Mode Active</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-mono text-xs font-bold border border-emerald-200">
              ● Network Health: 99.8% Online
            </span>
          )}
        </div>
      </div>

      {/* Hero Stats Grid (Enforces Blackout Read Policy) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Freight Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <div className="text-3xl font-mono font-extrabold text-slate-900">
            {totalRevenue !== null ? `₹${totalRevenue.toLocaleString('en-IN')}` : '—'}
          </div>
          <div className="text-[11px] font-semibold flex items-center gap-1 font-mono">
            {isServerDataAvailable ? (
              <span className="text-emerald-600 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> +18.4% vs last week
              </span>
            ) : (
              <span className="text-amber-700">Live data unavailable</span>
            )}
          </div>
        </div>

        {/* Hold Capacity Utilization */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Hold Capacity Utilization</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-mono font-extrabold text-slate-900">
            {networkUtilizationPercentage !== null ? `${networkUtilizationPercentage}%` : '—'}
          </div>
          <div className="text-[11px] font-semibold flex items-center gap-1 font-mono">
            {isServerDataAvailable ? (
              <span className="text-blue-600">Optimal Fill Threshold achieved</span>
            ) : (
              <span className="text-amber-700">Live telemetry offline</span>
            )}
          </div>
        </div>

        {/* Active Bus Trips / Protected Tasks */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>{isOffline ? 'Protected Local Tasks' : 'Active Bus Trips'}</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <BusIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-mono font-extrabold text-slate-900">
            {isOffline ? activeProtectedTasks.length : trips.length}
          </div>
          <div className="text-[11px] text-purple-600 font-semibold font-mono">
            {isOffline ? 'Saved on this device' : '30 Active Vehicles Operational'}
          </div>
        </div>

        {/* Active Partners / Pending Operations */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>{isOffline ? 'Pending Synchronization' : 'Active Courier Partners'}</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-mono font-extrabold text-slate-900">
            {isOffline ? pendingQueue.length : courierCompanies.length}
          </div>
          <div className="text-[11px] text-amber-600 font-semibold font-mono">
            {isOffline ? 'Queued in IndexedDB' : 'BlueDart, Delhivery, DTDC'}
          </div>
        </div>
      </div>

      {/* Main Historical Analytics Content */}
      {isOffline ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">Oops, something went wrong.</h2>
            <p className="text-slate-600 text-xs leading-relaxed">
              Historical analytics and central database aggregates are unavailable while the primary datastore is offline.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => restoreConnection()}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm inline-flex items-center gap-2 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-lime-300" />
              <span>Restore Connection & Retry</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Top Routes */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <h2 className="font-bold text-slate-900 text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Top Revenue Generating Bus Routes
              </span>
              <span className="text-xs text-slate-400 font-mono">Nashik Division</span>
            </h2>

            <div className="space-y-3">
              {topRoutes.map((route, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-xs text-slate-900">{route.name}</div>
                    <div className="font-mono text-sm font-bold text-emerald-600">
                      ₹{route.revenue.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Cargo Volume: {route.volume}</span>
                      <span>Hold Utilization: {route.fillPct}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: `${route.fillPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Courier Credit & Partner Activity */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Courier Partner Accounts
            </h2>

            <div className="space-y-3">
              {courierCompanies.map((company) => (
                <div key={company.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-xs text-slate-900">{company.name}</div>
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {company.code}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 font-mono">
                    <span>Used: ₹{company.usedCredit.toLocaleString('en-IN')}</span>
                    <span>Limit: ₹{company.creditLimit.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
