'use client';

import React from 'react';
import { Bus, ArrowRight, TrendingUp, ShieldCheck, Gauge, Layers, BarChart3, Lock } from 'lucide-react';

interface OperatorsSectionProps {
  onRequestAccess: () => void;
}

export function OperatorsSection({ onRequestAccess }: OperatorsSectionProps) {
  const operatorBenefits = [
    {
      title: 'Additional Revenue Per Journey',
      desc: 'Monetize otherwise empty lower luggage holds without altering passenger routes or seating tickets.',
      icon: TrendingUp
    },
    {
      title: 'Better Overall Fleet Utilization',
      desc: 'Transform scheduled bus runs into dual-purpose passenger and high-margin cargo transit corridors.',
      icon: Gauge
    },
    {
      title: 'Centralized Cargo Management',
      desc: 'Depot conductors manage waybills through simple mobile QR scanning; full audit log per trip.',
      icon: Layers
    },
    {
      title: 'Network-Wide Capacity Visibility',
      desc: 'Divisional controllers monitor real-time hold fill rates across all regional depots.',
      icon: BarChart3
    },
    {
      title: 'Controlled Cargo Reservations',
      desc: 'Set custom maximum payload limits per bus type to safeguard passenger luggage allowances.',
      icon: Lock
    },
    {
      title: 'Non-Fare Revenue Yield Analytics',
      desc: 'Automated credit ledger settlements provide transparent financial reports for transport authorities.',
      icon: ShieldCheck
    }
  ];

  return (
    <section id="for-operators" className="py-20 lg:py-28 bg-zinc-950 text-white border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 text-lime-300 text-xs font-bold uppercase tracking-wider border border-zinc-700">
              <Bus className="w-3.5 h-3.5" />
              <span>FOR PUBLIC TRANSIT OPERATORS</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Turn unused capacity into revenue.
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 font-medium">
              Public transport operators can generate scalable non-fare revenue from every scheduled bus journey.
            </p>
          </div>

          <button
            onClick={onRequestAccess}
            className="px-6 py-3.5 rounded-full bg-[#d9f99d] hover:bg-lime-300 text-zinc-950 font-extrabold text-sm transition-all shadow-md flex items-center gap-2 shrink-0"
          >
            <span>Explore Operator Model</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 6 Operator Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {operatorBenefits.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="bg-zinc-900/80 rounded-3xl p-6 sm:p-8 border border-zinc-800 space-y-4 hover:border-zinc-700 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-lime-300 flex items-center justify-center font-bold border border-zinc-700">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-white tracking-tight">
                  {b.title}
                </h3>
                <p className="text-xs text-zinc-400 font-normal leading-relaxed">
                  {b.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
