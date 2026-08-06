'use client';

import React, { useState } from 'react';
import { useCargoFlow } from '@/components/context/cargoflow-context';
import { Bus as BusIcon, Building2, MapPin, Plus, Search } from 'lucide-react';

export function FleetManageView() {
  const { buses, depots, stops, routes } = useCargoFlow();
  const [activeSubTab, setActiveSubTab] = useState<'BUSES' | 'DEPOTS' | 'ROUTES'>('BUSES');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBuses = buses.filter(
    b =>
      b.registration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.busType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans">
            MSRTC Fleet & Depot Inventory
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Manage physical bus vehicles, cargo hold capacities, depots, and terminal stops.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('BUSES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'BUSES' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700'
            }`}
          >
            Buses ({buses.length})
          </button>
          <button
            onClick={() => setActiveSubTab('DEPOTS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'DEPOTS' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700'
            }`}
          >
            Depots ({depots.length})
          </button>
          <button
            onClick={() => setActiveSubTab('ROUTES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'ROUTES' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700'
            }`}
          >
            Routes ({routes.length})
          </button>
        </div>
      </div>

      {activeSubTab === 'BUSES' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-base">MSRTC Bus Fleet Register</h2>
            <input
              type="text"
              placeholder="Search registration..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBuses.map(bus => (
              <div key={bus.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-slate-900 bg-white px-2.5 py-1 rounded border border-slate-200">
                    {bus.registration}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    {bus.busType}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                  <span>Hold Capacity:</span>
                  <strong className="font-mono text-slate-900">{bus.cargoCapacityKg} kg</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'DEPOTS' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <h2 className="font-bold text-slate-900 text-base">Operational Depots (Nashik Division)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {depots.map(depot => {
              const stop = stops.find(s => s.id === depot.stopId);
              return (
                <div key={depot.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 text-sm">{depot.name}</div>
                  <div className="text-xs text-slate-500 font-mono">ID: {depot.id} • Terminal: {stop?.name || depot.stopId}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeSubTab === 'ROUTES' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <h2 className="font-bold text-slate-900 text-base">Active Scheduled Bus Routes</h2>
          <div className="space-y-2">
            {routes.map(r => (
              <div key={r.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <strong className="text-slate-900 font-bold">{r.name}</strong>
                  <span className="text-slate-500 text-[11px] block font-mono">{r.id} • {r.intermediateStopIds.length} intermediate stop(s)</span>
                </div>
                <span className="text-blue-600 font-semibold text-[11px]">Division: Nashik</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
