'use client';

import React, { useState } from 'react';
import { Bus, Package, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export function CapacitySection() {
  const [reservedKg, setReservedKg] = useState<number>(32);
  const totalKg = 80;
  const availableKg = totalKg - reservedKg;
  const utilizationPct = Math.round((reservedKg / totalKg) * 100);

  return (
    <section className="py-20 lg:py-28 bg-white border-b border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-900 text-xs font-bold uppercase tracking-wider">
            <span>HOLD CAPABILITY</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-zinc-950 tracking-tight leading-tight">
            Make empty capacity productive.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 font-medium">
            Every scheduled passenger bus carries locked lower-deck luggage bays. CargoFlow converts that unused physical space into verifiable digital logistics supply.
          </p>
        </div>

        {/* Bus Capacity Visual Card */}
        <div className="bg-zinc-950 text-white rounded-3xl p-6 sm:p-10 border border-zinc-800 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Interactive Capacity Meter Controls */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-zinc-800 text-lime-300 border border-zinc-700">
                BUS 1024 • MH-15-EG-4022
              </span>
              <span className="text-xs text-zinc-400 font-medium">
                MSRTC Express Hold
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-white">
                Nashik CBS → Pune Swargate
              </h3>
              <p className="text-xs text-zinc-400">
                Departure: 08:30 AM • Distance: 210 km • Duration: 4h 45m
              </p>
            </div>

            {/* Live Slider Demo */}
            <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-zinc-400">Simulate Cargo Reservation:</span>
                <span className="font-mono text-lime-300">{reservedKg} kg reserved</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={reservedKg}
                onChange={(e) => setReservedKg(Number(e.target.value))}
                className="w-full accent-lime-400 cursor-pointer h-2 bg-zinc-800 rounded-lg"
              />
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>0 kg (Empty)</span>
                <span>80 kg (Max Payload)</span>
              </div>
            </div>

            {/* Metrics breakdown */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800">
                <div className="text-[10px] font-bold text-zinc-500 uppercase">Total Payload</div>
                <div className="text-lg font-black font-mono text-white mt-0.5">{totalKg} kg</div>
              </div>

              <div className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800">
                <div className="text-[10px] font-bold text-zinc-500 uppercase">Reserved</div>
                <div className="text-lg font-black font-mono text-amber-300 mt-0.5">{reservedKg} kg</div>
              </div>

              <div className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800">
                <div className="text-[10px] font-bold text-zinc-500 uppercase">Available</div>
                <div className="text-lg font-black font-mono text-lime-300 mt-0.5">{availableKg} kg</div>
              </div>
            </div>
          </div>

          {/* Right Column: Stylized Bus Luggage Hold Illustration */}
          <div className="lg:col-span-7 bg-zinc-900/90 rounded-2xl p-6 border border-zinc-800 space-y-6">
            
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 text-xs">
              <span className="font-mono font-bold text-zinc-400">BUS LUGGAGE HOLD CROSS-SECTION</span>
              <span className="font-mono font-extrabold text-lime-300">
                {utilizationPct}% CAPACITY UTILIZED
              </span>
            </div>

            {/* Bus Silhouette SVG */}
            <div className="relative w-full py-4 flex flex-col items-center justify-center space-y-4">
              
              {/* Bus Exterior Frame */}
              <div className="w-full bg-zinc-950 border-2 border-zinc-700 rounded-3xl p-4 shadow-xl space-y-3 relative">
                
                {/* Passenger Upper Deck Representation */}
                <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/80 rounded-xl border border-zinc-800 text-[11px] text-zinc-400">
                  <span className="font-bold text-zinc-300">PASSENGER SEATING DECK</span>
                  <span>45 Passengers Onboard</span>
                </div>

                {/* Lower Luggage Hold Compartment */}
                <div className="p-3 bg-zinc-900 rounded-2xl border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-extrabold uppercase font-mono text-zinc-400">
                    <span>LOWER-DECK CARGO HOLD (BAY 01 & 02)</span>
                    <span className="text-lime-300">{availableKg} KG FREE FOR WAYBILLS</span>
                  </div>

                  {/* Animated Capacity Meter Bar */}
                  <div className="w-full h-8 bg-zinc-950 rounded-xl border border-zinc-800 p-1 flex overflow-hidden relative">
                    {/* Reserved Fill Bar */}
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-lg transition-all duration-300 flex items-center justify-center font-mono text-[10px] font-bold text-zinc-950"
                      style={{ width: `${utilizationPct}%` }}
                    >
                      {utilizationPct > 15 ? `${reservedKg} kg` : ''}
                    </div>

                    {/* Available Fill Bar */}
                    <div
                      className="h-full bg-[#d9f99d]/20 border border-dashed border-lime-400/50 rounded-lg transition-all duration-300 flex-1 flex items-center justify-center font-mono text-[10px] font-bold text-lime-300 ml-1"
                    >
                      {availableKg} kg free space
                    </div>
                  </div>
                </div>

                {/* Bus Wheels Styling */}
                <div className="flex items-center justify-between px-8 -bottom-3 relative">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 border-4 border-zinc-950 shadow-md" />
                  <div className="w-8 h-8 rounded-full bg-zinc-800 border-4 border-zinc-950 shadow-md" />
                </div>
              </div>

            </div>

            <div className="pt-2 text-center text-xs text-zinc-400 font-medium">
              ★ Converts dead luggage hold space into structured, revenue-generating cargo capacity.
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
