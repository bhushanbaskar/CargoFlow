'use client';

import React, { useState } from 'react';
import { useCargoFlow } from '@/components/context/cargoflow-context';
import { Receipt, Building2, CheckCircle2, Clock, DollarSign, CreditCard } from 'lucide-react';

export function InvoicesView() {
  const { shipments, courierCompanies, currentProfile } = useCargoFlow();

  const company = courierCompanies.find(c => c.id === currentProfile.companyId) || courierCompanies[0] || {
    id: 'c0000000-0000-0000-0000-000000000001',
    name: 'BlueDart Express',
    legalName: 'Blue Dart Express Limited',
    code: 'BLUEDART',
    creditLimit: 250000,
    usedCredit: 34500,
  };
  const companyShipments = shipments.filter(s => s.courierCompanyId === company?.id);

  const [invoices, setInvoices] = useState([
    { id: 'INV-2026-001', waybill: 'WB-2026-NSS-0891', amount: 450, date: '2026-08-01', status: 'PAID' },
    { id: 'INV-2026-002', waybill: 'WB-2026-NSM-0412', amount: 780, date: '2026-08-03', status: 'UNPAID' },
    { id: 'INV-2026-003', waybill: 'WB-2026-NSB-0734', amount: 220, date: '2026-08-04', status: 'UNPAID' }
  ]);

  const markPaid = (id: string) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'PAID' } : inv));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Invoices & Credit Billing Account
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Automated waybill billing account for <strong>{company?.name || 'Courier Partner'}</strong>.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-right font-mono text-xs">
          <div className="text-slate-400">Available Credit Balance</div>
          <div className="text-xl font-bold text-emerald-600">
            ₹{((company?.creditLimit ?? 100000) - (company?.usedCredit ?? 0)).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <Receipt className="w-5 h-5 text-blue-600" />
          Waybill Invoices Ledger
        </h2>

        <div className="space-y-3">
          {invoices.map(inv => (
            <div key={inv.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
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
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
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
    </div>
  );
}
