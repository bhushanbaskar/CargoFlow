'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCargoFlow } from '@/components/context/cargoflow-context';
import { CargoFlowLogo } from '@/components/landing/logo';
import { XCircle, Building2, ArrowLeft, LogOut, AlertCircle } from 'lucide-react';

export default function PartnerRejectedPage() {
  const router = useRouter();
  const { currentCompany, currentProfile, logout } = useCargoFlow();

  const handleSignOut = async () => {
    await logout();
    router.push('/login');
  };

  const companyName = currentCompany?.legalName || currentCompany?.name || currentProfile?.companyName || 'Your Courier Company';
  const reason = currentCompany?.rejectionReason || 'Incomplete documentation provided or registration guidelines not met.';

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

      {/* Main Rejected Card */}
      <div className="max-w-xl mx-auto w-full py-8 space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-rose-200 shadow-xl space-y-8 text-center relative overflow-hidden">
          
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8" />
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100/80 text-rose-950 text-xs font-bold font-mono uppercase tracking-wider">
              <span>APPLICATION DECLINED</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
              Partner Registration Declined
            </h1>

            <p className="text-xs sm:text-sm text-zinc-600 font-medium max-w-md mx-auto leading-relaxed">
              Unfortunately, your application for <span className="font-bold text-zinc-900">{companyName}</span> could not be approved at this time.
            </p>
          </div>

          {/* Reason Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/60 border border-rose-200 text-left space-y-3 font-sans">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Administrative Review Reason:</span>
            </div>
            <p className="text-xs text-rose-950 font-medium pl-6 leading-relaxed">
              {reason}
            </p>
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

        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-zinc-400 font-mono py-2">
        © {new Date().getFullYear()} CargoFlow Technologies • MSRTC Transit Grid
      </div>

    </div>
  );
}
