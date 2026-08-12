'use client';

import React, { useState, useEffect } from 'react';
import { Bus, MapPin, Clock, ArrowRight, ShieldCheck, Sparkles, Navigation } from 'lucide-react';

interface RouteData {
  id: string;
  name: string;
  source: string;
  destination: string;
  via?: string;
  departure: string;
  arrival: string;
  capacityKg: number;
  status: 'SPACE AVAILABLE' | 'NEAR CAPACITY' | 'HIGH DEMAND';
  pathD: string;
  busPos: { x: number; y: number };
}

export function HeroMapVisualization() {
  const [selectedRouteId, setSelectedRouteId] = useState<string>('nashik-pune');
  const [animatedBusProgress, setAnimatedBusProgress] = useState<number>(35);

  // Animation cycle for the active bus marker
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedBusProgress((prev) => (prev >= 90 ? 10 : prev + 1.2));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Maharashtra Map Cities Coordinates (SVG viewBox 0 0 600 450)
  const cities = [
    { id: 'mumbai', name: 'Mumbai', x: 110, y: 220, main: true },
    { id: 'pune', name: 'Pune', x: 210, y: 280, main: true },
    { id: 'nashik', name: 'Nashik', x: 220, y: 130, main: true },
    { id: 'chhatrapati-sambhajinagar', name: 'Ch. Sambhajinagar', x: 330, y: 170, main: true },
    { id: 'sangamner', name: 'Sangamner', x: 215, y: 200, main: false },
    { id: 'solapur', name: 'Solapur', x: 370, y: 350, main: false },
    { id: 'kolhapur', name: 'Kolhapur', x: 220, y: 390, main: false },
    { id: 'amravati', name: 'Amravati', x: 470, y: 110, main: false },
    { id: 'nagpur', name: 'Nagpur', x: 540, y: 100, main: true },
  ];

  const routesList: RouteData[] = [
    {
      id: 'nashik-pune',
      name: 'Nashik → Pune Corridor',
      source: 'Nashik CBS',
      destination: 'Pune Swargate',
      via: 'Sangamner',
      departure: '08:30 AM',
      arrival: '01:15 PM',
      capacityKg: 68,
      status: 'SPACE AVAILABLE',
      pathD: 'M220 130 L215 200 L210 280',
      busPos: { x: 216, y: 180 }
    },
    {
      id: 'mumbai-pune',
      name: 'Mumbai → Pune Express',
      source: 'Mumbai Central',
      destination: 'Pune Swargate',
      departure: '09:00 AM',
      arrival: '12:30 PM',
      capacityKg: 112,
      status: 'SPACE AVAILABLE',
      pathD: 'M110 220 C 140 230, 180 260, 210 280',
      busPos: { x: 160, y: 250 }
    },
    {
      id: 'nashik-sambhajinagar',
      name: 'Nashik → Ch. Sambhajinagar',
      source: 'Nashik CBS',
      destination: 'Central Bus Stand',
      departure: '10:15 AM',
      arrival: '02:00 PM',
      capacityKg: 45,
      status: 'NEAR CAPACITY',
      pathD: 'M220 130 L330 170',
      busPos: { x: 275, y: 150 }
    },
    {
      id: 'pune-solapur',
      name: 'Pune → Solapur Highway',
      source: 'Pune Swargate',
      destination: 'Solapur CBS',
      departure: '07:45 AM',
      arrival: '01:00 PM',
      capacityKg: 95,
      status: 'SPACE AVAILABLE',
      pathD: 'M210 280 L370 350',
      busPos: { x: 290, y: 315 }
    },
    {
      id: 'sambhajinagar-nagpur',
      name: 'Ch. Sambhajinagar → Nagpur',
      source: 'Central Bus Stand',
      destination: 'Nagpur Ganeshpeth',
      departure: '11:00 AM',
      arrival: '07:30 PM',
      capacityKg: 140,
      status: 'SPACE AVAILABLE',
      pathD: 'M330 170 L470 110 L540 100',
      busPos: { x: 435, y: 125 }
    }
  ];

  const activeRoute = routesList.find((r) => r.id === selectedRouteId) || routesList[0];

  return (
    <div className="w-full relative bg-zinc-950 rounded-3xl p-4 sm:p-6 lg:p-8 border border-zinc-800 shadow-2xl overflow-hidden group">
      
      {/* Background Subtle Grid Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

      {/* Top Map Header Controls */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse" />
          <span className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-widest">
            MAHARASHTRA REGIONAL CORRIDORS
          </span>
          <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 text-[10px] text-zinc-400 font-mono">
            MSRTC TIMETABLE DATA
          </span>
        </div>

        {/* Route Selector Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          {routesList.slice(0, 3).map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRouteId(r.id)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all whitespace-nowrap ${
                selectedRouteId === r.id
                  ? 'bg-[#d9f99d] text-zinc-950 shadow-xs'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
              }`}
            >
              {r.source.split(' ')[0]} → {r.destination.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Map Canvas */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[460px]">
        <svg
          viewBox="0 0 600 450"
          className="w-full h-full text-zinc-700 select-none"
        >
          {/* Subtle regional boundary contour representation */}
          <path
            d="M80 180 Q 150 100, 260 80 T 450 70 T 570 120 T 520 280 T 380 400 T 200 420 T 90 320 Z"
            fill="none"
            stroke="#27272a"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            className="opacity-40"
          />

          {/* Render Route Lines */}
          {routesList.map((route) => {
            const isSelected = selectedRouteId === route.id;
            return (
              <g key={route.id} className="cursor-pointer" onClick={() => setSelectedRouteId(route.id)}>
                {/* Background glow path when selected */}
                {isSelected && (
                  <path
                    d={route.pathD}
                    fill="none"
                    stroke="#d9f99d"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className="opacity-20 animate-pulse"
                  />
                )}
                {/* Route Path Line */}
                <path
                  d={route.pathD}
                  fill="none"
                  stroke={isSelected ? '#d9f99d' : '#3f3f46'}
                  strokeWidth={isSelected ? '3.5' : '1.8'}
                  strokeLinecap="round"
                  strokeDasharray={isSelected ? 'none' : '4 4'}
                  className="transition-all duration-300 hover:stroke-zinc-300"
                />
              </g>
            );
          })}

          {/* Render City Nodes */}
          {cities.map((city) => {
            const isConnectedToActive =
              activeRoute.source.includes(city.name) ||
              activeRoute.destination.includes(city.name) ||
              activeRoute.via === city.name;

            return (
              <g key={city.id} className="transition-all">
                {/* Outer halo for main connected cities */}
                {isConnectedToActive && (
                  <circle
                    cx={city.x}
                    cy={city.y}
                    r={city.main ? '10' : '7'}
                    fill="none"
                    stroke="#d9f99d"
                    strokeWidth="1.5"
                    className="animate-ping opacity-30"
                  />
                )}
                
                {/* City Marker Circle */}
                <circle
                  cx={city.x}
                  cy={city.y}
                  r={city.main ? '5' : '3.5'}
                  fill={isConnectedToActive ? '#d9f99d' : '#a1a1aa'}
                  stroke="#09090b"
                  strokeWidth="2"
                />

                {/* City Label */}
                <text
                  x={city.x}
                  y={city.y - 10}
                  textAnchor="middle"
                  fill={isConnectedToActive ? '#ffffff' : '#71717a'}
                  fontSize={city.main ? '11' : '9'}
                  fontWeight={isConnectedToActive ? 'bold' : 'normal'}
                  fontFamily="sans-serif"
                  className="pointer-events-none transition-colors"
                >
                  {city.name}
                </text>
              </g>
            );
          })}

          {/* Animated Bus Icon Marker along Active Route */}
          <g transform={`translate(${activeRoute.busPos.x}, ${activeRoute.busPos.y})`}>
            <circle cx="0" cy="0" r="14" fill="#09090b" stroke="#d9f99d" strokeWidth="2.5" />
            <foreignObject x="-8" y="-8" width="16" height="16">
              <div className="w-full h-full flex items-center justify-center text-lime-300">
                <Bus className="w-3.5 h-3.5" />
              </div>
            </foreignObject>
          </g>
        </svg>

        {/* Floating Product Capacity Card over Map (Prompt Requirements) */}
        <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-4 sm:bottom-4 max-w-sm w-full bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 p-4 rounded-2xl shadow-2xl space-y-3 z-20">
          
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
              <span className="text-[11px] font-extrabold text-zinc-100 uppercase tracking-wider font-mono">
                {activeRoute.name}
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-[#d9f99d] text-zinc-950">
              {activeRoute.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800/80">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Available Capacity
              </div>
              <div className="text-xl font-extrabold text-white font-mono mt-0.5">
                {activeRoute.capacityKg} kg
              </div>
              <div className="text-[10px] text-lime-400 font-medium mt-0.5">
                Unused Hold Space
              </div>
            </div>

            <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800/80">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Next Departure
              </div>
              <div className="text-xl font-extrabold text-white font-mono mt-0.5">
                {activeRoute.departure}
              </div>
              <div className="text-[10px] text-zinc-400 font-medium mt-0.5">
                ETA: {activeRoute.arrival}
              </div>
            </div>
          </div>

          {/* Route Terminals Detail */}
          <div className="flex items-center justify-between text-xs font-bold text-zinc-300 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>{activeRoute.source}</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{activeRoute.destination}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Live Telemetry Indicator */}
      <div className="relative z-10 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
        <span>Route Code: MSRTC-MH-{activeRoute.id.toUpperCase()}</span>
        <span>Simulated GPS Live</span>
      </div>
    </div>
  );
}
