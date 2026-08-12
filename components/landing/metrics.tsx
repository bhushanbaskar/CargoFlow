'use client';

import React from 'react';
import { motion } from 'motion/react';

export function Metrics() {
  const metricsList = [
    {
      value: '100+',
      label: 'Scheduled Routes',
      sublabel: 'Regional corridors mapped'
    },
    {
      value: '3',
      label: 'Initial Divisions',
      sublabel: 'Nashik, Pune & Mumbai pilot'
    },
    {
      value: '24/7',
      label: 'Network Visibility',
      sublabel: 'Real-time GPS telemetry'
    },
    {
      value: '₹ Revenue',
      label: 'Monetized Transit Capacity',
      sublabel: 'New yield per bus journey'
    }
  ];

  return (
    <section className="py-10 bg-white border-y border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Metric Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 divide-y md:divide-y-0 md:divide-x divide-zinc-100"
        >
          {metricsList.map((metric, idx) => (
            <div
              key={metric.label}
              className={`space-y-1 ${idx !== 0 ? 'pt-4 md:pt-0 md:pl-6' : ''}`}
            >
              <div className="text-3xl lg:text-4xl font-black text-zinc-950 font-mono tracking-tight">
                {metric.value}
              </div>
              <div className="text-xs font-extrabold text-zinc-900 uppercase tracking-wider font-sans">
                {metric.label}
              </div>
              <div className="text-[11px] text-zinc-500 font-medium">
                {metric.sublabel}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Mandatory Transparency Note */}
        <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
          <span>* Platform demo metrics based on MSRTC regional bus schedules. Proposed technology model.</span>
          <span className="hidden sm:inline-block">Maharashtra Transit Grid v1.0</span>
        </div>

      </div>
    </section>
  );
}

