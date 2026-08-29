'use client';

import React, { useState } from 'react';
import { useCargoFlow } from '@/components/context/cargoflow-context';
import { CourierCompany, CompanyStatus } from '@/lib/types';
import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  ShieldCheck,
  FileText,
  MapPin,
  Mail,
  Phone,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export function AdminPartnersView() {
  const { courierCompanies, approveCompany, rejectCompany } = useCargoFlow();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | CompanyStatus>('ALL');
  
  const [selectedCompany, setSelectedCompany] = useState<CourierCompany | null>(null);
  const [rejectReasonModal, setRejectReasonModal] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loadingCompanyId, setLoadingCompanyId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const filteredCompanies = courierCompanies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (company.legalName && company.legalName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (company.city && company.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      company.contactEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || company.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = courierCompanies.filter((c) => c.status === 'PENDING').length;
  const activeCount = courierCompanies.filter((c) => c.status === 'ACTIVE').length;
  const rejectedCount = courierCompanies.filter((c) => c.status === 'REJECTED').length;

  const handleApprove = async (companyId: string, companyName: string) => {
    setLoadingCompanyId(companyId);
    try {
      await approveCompany(companyId);
      setFeedbackMessage({ text: `${companyName} has been approved and activated!`, type: 'success' });
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err: any) {
      setFeedbackMessage({ text: err.message || 'Failed to approve company.', type: 'error' });
      setTimeout(() => setFeedbackMessage(null), 4000);
    } finally {
      setLoadingCompanyId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectReasonModal) return;
    const targetId = rejectReasonModal;
    setLoadingCompanyId(targetId);
    try {
      await rejectCompany(targetId, rejectionReason.trim() || 'Application declined by administrator review.');
      setFeedbackMessage({ text: `Company application declined.`, type: 'success' });
      setTimeout(() => setFeedbackMessage(null), 4000);
      setRejectReasonModal(null);
      setRejectionReason('');
    } catch (err: any) {
      setFeedbackMessage({ text: err.message || 'Failed to decline company.', type: 'error' });
      setTimeout(() => setFeedbackMessage(null), 4000);
    } finally {
      setLoadingCompanyId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-900 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-lime-600" />
            <span>MSRTC SUPER ADMIN PANEL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
            Partner Applications & Verification
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1">
            Review, approve, or decline courier partner registrations to access luggage hold cargo capacity.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold text-amber-700 uppercase">Pending Review</div>
              <div className="text-lg font-black text-amber-950">{pendingCount}</div>
            </div>
          </div>

          <div className="px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold text-emerald-700 uppercase">Active Partners</div>
              <div className="text-lg font-black text-emerald-950">{activeCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-md animate-in fade-in slide-in-from-top-2 ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-xs opacity-60 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-zinc-200/90 shadow-2xs">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company, legal name, city, email..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl w-full sm:w-auto">
          {(['ALL', 'PENDING', 'ACTIVE', 'REJECTED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === status
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              {status === 'ALL' ? 'All Partners' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Companies List */}
      <div className="space-y-4">
        {filteredCompanies.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-zinc-200 space-y-3">
            <Building2 className="w-8 h-8 text-zinc-300 mx-auto" />
            <div className="text-sm font-bold text-zinc-700">No partner companies found</div>
            <p className="text-xs text-zinc-400">Try adjusting your search query or status filter.</p>
          </div>
        ) : (
          filteredCompanies.map((company) => {
            const isPending = company.status === 'PENDING';
            const isActive = company.status === 'ACTIVE';
            const isRejected = company.status === 'REJECTED';
            const isRowLoading = loadingCompanyId === company.id;

            return (
              <div
                key={company.id}
                className={`p-6 rounded-3xl border transition-all ${
                  isPending
                    ? 'bg-white border-amber-200 shadow-md hover:border-amber-300'
                    : isRejected
                    ? 'bg-zinc-50/70 border-zinc-200 opacity-80'
                    : 'bg-white border-zinc-200 shadow-xs hover:border-zinc-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  
                  {/* Left Company Details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="p-2.5 rounded-2xl bg-zinc-100 text-zinc-900">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-black uppercase text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">
                            {company.code}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                              isPending
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : isActive
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : 'bg-rose-100 text-rose-900 border border-rose-300'
                            }`}
                          >
                            ● {company.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-1">
                      <h3 className="text-base sm:text-lg font-black text-zinc-950">
                        {company.legalName || company.name}
                      </h3>
                      <p className="text-xs font-medium text-zinc-500">
                        Trading as: <span className="font-semibold text-zinc-800">{company.name}</span>
                      </p>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-zinc-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span>
                          {company.city || 'Nashik'}, {company.state || 'Maharashtra'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="truncate">{company.contactEmail}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span>{company.contactPhone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-end gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-zinc-100">
                    {isPending ? (
                      <div className="flex items-center gap-2.5 w-full lg:w-auto">
                        <button
                          onClick={() => setRejectReasonModal(company.id)}
                          disabled={isRowLoading}
                          className="flex-1 lg:flex-none px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-rose-50 text-rose-700 font-bold text-xs border border-zinc-200 hover:border-rose-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>

                        <button
                          onClick={() => handleApprove(company.id, company.name)}
                          disabled={isRowLoading}
                          className="flex-1 lg:flex-none px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-lime-400 hover:text-zinc-950 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          {isRowLoading ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              <span>Approving...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-lime-400 group-hover:text-zinc-950" />
                              <span>Approve Company</span>
                            </>
                          )}
                        </button>
                      </div>
                    ) : isActive ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approved & Active</span>
                        </span>
                        <button
                          onClick={() => setRejectReasonModal(company.id)}
                          disabled={isRowLoading}
                          className="text-xs text-zinc-500 hover:text-rose-600 underline font-medium px-2 py-1 cursor-pointer"
                        >
                          Revoke Access
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApprove(company.id, company.name)}
                        disabled={isRowLoading}
                        className="px-4 py-2 rounded-xl bg-zinc-900 text-white font-bold text-xs hover:bg-lime-400 hover:text-zinc-950 transition-colors cursor-pointer"
                      >
                        {isRowLoading ? 'Re-Approving...' : 'Re-Approve Company'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reject Reason Modal */}
      {rejectReasonModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-zinc-200 space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="space-y-2">
              <h3 className="text-xl font-black text-zinc-950 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600" />
                <span>Decline Partner Application</span>
              </h3>
              <p className="text-xs text-zinc-600">
                Provide an administrative note explaining why this company registration was declined.
              </p>
            </div>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Incomplete GSTIN registration or address verification required."
              className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectReasonModal(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={loadingCompanyId !== null}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                {loadingCompanyId ? 'Declining...' : 'Confirm Decline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
