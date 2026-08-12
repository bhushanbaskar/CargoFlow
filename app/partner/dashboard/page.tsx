'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCargoFlow } from '@/components/context/cargoflow-context';
import { HeaderNav } from '@/components/navigation/header-nav';
import { BookCapacityView } from '@/components/views/book-capacity';
import { ShipmentsView } from '@/components/views/shipments-view';
import { InvoicesView } from '@/components/views/invoices-view';
import { FleetMapView } from '@/components/views/fleet-map';
import {
  Building2,
  Package,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

export default function CourierPartnerDashboardPage() {
  const router = useRouter();
  const {
    currentRole,
    currentProfile,
    currentCompany,
    activeTab,
    shipments,
    totalRevenue,
    switchRole,
  } = useCargoFlow();

  // Role Guard & Status Check
  useEffect(() => {
    if (currentRole !== 'COURIER_PARTNER') {
      if (currentRole === 'SUPER_ADMIN') {
        router.push('/admin/dashboard');
      } else if (currentRole === 'CONDUCTOR') {
        router.push('/conductor/dashboard');
      } else {
        router.push('/login');
      }
      return;
    }

    const companyStatus = currentCompany?.status || currentProfile?.companyStatus;
    if (companyStatus === 'PENDING') {
      router.push('/partner/pending');
    } else if (companyStatus === 'REJECTED') {
      router.push('/partner/rejected');
    }
  }, [currentRole, currentCompany, currentProfile, router]);

  if (currentRole !== 'COURIER_PARTNER') {
    return (
      <div className="min-h-screen bg-[#eef0f3] flex items-center justify-center p-4">
        <div className="text-center font-mono text-xs text-zinc-500">Checking authorization...</div>
      </div>
    );
  }

  const companyName = currentCompany?.name || currentProfile?.companyName || 'Logistics Partner';
  const courierShipments = shipments.filter(
    (s) => s.courierCompanyId === currentCompany?.id || s.courierCompanyName === companyName
  );

  const activeShipmentsCount = courierShipments.filter(
    (s) => s.status === 'RESERVED' || s.status === 'LOADED' || s.status === 'IN_TRANSIT'
  ).length;

  const totalSpent = courierShipments.reduce((sum, s) => sum + s.fareAmount, 0) || 18420;

  const renderContent = () => {
    switch (activeTab) {
      case 'book-capacity':
        return <BookCapacityView />;
      case 'my-shipments':
        return <ShipmentsView isMasterLedger={false} />;
      case 'invoices':
        return <InvoicesView />;
      case 'fleet-map':
        return <FleetMapView />;
      default:
        return <BookCapacityView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#eef0f3] text-zinc-900 font-sans antialiased flex flex-col selection:bg-zinc-900 selection:text-white">
      {/* Top Banner */}
      <div className="bg-zinc-950 text-white px-4 py-2 border-b border-zinc-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-zinc-300">
          <Building2 className="w-3.5 h-3.5 text-lime-300" />
          <span className="font-bold text-white">{companyName}</span>
          <span className="text-zinc-500">•</span>
          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>ACTIVE PARTNER</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-lime-300 font-bold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Landing Page</span>
          </button>
        </div>
      </div>

      <HeaderNav />

      {/* Hero Welcome Banner */}
      <div className="bg-white border-b border-zinc-200 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
              COURIER PARTNER DISPATCH CONSOLE
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
              Good morning, {companyName}
            </h1>
            <p className="text-xs text-zinc-500">
              Manage your intercity luggage hold cargo reservations across MSRTC bus routes.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-zinc-50 border border-zinc-200/90 rounded-2xl">
              <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Active Waybills</div>
              <div className="text-lg font-black text-zinc-950">{activeShipmentsCount}</div>
            </div>
            <div className="p-3 bg-zinc-50 border border-zinc-200/90 rounded-2xl">
              <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Total Reserved</div>
              <div className="text-lg font-black text-zinc-950">{courierShipments.length || 8}</div>
            </div>
            <div className="p-3 bg-lime-50 border border-lime-200 rounded-2xl col-span-2 sm:col-span-1">
              <div className="text-[10px] font-mono font-bold text-lime-800 uppercase">Total Spend</div>
              <div className="text-lg font-black text-lime-950">₹{totalSpent.toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1">{renderContent()}</main>

      <footer className="bg-white border-t border-slate-200/80 py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-[1600px] mx-auto w-full">
        <div>
          <span className="font-bold text-slate-800">CargoFlow Courier Console</span> • {companyName}
        </div>
        <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
          <span>Credit Available: ₹2,15,500</span>
          <span>•</span>
          <span>MSRTC Transit Grid</span>
        </div>
      </footer>
    </div>
  );
}
