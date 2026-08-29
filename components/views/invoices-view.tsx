'use client';

import React, { useState } from 'react';
import { useCargoFlow } from '@/components/context/cargoflow-context';
import { Receipt, Building2, CheckCircle2, Clock, DollarSign, CreditCard, AlertTriangle, RefreshCw } from 'lucide-react';

export function InvoicesView() {
  const { shipments, courierCompanies, currentProfile, backendStatus, restoreConnection } = useCargoFlow();
  const isOffline = backendStatus === 'SIMULATED_OFFLINE';

  const company = courierCompanies.find((c) => c.id === currentProfile.companyId) || courierCompanies[0] || {
    id: 'c0000000-0000-0000-0000-000000000001',
    name: 'BlueDart Express',
    legalName: 'Blue Dart Express Limited',
    code: 'BLUEDART',
    creditLimit: 250000,
    usedCredit: 34500,
  };

  const [invoices, setInvoices] = useState([
    { id: 'INV-2026-001', waybill: 'WB-2026-NSS-0891', amount: 450, date: '2026-08-01', status: 'PAID' },
    { id: 'INV-2026-002', waybill: 'WB-2026-NSM-0412', amount: 780, date: '2026-08-03', status: 'UNPAID' },
    { id: 'INV-2026-003', waybill: 'WB-2026-NSB-0734', amount: 220, date: '2026-08-04', status: 'UNPAID' },
  ]);

  const markPaid = (id: string) => {
    setInvoices((prev) => (prev.map((inv) => (inv.id === id ? { ...inv, status: 'PAID' } : inv))));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Invoices & Credit Billing Account
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            {isOffline
              ? 'Datastore offline. Server-only invoice records and credit ledgers are suspended.'
              : `Automated waybill billing account for ${company?.name || 'Courier Partner'}.`}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-right font-mono text-xs">
          <div className="text-slate-400">Available Credit Balance</div>
          <div className="text-xl font-bold text-emerald-600">
            {isOffline ? '—' : `₹${((company?.creditLimit ?? 100000) - (company?.usedCredit ?? 0)).toLocaleString('en-IN')}`}
          </div>
          {isOffline && <div className="text-[10px] text-amber-700 font-semibold">Datastore offline</div>}
        </div>
      </div>

      {isOffline ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">Oops, something went wrong.</h2>
            <p className="text-slate-600 text-xs leading-relaxed">
              Historical waybill invoices and payment ledger records are unavailable while the primary datastore is offline.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => restoreConnection()}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm inline-flex items-center gap-2 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-lime-300" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600" />
            Waybill Invoices Ledger
          </h2>

          <div className="space-y-3">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{inv.id}</span>
                    <span className="text-slate-500">• Waybill: {inv.waybill}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Billing Date: {inv.date}</div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right font-mono">
                    <div className="font-bold text-slate-900 text-sm">₹{inv.amount}</div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>

                  {inv.status === 'UNPAID' && (
                    <button
                      onClick={() => markPaid(inv.id)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 shadow-xs"
                    >
                      Pay Invoice
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
