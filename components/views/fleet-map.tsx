'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useCargoFlow } from '@/components/context/cargoflow-context';
import { Stop, Route, ScheduledTrip, Bus } from '@/lib/types';
import PRECOMPUTED_ROUTES from '@/lib/precomputed-routes.json';
import {
  Bus as BusIcon,
  MapPin,
  Navigation,
  Clock,
  Gauge,
  Package,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  TrendingUp,
  PhoneCall,
  User,
  ArrowRight,
  SlidersHorizontal,
  HardDrive,
  WifiOff,
} from 'lucide-react';

// Dynamic import for Leaflet map component without SSR
const LeafletFleetMap = dynamic(() => import('@/components/maps/leaflet-fleet-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-zinc-200/60 animate-pulse rounded-3xl flex items-center justify-center text-zinc-500 font-medium text-xs font-mono">
      Loading Standard Interactive Map...
    </div>
  ),
});

export function FleetMapView() {
  const {
    stops,
    routes,
    buses,
    trips,
    shipments,
    selectedTripId,
    setSelectedTripId,
    backendStatus,
    isServerDataAvailable,
    activeProtectedTasks,
    protectedTripsCount,
  } = useCargoFlow();

  const isOffline = backendStatus === 'SIMULATED_OFFLINE';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'IN_TRANSIT' | 'SCHEDULED'>('IN_TRANSIT');

  const busesMap = useMemo(() => new Map(buses.map((b) => [b.id, b])), [buses]);
  const routesMap = useMemo(() => new Map(routes.map((r) => [r.id, r])), [routes]);
  const stopsMap = useMemo(() => new Map(stops.map((s) => [s.id, s])), [stops]);

  // Filtered trips for left drawer & map
  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const route = routesMap.get(trip.routeId);
      const bus = busesMap.get(trip.busId);
      const searchLower = searchTerm.toLowerCase();

      const matchesSearch =
        !searchTerm ||
        trip.id.toLowerCase().includes(searchLower) ||
        bus?.registration.toLowerCase().includes(searchLower) ||
        route?.name.toLowerCase().includes(searchLower);

      const matchesFilter =
        filterStatus === 'ALL' || trip.tripStatus === filterStatus;

      return matchesSearch && matchesFilter;
    });
  }, [trips, routesMap, busesMap, searchTerm, filterStatus]);

  const activeTrip = useMemo(
    () => trips.find((t) => t.id === selectedTripId) || filteredTrips[0] || trips[0],
    [trips, selectedTripId, filteredTrips]
  );

  const activeBus = activeTrip ? busesMap.get(activeTrip.busId) : null;
  const activeRoute = activeTrip ? routesMap.get(activeTrip.routeId) : null;
  const activeShipments = activeTrip ? shipments.filter((s) => s.tripId === activeTrip.id) : [];

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#eef0f3] p-4 lg:p-6 space-y-5 font-sans">
      
      {/* Top Header & Metrics Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
              Trucks & Fleet Management
            </h1>
            {isOffline ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 font-mono flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-amber-600" />
                <span>Static Cache · {protectedTripsCount} In-Transit Protected</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#d9f99d] text-slate-900 border border-lime-300">
                Live GPS Network
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {isOffline
              ? `Displaying ${protectedTripsCount} active in-transit trip(s) from local continuity store. Live GPS stream offline.`
              : 'Real-time MSRTC scheduled bus capacity, GPS telemetry, and luggage hold dispatch.'}
          </p>
        </div>

        {/* 3 Main KPI Metrics Cards (Enforces Read Blackout Policy) */}
        <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
          {/* Card 1: Total Cargo Weight */}
          <div className="bg-white p-3.5 rounded-2xl border border-zinc-200/80 shadow-2xs flex items-center justify-between min-w-[150px]">
            <div>
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Cargo Weight</div>
              <div className="text-lg font-extrabold text-zinc-900 font-mono mt-0.5">
                {isServerDataAvailable ? '7,340 kg' : '—'}
              </div>
              {!isServerDataAvailable && (
                <div className="text-[10px] text-amber-700 font-semibold font-mono">Live data unavailable</div>
              )}
            </div>
            {isServerDataAvailable ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#d9f99d] text-slate-900">
                +33%
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-600">
                Offline
              </span>
            )}
          </div>

          {/* Card 2: Active Waybills / Protected Tasks */}
          <div className="bg-white p-3.5 rounded-2xl border border-zinc-200/80 shadow-2xs flex items-center justify-between min-w-[150px]">
            <div>
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                {isOffline ? 'Protected Ops' : 'Waybills'}
              </div>
              <div className="text-lg font-extrabold text-zinc-900 font-mono mt-0.5">
                {isServerDataAvailable ? '120' : `${protectedTripsCount} trips, ${activeProtectedTasks.length} task`}
              </div>
              {!isServerDataAvailable && (
                <div className="text-[10px] text-amber-700 font-semibold font-mono">Protected in continuity store</div>
              )}
            </div>
            {isServerDataAvailable ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                +15%
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                Protected
              </span>
            )}
          </div>

          {/* Card 3: Free Capacity Alerts */}
          <div className="bg-white p-3.5 rounded-2xl border border-zinc-200/80 shadow-2xs flex items-center justify-between min-w-[150px]">
            <div>
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Hold Free</div>
              <div className="text-lg font-extrabold text-zinc-900 font-mono mt-0.5">
                {isServerDataAvailable ? '62 trips' : '—'}
              </div>
              {!isServerDataAvailable && (
                <div className="text-[10px] text-amber-700 font-semibold font-mono">Live fleet unavailable</div>
              )}
            </div>
            {isServerDataAvailable ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                -22%
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-600">
                Offline
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid Section: Left Parcels Drawer + Standard Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[620px]">
        
        {/* Left Floating Parcel Drawer */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-4 border border-zinc-200/80 shadow-xs flex flex-col h-full overflow-hidden">
          
          {/* Drawer Filter Header */}
          <div className="space-y-3 pb-3 border-b border-zinc-100">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-sm text-zinc-900 flex items-center gap-2">
                <span>{isOffline ? 'Active Protected Trips' : 'Active Freight Shipments'}</span>
                {isOffline && (
                  <span className="px-2 py-0.2 rounded-full bg-amber-100 text-amber-900 text-[10px] font-mono font-bold">
                    {filteredTrips.length} PROTECTED
                  </span>
                )}
              </h2>
              <span className="text-xs font-mono font-bold text-zinc-400">
                {filteredTrips.length} visible
              </span>
            </div>

            {isOffline && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 font-medium space-y-1">
                <div className="font-bold flex items-center justify-between">
                  <span>Continuity Active</span>
                  <span className="font-mono text-[10px] bg-amber-200 px-1.5 py-0.2 rounded font-bold">
                    {filteredTrips.length} in-transit protected
                  </span>
                </div>
                <p className="text-[10px] text-amber-800 leading-snug">
                  All active in-transit buses are preserved from local continuity store as last known positions (10:31 AM).
                </p>
              </div>
            )}

            {/* Filter Pill Tabs */}
            <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-full">
              {(['IN_TRANSIT', 'SCHEDULED', 'ALL'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`flex-1 py-1 rounded-full text-[11px] font-bold transition-all ${
                    filterStatus === status
                      ? 'bg-zinc-900 text-white shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  {status === 'IN_TRANSIT' ? 'In Transit' : status === 'SCHEDULED' ? 'Scheduled' : 'All'}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search bus registration or route..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-900"
              />
            </div>
          </div>

          {/* Scrollable Parcel List */}
          <div className="flex-1 overflow-y-auto py-3 space-y-3 scrollbar-thin scrollbar-thumb-zinc-200 pr-1">
            {filteredTrips.map((trip) => {
              const bus = busesMap.get(trip.busId);
              const route = routesMap.get(trip.routeId);
              const isSelected = selectedTripId === trip.id;
              const srcStop = stopsMap.get(route?.sourceStopId || '');
              const destStop = stopsMap.get(route?.destinationStopId || '');

              const tripShipments = shipments.filter((s) => s.tripId === trip.id);

              return (
                <div
                  key={trip.id}
                  onClick={() => setSelectedTripId(trip.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-zinc-900 ring-2 ring-zinc-900/10 bg-zinc-50 shadow-sm'
                      : 'border-zinc-200/90 hover:border-zinc-300 hover:bg-zinc-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-zinc-900 bg-white px-2 py-0.5 rounded border border-zinc-200">
                          {bus?.registration || trip.busId}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                          {trip.tripStatus}
                        </span>
                        {isOffline && (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-200">
                            Last known 10:31 AM
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-zinc-800 mt-1.5 flex items-center gap-1.5">
                        <span>{srcStop?.name || 'Origin'}</span>
                        <ArrowRight className="w-3 h-3 text-zinc-400" />
                        <span>{destStop?.name || 'Destination'}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-emerald-700">
                        {trip.availableCargoCapacityKg} kg free
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        {tripShipments.length} parcel(s)
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Section: Standard Interactive Map */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-3 border border-zinc-200/80 shadow-xs relative overflow-hidden flex flex-col">
          <LeafletFleetMap
            trips={trips}
            buses={buses}
            routes={routes}
            stops={stops}
            selectedTripId={selectedTripId}
            onSelectTrip={(id) => setSelectedTripId(id)}
          />
        </div>
      </div>
    </div>
  );
}
