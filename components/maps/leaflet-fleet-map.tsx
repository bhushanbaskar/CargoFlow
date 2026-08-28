'use client';

import React, { useEffect, useRef } from 'react';
import { ScheduledTrip, Bus, Route, Stop } from '@/lib/types';
import type LType from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Dynamically reference Leaflet on client side only to avoid SSR window errors
let Leaflet: typeof LType | null = null;
if (typeof window !== 'undefined') {
  Leaflet = require('leaflet');
}

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

  const busesMap = useRef(new Map(buses.map(b => [b.id, b])));
  const routesMap = useRef(new Map(routes.map(r => [r.id, r])));
  const stopsMap = useRef(new Map(stops.map(s => [s.id, s])));

  useEffect(() => {
    busesMap.current = new Map(buses.map(b => [b.id, b]));
    routesMap.current = new Map(routes.map(r => [r.id, r]));
    stopsMap.current = new Map(stops.map(s => [s.id, s]));
  }, [buses, routes, stops]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || !Leaflet) return;
    if (mapInstanceRef.current) return; // already initialized

    // Center on Nashik Division coordinates
    const map = Leaflet.map(mapContainerRef.current, {
      center: [19.8500, 73.8800],
      zoom: 9,
      zoomControl: false,
      attributionControl: false
    });

    // Add CartoDB Positron Light Tiles (Clean, elegant greyscale style matching image 2)
    Leaflet.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Custom Zoom Control at bottom right
    Leaflet.control.zoom({ position: 'bottomright' }).addTo(map);

    polylineGroupRef.current = Leaflet.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Render Routes (Polylines) & Terminal Pins
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !polylineGroupRef.current || !Leaflet) return;

    polylineGroupRef.current.clearLayers();

    // Render Terminal Pins
    stops.forEach(stop => {
      const activeTrip = trips.find(t => t.id === selectedTripId);
      const activeRoute = activeTrip ? routesMap.current.get(activeTrip.routeId) : null;

      const isSource = activeRoute?.sourceStopId === stop.id;
      const isDest = activeRoute?.destinationStopId === stop.id;

      const stopIcon = Leaflet!.divIcon({
        className: 'custom-stop-pin',
        html: `
          <div class="relative group cursor-pointer">
            <div class="w-3.5 h-3.5 rounded-full border-2 shadow-md transition-transform duration-200 hover:scale-125 ${
              isSource
                ? 'bg-blue-600 border-white ring-4 ring-blue-500/30'
                : isDest
                ? 'bg-emerald-500 border-white ring-4 ring-emerald-500/30'
                : 'bg-slate-800 border-white'
            }"></div>
            <div class="absolute left-1/2 -translate-x-1/2 bottom-5 bg-white/95 backdrop-blur-md text-slate-900 font-bold text-[10px] px-2 py-0.5 rounded-lg shadow-md border border-slate-200 whitespace-nowrap pointer-events-none">
              ${stop.name}
            </div>
          </div>
        `,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const marker = Leaflet!.marker([stop.latitude, stop.longitude], { icon: stopIcon });
      marker.addTo(polylineGroupRef.current!);
    });

    // Render Route Polylines
    routes.forEach(route => {
      const srcStop = stopsMap.current.get(route.sourceStopId);
      const destStop = stopsMap.current.get(route.destinationStopId);
      if (!srcStop || !destStop) return;

      const activeTrip = trips.find(t => t.id === selectedTripId);
      const isSelectedRoute = activeTrip?.routeId === route.id;

      const linePoints: LType.LatLngExpression[] = [
        [srcStop.latitude, srcStop.longitude]
      ];

      // Include intermediate stops if any
      route.intermediateStopIds.forEach(id => {
        const midStop = stopsMap.current.get(id);
        if (midStop) {
          linePoints.push([midStop.latitude, midStop.longitude]);
        }
      });

      linePoints.push([destStop.latitude, destStop.longitude]);

      const polyline = Leaflet!.polyline(linePoints, {
        color: isSelectedRoute ? '#000000' : '#94a3b8',
        weight: isSelectedRoute ? 4 : 2,
        dashArray: isSelectedRoute ? '8, 6' : '3, 6',
        opacity: isSelectedRoute ? 0.95 : 0.45
      });

      polyline.addTo(polylineGroupRef.current!);
    });
  }, [stops, routes, trips, selectedTripId]);

  // Render & Update Live Vehicle Bus Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !Leaflet) return;

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
              ? 'bg-slate-900 text-white border-slate-900 ring-4 ring-slate-900/20'
              : 'bg-white text-slate-900 border-slate-200 hover:border-slate-400'
          }">
            <div class="w-2 h-2 rounded-full ${trip.tripStatus === 'IN_TRANSIT' ? 'bg-[#d9f99d]' : 'bg-amber-400'} animate-pulse"></div>
            <span class="font-mono text-[11px] font-extrabold tracking-tight">${bus?.registration || trip.busId}</span>
            <span class="px-1.5 py-0.2 rounded-full text-[9px] font-bold ${isSelected ? 'bg-zinc-800 text-zinc-200' : 'bg-slate-100 text-slate-700'}">${trip.availableCargoCapacityKg}kg free</span>
          </div>
        </div>
      `;

      const vehicleIcon = Leaflet!.divIcon({
        className: 'custom-vehicle-marker',
        html,
        iconSize: [120, 36],
        iconAnchor: [60, 18]
      });

      if (markersRef.current[trip.id]) {
        markersRef.current[trip.id].setLatLng([lat, lng]);
        markersRef.current[trip.id].setIcon(vehicleIcon);
      } else {
        const marker = Leaflet!.marker([lat, lng], { icon: vehicleIcon });
        marker.on('click', () => {
          onSelectTrip(trip.id);
        });
        marker.addTo(map);
        markersRef.current[trip.id] = marker;
      }
    });
  }, [trips, selectedTripId, onSelectTrip]);

  // Fly to selected trip location smoothly
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedTripId) return;

    const selectedTrip = trips.find(t => t.id === selectedTripId);
    if (selectedTrip?.currentLocation) {
      map.flyTo(
        [selectedTrip.currentLocation.latitude, selectedTrip.currentLocation.longitude],
        10,
        { duration: 1.2 }
      );
    }
  }, [selectedTripId, trips]);

  return (
    <div className="w-full h-full relative rounded-3xl overflow-hidden border border-zinc-200/80 shadow-xs">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
