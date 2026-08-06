'use client';

import React from 'react';
import { CargoFlowProvider, useCargoFlow } from '@/components/context/cargoflow-context';
import { HeaderNav } from '@/components/navigation/header-nav';
import { FleetMapView } from '@/components/views/fleet-map';
import { BookCapacityView } from '@/components/views/book-capacity';
import { ShipmentsView } from '@/components/views/shipments-view';
import { ConductorView } from '@/components/views/conductor-view';
import { AnalyticsView } from '@/components/views/analytics-view';
import { FleetManageView } from '@/components/views/fleet-manage';
import { InvoicesView } from '@/components/views/invoices-view';

function MainAppShell() {
  const { activeTab } = useCargoFlow();

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'fleet-map':
        return <FleetMapView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'fleet-manage':
        return <FleetManageView />;
      case 'all-shipments':
        return <ShipmentsView isMasterLedger={true} />;
      case 'book-capacity':
        return <BookCapacityView />;
      case 'my-shipments':
        return <ShipmentsView isMasterLedger={false} />;
      case 'invoices':
        return <InvoicesView />;
      case 'today-trips':
        return <ConductorView isScannerTab={false} />;
      case 'qr-scanner':
        return <ConductorView isScannerTab={true} />;
      default:
        return <FleetMapView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#eef0f3] text-zinc-900 font-sans antialiased flex flex-col selection:bg-zinc-900 selection:text-white">
      <HeaderNav />
      <main className="flex-1">
        {renderActiveTabContent()}
      </main>

      {/* Footer Branding Bar */}
      <footer className="bg-white border-t border-slate-200/80 py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-[1600px] mx-auto w-full">
        <div>
          <span className="font-bold text-slate-800">CargoFlow</span> • Operated by Maharashtra State Road Transport Corporation (MSRTC)
        </div>
        <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
          <span>Nashik Division Transit Grid</span>
          <span>•</span>
          <span>Deterministic Matching Engine v1.0</span>
        </div>
      </footer>
    </div>
  );
}

export default function Page() {
  return (
    <CargoFlowProvider>
      <MainAppShell />
    </CargoFlowProvider>
  );
}
