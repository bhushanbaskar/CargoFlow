'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useCargoFlow } from '@/components/context/cargoflow-context';
import { EmailAlert } from '@/lib/types';
import {
  Inbox,
  Mail,
  MailOpen,
  MapPin,
  Calendar,
  User,
  Clock,
  ArrowRight,
  ShieldCheck,
  Globe,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export function EmailInboxView() {
  const {
    emailAlerts,
    markEmailAsRead,
    currentCompany,
    currentProfile,
    currentRole,
    evidenceNotifications,
    markNotificationAsRead
  } = useCargoFlow();

  const companyName = currentCompany?.name || currentProfile?.companyName || 'Logistics Partner';
  const companyEmail = currentCompany?.contactEmail || currentProfile?.email || 'dispatch@example.com';

  const unifiedMessages = useMemo(() => {
    const filteredEmails = emailAlerts.filter(
      alert =>
        currentRole === 'SUPER_ADMIN' ||
        alert.courierCompanyId === currentCompany?.id ||
        alert.courierCompanyName.toLowerCase() === companyName.toLowerCase()
    ).map(e => ({
      id: e.id,
      subject: e.subject,
      body: e.body,
      timestamp: e.timestamp,
      isRead: e.isRead,
      photoUrl: e.photoUrl,
      waybillNumber: e.waybillNumber,
      status: e.status,
      locationName: e.locationName,
      latitude: e.latitude,
      longitude: e.longitude,
      messageType: 'EMAIL' as const
    }));

    const filteredNotifs = evidenceNotifications.filter(
      notif =>
        currentRole === 'SUPER_ADMIN' ||
        notif.recipientRole === currentRole ||
        notif.recipientId === currentProfile.id
    ).map(n => ({
      id: n.id,
      subject: `[Verification System] ${n.type.replace('_', ' ')}`,
      body: n.message,
      timestamp: n.timestamp,
      isRead: n.isRead,
      photoUrl: undefined,
      waybillNumber: n.waybillNumber,
      status: 'VERIFICATION',
      locationName: 'MSRTC Node Hub',
      latitude: undefined,
      longitude: undefined,
      messageType: 'NOTIF' as const
    }));

    return [...filteredEmails, ...filteredNotifs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [emailAlerts, evidenceNotifications, currentRole, currentCompany, currentProfile, companyName]);

  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  const activeMessage = useMemo(() => {
    return unifiedMessages.find(m => m.id === selectedMessageId) || unifiedMessages[0] || null;
  }, [unifiedMessages, selectedMessageId]);

  useEffect(() => {
    if (activeMessage && !activeMessage.isRead) {
      if (activeMessage.messageType === 'EMAIL') {
        markEmailAsRead(activeMessage.id);
      } else {
        markNotificationAsRead(activeMessage.id);
      }
    }
  }, [activeMessage, markEmailAsRead, markNotificationAsRead]);

  useEffect(() => {
    if (unifiedMessages.length > 0 && !selectedMessageId) {
      setSelectedMessageId(unifiedMessages[0].id);
    }
  }, [unifiedMessages, selectedMessageId]);

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8 space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans flex items-center gap-2">
          <Mail className="w-6 h-6 text-blue-600" />
          MSRTC System Notifications & Mailbox
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          Automated email notifications dispatched to <span className="font-semibold text-slate-700">{companyEmail}</span> upon loading and unloading of cargo parcels.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-[70vh]">
        
        {/* Left Column: Email list */}
        <div className="lg:col-span-5 border-r border-slate-200 flex flex-col h-full bg-slate-50/50">
          <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 font-mono">
              <Inbox className="w-4 h-4 text-slate-400" />
              INBOX ({unifiedMessages.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-white">
            {unifiedMessages.length === 0 ? (
              <div className="p-8 text-center space-y-3 h-full flex flex-col items-center justify-center">
                <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">Your Mailbox is Empty</h4>
                  <p className="text-slate-400 text-xs max-w-xs">Scan events from the Conductor terminal will trigger real-time email alerts here.</p>
                </div>
              </div>
            ) : (
              unifiedMessages.map(mail => {
                const isSelected = activeMessage?.id === mail.id;
                return (
                  <div
                    key={mail.id}
                    onClick={() => setSelectedMessageId(mail.id)}
                    className={`p-4 cursor-pointer transition-all flex flex-col space-y-1 border-b border-slate-100 ${
                      isSelected
                        ? 'bg-blue-50/60 border-l-4 border-blue-600'
                        : 'hover:bg-slate-100/50 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 text-[11px] font-mono">
                        notifications@cargoflow.msrtc
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(mail.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-start gap-1.5 justify-between">
                      <span className={`text-xs truncate ${!mail.isRead ? 'font-extrabold text-slate-900' : 'text-slate-600 font-semibold'}`}>
                        {mail.subject}
                      </span>
                      {!mail.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5 animate-pulse" />
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 truncate font-semibold uppercase tracking-wider flex items-center gap-1.5 pt-0.5">
                      <span className={`px-1.5 py-0.2 rounded font-bold text-[9px] border ${
                        mail.messageType === 'NOTIF'
                          ? mail.subject.includes('RESOLVED')
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-205'
                            : 'bg-rose-50 text-rose-700 border-rose-205'
                          : mail.status === 'LOADED' 
                            ? 'bg-blue-50 text-blue-700 border-blue-200' 
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}>
                        {mail.messageType === 'NOTIF' ? 'VERIFICATION' : mail.status === 'LOADED' ? 'LOADED' : 'UNLOADED'}
                      </span>
                      <span>Waybill: {mail.waybillNumber}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Email Detail Viewer */}
        <div className="lg:col-span-7 flex flex-col h-full bg-white">
          {activeMessage ? (
            <div className="flex flex-col h-full overflow-y-auto bg-white">
              
              {/* Email Details Header */}
              <div className="p-6 border-b border-slate-100 space-y-4 bg-slate-50/20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight font-sans">
                    {activeMessage.subject}
                  </h2>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-black text-xs font-mono">
                    CF
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <strong className="text-slate-800 font-bold text-[13px]">CargoFlow Smart System Alerts</strong>
                      <span className="text-[11px] text-slate-400 font-mono">&lt;notifications@cargoflow.msrtc.gov.in&gt;</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      To: <strong className="text-slate-700">{currentRole} Inbox</strong> &lt;{currentProfile.email}&gt;
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {new Date(activeMessage.timestamp).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Email Styled Layout Body */}
              <div className="p-6 flex-1 bg-slate-50/30">
                <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
                  
                  {/* Email Styled Top Banner */}
                  <div className="bg-gradient-to-r from-amber-900 to-slate-900 text-white p-4 rounded-xl text-center space-y-0.5">
                    <h3 className="text-sm font-black tracking-wider uppercase">CargoFlow Verification Dispatch</h3>
                    <p className="text-[10px] opacity-75 font-mono">MAHARASHTRA STATE ROAD TRANSPORT CORPORATION</p>
                  </div>

                  {activeMessage.messageType === 'NOTIF' ? (
                    <div className="text-xs text-slate-700 space-y-4">
                      <p className="font-semibold text-slate-900">System Verification & Dispute Notification Details:</p>
                      <div className="bg-rose-50/20 text-rose-950 p-4 rounded-xl border border-rose-200/60 font-semibold leading-relaxed">
                        {activeMessage.body}
                      </div>
                      <div className="text-[10px] text-slate-400 leading-relaxed text-center pt-4 border-t border-slate-100">
                        This is an automated security audit trail update from the CargoFlow multi-sided verification system. 
                        All modifications are permanently recorded for dispute resolution and compliance.
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Email Greeting */}
                      <div className="text-xs text-slate-700 space-y-2">
                        <p>Dear <strong>{companyName}</strong> Dispatch Team,</p>
                        <p>We are writing to notify you that your cargo parcel under waybill <strong>{activeMessage.waybillNumber}</strong> has been scanned and updated by on-bus crew. Details are logged below.</p>
                      </div>

                      {/* Shipment details table */}
                      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
                        <table className="w-full text-xs border-collapse">
                          <tbody>
                            <tr className="border-b border-slate-200/60">
                              <td className="py-2.5 font-bold text-slate-400 uppercase tracking-wider w-[140px]">Waybill Number:</td>
                              <td className="py-2.5 font-mono font-bold text-slate-900 text-sm">{activeMessage.waybillNumber}</td>
                            </tr>
                            <tr className="border-b border-slate-200/60">
                              <td className="py-2.5 font-bold text-slate-400 uppercase tracking-wider">Status Update:</td>
                              <td className="py-2.5">
                                <span className={`px-2 py-0.5 rounded font-bold text-[10px] border ${
                                  activeMessage.status === 'LOADED' 
                                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }`}>
                                  {activeMessage.status === 'LOADED' ? 'LOADED INTO HOLD' : 'UNLOADED (DELIVERED)'}
                                </span>
                              </td>
                            </tr>
                            <tr className="border-b border-slate-200/60">
                              <td className="py-2.5 font-bold text-slate-400 uppercase tracking-wider">Present stop:</td>
                              <td className="py-2.5 font-bold text-slate-900">{activeMessage.locationName}</td>
                            </tr>
                            {activeMessage.latitude && activeMessage.longitude ? (
                              <tr>
                                <td className="py-2.5 font-bold text-slate-400 uppercase tracking-wider">GPS Coordinates:</td>
                                <td className="py-2.5 font-mono font-bold text-slate-800">
                                  {activeMessage.latitude.toFixed(6)}, {activeMessage.longitude.toFixed(6)}
                                  <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${activeMessage.latitude},${activeMessage.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 text-blue-600 hover:underline inline-flex items-center gap-0.5 text-[10px] font-bold"
                                  >
                                    View Google Maps Pin <ExternalLink className="w-3 h-3" />
                                  </a>
                                </td>
                              </tr>
                            ) : null}
                          </tbody>
                        </table>
                      </div>

                      {/* Photo proof in email body */}
                      {activeMessage.photoUrl ? (
                        <div className="space-y-2">
                          <span className="block text-[11px] font-bold text-slate-450 uppercase tracking-wider">Waypoint Verification Image</span>
                          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs max-w-md mx-auto">
                            <img
                              src={activeMessage.photoUrl}
                              alt="Scan Verification Proof"
                              className="w-full h-auto max-h-[220px] object-cover"
                            />
                          </div>
                        </div>
                      ) : null}

                      {/* Footer message */}
                      <div className="text-[10px] text-slate-400 pt-3 border-t border-slate-100 text-center font-medium leading-relaxed">
                        This is an automated dispatch update from CargoFlow on behalf of MSRTC. 
                        <br/>
                        Do not reply directly to this mail. For support or ledger queries, contact MSRTC Cargo Support division.
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="p-8 text-center space-y-2 h-full flex flex-col items-center justify-center">
              <MailOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-900 text-sm">Select an Alert</h3>
              <p className="text-slate-400 text-xs">Choose a notification on the left to read email detail update.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
