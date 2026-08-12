'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Map,
  Bus,
  TrendingUp,
  Settings,
  ArrowRight,
  Gauge,
  Sparkles,
  Layers
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardPreviewProps {
  onLaunchApp: () => void;
}

export function DashboardPreview({ onLaunchApp }: DashboardPreviewProps) {
  const [activeTabPreview, setActiveTabPreview] = useState('Overview');

  return (
    <section className="py-20 lg:py-28 bg-[#fafafa] border-b border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-100 text-zinc-900 text-xs font-bold uppercase tracking-wider">
              <span>PRODUCT INTERFACE</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-zinc-950 tracking-tight">
              Integrated Dispatch & Capacity Control
            </h2>
            <p className="text-base text-zinc-600 font-medium">
              Real-time MSRTC bus timetable sync, luggage hold capacity meters, and waybill dispatch ledger.
            </p>
          </div>

          <button
            onClick={onLaunchApp}
            className="px-6 py-3.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold text-sm transition-all shadow-md flex items-center gap-2 shrink-0 group cursor-pointer"
          >
            <span>Launch Live Platform</span>
            <ArrowRight className="w-4 h-4 text-lime-300 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>

        {/* Browser Mockup Frame Container */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl border border-zinc-300/80 shadow-2xl overflow-hidden"
        >
          
          {/* Top Browser Bar */}
          <div className="bg-zinc-100/90 px-4 py-3 border-b border-zinc-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="ml-2 font-mono text-[11px] font-bold text-zinc-500">
                https://app.cargoflow.in/network/dispatch-ledger
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 rounded-md bg-zinc-200 text-zinc-800 text-[10px] font-bold font-mono">
                MSRTC SAAS CONTROL
              </span>
            </div>
          </div>

          {/* Dashboard Application Shell Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
            
            {/* Sidebar Mockup */}
            <div className="hidden lg:block lg:col-span-2 bg-zinc-950 text-zinc-300 p-4 border-r border-zinc-800 space-y-6">
              <div className="font-black text-white text-base tracking-tight font-sans">
                Cargo<span className="text-lime-300">Flow</span>
              </div>

              <div className="space-y-1 text-xs font-bold">
                {[
                  { name: 'Overview', icon: LayoutDashboard },
                  { name: 'Shipments', icon: Package },
                  { name: 'Network Map', icon: Map },
                  { name: 'Bus Routes', icon: Bus },
                  { name: 'Capacity', icon: Gauge },
                  { name: 'Reservations', icon: Layers },
                  { name: 'Analytics', icon: TrendingUp },
                  { name: 'Settings', icon: Settings }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTabPreview === item.name;
                  return (
                    <button
                      key={item.name}
                      onClick={() => setActiveTabPreview(item.name)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                        isActive
                          ? 'bg-zinc-800 text-white border border-zinc-700'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-lime-300' : 'text-zinc-500'}`} />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-8 border-t border-zinc-800 space-y-2">
                <div className="text-[10px] uppercase font-mono font-bold text-zinc-500">
                  Logged In As
                </div>
                <div className="text-xs font-bold text-white">Nashik Dispatcher</div>
                <div className="text-[10px] text-zinc-400">MSRTC Control Hub</div>
              </div>
            </div>

            {/* Main Area Preview */}
            <div className="lg:col-span-10 p-6 bg-[#f8f9fa] space-y-6">
              
              {/* Header inside mockup */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-4">
                <div>
                  <h3 className="text-xl font-extrabold text-zinc-950 font-sans">
                    Network Overview & Capacity Grid
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Live timetable feed from Nashik, Swargate Pune, and Mumbai Central terminals.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-md bg-[#d9f99d] text-zinc-950 font-extrabold text-xs">
                    GPS Live Sync
                  </span>
                </div>
              </div>

              {/* 4 Floating KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-zinc-200/90 shadow-2xs space-y-1">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Available Hold
                  </div>
                  <div className="text-2xl font-black text-zinc-950 font-mono">124 kg</div>
                  <div className="text-[10px] text-emerald-600 font-bold">Unreserved free capacity</div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-zinc-200/90 shadow-2xs space-y-1">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    In Transit
                  </div>
                  <div className="text-2xl font-black text-zinc-950 font-mono">8 shipments</div>
                  <div className="text-[10px] text-zinc-500 font-medium">Across 5 active buses</div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-zinc-200/90 shadow-2xs space-y-1">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Active Routes
                  </div>
                  <div className="text-2xl font-black text-zinc-950 font-mono">23 corridors</div>
                  <div className="text-[10px] text-purple-600 font-bold">Maharashtra regional</div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-zinc-200/90 shadow-2xs space-y-1">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Projected Revenue
                  </div>
                  <div className="text-2xl font-black text-zinc-950 font-mono">₹18,420</div>
                  <div className="text-[10px] text-lime-600 font-bold">Non-fare transit yield</div>
                </div>
              </div>

              {/* Sample Dispatch Table inside Dashboard Mockup */}
              <div className="bg-white rounded-lg border border-zinc-200/90 shadow-2xs p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-900 border-b border-zinc-100 pb-2">
                  <span>Active Scheduled Bus Departures</span>
                  <span className="text-zinc-400 font-mono text-[11px]">Demo Data</span>
                </div>

                <div className="space-y-2 text-xs">
                  {[
                    { bus: 'MH-15-EG-4022', route: 'Nashik CBS → Pune Swargate', departure: '08:30 AM', free: '68 kg', status: 'IN TRANSIT' },
                    { bus: 'MH-12-RN-8819', route: 'Mumbai Central → Pune Swargate', departure: '09:00 AM', free: '112 kg', status: 'IN TRANSIT' },
                    { bus: 'MH-20-BV-3310', route: 'Ch. Sambhajinagar → Nashik', departure: '10:15 AM', free: '45 kg', status: 'SCHEDULED' }
                  ].map((row) => (
                    <div key={row.bus} className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/60">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-zinc-200 text-zinc-900">
                          {row.bus}
                        </span>
                        <span className="font-bold text-zinc-800">{row.route}</span>
                      </div>
                      <div className="flex items-center gap-4 font-mono text-[11px]">
                        <span>Dep: {row.departure}</span>
                        <span className="text-lime-700 font-bold">Hold Free: {row.free}</span>
                        <span className="px-2 py-0.5 rounded-md bg-zinc-950 text-white text-[10px] font-bold">
                          {row.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Interactive Overlay CTA Banner */}
          <div className="bg-zinc-950 text-white px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-800">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-lime-300" />
              <span className="text-xs font-extrabold font-sans">
                Want to test the full MSRTC dispatch system, QR scanner & capacity search engine?
              </span>
            </div>

            <button
              onClick={onLaunchApp}
              className="px-5 py-2 rounded-lg bg-[#d9f99d] hover:bg-lime-300 text-zinc-950 font-extrabold text-xs transition-colors shrink-0 flex items-center gap-2 cursor-pointer"
            >
              <span>Interact with Full App</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </motion.div>

      </div>
    </section>
  );
}

