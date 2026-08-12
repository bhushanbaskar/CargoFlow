'use client';

import React, { useState, useEffect } from 'react';
import { Package, MapPin, Clock, CheckCircle2, Bus, ShieldCheck, ArrowRight } from 'lucide-react';

export function TrackingSection() {
  const [timelineStep, setTimelineStep] = useState<number>(3); // In Transit

  useEffect(() => {
    const interval = setInterval(() => {
      setTimelineStep((prev) => (prev >= 4 ? 1 : prev + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const timelineEvents = [
    { id: 1, label: 'Booked', time: '07:15 AM', location: 'BlueDart Hub Nashik', done: true },
    { id: 2, label: 'Reserved', time: '07:45 AM', location: 'MSRTC Bus MH-15-EG-4022', done: true },
    { id: 3, label: 'Loaded', time: '08:20 AM', location: 'Nashik CBS Depot Bay 04', done: true },
    { id: 4, label: 'In Transit', time: '10:30 AM', location: 'Passing Sinnar (En-Route)', active: true },
    { id: 5, label: 'Delivered', time: '12:45 PM', location: 'Pune Swargate Depot', pending: true }
  ];

  return (
    <section className="py-20 lg:py-28 bg-white border-b border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-900 text-xs font-bold uppercase tracking-wider">
            <span>REAL-TIME TELEMETRY</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-zinc-950 tracking-tight leading-tight">
            Complete visibility from depot to destination.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 font-medium">
            Couriers track waybills in real time as the host bus travels along scheduled highways across Maharashtra.
          </p>
        </div>

        {/* Tracking Card Showcase */}
        <div className="bg-zinc-950 text-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-zinc-800 shadow-2xl space-y-8">
          
          {/* Tracking Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-extrabold text-lime-300">
                  WAYBILL #CF-2048-MH
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#d9f99d] text-zinc-950">
                  IN TRANSIT
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-white font-sans">
                Nashik CBS → Pune Swargate
              </h3>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="bg-zinc-900 px-3 py-2 rounded-xl border border-zinc-800">
                <span className="text-zinc-500 uppercase block text-[9px]">Carrier Bus</span>
                <span className="text-white font-bold">MH-15-EG-4022</span>
              </div>
              <div className="bg-zinc-900 px-3 py-2 rounded-xl border border-zinc-800">
                <span className="text-zinc-500 uppercase block text-[9px]">Est. Arrival</span>
                <span className="text-lime-300 font-bold">12:45 PM (Today)</span>
              </div>
            </div>
          </div>

          {/* Current Status Pills Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase font-mono">Current Location</span>
              <div className="text-base font-extrabold text-white">Sinnar Bypass</div>
              <span className="text-[10px] text-lime-400 font-mono">GPS Telemetry Active</span>
            </div>

            <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase font-mono">Next Stop</span>
              <div className="text-base font-extrabold text-white">Sangamner Depot</div>
              <span className="text-[10px] text-zinc-400 font-mono">Scheduled 11:10 AM</span>
            </div>

            <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase font-mono">Parcel Weight & Type</span>
              <div className="text-base font-extrabold text-white">24 kg • Standard Cargo Box</div>
              <span className="text-[10px] text-zinc-400 font-mono">BlueDart Express</span>
            </div>
          </div>

          {/* Timeline Visual Progress */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-extrabold uppercase font-mono text-zinc-400">
              Shipment Custody Timeline
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {timelineEvents.map((evt) => (
                <div
                  key={evt.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    evt.active
                      ? 'bg-zinc-900 border-lime-400 text-white ring-2 ring-lime-400/20'
                      : evt.done
                      ? 'bg-zinc-900/60 border-zinc-800 text-zinc-200'
                      : 'bg-zinc-950 border-zinc-800/60 text-zinc-500'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                    <span>{evt.time}</span>
                    <span className={evt.active ? 'text-lime-300 font-bold' : ''}>
                      {evt.done ? '✓' : evt.active ? 'LIVE' : ''}
                    </span>
                  </div>
                  <div className="font-extrabold text-xs text-white">{evt.label}</div>
                  <div className="text-[10px] text-zinc-400 mt-1 line-clamp-1">{evt.location}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
