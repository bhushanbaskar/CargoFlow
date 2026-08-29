'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ScheduledTrip, Bus, Route, Stop } from '@/lib/types';
import { getRouteRoadGeometry, RoadRouteResult } from '@/lib/routing-service';
import type LType from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

interface LeafletFleetMapProps {
  trips: ScheduledTrip[];
  buses: Bus[];
  routes: Route[];
  stops: Stop[];
  selectedTripId: string | null;
  onSelectTrip: (tripId: string) => void;
}

export default function LeafletFleetMap({
  trips,
  buses,
  routes,
  stops,
  selectedTripId,
  onSelectTrip
}: LeafletFleetMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LType.Map | null>(null);
  const markersRef = useRef<{ [key: string]: LType.Marker }>({});
  const polylineGroupRef = useRef<LType.LayerGroup | null>(null);
  const activeRoutePolylineRef = useRef<LType.Polyline | null>(null);
  const activeRouteHaloRef = useRef<LType.Polyline | null>(null);

  const [leafletLib, setLeafletLib] = useState<typeof LType | null>(null);
  const [routeGeometries, setRouteGeometries] = useState<Map<string, RoadRouteResult>>(new Map());
  const [activeRouteResult, setActiveRouteResult] = useState<RoadRouteResult | null>(null);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState<boolean>(true);
  const [routingError, setRoutingError] = useState<string | null>(null);
  const [routingRetryCount, setRoutingRetryCount] = useState<number>(0);

  const busesMap = useRef(new Map(buses.map(b => [b.id, b])));
  const routesMap = useRef(new Map(routes.map(r => [r.id, r])));
  const stopsMap = useRef(new Map(stops.map(s => [s.id, s])));

  useEffect(() => {
    busesMap.current = new Map(buses.map(b => [b.id, b]));
    routesMap.current = new Map(routes.map(r => [r.id, r]));
    stopsMap.current = new Map(stops.map(s => [s.id, s]));
  }, [buses, routes, stops]);

  // Load Leaflet dynamically on client mount
  useEffect(() => {
    let isMounted = true;
    import('leaflet').then(L => {
      if (isMounted) {
        setLeafletLib(L.default || L);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // 1. Fetch & Resolve Road Network Geometries for all active routes
  useEffect(() => {
    let isCancelled = false;

    async function loadAllRoadRoutes() {
      setIsLoadingRoutes(true);
      setRoutingError(null);
      const geomMap = new Map<string, RoadRouteResult>();

      try {
        const fetchPromises = routes.map(async route => {
          try {
            const roadRes = await getRouteRoadGeometry(route, stopsMap.current);
            return { routeId: route.id, roadRes };
          } catch (err: any) {
            console.warn(`[ROUTING] Could not resolve road route for ${route.id}:`, err.message);
            return null;
          }
        });

        const results = await Promise.all(fetchPromises);
        if (isCancelled) return;

        results.forEach(res => {
          if (res) {
            geomMap.set(res.routeId, res.roadRes);
          }
        });

        setRouteGeometries(geomMap);

        // Check active route
        const activeTrip = trips.find(t => t.id === selectedTripId);
        if (activeTrip && geomMap.has(activeTrip.routeId)) {
          setActiveRouteResult(geomMap.get(activeTrip.routeId)!);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setRoutingError(err.message || 'Error communicating with routing engine');
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingRoutes(false);
        }
      }
    }

    loadAllRoadRoutes();

    return () => {
      isCancelled = true;
    };
  }, [routes, stops, routingRetryCount]);

  // Update active route result when selection changes
  useEffect(() => {
    const activeTrip = trips.find(t => t.id === selectedTripId);
    if (activeTrip && routeGeometries.has(activeTrip.routeId)) {
      setActiveRouteResult(routeGeometries.get(activeTrip.routeId)!);
    } else {
      setActiveRouteResult(null);
    }
  }, [selectedTripId, trips, routeGeometries]);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || !leafletLib) return;
    if (mapInstanceRef.current) return;

    // Center on Nashik Division coordinates (Maharashtra transit hub)
    const map = leafletLib.map(mapContainerRef.current, {
      center: [19.8500, 73.8800],
      zoom: 9,
      zoomControl: false,
      attributionControl: false
    });

    // Add standard OpenStreetMap tiles
    leafletLib.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Custom Zoom Control at bottom right
    leafletLib.control.zoom({ position: 'bottomright' }).addTo(map);

    polylineGroupRef.current = leafletLib.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [leafletLib]);

  // 3. Render Road Network Polylines & Terminal Stop Pins
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !polylineGroupRef.current || !leafletLib) return;

    polylineGroupRef.current.clearLayers();

    // Determine active trip & route
    const activeTrip = trips.find(t => t.id === selectedTripId);
    const activeRoute = activeTrip ? routesMap.current.get(activeTrip.routeId) : null;

    // A. Render Background Non-Selected Road Polylines
    routes.forEach(route => {
      if (activeRoute && route.id === activeRoute.id) return;

      const roadData = routeGeometries.get(route.id);
      if (!roadData || !roadData.coordinates || roadData.coordinates.length < 2) return;

      const polyline = leafletLib.polyline(roadData.coordinates, {
        color: '#64748b',
        weight: 2.5,
        opacity: 0.45,
        lineCap: 'round',
        lineJoin: 'round'
      });

      polyline.bindTooltip(
        `<div class="text-[11px] font-bold font-sans">${route.name}</div><div class="text-[10px] text-slate-500 font-mono">${roadData.distanceKm} km • Verified Road Route</div>`,
        { sticky: true, className: 'custom-leaflet-tooltip' }
      );

      polyline.on('click', () => {
        const matchingTrip = trips.find(t => t.routeId === route.id);
        if (matchingTrip) onSelectTrip(matchingTrip.id);
      });

      polyline.addTo(polylineGroupRef.current!);
    });

    // B. Render Highlighted Selected Road Polyline
    if (activeRoute && routeGeometries.has(activeRoute.id)) {
      const activeRoadData = routeGeometries.get(activeRoute.id)!;
      if (activeRoadData.coordinates && activeRoadData.coordinates.length >= 2) {
        // Lower glowing casing
        const haloPolyline = leafletLib.polyline(activeRoadData.coordinates, {
          color: '#3b82f6',
          weight: 8,
          opacity: 0.35,
          lineCap: 'round',
          lineJoin: 'round'
        });
        haloPolyline.addTo(polylineGroupRef.current!);
        activeRouteHaloRef.current = haloPolyline;

        // Upper crisp road polyline
        const activePolyline = leafletLib.polyline(activeRoadData.coordinates, {
          color: '#0f172a',
          weight: 4.5,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round'
        });

        activePolyline.bindTooltip(
          `<div class="text-xs font-extrabold font-sans text-slate-900">${activeRoute.name}</div><div class="text-[11px] text-blue-600 font-mono font-bold">${activeRoadData.distanceKm} km • ~${activeRoadData.durationHours}h via Road Network</div>`,
          { sticky: true, permanent: false, className: 'custom-leaflet-tooltip' }
        );

        activePolyline.addTo(polylineGroupRef.current!);
        activeRoutePolylineRef.current = activePolyline;

        // Smoothly fit bounds to active road route if user clicked trip
        if (activeRoadData.coordinates.length > 0) {
          const bounds = leafletLib.latLngBounds(activeRoadData.coordinates);
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12, animate: true, duration: 1 });
        }
      }
    }

    // C. Render Terminal Pins
    stops.forEach(stop => {
      const isSource = activeRoute?.sourceStopId === stop.id;
      const isDest = activeRoute?.destinationStopId === stop.id;
      const isIntermediate = activeRoute?.intermediateStopIds.includes(stop.id);
      const isConnected = isSource || isDest || isIntermediate;

      const stopIcon = leafletLib.divIcon({
        className: 'custom-stop-pin',
        html: `
          <div class="relative group cursor-pointer transition-transform duration-200 hover:scale-125 z-10">
            <div class="w-4 h-4 rounded-full border-2 shadow-md flex items-center justify-center ${
              isSource
                ? 'bg-blue-600 border-white ring-4 ring-blue-500/30'
                : isDest
                ? 'bg-emerald-500 border-white ring-4 ring-emerald-500/30'
                : isIntermediate
                ? 'bg-amber-500 border-white ring-2 ring-amber-400/30'
                : 'bg-slate-700 border-white opacity-80'
            }">
              ${
                isSource || isDest
                  ? '<div class="w-1.5 h-1.5 rounded-full bg-white"></div>'
                  : ''
              }
            </div>
            <div class="absolute left-1/2 -translate-x-1/2 bottom-5 bg-white/95 backdrop-blur-md text-slate-900 font-bold text-[10px] px-2 py-0.5 rounded-lg shadow-md border ${
              isConnected ? 'border-blue-300 font-extrabold' : 'border-slate-200 font-medium opacity-80'
            } whitespace-nowrap pointer-events-none">
              ${isSource ? '🛫 ' : isDest ? '🛬 ' : ''}${stop.name}
            </div>
          </div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      const marker = leafletLib.marker([stop.latitude, stop.longitude], { icon: stopIcon });
      marker.bindPopup(
        `<div class="p-1"><strong class="text-xs text-slate-900">${stop.name} Terminal</strong><br/><span class="text-[10px] text-slate-500 font-mono">${stop.latitude.toFixed(4)}, ${stop.longitude.toFixed(4)}</span></div>`
      );
      marker.addTo(polylineGroupRef.current!);
    });
  }, [stops, routes, trips, selectedTripId, routeGeometries, leafletLib]);

  // 4. Render & Update Live Vehicle Bus Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !leafletLib) return;

    trips.forEach(trip => {
      if (!trip.currentLocation) return;
      const bus = busesMap.current.get(trip.busId);
      const isSelected = selectedTripId === trip.id;

      const lat = trip.currentLocation.latitude;
      const lng = trip.currentLocation.longitude;

      const html = `
        <div class="relative cursor-pointer transition-transform duration-200 ${isSelected ? 'scale-110 z-30' : 'hover:scale-105 z-20'}">
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-lg border transition-all ${
            isSelected
              ? 'bg-slate-900 text-white border-slate-900 ring-4 ring-blue-500/30 shadow-blue-500/20'
              : 'bg-white text-slate-900 border-slate-200 hover:border-slate-400'
          }">
            <div class="w-2 h-2 rounded-full ${trip.tripStatus === 'IN_TRANSIT' ? 'bg-[#d9f99d]' : 'bg-amber-400'} animate-pulse"></div>
            <span class="font-mono text-[11px] font-extrabold tracking-tight">${bus?.registration || trip.busId}</span>
            <span class="px-1.5 py-0.2 rounded-full text-[9px] font-bold ${isSelected ? 'bg-zinc-800 text-zinc-200' : 'bg-slate-100 text-slate-700'}">${trip.availableCargoCapacityKg}kg free</span>
          </div>
        </div>
      `;

      const vehicleIcon = leafletLib.divIcon({
        className: 'custom-vehicle-marker',
        html,
        iconSize: [130, 36],
        iconAnchor: [65, 18]
      });

      if (markersRef.current[trip.id]) {
        markersRef.current[trip.id].setLatLng([lat, lng]);
        markersRef.current[trip.id].setIcon(vehicleIcon);
      } else {
        const marker = leafletLib.marker([lat, lng], { icon: vehicleIcon });
        marker.on('click', () => {
          onSelectTrip(trip.id);
        });
        marker.addTo(map);
        markersRef.current[trip.id] = marker;
      }
    });
  }, [trips, selectedTripId, onSelectTrip, leafletLib]);

  return (
    <div className="w-full h-full relative rounded-3xl overflow-hidden border border-zinc-200/80 shadow-xs">
      {/* Interactive Map DOM Canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Road Telemetry Overlay Badge */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 max-w-sm pointer-events-auto">
        <div className="bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl border border-slate-700 shadow-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div className="flex flex-col">
              <span className="font-extrabold font-sans text-white text-[11px] tracking-tight">
                Physical Road Network Routing
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">
                OSRM Highway Graph • Verified Road Path
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg font-mono text-[10px] text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Strict Road Geometries</span>
          </div>
        </div>

        {/* Selected Route Physical Road Telemetry */}
        {activeRouteResult && (
          <div className="bg-white/95 backdrop-blur-md text-slate-900 p-3 rounded-2xl border border-slate-200 shadow-lg space-y-1.5 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-900 line-clamp-1">
                {activeRouteResult.name || 'Selected Route'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-mono font-bold border border-blue-200">
                {activeRouteResult.distanceKm} km
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 text-[10px] font-mono text-slate-600">
              <div>
                <span className="text-slate-400 block text-[9px]">TRAVEL TIME</span>
                <strong className="text-slate-800 font-bold">~{activeRouteResult.durationHours}h</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px]">ROAD NODES</span>
                <strong className="text-slate-800 font-bold">{activeRouteResult.coordinateCount} coords</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px]">GEOMETRY</span>
                <strong className="text-emerald-700 font-bold">Highway Line</strong>
              </div>
            </div>
          </div>
        )}

        {/* Routing Error Notice with Retry Button */}
        {routingError && (
          <div className="bg-rose-950/90 backdrop-blur-md text-white p-3 rounded-2xl border border-rose-700 shadow-xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="text-[11px] text-rose-200 font-medium">
                {routingError} (Straight-line fallback disabled)
              </span>
            </div>
            <button
              onClick={() => setRoutingRetryCount(c => c + 1)}
              className="px-2.5 py-1 rounded-lg bg-rose-800 hover:bg-rose-700 text-white font-bold text-[10px] flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isLoadingRoutes && (
        <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-md text-slate-800 px-3 py-1.5 rounded-full border border-slate-200 shadow-md flex items-center gap-2 text-[11px] font-semibold">
          <RefreshCw className="w-3 h-3 text-blue-600 animate-spin" />
          <span>Resolving road geometries...</span>
        </div>
      )}
    </div>
  );
}
