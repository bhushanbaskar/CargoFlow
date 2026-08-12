'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, ArrowRight, Building2, Bus, ShieldCheck } from 'lucide-react';

interface RequestAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchApp?: () => void;
}

export function RequestAccessModal({ isOpen, onClose, onLaunchApp }: RequestAccessModalProps) {
  const [role, setRole] = useState<'COURIER' | 'OPERATOR'>('COURIER');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [routePreference, setRoutePreference] = useState('Mumbai - Pune - Nashik');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setFullName('');
    setCompanyName('');
    setEmail('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 lg:p-8 shadow-2xl border border-zinc-200/90 relative space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#d9f99d] text-zinc-900 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-zinc-950 tracking-tight">Access Requested</h3>
              <p className="text-sm text-zinc-600 max-w-sm mx-auto">
                Thank you, <strong className="text-zinc-900">{fullName || 'Partner'}</strong>. We have prioritized your request for the <strong className="text-zinc-900">{companyName || 'Logistics'}</strong> account on the Maharashtra Transit Corridor.
              </p>
            </div>

            <div className="pt-4 flex flex-col gap-2">
              {onLaunchApp && (
                <button
                  onClick={() => {
                    handleReset();
                    onLaunchApp();
                  }}
                  className="w-full py-3.5 px-6 rounded-full bg-zinc-950 text-white font-extrabold text-sm hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Explore Live Interactive App</span>
                  <ArrowRight className="w-4 h-4 text-lime-300" />
                </button>
              )}
              <button
                onClick={handleReset}
                className="w-full py-3 px-6 rounded-full bg-zinc-100 text-zinc-700 font-bold text-xs hover:bg-zinc-200 transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2 pr-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-[11px] font-bold text-zinc-700 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-900" />
                Beta Access • Maharashtra Network
              </div>
              <h2 className="text-2xl font-extrabold text-zinc-950 tracking-tight">
                Request Platform Access
              </h2>
              <p className="text-xs text-zinc-500">
                Join courier partners and transport operators testing scheduled bus hold capacity reservation.
              </p>
            </div>

            {/* Role Selection Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-zinc-100 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => setRole('COURIER')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  role === 'COURIER'
                    ? 'bg-zinc-950 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Courier / Logistics</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('OPERATOR')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  role === 'OPERATOR'
                    ? 'bg-zinc-950 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Bus className="w-4 h-4" />
                <span>Transit Operator</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-950 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider">
                    {role === 'COURIER' ? 'Company Name' : 'Transit Division / Fleet'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={role === 'COURIER' ? 'e.g. BlueDart Express' : 'e.g. Nashik Division'}
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-950 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider">
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-950 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider">
                  Key Corridor Preference
                </label>
                <select
                  value={routePreference}
                  onChange={(e) => setRoutePreference(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:border-zinc-950 transition-colors"
                >
                  <option value="Mumbai - Pune - Nashik">Mumbai • Pune • Nashik Corridor</option>
                  <option value="Nashik - Chhatrapati Sambhajinagar">Nashik • Chhatrapati Sambhajinagar</option>
                  <option value="Pune - Solapur - Kolhapur">Pune • Solapur • Kolhapur</option>
                  <option value="Nagpur - Amravati - Wardha">Nagpur • Amravati • Wardha</option>
                  <option value="All Maharashtra Divisions">All Maharashtra Regional Divisions</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold text-sm transition-colors shadow-sm flex items-center justify-center gap-2 mt-2"
              >
                <span>Submit Request</span>
                <ArrowRight className="w-4 h-4 text-lime-300" />
              </button>

              <p className="text-[11px] text-center text-zinc-400">
                Built for Maharashtra regional logistics. Confidential pilot onboarding.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
