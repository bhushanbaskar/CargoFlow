'use client';

import React from 'react';
import { XCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export function ProblemSection() {
  return (
    <section id="product" className="py-20 lg:py-28 bg-[#f4f5f7] border-b border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="max-w-3xl space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-200/80 text-zinc-900 text-xs font-bold uppercase tracking-wider">
            <span>NETWORK EFFICIENCY</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-zinc-950 tracking-tight leading-tight">
            Millions of kilometres are already being travelled.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 font-medium">
            The network doesn&apos;t need more vehicles on the road. It needs better utilization of existing journeys.
          </p>
        </motion.div>

        {/* Visual Side-by-Side Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Card 1: Traditional Model */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="bg-white rounded-xl p-6 sm:p-8 border border-zinc-200/90 shadow-2xs space-y-6 relative overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-2 text-zinc-500 font-extrabold text-xs uppercase tracking-wider">
                <XCircle className="w-4 h-4 text-red-500" />
                <span>Traditional Model</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                High Capital & Carbon Cost
              </span>
            </div>

            {/* Visual Process Flow */}
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold text-zinc-700">
                <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200/80 space-y-1">
                  <div className="text-[10px] text-zinc-400 uppercase">Step 01</div>
                  <div>Courier</div>
                </div>
                <div className="bg-red-50/60 p-3 rounded-lg border border-red-200/80 space-y-1">
                  <div className="text-[10px] text-red-400 uppercase">New Fleet</div>
                  <div className="text-red-950">Dedicated Truck</div>
                </div>
                <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200/80 space-y-1">
                  <div className="text-[10px] text-zinc-400 uppercase">Step 03</div>
                  <div>Duplicate Route</div>
                </div>
                <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200/80 space-y-1">
                  <div className="text-[10px] text-zinc-400 uppercase">Step 04</div>
                  <div>Delivery</div>
                </div>
              </div>

              {/* Drawbacks Bullet Points */}
              <ul className="space-y-2.5 text-xs text-zinc-600 pt-2 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  <span><strong>High Operational Expense</strong>: Buying and maintaining dedicated delivery vans.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  <span><strong>Empty Deadhead Miles</strong>: Vehicles return empty on regional legs.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  <span><strong>Traffic & Toll Congestion</strong>: Adding more vehicles onto already busy highways.</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Card 2: CargoFlow Model */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="bg-zinc-950 text-white rounded-xl p-6 sm:p-8 border border-zinc-800 shadow-xl space-y-6 relative overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2 text-lime-300 font-extrabold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-lime-300" />
                <span>CargoFlow Model</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-[#d9f99d] text-zinc-950">
                Zero Added Vehicles
              </span>
            </div>

            {/* Visual Process Flow */}
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold text-zinc-200">
                <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800 space-y-1">
                  <div className="text-[10px] text-zinc-500 uppercase">Source</div>
                  <div>Courier Parcel</div>
                </div>
                <div className="bg-zinc-900 p-3 rounded-lg border border-lime-400/40 space-y-1 text-lime-300">
                  <div className="text-[10px] text-lime-400 uppercase">Hold Space</div>
                  <div>Scheduled Bus</div>
                </div>
                <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800 space-y-1">
                  <div className="text-[10px] text-zinc-500 uppercase">Transit</div>
                  <div>Existing Route</div>
                </div>
                <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800 space-y-1">
                  <div className="text-[10px] text-zinc-500 uppercase">Dest.</div>
                  <div>Depot Handoff</div>
                </div>
              </div>

              {/* Benefits Bullet Points */}
              <ul className="space-y-2.5 text-xs text-zinc-300 pt-2 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-lime-300 font-bold">•</span>
                  <span><strong className="text-white">Fractional Regional Logistics Cost</strong>: Pay only for the exact hold capacity required.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-300 font-bold">•</span>
                  <span><strong className="text-white">Monetizes Unused Space</strong>: Public transport generates additional non-fare revenue.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-300 font-bold">•</span>
                  <span><strong className="text-white">Predictable Timetable Dispatch</strong>: High-frequency buses depart on fixed daily schedules.</span>
                </li>
              </ul>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}

