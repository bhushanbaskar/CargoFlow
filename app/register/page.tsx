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
  CheckCircle2,
  Home,
  Clock,
  ExternalLink,
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
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredData, setRegisteredData] = useState<{
    companyName: string;
    contactEmail: string;
    contactPhone: string;
    city: string;
    state: string;
    fullName: string;
    workEmail: string;
    companyCode?: string;
  } | null>(null);

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

      // Capture registered data for confirmation display
      setRegisteredData({
        companyName: legalName,
        contactEmail: contactEmail || workEmail,
        contactPhone,
        city,
        state,
        fullName,
        workEmail,
        companyCode: res.session?.company?.code,
      });

      setIsLoading(false);
      setIsSuccess(true);
    } catch (err) {
      setErrorMsg('An unexpected error occurred during registration.');
      setIsLoading(false);
    }
  };

  // SUCCESS CONFIRMATION SCREEN
  if (isSuccess && registeredData) {
    return (
      <div className="min-h-screen bg-[#f4f5f7] flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans antialiased text-zinc-950 selection:bg-zinc-950 selection:text-lime-300">
        
        {/* Header */}
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between py-2">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <CargoFlowLogo size="md" />
          </Link>
          <Link
            href="/"
            className="text-xs font-bold text-zinc-700 hover:text-zinc-950 flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-zinc-200 bg-white hover:border-zinc-300 transition-all shadow-2xs"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Go to Homepage</span>
          </Link>
        </div>

        {/* Main Success Container */}
        <div className="max-w-2xl mx-auto w-full py-8 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-200/90 shadow-2xl space-y-8 text-center relative overflow-hidden">
            
            {/* Ambient Background Accent */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-lime-100 rounded-full blur-3xl opacity-50 pointer-events-none" />

            {/* Success Icon */}
            <div className="relative inline-flex items-center justify-center">
              <div className="w-20 h-20 rounded-3xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center shadow-lg shadow-emerald-500/10 text-emerald-600 animate-in zoom-in-90 duration-300">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
              </span>
            </div>

            {/* Titles */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold font-mono uppercase tracking-wider border border-emerald-200/80">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>REGISTRATION REQUEST SUBMITTED</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950">
                Application Received Successfully!
              </h1>
              
              <p className="text-xs sm:text-sm text-zinc-600 font-medium max-w-lg mx-auto leading-relaxed">
                Welcome to CargoFlow. Your courier partner account for <span className="font-bold text-zinc-950">{registeredData.companyName}</span> has been created and securely logged in MSRTC Transit Grid.
              </p>
            </div>

            {/* Application Summary Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-zinc-50 border border-zinc-200/90 text-left space-y-4 font-sans">
              <div className="flex items-center justify-between border-b border-zinc-200/70 pb-3">
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-zinc-600" />
                  <div>
                    <span className="text-xs font-bold text-zinc-950 block">{registeredData.companyName}</span>
                    {registeredData.companyCode && (
                      <span className="text-[10px] font-mono text-zinc-400">Ref Code: {registeredData.companyCode}</span>
                    )}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>Pending Review</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">Account Admin</span>
                  <span className="font-semibold text-zinc-900">{registeredData.fullName}</span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">Login Work Email</span>
                  <span className="font-semibold text-zinc-900">{registeredData.workEmail}</span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">Contact Phone</span>
                  <span className="font-semibold text-zinc-900">{registeredData.contactPhone}</span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">Hub Station Location</span>
                  <span className="font-semibold text-zinc-900">{registeredData.city}, {registeredData.state}</span>
                </div>
              </div>
            </div>

            {/* Next Steps Notification */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-left flex items-start gap-3">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs text-amber-950">
                <span className="font-bold block">What happens next?</span>
                <p className="text-amber-800 leading-relaxed text-[11px]">
                  MSRTC Controllers verify your logistics details and activate your digital credit limit. You can monitor the review progress or sign in anytime using your work email.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/"
                className="w-full sm:w-auto px-8 py-4 bg-zinc-950 hover:bg-lime-400 hover:text-zinc-950 text-white font-black text-xs rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl group"
              >
                <Home className="w-4 h-4" />
                <span>Go to Homepage</span>
              </Link>

              <Link
                href="/partner/pending"
                className="w-full sm:w-auto px-6 py-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold text-xs rounded-2xl transition-colors flex items-center justify-center gap-2 border border-zinc-200"
              >
                <span>View Status Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="pt-2">
              <Link
                href="/login"
                className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 underline"
              >
                Sign in with existing credentials
              </Link>
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

  // REGISTRATION FORM
  return (
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans antialiased text-zinc-950 selection:bg-zinc-950 selection:text-lime-300">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between py-2">
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <CargoFlowLogo size="md" />
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-xs font-bold text-zinc-600 hover:text-zinc-950 flex items-center gap-1.5 px-3 py-2 rounded-full border border-zinc-200 bg-white hover:border-zinc-300 transition-all shadow-2xs"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Homepage</span>
          </Link>
          <Link
            href="/login"
            className="text-xs font-bold text-zinc-600 hover:text-zinc-950 flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-zinc-200 bg-white hover:border-zinc-300 transition-all shadow-2xs"
          >
            <span>Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
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
              className="w-full py-4 px-8 bg-zinc-950 hover:bg-lime-400 hover:text-zinc-950 text-white font-black text-sm rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl group cursor-pointer"
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
