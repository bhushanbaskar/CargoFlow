'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCargoFlow } from '@/components/context/cargoflow-context';
import { HeaderNav } from '@/components/navigation/header-nav';
import { AdminPartnersView } from '@/components/views/admin-partners-view';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function SuperAdminPartnersPage() {
  const router = useRouter();
  const { currentRole, setActiveTab } = useCargoFlow();

  useEffect(() => {
    if (currentRole !== 'SUPER_ADMIN') {
      if (currentRole === 'COURIER_PARTNER') {
        router.push('/partner/dashboard');
      } else if (currentRole === 'CONDUCTOR') {
        router.push('/conductor/dashboard');
      } else {
        router.push('/login');
      }
    } else {
      setActiveTab('admin-partners');
    }
  }, [currentRole, router, setActiveTab]);

  if (currentRole !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen bg-[#eef0f3] flex items-center justify-center p-4 font-mono text-xs text-zinc-500">
        Checking authorization...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef0f3] text-zinc-900 font-sans antialiased flex flex-col selection:bg-zinc-900 selection:text-white">
      <div className="bg-zinc-950 text-white px-4 py-2 border-b border-zinc-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-zinc-300">
          <ShieldCheck className="w-3.5 h-3.5 text-lime-300" />
          <span className="font-bold text-white">MSRTC Partner Review Console</span>
        </div>

        <button
          onClick={() => router.push('/admin/dashboard')}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-lime-300 font-bold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Admin Main Console</span>
        </button>
      </div>

      <HeaderNav />

      <main className="flex-1">
        <AdminPartnersView />
      </main>

      <footer className="bg-white border-t border-slate-200/80 py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-[1600px] mx-auto w-full">
        <div>
          <span className="font-bold text-slate-800">CargoFlow Partner Verification</span>
        </div>
      </footer>
    </div>
  );
}
