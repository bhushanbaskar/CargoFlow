'use client';

import React, { useState } from 'react';
import { Package, Search, Bus, CheckCircle2, ArrowRight } from 'lucide-react';

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      num: '01',
      title: 'BOOK',
      icon: Package,
      headline: 'Specify Shipment Requirements',
      desc: 'A logistics company inputs origin, destination, parcel weight (kg), dimensions, and required delivery window.',
      detailKeys: ['Origin & Destination', 'Weight & Dimensions', 'Target Arrival Window']
    },
    {
      num: '02',
      title: 'MATCH',
      icon: Search,
      headline: 'Deterministic Route Matching',
      desc: 'CargoFlow instantly queries scheduled MSRTC public buses for compatible routes, verified hold capacity, and exact timetables.',
      detailKeys: ['Route Compatibility', 'Hold Capacity Check', 'Departure & Arrival Sync']
    },
    {
      num: '03',
      title: 'MOVE',
      icon: Bus,
      headline: 'Scheduled Transit & Live Tracking',
      desc: 'The parcel travels in the luggage hold of the scheduled bus. Conductor scans QR code; telemetry updates live en-route.',
      detailKeys: ['Conductor Barcode Scan', 'GPS Telemetry Feed', 'Hold Capacity Monitoring']
    },
    {
      num: '04',
      title: 'DELIVER',
      icon: CheckCircle2,
      headline: 'Terminal Handoff & Digital POD',
      desc: 'At the destination depot, parcel is unloaded, scanned by courier agent, and digital proof of delivery is recorded instantly.',
      detailKeys: ['Destination Depot Handoff', 'Digital QR Receipt', 'Instant Credit Settlement']
    }
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-white border-b border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-900 text-xs font-bold uppercase tracking-wider">
            <span>DETERMINISTIC WORKFLOW</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-zinc-950 tracking-tight leading-tight">
            Cargo moves through the network, not around it.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 font-medium">
            Four seamless steps connecting courier parcels with verified public bus luggage hold capacity.
          </p>
        </div>

        {/* 4-Step Horizontal Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          
          {/* Subtle Connecting Line for Desktop */}
          <div className="hidden lg:block absolute top-12 left-12 right-12 h-0.5 bg-zinc-200 -z-0" />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isSelected = activeStep === idx + 1;

            return (
              <div
                key={step.num}
                onClick={() => setActiveStep(idx + 1)}
                className={`bg-white rounded-3xl p-6 border transition-all duration-200 cursor-pointer relative z-10 flex flex-col justify-between space-y-6 ${
                  isSelected
                    ? 'border-zinc-950 shadow-xl ring-2 ring-zinc-950/10 bg-zinc-50/50'
                    : 'border-zinc-200/80 hover:border-zinc-400 hover:bg-zinc-50/30'
                }`}
              >
                <div className="space-y-4">
                  {/* Step Header Badge */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-black text-zinc-400">
                      {step.num}
                    </span>
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-zinc-950 text-lime-300'
                          : 'bg-zinc-100 text-zinc-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Title & Headline */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-500 font-mono">
                      {step.title}
                    </div>
                    <h3 className="text-lg font-black text-zinc-950 tracking-tight">
                      {step.headline}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-zinc-600 font-normal leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {/* Detail Keys List */}
                <div className="pt-4 border-t border-zinc-200/60 space-y-1.5">
                  {step.detailKeys.map((key) => (
                    <div key={key} className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-950" />
                      <span>{key}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
