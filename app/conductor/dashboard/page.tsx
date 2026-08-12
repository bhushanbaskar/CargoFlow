'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCargoFlow } from '@/components/context/cargoflow-context';
import { HeaderNav } from '@/components/navigation/header-nav';
import { ConductorView } from '@/components/views/conductor-view';
import { ArrowLeft, Bus, QrCode } from 'lucide-react';

export default function ConductorDashboardPage() {
  const router = useRouter();
  const { currentRole, activeTab, currentProfile } = useCargoFlow();

  // Role Guard
  useEffect(() => {
    if (currentRole !== 'CONDUCTOR') {
      if (currentRole === 'SUPER_ADMIN') {
        router.push('/admin/dashboard');
      } else if (currentRole === 'COURIER_PARTNER') {
        router.push('/partner/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [currentRole, router]);

  if (currentRole !== 'CONDUCTOR') {
    return (
      <div className="min-h-screen bg-[#eef0f3] flex items-center justify-center p-4 font-mono text-xs text-zinc-500">
        Checking authorization...
      </div>
    );
  }

  const isScannerTab = activeTab === 'qr-scanner';

  return (
    <div className="min-h-screen bg-[#eef0f3] text-zinc-900 font-sans antialiased flex flex-col selection:bg-zinc-900 selection:text-white">
      {/* Top Banner */}
      <div className="bg-zinc-950 text-white px-4 py-2 border-b border-zinc-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-zinc-300">
          <Bus className="w-3.5 h-3.5 text-lime-300" />
          <span className="font-bold text-white">MSRTC Bus Conductor Handheld Console</span>
        </div>

        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-lime-300 font-bold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Landing Page</span>
        </button>
      </div>

      <HeaderNav />

      {/* Hero Conductor Bar */}
      <div className="bg-white border-b border-zinc-200 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase">ON-BUS OPERATIONAL TERMINAL</div>
            <h1 className="text-xl font-extrabold text-zinc-950">{currentProfile.fullName}</h1>
            <p className="text-xs text-zinc-500">Depot Station: {currentProfile.depotName || 'Nashik CBS Division'}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 text-xs font-bold font-mono">
              BUS #MH-15-BD-1021
            </span>
          </div>
        </div>
      </div>

      <main className="flex-1">
        <ConductorView isScannerTab={isScannerTab} />
      </main>

      <footer className="bg-white border-t border-slate-200/80 py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-[1600px] mx-auto w-full">
        <div>
          <span className="font-bold text-slate-800">CargoFlow Conductor Terminal</span> • MSRTC
        </div>
        <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
          <span>En-route Luggage Hold Control</span>
        </div>
      </footer>
    </div>
  );
}
