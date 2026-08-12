'use client';

import React from 'react';
import { Building2, ArrowRight, ShieldCheck, CheckCircle2, TrendingDown, Clock, Eye, FileCheck } from 'lucide-react';

interface LogisticsSectionProps {
  onRequestAccess: () => void;
}

export function LogisticsSection({ onRequestAccess }: LogisticsSectionProps) {
  const benefits = [
    {
      title: 'Lower Regional Delivery Costs',
      desc: 'Pay for exact hold capacity without leasing, fueling, or maintaining dedicated delivery trucks on intercity routes.',
      icon: TrendingDown
    },
    {
      title: 'Access to Existing High-Frequency Routes',
      desc: 'Tap directly into hundreds of daily scheduled public transport departures across Maharashtra.',
      icon: Clock
    },
    {
      title: 'Predictable Scheduled Departures',
      desc: 'Fixed bus timetables mean exact departure times and reliable, predictable arrival SLA windows.',
      icon: CheckCircle2
    },
    {
      title: 'Real-Time Shipment Visibility',
      desc: 'Track waybills through en-route GPS telemetry from origin depot to destination handoff.',
      icon: Eye
    },
    {
      title: 'Centralized Capacity Reservations',
      desc: 'Lock in hold space ahead of time or query instant availability for urgent parcel dispatches.',
      icon: Building2
    },
    {
      title: 'Digital Proof of Delivery (POD)',
      desc: 'Instant QR code scanning by conductors and destination agents ensures tamper-proof verification.',
      icon: FileCheck
    }
  ];

  return (
    <section id="for-logistics" className="py-20 lg:py-28 bg-[#f4f5f7] border-b border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-200/80 text-zinc-900 text-xs font-bold uppercase tracking-wider">
              <span>FOR COURIERS & LOGISTICS COMPANIES</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-zinc-950 tracking-tight leading-tight">
              Ship without adding another vehicle.
            </h2>
            <p className="text-base sm:text-lg text-zinc-600 font-medium">
              Expand your regional delivery network across Maharashtra instantly using scheduled public bus capacity.
            </p>
          </div>

          <button
            onClick={onRequestAccess}
            className="px-6 py-3.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold text-sm transition-all shadow-md flex items-center gap-2 shrink-0 group"
          >
            <span>Start Shipping</span>
            <ArrowRight className="w-4 h-4 text-lime-300 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* 6 Benefit Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/90 shadow-2xs space-y-4 hover:border-zinc-400 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-950 flex items-center justify-center font-bold">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-zinc-950 tracking-tight">
                  {b.title}
                </h3>
                <p className="text-xs text-zinc-600 font-normal leading-relaxed">
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
