'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useCargoFlow } from '@/components/context/cargoflow-context';
import { UserRole } from '@/lib/types';
import {
  Bus,
  ShieldCheck,
  Building2,
  Smartphone,
  ChevronDown,
  Search,
  Bell,
  LogOut,
  Clock,
  UserCheck,
  Sparkles,
} from 'lucide-react';

export function HeaderNav() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    currentRole,
    currentProfile,
    currentCompany,
    activeTab,
    setActiveTab,
    switchRole,
    logout,
    courierCompanies,
    isSimulating,
    toggleSimulation,
  } = useCargoFlow();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const pendingAppsCount = courierCompanies.filter((c) => c.status === 'PENDING').length;

  const getNavTabs = () => {
    if (currentRole === 'SUPER_ADMIN') {
      return [
        { id: 'fleet-map', label: 'Fleet Map' },
        { id: 'admin-partners', label: 'Partner Apps', badge: pendingAppsCount },
        { id: 'analytics', label: 'Network Analytics' },
        { id: 'fleet-manage', label: 'Buses & Depots' },
        { id: 'all-shipments', label: 'Master Shipments' },
      ];
    } else if (currentRole === 'COURIER_PARTNER') {
      return [
        { id: 'book-capacity', label: 'Book Capacity' },
        { id: 'my-shipments', label: 'My Waybills' },
        { id: 'invoices', label: 'Invoices & Credit' },
      ];
    } else {
      return [
        { id: 'today-trips', label: 'Assigned Trips' },
        { id: 'qr-scanner', label: 'QR Scan & Load' },
      ];
    }
  };

  const navTabs = getNavTabs();

  const handleSignOut = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#f4f5f7] border-b border-zinc-200/80 px-4 lg:px-8 py-2.5">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between h-14">
        
        {/* Left Brand Logo & Tabs */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-extrabold text-lg shadow-xs">
              <Bus className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black text-zinc-900 text-base tracking-tight font-sans">
                CargoFlow
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#d9f99d] text-slate-900 border border-lime-300">
                MSRTC
              </span>
            </div>
          </Link>

          {/* Nav Tabs */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-zinc-200/60 p-1 rounded-full border border-zinc-300/40">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    
                    if (currentRole === 'SUPER_ADMIN' && pathname && !pathname.startsWith('/admin/dashboard')) {
                      router.push('/admin/dashboard');
                    } else if (currentRole === 'COURIER_PARTNER' && pathname && !pathname.startsWith('/partner/dashboard')) {
                      router.push('/partner/dashboard');
                    } else if (currentRole === 'CONDUCTOR' && pathname && !pathname.startsWith('/conductor/dashboard')) {
                      router.push('/conductor/dashboard');
                    }
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-zinc-900 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-300/50'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-amber-400 text-zinc-950' : 'bg-amber-500 text-white'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Action Icons & User Capsule */}
        <div className="flex items-center gap-3">
          
          {/* Telemetry Switcher */}
          <button
            onClick={toggleSimulation}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-zinc-200/90 text-xs font-medium text-zinc-700 shadow-2xs hover:bg-zinc-50"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isSimulating ? 'bg-[#d9f99d] ring-2 ring-lime-400' : 'bg-amber-400'
              }`}
            />
            <span>{isSimulating ? 'GPS Live' : 'Paused'}</span>
          </button>

          {/* Role Dropdown */}
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
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-zinc-200 p-3 z-50 animate-in fade-in space-y-2">
                <div className="px-2 py-1.5 text-[10px] font-bold tracking-wider text-zinc-400 uppercase border-b border-zinc-100 flex items-center justify-between">
                  <span>CURRENT AUTH SESSION</span>
                  <span className="text-zinc-900 font-mono">{currentRole}</span>
                </div>

                <div className="px-2 py-1 text-xs space-y-0.5">
                  <div className="font-bold text-zinc-900">{currentProfile.fullName}</div>
                  <div className="text-[11px] text-zinc-500">{currentProfile.email}</div>
                  {currentCompany && (
                    <div className="inline-block mt-1 px-2 py-0.5 bg-zinc-100 rounded text-[10px] font-bold text-zinc-800">
                      Company: {currentCompany.name} ({currentCompany.status})
                    </div>
                  )}
                </div>

                <div className="px-2 py-1 text-[10px] font-bold tracking-wider text-zinc-400 uppercase border-t border-zinc-100 pt-2">
                  SWITCH DEMO ROLE
                </div>

                <button
                  onClick={() => {
                    switchRole('SUPER_ADMIN');
                    setRoleMenuOpen(false);
                    router.push('/admin/dashboard');
                  }}
                  className={`w-full text-left p-2.5 rounded-lg text-xs flex items-center gap-2.5 transition-colors ${
                    currentRole === 'SUPER_ADMIN'
                      ? 'bg-zinc-900 text-white font-medium'
                      : 'hover:bg-zinc-100 text-zinc-800'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 shrink-0 text-lime-400" />
                  <div>
                    <div className="font-bold">MSRTC Super Admin</div>
                    <div className="text-[10px] opacity-70">Review applications & master dispatch</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    switchRole('COURIER_PARTNER');
                    setRoleMenuOpen(false);
                    router.push('/partner/dashboard');
                  }}
                  className={`w-full text-left p-2.5 rounded-lg text-xs flex items-center gap-2.5 transition-colors ${
                    currentRole === 'COURIER_PARTNER'
                      ? 'bg-zinc-900 text-white font-medium'
                      : 'hover:bg-zinc-100 text-zinc-800'
                  }`}
                >
                  <Building2 className="w-4 h-4 shrink-0 text-blue-400" />
                  <div>
                    <div className="font-bold">Courier Partner (BlueDart)</div>
                    <div className="text-[10px] opacity-70">Book hold capacity & waybills</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    switchRole('CONDUCTOR');
                    setRoleMenuOpen(false);
                    router.push('/conductor/dashboard');
                  }}
                  className={`w-full text-left p-2.5 rounded-lg text-xs flex items-center gap-2.5 transition-colors ${
                    currentRole === 'CONDUCTOR'
                      ? 'bg-zinc-900 text-white font-medium'
                      : 'hover:bg-zinc-100 text-zinc-800'
                  }`}
                >
                  <Smartphone className="w-4 h-4 shrink-0 text-purple-400" />
                  <div>
                    <div className="font-bold">Bus Conductor</div>
                    <div className="text-[10px] opacity-70">QR barcode scanning & loading</div>
                  </div>
                </button>

                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                  <Link
                    href="/login"
                    onClick={() => setRoleMenuOpen(false)}
                    className="text-xs text-zinc-600 font-bold hover:text-zinc-950 px-2 py-1"
                  >
                    Login Screen
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs flex items-center gap-1 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Navigation Row */}
      <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto pt-2 border-t border-zinc-200/50 scrollbar-none">
        {navTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                
                if (currentRole === 'SUPER_ADMIN' && pathname && !pathname.startsWith('/admin/dashboard')) {
                  router.push('/admin/dashboard');
                } else if (currentRole === 'COURIER_PARTNER' && pathname && !pathname.startsWith('/partner/dashboard')) {
                  router.push('/partner/dashboard');
                } else if (currentRole === 'CONDUCTOR' && pathname && !pathname.startsWith('/conductor/dashboard')) {
                  router.push('/conductor/dashboard');
                }
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isActive ? 'bg-zinc-900 text-white' : 'bg-zinc-200/60 text-zinc-700'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
