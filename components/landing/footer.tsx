'use client';

import React from 'react';
import { CargoFlowLogo } from './logo';

interface FooterProps {
  onRequestAccess: () => void;
  onLaunchApp: () => void;
}

export function Footer({ onRequestAccess, onLaunchApp }: FooterProps) {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-white border-t border-zinc-200/80 pt-16 pb-12 text-zinc-600 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <CargoFlowLogo size="md" />
            <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
              Technology for a more connected transport and logistics network across Maharashtra.
            </p>
            <div className="pt-2 text-[11px] font-mono text-zinc-400">
              Built for Maharashtra. Designed for the network.
            </div>
          </div>

          {/* Links Column 1 */}
          <div className="md:col-span-3 space-y-3">
            <div className="text-xs font-extrabold uppercase font-mono text-zinc-950 tracking-wider">
              Navigation
            </div>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <button onClick={() => scrollToSection('product')} className="hover:text-zinc-950 transition-colors">
                  Product
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('how-it-works')} className="hover:text-zinc-950 transition-colors">
                  How it Works
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('for-logistics')} className="hover:text-zinc-950 transition-colors">
                  For Logistics
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('for-operators')} className="hover:text-zinc-950 transition-colors">
                  For Operators
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('network')} className="hover:text-zinc-950 transition-colors">
                  Network
                </button>
              </li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="md:col-span-4 space-y-3">
            <div className="text-xs font-extrabold uppercase font-mono text-zinc-950 tracking-wider">
              Platform & Demos
            </div>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <button onClick={onLaunchApp} className="text-zinc-950 font-bold hover:underline flex items-center gap-1.5">
                  <span>Launch Live SaaS Dispatch App</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#d9f99d] text-zinc-950 font-mono">LIVE</span>
                </button>
              </li>
              <li>
                <button onClick={onRequestAccess} className="hover:text-zinc-950 transition-colors">
                  Request Access / Pilot
                </button>
              </li>
              <li className="pt-2 text-[11px] text-zinc-400 leading-relaxed">
                Notice: CargoFlow is a proposed technology platform / hackathon project designed around scheduled public transport timetables. Not officially operated by MSRTC.
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Legal Bar */}
        <div className="pt-8 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div>
            © {new Date().getFullYear()} CargoFlow Technologies Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-zinc-700">Privacy Policy</a>
            <a href="#terms" className="hover:text-zinc-700">Terms of Service</a>
            <a href="#security" className="hover:text-zinc-700">Security</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
