'use client';

import React, { useState } from 'react';
import { MapPin, ArrowRight, Clock, Gauge, Bus, ShieldCheck } from 'lucide-react';

export function NetworkSection() {
  const [activeCorridor, setActiveCorridor] = useState<string>('nashik-pune');

  const corridors = [
    {
      id: 'nashik-pune',
      title: 'Nashik → Pune Corridor',
      distance: '210 km',
      tripsPerDay: 28,
      avgHoldFree: '68 kg',
      status: 'ACTIVE ROUTE',
      nextDep: '08:30 AM',
      terminals: ['Nashik CBS', 'Sangamner', 'Narayangaon', 'Pune Swargate']
    },
    {
      id: 'mumbai-pune',
      title: 'Mumbai → Pune Expressway',
      distance: '150 km',
      tripsPerDay: 42,
      avgHoldFree: '112 kg',
      status: 'ACTIVE ROUTE',
      nextDep: '09:00 AM',
      terminals: ['Mumbai Central', 'Dadarr', 'Panvel', 'Lonavala', 'Pune Swargate']
    },
    {
      id: 'nashik-sambhajinagar',
      title: 'Nashik → Ch. Sambhajinagar',
      distance: '180 km',
      tripsPerDay: 18,
      avgHoldFree: '45 kg',
      status: 'ACTIVE ROUTE',
      nextDep: '10:15 AM',
      terminals: ['Nashik CBS', 'Yeola', 'Vaijapur', 'Ch. Sambhajinagar CBS']
    },
    {
      id: 'pune-solapur',
      title: 'Pune → Solapur Highway',
      distance: '250 km',
      tripsPerDay: 22,
      avgHoldFree: '95 kg',
      status: 'ACTIVE ROUTE',
      nextDep: '07:45 AM',
      terminals: ['Pune Swargate', 'Hadapsar', 'Indapur', 'Solapur CBS']
    }
  ];

  const current = corridors.find((c) => c.id === activeCorridor) || corridors[0];

  return (
    <section id="network" className="py-20 lg:py-28 bg-white border-b border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-900 text-xs font-bold uppercase tracking-wider">
            <span>REGIONAL COVERAGE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-zinc-950 tracking-tight leading-tight">
            One network. Thousands of journeys.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 font-medium">
            Explore active high-frequency public transit corridors connecting major commercial hubs and regional depots across Maharashtra.
          </p>
        </div>

        {/* Corridor Selector Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Corridor Selection List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-extrabold uppercase font-mono text-zinc-400 px-1">
              Select Regional Corridor
            </div>

            {corridors.map((c) => {
              const isSelected = activeCorridor === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveCorridor(c.id)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-950 text-white border-zinc-950 shadow-xl ring-2 ring-zinc-950/10'
                      : 'bg-zinc-50/80 text-zinc-800 border-zinc-200/90 hover:bg-white hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-sm font-sans">{c.title}</span>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                        isSelected
                          ? 'bg-[#d9f99d] text-zinc-950'
                          : 'bg-zinc-200 text-zinc-700'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono pt-2 opacity-80">
                    <span>{c.tripsPerDay} daily scheduled runs</span>
                    <span>Avg Hold: {c.avgHoldFree}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Corridor Card & Terminal Pipeline */}
          <div className="lg:col-span-7 bg-zinc-950 text-white rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-2xl space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-lime-300 uppercase tracking-widest">
                  SELECTED CORRIDOR DETAIL
                </span>
                <h3 className="text-2xl font-black text-white font-sans mt-0.5">
                  {current.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 font-mono text-xs border border-zinc-700">
                  {current.distance}
                </span>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800">
                <div className="text-[10px] font-bold text-zinc-400 uppercase font-mono">Daily Departures</div>
                <div className="text-xl font-black text-white font-mono mt-0.5">{current.tripsPerDay} buses</div>
              </div>

              <div className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800">
                <div className="text-[10px] font-bold text-zinc-400 uppercase font-mono">Next Departure</div>
                <div className="text-xl font-black text-lime-300 font-mono mt-0.5">{current.nextDep}</div>
              </div>

              <div className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800">
                <div className="text-[10px] font-bold text-zinc-400 uppercase font-mono">Avg Hold Space</div>
                <div className="text-xl font-black text-white font-mono mt-0.5">{current.avgHoldFree}</div>
              </div>
            </div>

            {/* Terminal Route Pipeline */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-extrabold uppercase font-mono text-zinc-400">
                En-Route Depot Terminals
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {current.terminals.map((t, idx) => (
                  <React.Fragment key={t}>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-200">
                      <MapPin className="w-3.5 h-3.5 text-lime-300" />
                      <span>{t}</span>
                    </div>
                    {idx < current.terminals.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-zinc-600 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="pt-2 text-xs text-zinc-400 font-mono flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-lime-300" />
              <span>Full MSRTC timetable integration. QR proof-of-delivery enabled at all terminals.</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
