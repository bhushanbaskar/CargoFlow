'use client';

import React, { useState } from 'react';
import { useCargoFlow } from '@/components/context/cargoflow-context';
import { UserRole } from '@/lib/types';
import {
  Bus,
  MapPin,
  TrendingUp,
  Package,
  Receipt,
  QrCode,
  ShieldCheck,
  Building2,
  Smartphone,
  ChevronDown,
  Sparkles,
  Search,
  Bell,
  SlidersHorizontal,
  User,
  Grid
} from 'lucide-react';

export function HeaderNav() {
  const {
    currentRole,
    currentProfile,
    activeTab,
    setActiveTab,
    switchRole,
    networkUtilizationPercentage,
    totalRevenue,
    isSimulating,
    toggleSimulation
  } = useCargoFlow();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return { label: 'Dispatcher Controller', color: 'bg-slate-900 text-white' };
      case 'COURIER_PARTNER':
        return { label: 'Courier Partner', color: 'bg-emerald-600 text-white' };
      case 'CONDUCTOR':
        return { label: 'Bus Conductor', color: 'bg-amber-600 text-white' };
    }
  };

  const currentRoleBadge = getRoleBadge(currentRole);

  // Nav tabs matching Truck&Co header style
  const getNavTabs = () => {
    if (currentRole === 'SUPER_ADMIN') {
      return [
        { id: 'fleet-map', label: 'Fleet Map' },
        { id: 'analytics', label: 'Network Analytics' },
        { id: 'fleet-manage', label: 'Buses & Depots' },
        { id: 'all-shipments', label: 'Master Shipments' }
      ];
    } else if (currentRole === 'COURIER_PARTNER') {
      return [
        { id: 'book-capacity', label: 'Book Capacity' },
        { id: 'my-shipments', label: 'My Waybills' },
        { id: 'invoices', label: 'Invoices & Credit' }
      ];
    } else {
      return [
        { id: 'today-trips', label: 'Assigned Trips' },
        { id: 'qr-scanner', label: 'QR Scan & Load' }
      ];
    }
  };

  const navTabs = getNavTabs();

  return (
    <header className="sticky top-0 z-40 bg-[#f4f5f7] border-b border-zinc-200/80 px-4 lg:px-8 py-2.5">
      
      {/* Top Bar for Live Telemetry */}
      <div className="max-w-[1600px] mx-auto flex items-center justify-between h-14">
        
        {/* Left Brand Logo - Truck&Co / CargoFlow style */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('fleet-map')}>
            <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
              <Bus className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-zinc-900 text-base tracking-tight font-sans">
                CargoFlow
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#d9f99d] text-slate-900 border border-lime-300">
                MSRTC
              </span>
            </div>
          </div>

          {/* Navigation Bar Pills */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-zinc-200/60 p-1 rounded-full border border-zinc-300/40">
            {navTabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-zinc-900 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-300/50'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Action Icons & User Capsule */}
        <div className="flex items-center gap-3">
          
          {/* Telemetry Switcher Button */}
          <button
            onClick={toggleSimulation}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-zinc-200/90 text-xs font-medium text-zinc-700 shadow-2xs hover:bg-zinc-50"
          >
            <span className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-[#d9f99d] ring-2 ring-lime-400' : 'bg-amber-400'}`} />
            <span>{isSimulating ? 'GPS Live' : 'Paused'}</span>
          </button>

          {/* Search Icon */}
          <button className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-white rounded-full transition-colors border border-transparent hover:border-zinc-200 shadow-2xs">
            <Search className="w-4 h-4" />
          </button>

          {/* Bell Icon */}
          <button
            onClick={() => setAuthModalOpen(true)}
            className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-white rounded-full transition-colors border border-transparent hover:border-zinc-200 shadow-2xs relative"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-lime-500 absolute top-1.5 right-1.5 ring-2 ring-white" />
          </button>

          {/* User Profile Capsule (Reference Image 1: Dispatcher Pill) */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2.5 bg-white border border-zinc-200/90 rounded-full pl-3 pr-2 py-1 shadow-2xs hover:border-zinc-300 transition-all"
            >
              <div className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-bold">
                {currentProfile.fullName.charAt(0)}
              </div>
              <div className="text-left text-xs font-semibold text-zinc-800 hidden sm:block">
                <span>{currentProfile.fullName.split(' ')[0]}</span>
                <span className="text-[10px] text-zinc-400 ml-1 font-mono">({currentRole})</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-xl border border-zinc-200 p-2 z-50 animate-in fade-in">
                <div className="px-3 py-2 text-[10px] font-bold tracking-wider text-zinc-400 uppercase border-b border-zinc-100 mb-1">
                  Switch Persona Demo
                </div>

                <button
                  onClick={() => { switchRole('SUPER_ADMIN'); setRoleMenuOpen(false); }}
                  className={`w-full text-left p-2.5 rounded-2xl text-xs flex items-center gap-2.5 transition-colors ${
                    currentRole === 'SUPER_ADMIN' ? 'bg-zinc-900 text-white font-medium' : 'hover:bg-zinc-100 text-zinc-800'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <div>
                    <div className="font-bold">MSRTC Super Admin</div>
                    <div className="text-[10px] opacity-70">Full network control & dispatch</div>
                  </div>
                </button>

                <button
                  onClick={() => { switchRole('COURIER_PARTNER'); setRoleMenuOpen(false); }}
                  className={`w-full text-left p-2.5 rounded-2xl text-xs flex items-center gap-2.5 transition-colors mt-1 ${
                    currentRole === 'COURIER_PARTNER' ? 'bg-zinc-900 text-white font-medium' : 'hover:bg-zinc-100 text-zinc-800'
                  }`}
                >
                  <Building2 className="w-4 h-4 shrink-0" />
                  <div>
                    <div className="font-bold">Courier Partner (BlueDart)</div>
                    <div className="text-[10px] opacity-70">Book hold capacity & waybills</div>
                  </div>
                </button>

                <button
                  onClick={() => { switchRole('CONDUCTOR'); setRoleMenuOpen(false); }}
                  className={`w-full text-left p-2.5 rounded-2xl text-xs flex items-center gap-2.5 transition-colors mt-1 ${
                    currentRole === 'CONDUCTOR' ? 'bg-zinc-900 text-white font-medium' : 'hover:bg-zinc-100 text-zinc-800'
                  }`}
                >
                  <Smartphone className="w-4 h-4 shrink-0" />
                  <div>
                    <div className="font-bold">Bus Conductor</div>
                    <div className="text-[10px] opacity-70">QR scan loading & delivery</div>
                  </div>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Navigation Row */}
      <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto pt-2 border-t border-zinc-200/50 scrollbar-none">
        {navTabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-200/60 text-zinc-700'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Auth Info Modal */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-zinc-900" />
                <h3 className="font-bold text-zinc-900">CargoFlow System Roles</h3>
              </div>
              <button
                onClick={() => setAuthModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-600">
              <p>You are logged in as <strong>{currentProfile.fullName}</strong>.</p>
              <div className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200/80 space-y-2">
                <div><strong>Super Admin</strong>: Live GPS fleet map, capacity metrics, route gantt charts.</div>
                <div><strong>Courier Partner</strong>: Deterministic bus hold space search & instant waybill reservation.</div>
                <div><strong>Conductor</strong>: Mobile terminal interface, barcode/QR scanner verification.</div>
              </div>
            </div>

            <button
              onClick={() => setAuthModalOpen(false)}
              className="w-full py-2.5 rounded-full bg-zinc-900 text-white font-bold text-xs hover:bg-zinc-800 transition-colors"
            >
              Close Overview
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
