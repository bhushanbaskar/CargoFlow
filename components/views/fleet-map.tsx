'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useCargoFlow } from '@/components/context/cargoflow-context';
import { Stop, Route, ScheduledTrip, Bus } from '@/lib/types';
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
  SlidersHorizontal
} from 'lucide-react';

// Dynamic import for Leaflet map component without SSR
const LeafletFleetMap = dynamic(() => import('@/components/maps/leaflet-fleet-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-zinc-200/60 animate-pulse rounded-3xl flex items-center justify-center text-zinc-500 font-medium text-xs">
      Loading Standard Interactive Map...
    </div>
  )
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
    isSimulating
  } = useCargoFlow();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'IN_TRANSIT' | 'SCHEDULED'>('IN_TRANSIT');

  const busesMap = useMemo(() => new Map(buses.map(b => [b.id, b])), [buses]);
  const routesMap = useMemo(() => new Map(routes.map(r => [r.id, r])), [routes]);
  const stopsMap = useMemo(() => new Map(stops.map(s => [s.id, s])), [stops]);

  // Filtered trips for left drawer & map
  const filteredTrips = useMemo(() => {
    return trips.filter(trip => {
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
    () => trips.find(t => t.id === selectedTripId) || filteredTrips[0] || trips[0],
    [trips, selectedTripId, filteredTrips]
  );

  const activeBus = activeTrip ? busesMap.get(activeTrip.busId) : null;
  const activeRoute = activeTrip ? routesMap.get(activeTrip.routeId) : null;
  const activeShipments = activeTrip ? shipments.filter(s => s.tripId === activeTrip.id) : [];

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#eef0f3] p-4 lg:p-6 space-y-5">
      
      {/* Top Header & Metrics Section (Reference Image 1 & 2 DNA) */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight font-sans">
              Trucks & Fleet Management
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#d9f99d] text-slate-900 border border-lime-300">
              Live GPS Network
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time MSRTC scheduled bus capacity, GPS telemetry, and luggage hold dispatch.
          </p>
        </div>

        {/* 3 Main KPI Metrics Cards with Pill Badges (Reference Image 1) */}
        <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
          {/* Card 1: Total Cargo Weight */}
          <div className="bg-white p-3.5 rounded-2xl border border-zinc-200/80 shadow-2xs flex items-center justify-between min-w-[150px]">
            <div>
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Cargo Weight</div>
              <div className="text-lg font-extrabold text-zinc-900 font-mono mt-0.5">7,340 kg</div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#d9f99d] text-slate-900">
              +33%
            </span>
          </div>

          {/* Card 2: Active Waybills / Pallets */}
          <div className="bg-white p-3.5 rounded-2xl border border-zinc-200/80 shadow-2xs flex items-center justify-between min-w-[150px]">
            <div>
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Waybills</div>
              <div className="text-lg font-extrabold text-zinc-900 font-mono mt-0.5">120</div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              +15%
            </span>
          </div>

          {/* Card 3: Free Capacity Alerts */}
          <div className="bg-white p-3.5 rounded-2xl border border-zinc-200/80 shadow-2xs flex items-center justify-between min-w-[150px]">
            <div>
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Hold Free</div>
              <div className="text-lg font-extrabold text-zinc-900 font-mono mt-0.5">62 trips</div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
              -22%
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid Section: Left Parcels Drawer + Standard Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[620px]">
        
        {/* Left Floating Parcel Drawer (Matching Reference Image 2) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-4 border border-zinc-200/80 shadow-xs flex flex-col h-full overflow-hidden">
          
          {/* Drawer Filter Header */}
          <div className="space-y-3 pb-3 border-b border-zinc-100">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-sm text-zinc-900">
                Active Freight Shipments
              </h2>
              <span className="text-xs font-mono font-bold text-zinc-400">
                {filteredTrips.length} active
              </span>
            </div>

            {/* Filter Pill Tabs */}
            <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-full">
              {(['IN_TRANSIT', 'SCHEDULED', 'ALL'] as const).map(status => (
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
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-900"
              />
            </div>
          </div>

          {/* Scrollable Parcel List (Image 2 style) */}
          <div className="flex-1 overflow-y-auto py-3 space-y-3 scrollbar-thin scrollbar-thumb-zinc-200 pr-1">
            {filteredTrips.map(trip => {
              const bus = busesMap.get(trip.busId);
              const route = routesMap.get(trip.routeId);
              const isSelected = selectedTripId === trip.id;
              const srcStop = stopsMap.get(route?.sourceStopId || '');
              const destStop = stopsMap.get(route?.destinationStopId || '');

              const tripShipments = shipments.filter(s => s.tripId === trip.id);

              return (
                <div
                  key={trip.id}
                  onClick={() => setSelectedTripId(trip.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-md ring-2 ring-zinc-900/10'
                      : 'bg-zinc-50/80 text-zinc-800 border-zinc-200/90 hover:bg-white hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-lg ${
                        isSelected ? 'bg-zinc-800 text-white' : 'bg-white text-zinc-900 border border-zinc-200'
                      }`}>
                        {bus?.registration || trip.busId}
                      </span>
                      <span className={`text-[10px] font-bold ${isSelected ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {bus?.busType}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                        trip.tripStatus === 'IN_TRANSIT'
                          ? 'bg-[#d9f99d] text-slate-900'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {trip.tripStatus === 'IN_TRANSIT' ? 'In Transit' : 'Scheduled'}
                    </span>
                  </div>

                  {/* Route Name with Arrow */}
                  <div className="flex items-center gap-1.5 font-bold text-xs my-1">
                    <span>{srcStop?.name || 'Origin'}</span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-lime-300' : 'text-zinc-400'}`} />
                    <span>{destStop?.name || 'Destination'}</span>
                  </div>

                  <div className={`text-[11px] font-mono mt-1 ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                    Available Hold: <strong className={isSelected ? 'text-lime-300' : 'text-zinc-900'}>{trip.availableCargoCapacityKg} kg free</strong>
                  </div>

                  {/* Driver / Conductor Footer (Matching Image 2 avatar row) */}
                  <div className={`flex items-center justify-between mt-3 pt-2.5 border-t text-xs ${
                    isSelected ? 'border-zinc-800' : 'border-zinc-200/60'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-zinc-300 text-zinc-900 flex items-center justify-center text-[10px] font-bold">
                        C
                      </div>
                      <span className={`text-[11px] font-medium ${isSelected ? 'text-zinc-300' : 'text-zinc-600'}`}>
                        Depot Conductor
                      </span>
                    </div>

                    <span className={`text-[11px] font-mono ${isSelected ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      {trip.departureTime}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Standard Interactive Map (Replacing SVG Map) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-zinc-200/80 shadow-xs relative overflow-hidden h-full">
          <LeafletFleetMap
            trips={trips}
            buses={buses}
            routes={routes}
            stops={stops}
            selectedTripId={selectedTripId}
            onSelectTrip={setSelectedTripId}
          />
        </div>
      </div>

      {/* Bottom Schedule Gantt / Trip Timeline Bar (Reference Image 1 DNA) */}
      <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-900" />
            <h3 className="font-extrabold text-sm text-zinc-900">
              Today&apos;s Dispatch Timeline & Load Slots (Jun 14, 2026)
            </h3>
          </div>
          <span className="text-xs font-mono text-zinc-500">
            MSRTC Nashik Division • 60 Scheduled Trips
          </span>
        </div>

        {/* Timeline Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {trips.slice(0, 4).map(t => {
            const bus = busesMap.get(t.busId);
            const route = routesMap.get(t.routeId);
            return (
              <div
                key={t.id}
                onClick={() => setSelectedTripId(t.id)}
                className="bg-[#7000ff] text-white p-3.5 rounded-2xl shadow-sm cursor-pointer hover:bg-[#5f00dc] transition-colors space-y-2"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono font-bold">{bus?.registration}</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-mono text-[10px]">
                    {t.departureTime}
                  </span>
                </div>
                <div className="font-extrabold text-xs line-clamp-1">{route?.name}</div>
                <div className="flex items-center justify-between text-[10px] text-white/80 font-mono pt-1">
                  <span>Free Hold: {t.availableCargoCapacityKg}kg</span>
                  <span>{t.tripStatus}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
