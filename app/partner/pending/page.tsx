'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCargoFlow } from '@/components/context/cargoflow-context';
import { CargoFlowLogo } from '@/components/landing/logo';
import { Clock, Building2, CheckCircle2, ArrowLeft, LogOut, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';

export default function PartnerPendingPage() {
  const router = useRouter();
  const { currentCompany, currentProfile, logout, approveCompany, refreshCompanies } = useCargoFlow();

  const handleSignOut = async () => {
    await logout();
    router.push('/login');
  };

  const handleDemoApprove = async () => {
    const targetCompanyId = currentCompany?.id || currentProfile?.companyId;
    if (targetCompanyId) {
      await approveCompany(targetCompanyId);
      await refreshCompanies();
      router.push('/partner/dashboard');
    }
  };

  const companyName = currentCompany?.legalName || currentCompany?.name || currentProfile?.companyName || 'Your Courier Company';

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans antialiased text-zinc-950">
      
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between py-2">
        <Link href="/">
          <CargoFlowLogo size="md" />
        </Link>
        <button
          onClick={handleSignOut}
          className="text-xs font-bold text-zinc-600 hover:text-zinc-950 flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-zinc-200 bg-white hover:border-zinc-300 transition-all shadow-2xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Pending Card */}
      <div className="max-w-xl mx-auto w-full py-8 space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-amber-200 shadow-xl space-y-8 text-center relative overflow-hidden">
          
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-inner">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 text-amber-950 text-xs font-bold font-mono uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>APPLICATION UNDER REVIEW</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
              Your application has been submitted.
            </h1>

            <p className="text-xs sm:text-sm text-zinc-600 font-medium max-w-md mx-auto leading-relaxed">
              Your CargoFlow partner application is currently being reviewed by MSRTC Transit Controllers. You&apos;ll be able to access the intercity logistics dispatch dashboard once your company is approved.
            </p>
          </div>

          {/* Company Details Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 border border-zinc-200/90 text-left space-y-3 font-sans">
            <div className="flex items-center justify-between border-b border-zinc-200/60 pb-3">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-zinc-500" />
                <span className="text-xs font-bold text-zinc-950">{companyName}</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold font-mono">
                ● Pending Review
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-600">
              <div>
                <span className="text-zinc-400 font-mono uppercase text-[9px] block">Contact Email</span>
                <span className="font-semibold text-zinc-800">{currentCompany?.contactEmail || currentProfile?.email}</span>
              </div>
              <div>
                <span className="text-zinc-400 font-mono uppercase text-[9px] block">Location</span>
                <span className="font-semibold text-zinc-800">
                  {currentCompany?.city ? `${currentCompany.city}, ${currentCompany.state}` : 'Maharashtra'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to CargoFlow Home</span>
            </Link>

            <button
              onClick={handleSignOut}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Demo Helper Banner */}
          <div className="pt-6 border-t border-zinc-100 space-y-2">
            <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
              DEMO EVALUATOR SHORTCUT
            </div>
            <button
              onClick={handleDemoApprove}
              className="px-4 py-2.5 bg-lime-100 hover:bg-lime-200 text-lime-950 font-extrabold text-xs rounded-xl border border-lime-300 transition-all flex items-center justify-center gap-2 mx-auto"
            >
              <Sparkles className="w-4 h-4 text-lime-700" />
              <span>Instant Approve Company (Demo Mode)</span>
            </button>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-zinc-400 font-mono py-2">
        © {new Date().getFullYear()} CargoFlow Technologies • MSRTC Transit Grid
      </div>

    </div>
  );
}
