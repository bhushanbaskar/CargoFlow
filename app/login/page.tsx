'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCargoFlow } from '@/components/context/cargoflow-context';
import { CargoFlowLogo } from '@/components/landing/logo';
import { ArrowRight, Lock, Mail, AlertCircle, Sparkles, Building2, ShieldCheck, Bus } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useCargoFlow();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await login(email, password);
      if (!res.success || !res.session) {
        setErrorMsg(res.error || 'Invalid email or password.');
        setIsLoading(false);
        return;
      }

      const role = res.session.user.role;
      const compStatus = res.session.company?.status || res.session.user.companyStatus;

      if (role === 'SUPER_ADMIN') {
        router.push('/admin/dashboard');
      } else if (role === 'COURIER_PARTNER') {
        if (compStatus === 'PENDING') {
          router.push('/partner/pending');
        } else if (compStatus === 'REJECTED') {
          router.push('/partner/rejected');
        } else {
          router.push('/partner/dashboard');
        }
      } else if (role === 'CONDUCTOR') {
        router.push('/conductor/dashboard');
      } else {
        router.push('/');
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred during sign in.');
      setIsLoading(false);
    }
  };

  const setDemoCredentials = (role: 'ADMIN' | 'COURIER_ACTIVE' | 'COURIER_PENDING' | 'CONDUCTOR') => {
    setErrorMsg('');
    if (role === 'ADMIN') {
      setEmail('admin@msrtc.gov.in');
      setPassword('password123');
    } else if (role === 'COURIER_ACTIVE') {
      setEmail('dispatch@bluedart.com');
      setPassword('password123');
    } else if (role === 'COURIER_PENDING') {
      setEmail('contact@swiftlog.in');
      setPassword('password123');
    } else if (role === 'CONDUCTOR') {
      setEmail('conductor.nashik@msrtc.gov.in');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans antialiased text-zinc-950 selection:bg-zinc-950 selection:text-lime-300">
      
      {/* Top Header */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between py-2">
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <CargoFlowLogo size="md" />
        </Link>
        <Link
          href="/register"
          className="text-xs font-bold text-zinc-600 hover:text-zinc-950 flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-zinc-200 bg-white hover:border-zinc-300 transition-all shadow-2xs"
        >
          <span>Become a Courier Partner</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Login Box */}
      <div className="max-w-md mx-auto w-full py-8 space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/90 shadow-xl space-y-6">
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-900 text-[10px] font-bold font-mono uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-lime-600" />
              <span>B2B PORTAL ACCESS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950">
              Sign in to CargoFlow
            </h1>
            <p className="text-xs text-zinc-500">
              Enter your credentials to manage luggage hold capacity and waybill shipments.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700">Work Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-700">Password</label>
                <button
                  type="button"
                  onClick={() => alert('For testing, use demo buttons below or password123')}
                  className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-900"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 bg-zinc-950 hover:bg-lime-400 hover:text-zinc-950 text-white font-black text-xs rounded-2xl transition-all flex items-center justify-center gap-2 shadow-md group"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Switcher */}
          <div className="pt-4 border-t border-zinc-100 space-y-3">
            <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider text-center">
              ONE-CLICK DEMO TEST ACCOUNTS
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setDemoCredentials('ADMIN')}
                className="p-2 rounded-xl bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 text-zinc-800 text-left flex items-center gap-2"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-lime-600 shrink-0" />
                <span className="truncate">Super Admin</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('COURIER_ACTIVE')}
                className="p-2 rounded-xl bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 text-zinc-800 text-left flex items-center gap-2"
              >
                <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">Active Courier</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('COURIER_PENDING')}
                className="p-2 rounded-xl bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 text-zinc-800 text-left flex items-center gap-2"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">Pending Courier</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('CONDUCTOR')}
                className="p-2 rounded-xl bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 text-zinc-800 text-left flex items-center gap-2"
              >
                <Bus className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="truncate">Conductor</span>
              </button>
            </div>
          </div>

        </div>

        <div className="text-center text-xs text-zinc-500 font-medium">
          Don&apos;t have a partner account?{' '}
          <Link href="/register" className="font-bold text-zinc-950 underline">
            Register Courier Company
          </Link>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center text-xs text-zinc-400 font-mono py-2">
        © {new Date().getFullYear()} CargoFlow Technologies • MSRTC Transit Grid
      </div>

    </div>
  );
}
