'use client';

import React from 'react';
import { HeroMapVisualization } from './hero-map';
import { ArrowRight, LayoutDashboard, Sparkles, CheckCircle2, Shield } from 'lucide-react';

interface HeroProps {
  onRequestAccess: () => void;
  onLaunchApp: () => void;
}

export function Hero({ onRequestAccess, onLaunchApp }: HeroProps) {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative pt-28 sm:pt-36 pb-16 lg:pb-24 overflow-hidden bg-[#fafafa]">
      
      {/* Background Accent Grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Typography & Narrative CTAs */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            
            {/* Small Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-200/90 text-zinc-900 text-xs font-bold tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-zinc-950" />
              <span>THE LOGISTICS NETWORK ALREADY EXISTS</span>
            </div>

            {/* Main Display Headline (64-88px scale with tight tracking) */}
            <h1 className="text-4xl sm:text-6xl lg:text-[72px] font-black tracking-[-0.035em] text-zinc-950 leading-[0.98] font-sans">
              Turn every journey into delivery capacity.
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-zinc-600 font-normal leading-relaxed max-w-xl">
              CargoFlow lets logistics companies reserve unused capacity on scheduled public buses—creating a faster, more affordable way to move cargo across Maharashtra.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {/* Primary CTA */}
              <button
                onClick={onRequestAccess}
                className="px-6 py-3.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2 group"
              >
                <span>Request Access</span>
                <ArrowRight className="w-4 h-4 text-lime-300 transition-transform group-hover:translate-x-1" />
              </button>

              {/* Secondary CTA */}
              <button
                onClick={() => scrollToSection('network')}
                className="px-6 py-3.5 rounded-full bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-200/90 font-bold text-sm transition-all shadow-2xs"
              >
                Explore the Network
              </button>

              {/* Live App Launcher CTA */}
              <button
                onClick={onLaunchApp}
                className="px-5 py-3.5 rounded-full bg-zinc-100 hover:bg-zinc-200/80 text-zinc-950 font-extrabold text-xs transition-all border border-zinc-200/80 flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-zinc-700" />
                <span>Launch SaaS App</span>
              </button>
            </div>

            {/* Subtle Trust Statement */}
            <div className="pt-2 flex items-center gap-2 text-xs font-medium text-zinc-500">
              <Shield className="w-4 h-4 text-zinc-700 shrink-0" />
              <span>Built around scheduled public transport. Designed for logistics.</span>
            </div>

            {/* Key Value Pill Tags */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              {[
                'Zero Added Vehicles',
                'Lower Regional Costs',
                'MSRTC Timetable Sync',
                '24/7 Digital Tracking'
              ].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-[11px] font-bold bg-white text-zinc-700 border border-zinc-200/80 shadow-2xs"
                >
                  ✓ {tag}
                </span>
              ))}
            </div>

          </div>

          {/* Right Column: Hero Interactive Map Visual */}
          <div className="lg:col-span-6 w-full">
            <HeroMapVisualization />
          </div>

        </div>
      </div>
    </section>
  );
}
