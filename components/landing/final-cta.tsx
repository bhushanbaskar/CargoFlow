'use client';

import React from 'react';
import { ArrowRight, LayoutDashboard, Sparkles, ShieldCheck } from 'lucide-react';

interface FinalCTAProps {
  onRequestAccess: () => void;
  onLaunchApp: () => void;
}

export function FinalCTA({ onRequestAccess, onLaunchApp }: FinalCTAProps) {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-24 lg:py-32 bg-zinc-950 text-white relative overflow-hidden">
      
      {/* Background Accent Lines */}
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
        
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-lime-300 text-xs font-bold tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>JOIN THE LOGISTICS EVOLUTION</span>
        </div>

        {/* Large Editorial Heading */}
        <h2 className="text-4xl sm:text-6xl lg:text-[76px] font-black tracking-[-0.03em] text-white leading-[1.02] font-sans">
          The road is already moving.
        </h2>

        {/* Supporting Copy */}
        <p className="text-lg sm:text-xl text-zinc-400 font-normal max-w-2xl mx-auto leading-relaxed">
          CargoFlow gives that movement another purpose—connecting public transit capacity with regional logistics demand.
        </p>

        {/* CTAs */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onRequestAccess}
            className="px-8 py-4 rounded-full bg-[#d9f99d] hover:bg-lime-300 text-zinc-950 font-black text-sm transition-all shadow-xl hover:shadow-2xl flex items-center gap-2 group"
          >
            <span>Request Access</span>
            <ArrowRight className="w-4 h-4 text-zinc-950 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={() => scrollToSection('network')}
            className="px-8 py-4 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold text-sm border border-zinc-800 transition-all"
          >
            Explore the Network
          </button>

          <button
            onClick={onLaunchApp}
            className="px-6 py-4 rounded-full bg-zinc-900 hover:bg-zinc-800 text-lime-300 font-bold text-xs border border-zinc-700/80 flex items-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Launch Live SaaS App</span>
          </button>
        </div>

        <div className="pt-6 text-xs text-zinc-500 font-mono flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-lime-400" />
          <span>Built for Maharashtra regional logistics. Confidential pilot onboarding.</span>
        </div>

      </div>
    </section>
  );
}
