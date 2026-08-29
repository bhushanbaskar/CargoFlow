'use client';

import React, { useState } from 'react';
import { CargoFlowProvider, useCargoFlow } from '@/components/context/cargoflow-context';
import { HeaderNav } from '@/components/navigation/header-nav';
import { FleetMapView } from '@/components/views/fleet-map';
import { BookCapacityView } from '@/components/views/book-capacity';
import { ShipmentsView } from '@/components/views/shipments-view';
import { ConductorView } from '@/components/views/conductor-view';
import { AnalyticsView } from '@/components/views/analytics-view';
import { FleetManageView } from '@/components/views/fleet-manage';
import { InvoicesView } from '@/components/views/invoices-view';
import { SimulationController } from '@/components/views/simulation-controller';
import { RecoveryCenterModal } from '@/components/views/recovery-center-modal';

// Landing Page Components
import { Navbar } from '@/components/landing/navbar';
import { Hero } from '@/components/landing/hero';
import { Metrics } from '@/components/landing/metrics';
import { ProblemSection } from '@/components/landing/problem';
import { HowItWorks } from '@/components/landing/how-it-works';
import { DashboardPreview } from '@/components/landing/dashboard-preview';
import { CapacitySection } from '@/components/landing/capacity';
import { LogisticsSection } from '@/components/landing/logistics-section';
import { OperatorsSection } from '@/components/landing/operators-section';
import { NetworkSection } from '@/components/landing/network-section';
import { RevenueModel } from '@/components/landing/revenue-model';
import { TrackingSection } from '@/components/landing/tracking-section';
import { WhyCargoFlow } from '@/components/landing/why-cargoflow';
import { FinalCTA } from '@/components/landing/final-cta';
import { Footer } from '@/components/landing/footer';
import { RequestAccessModal } from '@/components/landing/request-access-modal';
import { ArrowLeft, Sparkles } from 'lucide-react';

function LandingPage({
  onRequestAccess,
  onLaunchApp
}: {
  onRequestAccess: () => void;
  onLaunchApp: () => void;
}) {
  return (
    <div className="min-h-screen bg-white text-zinc-950 font-sans antialiased selection:bg-zinc-950 selection:text-lime-300">
      {/* Sticky Landing Navigation */}
      <Navbar onRequestAccess={onRequestAccess} onLaunchApp={onLaunchApp} />

      {/* Main Landing Sections */}
      <main>
        <Hero onRequestAccess={onRequestAccess} onLaunchApp={onLaunchApp} />
        <Metrics />
        <ProblemSection />
        <HowItWorks />
        <DashboardPreview onLaunchApp={onLaunchApp} />
        <CapacitySection />
        <LogisticsSection onRequestAccess={onRequestAccess} />
        <OperatorsSection onRequestAccess={onRequestAccess} />
        <NetworkSection />
        <RevenueModel />
        <TrackingSection />
        <WhyCargoFlow />
        <FinalCTA onRequestAccess={onRequestAccess} onLaunchApp={onLaunchApp} />
      </main>

      {/* Footer */}
      <Footer onRequestAccess={onRequestAccess} onLaunchApp={onLaunchApp} />
    </div>
  );
}

function MainAppShell({ onReturnToLanding }: { onReturnToLanding: () => void }) {
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
      {/* Top Banner to Return to Landing Page */}
      <div className="bg-zinc-950 text-white px-4 py-2 border-b border-zinc-800 flex items-center justify-between text-xs font-mono">
        <button
          onClick={onReturnToLanding}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-lime-300 font-bold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Back to Landing Page</span>
        </button>

        <div className="hidden sm:flex items-center gap-2 text-zinc-400">
          <Sparkles className="w-3.5 h-3.5 text-lime-300" />
          <span>CargoFlow Live MSRTC Dispatch System Demo</span>
        </div>
      </div>

      <HeaderNav />

      <main className="flex-1">
        {renderActiveTabContent()}
      </main>

      <SimulationController />
      <RecoveryCenterModal />

      {/* Footer Branding Bar */}
      <footer className="bg-white border-t border-slate-200/80 py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-[1600px] mx-auto w-full">
        <div>
          <span className="font-bold text-slate-800">CargoFlow</span> • Proposed Technology Infrastructure Model for Regional Transport
        </div>
        <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
          <span>Maharashtra Transit Grid</span>
          <span>•</span>
          <span>Deterministic Matching Engine v1.0</span>
        </div>
      </footer>
    </div>
  );
}

export default function Page() {
  const [viewMode, setViewMode] = useState<'LANDING' | 'APP'>('LANDING');
  const [requestModalOpen, setRequestModalOpen] = useState<boolean>(false);

  return (
    <CargoFlowProvider>
      {viewMode === 'LANDING' ? (
        <>
          <LandingPage
            onRequestAccess={() => setRequestModalOpen(true)}
            onLaunchApp={() => setViewMode('APP')}
          />
          <RequestAccessModal
            isOpen={requestModalOpen}
            onClose={() => setRequestModalOpen(false)}
            onLaunchApp={() => {
              setRequestModalOpen(false);
              setViewMode('APP');
            }}
          />
        </>
      ) : (
        <MainAppShell onReturnToLanding={() => setViewMode('LANDING')} />
      )}
    </CargoFlowProvider>
  );
}
