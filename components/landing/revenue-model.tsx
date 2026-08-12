'use client';

import React from 'react';
import { Bus, Building2, Layers, CreditCard, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';

export function RevenueModel() {
  return (
    <section className="py-20 lg:py-28 bg-[#f4f5f7] border-b border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-200/80 text-zinc-900 text-xs font-bold uppercase tracking-wider">
            <span>SUSTAINABLE TRANSIT ECONOMICS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-zinc-950 tracking-tight leading-tight">
            Every seat doesn&apos;t need a passenger to create value.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 font-medium">
            A transparent platform model connecting logistics demand with public transport supply—generating high-margin non-fare yield.
          </p>
        </div>

        {/* Conceptual Ecosystem Flow Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-zinc-200/90 shadow-2xs space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            
            {/* Step 1: Logistics Company */}
            <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-200/80 space-y-4 relative">
              <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-zinc-950">
                Logistics Company
              </h3>
              <p className="text-xs text-zinc-600 font-normal leading-relaxed">
                Reserves verified luggage hold space on scheduled routes. Pays predictable regional freight rates per kg/km.
              </p>
              <div className="pt-2 text-[11px] font-bold text-zinc-700 font-mono">
                ✓ Cost reduction vs dedicated vans
              </div>
            </div>

            {/* Step 2: CargoFlow Platform */}
            <div className="bg-zinc-950 text-white rounded-2xl p-6 border border-zinc-800 space-y-4 relative shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-lime-400 text-zinc-950 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-white">
                CargoFlow Platform
              </h3>
              <p className="text-xs text-zinc-300 font-normal leading-relaxed">
                Manages capacity verification, timetable matching, waybill QR tracking, credit ledger settlements, and compliance analytics.
              </p>
              <div className="pt-2 text-[11px] font-bold text-lime-300 font-mono">
                ★ Platform Infrastructure Engine
              </div>
            </div>

            {/* Step 3: Public Transport Operator */}
            <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-200/80 space-y-4 relative">
              <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-bold">
                <Bus className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-zinc-950">
                Transport Operator
              </h3>
              <p className="text-xs text-zinc-600 font-normal leading-relaxed">
                Provides unused luggage hold capacity on existing runs. Receives net automated non-fare revenue disbursements.
              </p>
              <div className="pt-2 text-[11px] font-bold text-zinc-700 font-mono">
                ✓ Non-fare revenue from empty holds
              </div>
            </div>

          </div>

          <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-zinc-800" />
              <span>Transparent credit billing & automated waybill accounting.</span>
            </div>
            <span className="font-mono text-[11px] text-zinc-400">
              * Proposed platform revenue model
            </span>
          </div>

        </div>

      </div>
    </section>
  );
}
