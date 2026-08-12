'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCargoFlow } from '@/components/context/cargoflow-context';
import { HeaderNav } from '@/components/navigation/header-nav';
import { FleetMapView } from '@/components/views/fleet-map';
import { AnalyticsView } from '@/components/views/analytics-view';
import { FleetManageView } from '@/components/views/fleet-manage';
import { ShipmentsView } from '@/components/views/shipments-view';
import { AdminPartnersView } from '@/components/views/admin-partners-view';
import { InvoicesView } from '@/components/views/invoices-view';
import { ArrowLeft, ShieldCheck, Clock } from 'lucide-react';

export default function SuperAdminDashboardPage() {
  const router = useRouter();
  const { currentRole, activeTab, courierCompanies } = useCargoFlow();

  const pendingCount = courierCompanies.filter((c) => c.status === 'PENDING').length;

  // Role Guard
  useEffect(() => {
    if (currentRole !== 'SUPER_ADMIN') {
      if (currentRole === 'COURIER_PARTNER') {
        router.push('/partner/dashboard');
      } else if (currentRole === 'CONDUCTOR') {
        router.push('/conductor/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [currentRole, router]);

  if (currentRole !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen bg-[#eef0f3] flex items-center justify-center p-4 font-mono text-xs text-zinc-500">
        Checking authorization...
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'fleet-map':
        return <FleetMapView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'fleet-manage':
        return <FleetManageView />;
      case 'all-shipments':
        return <ShipmentsView isMasterLedger={true} />;
      case 'admin-partners':
        return <AdminPartnersView />;
      case 'invoices':
        return <InvoicesView />;
      default:
        return <FleetMapView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#eef0f3] text-zinc-900 font-sans antialiased flex flex-col selection:bg-zinc-900 selection:text-white">
      {/* Top Banner */}
      <div className="bg-zinc-950 text-white px-4 py-2 border-b border-zinc-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-zinc-300">
          <ShieldCheck className="w-3.5 h-3.5 text-lime-300" />
          <span className="font-bold text-white">MSRTC Super Admin Console</span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-zinc-950 font-bold text-[10px] flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{pendingCount} Pending Partner Apps</span>
            </span>
          )}
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

      <main className="flex-1">{renderContent()}</main>

      <footer className="bg-white border-t border-slate-200/80 py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-[1600px] mx-auto w-full">
        <div>
          <span className="font-bold text-slate-800">CargoFlow Network Administration</span> • MSRTC
        </div>
        <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
          <span>Maharashtra Intercity Transit Network</span>
          <span>•</span>
          <span>Full Master Ledger Control</span>
        </div>
      </footer>
    </div>
  );
}
