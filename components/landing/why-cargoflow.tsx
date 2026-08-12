'use client';

import React from 'react';
import { Network, TrendingDown, Eye, Coins } from 'lucide-react';

export function WhyCargoFlow() {
  const pillars = [
    {
      num: '01',
      title: 'UTILIZE EXISTING INFRASTRUCTURE',
      desc: 'Move more cargo without adding dedicated vehicles onto congested highway corridors.',
      icon: Network
    },
    {
      num: '02',
      title: 'LOWER REGIONAL COST',
      desc: 'Use high-frequency scheduled public journeys instead of building custom transport routes from scratch.',
      icon: TrendingDown
    },
    {
      num: '03',
      title: 'REAL-TIME VISIBILITY',
      desc: 'Track waybills through en-route GPS telemetry from initial depot check-in to final destination handoff.',
      icon: Eye
    },
    {
      num: '04',
      title: 'NEW TRANSIT REVENUE',
      desc: 'Turn empty bus luggage holds into scalable, recurring non-fare revenue for public transport authorities.',
      icon: Coins
    }
  ];

  return (
    <section className="py-20 lg:py-28 bg-[#f4f5f7] border-b border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-200/80 text-zinc-900 text-xs font-bold uppercase tracking-wider">
            <span>CORE ADVANTAGES</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-zinc-950 tracking-tight leading-tight">
            Why CargoFlow?
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 font-medium">
            Designed for regional logistics efficiency and public transit sustainability.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.num}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/90 shadow-2xs space-y-6 flex flex-col justify-between hover:border-zinc-400 transition-colors"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xl font-black text-zinc-400">
                      {p.num}
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-zinc-100 text-zinc-950 flex items-center justify-center font-bold">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-sm font-extrabold text-zinc-950 tracking-wider font-mono uppercase">
                    {p.title}
                  </h3>

                  <p className="text-xs text-zinc-600 font-normal leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
