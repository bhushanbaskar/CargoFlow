'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCargoFlow } from '@/components/context/cargoflow-context';
import { CargoFlowLogo } from './logo';
import { Menu, X, ArrowRight, LogIn, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  onRequestAccess: () => void;
  onLaunchApp: () => void;
}

export function Navbar({ onRequestAccess, onLaunchApp }: NavbarProps) {
  const router = useRouter();
  const { currentRole } = useCargoFlow();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getDashboardPath = () => {
    if (currentRole === 'SUPER_ADMIN') return '/admin/dashboard';
    if (currentRole === 'COURIER_PARTNER') return '/partner/dashboard';
    if (currentRole === 'CONDUCTOR') return '/conductor/dashboard';
    return '/admin/dashboard';
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/85 backdrop-blur-md border-b border-zinc-200/80 shadow-2xs py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <CargoFlowLogo size="md" />
        </div>

        {/* Desktop Navigation Links (shown only on lg screens >= 1024px) */}
        <nav className="hidden lg:flex items-center gap-1 bg-zinc-100/90 p-1.5 rounded-full border border-zinc-200/80 shadow-2xs">
          {[
            { id: 'product', label: 'Product' },
            { id: 'how-it-works', label: 'How it Works' },
            { id: 'for-logistics', label: 'For Logistics' },
            { id: 'for-operators', label: 'For Operators' },
            { id: 'network', label: 'Network' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-zinc-600 hover:text-zinc-950 hover:bg-white/80 transition-all duration-150"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right CTA Group (hidden on tablet/mobile < 1024px) */}
        <div className="hidden lg:flex items-center gap-2.5">
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 text-xs font-bold transition-all"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Link>

          <Link
            href="/register"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-lime-300 hover:bg-lime-400 text-zinc-950 text-xs font-black transition-all shadow-2xs border border-lime-400"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Partner Sign Up</span>
          </Link>

          <button
            onClick={() => router.push(getDashboardPath())}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-sm group"
          >
            <span>Open Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5 text-lime-300 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Hamburger Menu Button (shown for tablet & mobile view < 1024px) */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href="/login"
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-zinc-900 text-white text-[11px] font-bold"
          >
            <span>Sign In</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-700 hover:text-zinc-950 rounded-lg bg-zinc-100 border border-zinc-200 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Hamburger Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-zinc-200 px-6 py-6 space-y-4 shadow-xl"
          >
            <nav className="flex flex-col gap-1.5">
              {[
                { id: 'product', label: 'Product' },
                { id: 'how-it-works', label: 'How it Works' },
                { id: 'for-logistics', label: 'For Logistics' },
                { id: 'for-operators', label: 'For Operators' },
                { id: 'network', label: 'Network' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-left px-4 py-2.5 rounded-lg text-sm font-bold text-zinc-800 hover:bg-zinc-100 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="pt-4 border-t border-zinc-100 flex flex-col gap-2.5">
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3.5 rounded-lg bg-lime-300 text-zinc-950 font-black text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register Courier Partner</span>
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push(getDashboardPath());
                }}
                className="w-full py-3 rounded-lg bg-zinc-950 text-white font-bold text-xs hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 text-lime-300" />
              </button>

              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-lg bg-zinc-100 text-zinc-900 font-bold text-xs hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4 text-zinc-700" />
                <span>Sign In to Account</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

