'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCargoFlow } from '@/components/context/cargoflow-context';
import { CargoFlowLogo } from '@/components/landing/logo';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  User,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { registerCourier } = useCargoFlow();

  const [legalName, setLegalName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [gstin, setGstin] = useState('');

  const [fullName, setFullName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await registerCourier({
        legalName,
        contactEmail,
        contactPhone,
        address,
        city,
        state,
        gstin,
        fullName,
        workEmail,
        password,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Registration failed.');
        setIsLoading(false);
        return;
      }

      // Successful registration leads to PENDING review page
      router.push('/partner/pending');
    } catch (err) {
      setErrorMsg('An unexpected error occurred during registration.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans antialiased text-zinc-950 selection:bg-zinc-950 selection:text-lime-300">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between py-2">
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <CargoFlowLogo size="md" />
        </Link>
        <Link
          href="/login"
          className="text-xs font-bold text-zinc-600 hover:text-zinc-950 flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-zinc-200 bg-white hover:border-zinc-300 transition-all shadow-2xs"
        >
          <span>Existing Partner? Sign In</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Registration Form Container */}
      <div className="max-w-2xl mx-auto w-full py-8 space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-zinc-200/90 shadow-xl space-y-8">
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-900 text-[10px] font-bold font-mono uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-lime-600" />
              <span>COURIER PARTNER ONBOARDING</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950">
              Register Your Courier Company
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 font-medium">
              Join the CargoFlow network to reserve luggage hold capacity across scheduled Maharashtra intercity buses.
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-8">
            
            {/* Section 1: Company Info */}
            <div className="space-y-4">
              <div className="border-b border-zinc-100 pb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-zinc-500" />
                <h2 className="text-xs font-black uppercase font-mono tracking-wider text-zinc-950">
                  1. Company Details
                </h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700">Legal Company Name *</label>
                  <input
                    type="text"
                    required
                    value={legalName}
                    onChange={(e) => {
                      setLegalName(e.target.value);
                      if (!contactEmail && e.target.value) {
                        setContactEmail(`dispatch@${e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`);
                      }
                    }}
                    placeholder="e.g. SwiftLog Parcel Services Pvt Ltd"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700">Business Contact Email *</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="dispatch@company.com"
                        className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700">Business Phone Number *</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="+91 98220 00000"
                        className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700">Office / Hub Address</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Plot 42, MIDC Ambad"
                      className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700">City *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Pune"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700">State *</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Maharashtra"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700">GSTIN (Optional)</label>
                    <input
                      type="text"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      placeholder="27AAAAA0000A1Z5"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-mono font-semibold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Primary Account User */}
            <div className="space-y-4">
              <div className="border-b border-zinc-100 pb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-zinc-500" />
                <h2 className="text-xs font-black uppercase font-mono tracking-wider text-zinc-950">
                  2. Primary Admin Account
                </h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700">Work Email *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={workEmail}
                      onChange={(e) => setWorkEmail(e.target.value)}
                      placeholder="priya@company.com"
                      className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700">Password *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 chars"
                        className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700">Confirm Password *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-8 bg-zinc-950 hover:bg-lime-400 hover:text-zinc-950 text-white font-black text-sm rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl group"
            >
              {isLoading ? (
                <span>Submitting Registration...</span>
              ) : (
                <>
                  <span>Submit Partner Application</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

        </div>

        <div className="text-center text-xs text-zinc-500 font-medium">
          Already registered?{' '}
          <Link href="/login" className="font-bold text-zinc-950 underline">
            Sign In to Account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-zinc-400 font-mono py-2">
        © {new Date().getFullYear()} CargoFlow Technologies • MSRTC Transit Grid
      </div>

    </div>
  );
}
