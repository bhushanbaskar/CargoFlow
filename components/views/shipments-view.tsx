'use client';

import React, { useState, useMemo } from 'react';
import { useCargoFlow } from '@/components/context/cargoflow-context';
import { Shipment, ShipmentStatus } from '@/lib/types';
import {
  Package,
  Search,
  Filter,
  QrCode,
  CheckCircle2,
  Clock,
  ArrowRight,
  Truck,
  Building2,
  MapPin,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  X,
  Camera,
  Globe,
  Upload,
  AlertTriangle,
  Edit3,
  Check,
  HardDrive,
  RefreshCw,
  PlusCircle,
  FileText,
  Send,
} from 'lucide-react';
import {
  DEMO_ACTIVE_TASK_ID,
  DEMO_CACHED_TASK_ID,
  DEMO_UNCACHED_TASK_IDS,
} from '@/lib/mock-data';
import { GracefulUnavailableCard } from './graceful-unavailable-card';

export function ShipmentsView({ isMasterLedger = false }: { isMasterLedger?: boolean }) {
  const {
    shipments,
    currentRole,
    currentProfile,
    stops,
    trips,
    buses,
    selectedShipmentId,
    setSelectedShipmentId,
    backendStatus,
    pendingQueue,
    updateShipmentStatus,
    lastSyncTimestamp,
    hiddenServerOnlyCount,
    allMasterShipments,
    evidenceRecords,
    disputes,
    uploadEvidenceFile,
    addEvidenceRecord,
    raiseDispute,
    resolveDispute,
    submitSystemCorrection,
    confirmHandover
  } = useCargoFlow();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Evidence states
  const [isUploading, setIsUploading] = useState(false);
  const [remarksInput, setRemarksInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeTargetEvidenceId, setDisputeTargetEvidenceId] = useState<string | null>(null);
  
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionRemarks, setCorrectionRemarks] = useState('');
  const [correctionTargetEvidenceId, setCorrectionTargetEvidenceId] = useState<string | null>(null);
  
  const [adminResolutionRemarks, setAdminResolutionRemarks] = useState('');

  const [newNoteText, setNewNoteText] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [forcedRetryId, setForcedRetryId] = useState<string | null>(null);

  const isOffline = backendStatus === 'SIMULATED_OFFLINE';

  const stopsMap = useMemo(() => new Map(stops.map((s) => [s.id, s])), [stops]);
  const tripsMap = useMemo(() => new Map(trips.map((t) => [t.id, t])), [trips]);
  const busesMap = useMemo(() => new Map(buses.map((b) => [b.id, b])), [buses]);

  // Filter shipments based on role (Courier Partner sees company shipments, Admin sees all)
  const roleFilteredShipments = useMemo(() => {
    if (currentRole === 'COURIER_PARTNER' && currentProfile.companyId && !isMasterLedger) {
      return shipments.filter((s) => s.courierCompanyId === currentProfile.companyId);
    }
    return shipments;
  }, [shipments, currentRole, currentProfile, isMasterLedger]);

  const displayedShipments = useMemo(() => {
    return roleFilteredShipments.filter((s) => {
      const matchSearch =
        !searchTerm ||
        s.waybillNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.courierCompanyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.receiverName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [roleFilteredShipments, searchTerm, statusFilter]);

  const activeShipment = useMemo(
    () => (allMasterShipments || shipments).find((s) => s.id === selectedShipmentId) || displayedShipments[0] || null,
    [allMasterShipments, shipments, selectedShipmentId, displayedShipments]
  );

  const activeTrip = activeShipment ? tripsMap.get(activeShipment.tripId) : null;
  const activeBus = activeTrip ? busesMap.get(activeTrip.busId) : null;

  const activeEvidence = useMemo(() => {
    if (!activeShipment) return [];
    return evidenceRecords.filter(r => r.shipmentId === activeShipment.id);
  }, [evidenceRecords, activeShipment]);

  const activeDispute = useMemo(() => {
    if (!activeShipment) return null;
    return disputes.find(d => d.shipmentId === activeShipment.id && d.status === 'PENDING');
  }, [disputes, activeShipment]);

  // Check if active shipment is backend-only / uncached during blackout
  const isSelectedBackendOnly = useMemo(() => {
    if (!isOffline || !activeShipment) return false;
    return DEMO_UNCACHED_TASK_IDS.includes(activeShipment.id);
  }, [isOffline, activeShipment]);

  // Check if active shipment is cached (e.g. Shipment #470)
  const isSelectedCached = useMemo(() => {
    if (!isOffline || !activeShipment) return false;
    return activeShipment.id === DEMO_CACHED_TASK_ID;
  }, [isOffline, activeShipment]);

  // Pending changes count for active shipment
  const activeShipmentPendingOps = useMemo(() => {
    if (!activeShipment) return [];
    return pendingQueue.filter((q) => q.entity_id === activeShipment.id && q.status === 'PENDING');
  }, [activeShipment, pendingQueue]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShipment || !newNoteText.trim()) return;

    await updateShipmentStatus(
      activeShipment.id,
      activeShipment.status,
      `Operator note: ${newNoteText.trim()}`
    );
    setNewNoteText('');
    setIsAddingNote(false);
  };

  const getStatusBadge = (status: ShipmentStatus, shipmentId: string) => {
    const isProtected = isOffline && (shipmentId === DEMO_ACTIVE_TASK_ID || (shipmentId.startsWith('shp-') && !DEMO_UNCACHED_TASK_IDS.includes(shipmentId)));
    const isCachedOld = isOffline && shipmentId === DEMO_CACHED_TASK_ID;
    switch (status) {
      case 'RESERVED':
        return { label: 'RESERVED', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'LOADED':
        return { label: 'LOADED IN HOLD', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'IN_TRANSIT':
        return { label: 'EN-ROUTE', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'DELIVERED':
        return { label: 'DELIVERED', color: 'bg-slate-100 text-slate-700 border-slate-300' };
      default:
        return { label: status, color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 font-sans">
      
      {/* View Title & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {isMasterLedger ? 'Network Master Shipments Ledger' : 'My Active Waybills'}
            </h1>
            {isOffline && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono font-bold text-xs border border-amber-300">
                CONTINUITY FILTER
              </span>
            )}
          </div>
          <p className="text-slate-500 text-xs mt-1">
            Real-time tracking, conductor loading events, and QR verification logs across MSRTC routes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search waybill # or receiver..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
            {['ALL', 'RESERVED', 'LOADED', 'IN_TRANSIT', 'DELIVERED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {st === 'ALL' ? 'All' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Shipment Cards List */}
        <div className="lg:col-span-7 space-y-3">
          {isOffline && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-amber-600" />
                  <span>Continuity Read Policy Active</span>
                </span>
                <span className="font-mono text-[11px] bg-amber-200/70 px-2 py-0.5 rounded font-bold">
                  {hiddenServerOnlyCount} server records offline
                </span>
              </div>
              <p className="text-amber-800 text-[11px]">
                Showing <strong>{displayedShipments.length}</strong> locally available waybill(s) (active protected task & cached snapshot). Historical server records are withheld while the datastore is offline.
              </p>
              <div className="pt-1 flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-amber-700 font-bold uppercase">Direct Access Test:</span>
                <button
                  onClick={() => setSelectedShipmentId('shp-471')}
                  className="px-2 py-0.5 rounded bg-amber-200 hover:bg-amber-300 text-amber-950 font-mono text-[10px] font-bold transition-colors cursor-pointer"
                >
                  Test Uncached Record #471
                </button>
                <button
                  onClick={() => setSelectedShipmentId('shp-470')}
                  className="px-2 py-0.5 rounded bg-zinc-200 hover:bg-zinc-300 text-zinc-950 font-mono text-[10px] font-bold transition-colors cursor-pointer"
                >
                  Test Cached Record #470
                </button>
                <button
                  onClick={() => setSelectedShipmentId(DEMO_ACTIVE_TASK_ID)}
                  className="px-2 py-0.5 rounded bg-blue-200 hover:bg-blue-300 text-blue-950 font-mono text-[10px] font-bold transition-colors cursor-pointer"
                >
                  Active Task #482
                </button>
              </div>
            </div>
          )}

          {displayedShipments.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-900 text-base">No Waybills Found</h3>
              <p className="text-slate-500 text-xs">No shipments match your current search or status filter.</p>
            </div>
          ) : (
            displayedShipments.map((shp) => {
              const origin = stopsMap.get(shp.originStopId);
              const dest = stopsMap.get(shp.destinationStopId);
              const badge = getStatusBadge(shp.status, shp.id);
              const isSelected = selectedShipmentId === shp.id;
              const isProtectedLocal = isOffline && (shp.id === DEMO_ACTIVE_TASK_ID || (shp.id.startsWith('shp-') && !DEMO_UNCACHED_TASK_IDS.includes(shp.id)));
              const isCachedItem = isOffline && shp.id === DEMO_CACHED_TASK_ID;
              const isUncachedBackendOnly = isOffline && DEMO_UNCACHED_TASK_IDS.includes(shp.id);

              return (
                <div
                  key={shp.id}
                  onClick={() => setSelectedShipmentId(shp.id)}
                  className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-xs ${
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md bg-blue-50/10'
                      : 'border-slate-200/90 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          {shp.waybillNumber}
                        </span>

                        {isProtectedLocal && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 font-mono">
                            <HardDrive className="w-3 h-3 text-amber-600" />
                            <span>Protected locally</span>
                          </span>
                        )}

                        {isCachedItem && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-300 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-zinc-500" />
                            <span>Last known (10:18 AM)</span>
                          </span>
                        )}

                        {isUncachedBackendOnly && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 font-mono">
                            <AlertTriangle className="w-3 h-3 text-rose-500" />
                            <span>Backend datastore only</span>
                          </span>
                        )}

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-slate-800 flex items-center gap-2 pt-1">
                        <span>{origin?.name || shp.originStopId}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span>{dest?.name || shp.destinationStopId}</span>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-sm font-bold text-slate-900">₹{shp.fareAmount}</div>
                      <div className="text-[11px] text-slate-500">{shp.weightKg} kg</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {shp.courierCompanyName}
                    </span>
                    <span className="text-blue-600 font-semibold flex items-center gap-0.5">
                      Timeline details <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed Active Waybill Drawer / Graceful Card */}
        <div className="lg:col-span-5">
          {activeShipment ? (
            isSelectedBackendOnly ? (
              /* Section 6 & 17: Graceful state for uncached backend-only records */
              <div className="sticky top-24">
                <GracefulUnavailableCard
                  waybillNumber={activeShipment.waybillNumber}
                  onRetry={() => setForcedRetryId(activeShipment.id)}
                />
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6 sticky top-24 font-sans">
                
                {/* Top Header */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Waybill Document
                    </div>
                    <div className="font-mono text-lg font-extrabold text-slate-900 flex items-center gap-2">
                      <span>{activeShipment.waybillNumber}</span>
                    </div>
                    <div className="text-xs text-slate-500">{activeShipment.courierCompanyName}</div>

                    {/* Local Protection Notice (Section 12) */}
                    {isOffline && (
                      <div className="pt-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 text-[11px] font-bold">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          <span>🟠 Protected locally</span>
                          <span className="text-amber-700 font-mono font-normal">
                            · Last synced: {lastSyncTimestamp || '10:31 AM'}
                          </span>
                        </span>
                        {activeShipmentPendingOps.length > 0 && (
                          <div className="text-[11px] text-amber-800 font-mono font-semibold mt-1">
                            Pending local changes: <strong>{activeShipmentPendingOps.length}</strong>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Cached Last Known State Banner (Section 7) */}
                    {isSelectedCached && (
                      <div className="pt-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-800 border border-zinc-300 text-[11px] font-bold">
                          <Clock className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Last known information (10:18 AM)</span>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="w-16 h-16 bg-slate-50 p-1.5 rounded-xl border border-slate-200 flex flex-col items-center justify-center relative group shrink-0">
                    <QrCode className="w-10 h-10 text-slate-900" />
                  </div>
                </div>

                {/* Operations Actions during Blackout (Section 5 & 12) */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Task Operations</span>
                    {isOffline && (
                      <span className="text-[10px] text-amber-700 font-mono font-semibold">
                        Saves Locally
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {activeShipment.status === 'RESERVED' && (
                      <button
                        onClick={() =>
                          updateShipmentStatus(activeShipment.id, 'LOADED', 'Cargo loaded into bus hold')
                        }
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Mark Picked Up / Loaded
                      </button>
                    )}

                    {activeShipment.status === 'LOADED' && (
                      <button
                        onClick={() =>
                          updateShipmentStatus(activeShipment.id, 'IN_TRANSIT', 'Bus departed on highway route')
                        }
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Depart (In Transit)
                      </button>
                    )}

                    {activeShipment.status === 'IN_TRANSIT' && (
                      <button
                        onClick={() =>
                          updateShipmentStatus(activeShipment.id, 'DELIVERED', 'Handed over to consignee at depot')
                        }
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Mark Delivered
                      </button>
                    )}

                    <button
                      onClick={() => setIsAddingNote(!isAddingNote)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold shadow-2xs flex items-center gap-1 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-slate-500" />
                      <span>Add Note / Hazard</span>
                    </button>
                  </div>

                  {isAddingNote && (
                    <form onSubmit={handleAddNote} className="space-y-2 pt-2 border-t border-slate-200">
                      <input
                        type="text"
                        placeholder="e.g. Verified seals at Sangamner checkpoint"
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingNote(false)}
                          className="px-2.5 py-1 rounded-lg text-slate-500 hover:bg-slate-200 text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Save Note</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Status Timeline (Section 13) */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    Audit Trail & Continuity Timeline
                  </h3>

                  <div className="space-y-3 pl-2 border-l-2 border-slate-100">
                    {activeShipment.statusHistory.map((item, idx) => {
                      const isLocalItem = item.remarks.includes('Protected locally') || item.remarks.includes('locally on device');

                      return (
                        <div key={idx} className="relative pl-4 space-y-0.5 pb-2">
                          <div
                            className={`w-2.5 h-2.5 rounded-full absolute -left-[5px] top-1 ring-4 ring-white ${
                              isLocalItem ? 'bg-amber-500' : 'bg-blue-600'
                            }`}
                          />
                          <div className="flex items-center justify-between text-xs">
                            <strong className="text-slate-900 font-bold flex items-center gap-1.5">
                              <span>{item.status}</span>
                              {isLocalItem && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 text-[9px] font-mono font-bold">
                                  LOCAL
                                </span>
                              )}
                            </strong>
                            <span suppressHydrationWarning className="text-[10px] font-mono text-slate-400">
                              {new Date(item.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600">{item.location}</div>
                          <div className="text-[11px] text-slate-400 italic">{item.remarks}</div>
                          
                          {/* GPS Location Telemetry Map Link */}
                          {item.latitude && item.longitude && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold flex items-center gap-1 font-mono">
                                <MapPin className="w-2.5 h-2.5 text-amber-600" />
                                {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
                              </span>
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-blue-600 hover:text-blue-500 font-bold flex items-center gap-0.5 transition-colors"
                              >
                                View Pin &rarr;
                              </a>
                            </div>
                          )}

                          {/* Scan Verification Photo Proof */}
                          {item.photoUrl && (
                            <div className="mt-1.5 flex items-start gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200/60 max-w-sm">
                              <div
                                onClick={() => setSelectedPhoto(item.photoUrl || null)}
                                className="w-14 h-14 rounded-lg overflow-hidden border border-slate-200 cursor-zoom-in hover:opacity-90 hover:border-blue-400 transition-all shadow-3xs relative shrink-0"
                              >
                                <img
                                  src={item.photoUrl}
                                  alt="Scan Verification"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="self-center">
                                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Verification Photo</span>
                                <span className="text-[9px] text-slate-500 block leading-tight font-medium">Captured at waypoint stop. Click to zoom.</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Evidence-Based Verification Trail
                  </h3>
                  
                  {/* Courier Partner Upload button */}
                  {currentRole === 'COURIER_PARTNER' && activeShipment.status !== 'CANCELLED' && (
                    <button
                      onClick={() => {
                        setRemarksInput('');
                        setShowUploadModal(true);
                      }}
                      className="px-2 py-1 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 font-bold text-[10px] flex items-center gap-1 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Add Proof
                    </button>
                  )}
                </div>

                {activeEvidence.length === 0 ? (
                  <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-200 border-dashed text-slate-400 text-xs font-medium">
                    No evidence records submitted yet.
                  </div>
                ) : (
                  <div className="space-y-3.5 pl-2 border-l-2 border-slate-100">
                    {activeEvidence.map((ev) => {
                      const statusColor = 
                        ev.verificationStatus === 'Verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        ev.verificationStatus === 'Disputed' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        ev.verificationStatus === 'Corrected' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        ev.verificationStatus === 'Rejected' ? 'bg-slate-50 text-slate-500 border-slate-200' :
                        'bg-blue-50 text-blue-700 border-blue-200';

                      return (
                        <div key={ev.id} className="relative pl-4 space-y-1 pb-1">
                          {/* Dot indicator */}
                          <div className={`w-2.5 h-2.5 rounded-full absolute -left-[6px] top-1.5 ring-4 ring-white ${
                            ev.verificationStatus === 'Verified' ? 'bg-emerald-500' :
                            ev.verificationStatus === 'Disputed' ? 'bg-rose-500' :
                            ev.verificationStatus === 'Corrected' ? 'bg-amber-500' :
                            ev.verificationStatus === 'Rejected' ? 'bg-slate-400' :
                            'bg-blue-500'
                          }`} />
                          
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-extrabold text-slate-800">
                              {ev.uploaderName} <span className="font-semibold text-slate-400 text-[10px]">({ev.uploaderRole})</span>
                            </span>
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border ${statusColor}`}>
                              {ev.verificationStatus.toUpperCase()}
                            </span>
                          </div>

                          <div className="text-[10px] text-slate-400 font-mono">
                            {new Date(ev.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </div>

                          <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 font-medium">
                            {ev.remarks}
                          </div>

                          {/* Image preview */}
                          {ev.fileUrl && (
                            <div className="flex gap-2 items-center mt-1.5">
                              <div
                                onClick={() => setSelectedPhoto(ev.fileUrl || null)}
                                className="w-14 h-14 rounded-lg overflow-hidden border border-slate-200 cursor-zoom-in hover:opacity-90 transition-opacity shrink-0 shadow-3xs"
                              >
                                <img src={ev.fileUrl} className="w-full h-full object-cover" alt="evidence" />
                              </div>
                              <span className="text-[9px] text-slate-400 font-medium">Click to zoom verification document</span>
                            </div>
                          )}

                          {/* GPS data */}
                          {ev.latitude && ev.longitude && (
                            <div className="flex items-center gap-1 mt-1 text-[10px] font-mono text-slate-500">
                              <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                              <span>{ev.latitude.toFixed(5)}, {ev.longitude.toFixed(5)} ({ev.locationName})</span>
                            </div>
                          )}

                          {/* Issue system correction button (Super Admin only) */}
                          {currentRole === 'SUPER_ADMIN' && ev.verificationStatus !== 'Corrected' && (
                            <button
                              onClick={() => {
                                setCorrectionTargetEvidenceId(ev.id);
                                setCorrectionRemarks('');
                                setShowCorrectionModal(true);
                              }}
                              className="absolute top-1 right-1 text-slate-400 hover:text-amber-600 p-1 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
                              title="Issue system correction"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Actions: Courier can dispute or confirm conductor pending load/unload proof */}
                          {currentRole === 'COURIER_PARTNER' && 
                           ev.uploaderRole === 'CONDUCTOR' && 
                           ev.verificationStatus === 'Pending' && (
                            <div className="flex items-center gap-2 pt-1.5">
                              <button
                                onClick={() => {
                                  setDisputeTargetEvidenceId(ev.id);
                                  setDisputeReason('');
                                  setShowDisputeModal(true);
                                }}
                                className="px-2.5 py-1 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 text-[10px] font-extrabold border border-rose-200 transition-all flex items-center gap-0.5 cursor-pointer"
                              >
                                <AlertTriangle className="w-3 h-3" /> Dispute
                              </button>
                              <button
                                onClick={() => {
                                  confirmHandover(activeShipment.id, ev.fileUrl, "Confirmed Conductor physical upload details");
                                }}
                                className="px-2.5 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-500 text-[10px] font-extrabold shadow-sm transition-all flex items-center gap-0.5 cursor-pointer"
                              >
                                <Check className="w-3 h-3" /> Confirm & Handover
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Courier Final Handover Confirmation Button */}
              {currentRole === 'COURIER_PARTNER' && 
               activeShipment.status === 'DELIVERED' && 
               !activeEvidence.some(e => e.remarks.includes('Handover')) && (
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setRemarksInput("Final shipment delivery acknowledged, seal verified intact, customer signed receipt.");
                      setShowUploadModal(true);
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Confirm Final Handover Proof
                  </button>
                </div>
              )}

              {/* Government/Admin Dispute Resolution Panel */}
              {currentRole === 'SUPER_ADMIN' && activeDispute && (
                <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-200 space-y-3 mt-4">
                  <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Government Dispute Resolution Panel
                  </h4>
                  <div className="text-[11px] text-slate-700 bg-white p-3 rounded-xl border border-rose-100 space-y-2">
                    <div>
                      <strong className="text-rose-900 block font-bold">DISPUTE REASON:</strong>
                      {activeDispute.reason}
                    </div>
                    {activeDispute.counterEvidenceUrl && (
                      <div>
                        <strong className="text-slate-500 block font-bold">COUNTER EVIDENCE:</strong>
                        <div 
                          onClick={() => setSelectedPhoto(activeDispute.counterEvidenceUrl || null)}
                          className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 cursor-zoom-in mt-1 shrink-0"
                        >
                          <img src={activeDispute.counterEvidenceUrl} className="w-full h-full object-cover" alt="counter-evidence" />
                        </div>
                      </div>
                    )}
                    <div className="text-[10px] text-slate-400 font-mono">
                      Raised by: {activeDispute.raiserName} ({activeDispute.raisedRole}) on {new Date(activeDispute.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Resolution Remarks</label>
                    <input
                      type="text"
                      placeholder="e.g. Approved Courier claims. Conductor error."
                      value={adminResolutionRemarks}
                      onChange={e => setAdminResolutionRemarks(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-600 font-semibold"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        resolveDispute(activeDispute.id, adminResolutionRemarks || "Approved BlueDart courier manifest details.", 'APPROVE_COURIER');
                        setAdminResolutionRemarks('');
                      }}
                      className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold shadow-sm transition-all cursor-pointer"
                    >
                      Resolve: Favor Courier
                    </button>
                    <button
                      onClick={() => {
                        resolveDispute(activeDispute.id, adminResolutionRemarks || "Approved Conductor weight discrepancy report.", 'APPROVE_CONDUCTOR');
                        setAdminResolutionRemarks('');
                      }}
                      className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold shadow-sm transition-all cursor-pointer"
                    >
                      Resolve: Favor Conductor
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setCorrectionTargetEvidenceId(activeDispute.evidenceId);
                      setCorrectionRemarks('');
                      setShowCorrectionModal(true);
                    }}
                    className="w-full py-1.5 border border-amber-300 bg-amber-50/50 hover:bg-amber-50 text-amber-800 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" /> Issue System Correction
                  </button>
                </div>
              )}

              {/* Transport Vehicle Info */}
              {activeTrip && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-blue-600" />
                      Assigned MSRTC Bus
                    </span>
                    <span className="font-mono text-blue-700 bg-blue-100 px-2 py-0.5 rounded font-bold">
                      {activeBus?.registration || 'MH-15-BD-1021'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Trip Schedule:</span>
                    <strong className="text-slate-800">
                      {activeTrip.id} ({activeTrip.departureTime} → {activeTrip.arrivalTime})
                    </strong>
                  </div>
                </div>
              )}

              {/* Sender & Receiver Info */}
              <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100">
                <div className="space-y-1 bg-slate-50 p-3 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Sender</div>
                  <div className="font-bold text-slate-900">{activeShipment.senderName}</div>
                  <div className="text-slate-500 text-[11px]">{activeShipment.senderPhone}</div>
                </div>

                <div className="space-y-1 bg-slate-50 p-3 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Consignee</div>
                  <div className="font-bold text-slate-900">{activeShipment.receiverName}</div>
                  <div className="text-slate-500 text-[11px]">{activeShipment.receiverPhone}</div>
                </div>
              </div>
            </div>
          )) : (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-slate-400 text-xs">
              Select a waybill on the left to inspect detailed tracking timeline.
            </div>
          )}
        </div>
      </div>

      {/* Zoom Photo Modal Overlay */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-zoom-out" 
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="relative max-w-3xl max-h-[85vh] w-full overflow-hidden bg-transparent rounded-3xl flex items-center justify-center" 
            onClick={e => e.stopPropagation()}
          >
            <img 
              src={selectedPhoto} 
              alt="Scan Verification Proof Zoomed" 
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-slate-700/50"
            />
            <button 
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-950 text-white rounded-full p-2 border border-slate-750 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Upload Evidence Modal Overlay */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 border border-slate-100 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 font-sans">
                <Upload className="w-4 h-4 text-blue-600" />
                Submit Verification Evidence
              </h3>
              <button 
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setRemarksInput('');
                }}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* File Input */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono">1. Upload File (Manifest Document or Photo)</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-600 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              {/* Remarks */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono">2. Description / Remarks</label>
                <textarea
                  placeholder="e.g. Weighing receipt scanned. Weight: 15.2 kg. Verified by warehouse lead."
                  value={remarksInput}
                  onChange={e => setRemarksInput(e.target.value)}
                  className="w-full min-h-[80px] bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-850 outline-none focus:border-blue-600 resize-none font-semibold"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setRemarksInput('');
                }}
                className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedFile || isUploading}
                onClick={async () => {
                  if (!selectedFile) return;
                  setIsUploading(true);
                  try {
                    const fileUrl = await uploadEvidenceFile(selectedFile);
                    
                    if (activeShipment.status === 'DELIVERED') {
                      await confirmHandover(activeShipment.id, fileUrl, remarksInput || "Final handover proof uploaded by Courier Partner.");
                    } else {
                      await addEvidenceRecord(
                        activeShipment.id,
                        fileUrl,
                        remarksInput || "Courier manifest evidence details.",
                        "Origin Warehouse Depot",
                        'Pending'
                      );
                    }
                    setShowUploadModal(false);
                    setSelectedFile(null);
                    setRemarksInput('');
                  } catch (err) {
                    console.error("Upload error:", err);
                  } finally {
                    setIsUploading(false);
                  }
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold text-white shadow-sm flex items-center justify-center gap-1.5 transition-all ${
                  selectedFile && !isUploading
                    ? 'bg-blue-600 hover:bg-blue-500 cursor-pointer'
                    : 'bg-slate-300 cursor-not-allowed text-slate-500 shadow-none'
                }`}
              >
                {isUploading ? "Uploading..." : "Submit Proof"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal Overlay */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 border border-slate-100 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 font-sans">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Raise Verification Dispute
              </h3>
              <button 
                onClick={() => {
                  setShowDisputeModal(false);
                  setSelectedFile(null);
                  setDisputeReason('');
                  setDisputeTargetEvidenceId(null);
                }}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Reason */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono">1. Reason for Dispute</label>
                <textarea
                  placeholder="e.g. Weight is mismatch. Conductor weighs box at 38kg, but scale calibration certificate shows waybill weight is correct."
                  value={disputeReason}
                  onChange={e => setDisputeReason(e.target.value)}
                  className="w-full min-h-[80px] bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-850 outline-none focus:border-rose-600 resize-none font-semibold"
                />
              </div>

              {/* Counter-Evidence File */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono">2. Counter-Evidence Document/Photo (Optional)</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-600 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDisputeModal(false);
                  setSelectedFile(null);
                  setDisputeReason('');
                  setDisputeTargetEvidenceId(null);
                }}
                className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!disputeReason || isUploading}
                onClick={async () => {
                  if (!disputeReason || !disputeTargetEvidenceId) return;
                  setIsUploading(true);
                  try {
                    let counterUrl = undefined;
                    if (selectedFile) {
                      counterUrl = await uploadEvidenceFile(selectedFile);
                    }
                    await raiseDispute(
                      activeShipment.id,
                      disputeTargetEvidenceId,
                      disputeReason,
                      counterUrl
                    );
                    setShowDisputeModal(false);
                    setSelectedFile(null);
                    setDisputeReason('');
                    setDisputeTargetEvidenceId(null);
                  } catch (err) {
                    console.error("Dispute error:", err);
                  } finally {
                    setIsUploading(false);
                  }
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold text-white shadow-sm flex items-center justify-center gap-1.5 transition-all ${
                  disputeReason && !isUploading
                    ? 'bg-rose-600 hover:bg-rose-500 cursor-pointer'
                    : 'bg-slate-300 cursor-not-allowed text-slate-500 shadow-none'
                }`}
              >
                {isUploading ? "Submitting..." : "Raise Dispute"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* System Correction Modal Overlay */}
      {showCorrectionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 border border-slate-100 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 font-sans">
                <Edit3 className="w-4 h-4 text-amber-600" />
                Issue System Correction
              </h3>
              <button 
                onClick={() => {
                  setShowCorrectionModal(false);
                  setSelectedFile(null);
                  setCorrectionRemarks('');
                  setCorrectionTargetEvidenceId(null);
                }}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Correction Remarks */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono">1. Correction Description</label>
                <textarea
                  placeholder="Explain the correction. The original record will remain in history as required by audit policies."
                  value={correctionRemarks}
                  onChange={e => setCorrectionRemarks(e.target.value)}
                  className="w-full min-h-[80px] bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-855 outline-none focus:border-amber-600 resize-none font-semibold"
                />
              </div>

              {/* Correction Document */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono">2. Correction Document/Revised Photo (Optional)</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-600 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowCorrectionModal(false);
                  setSelectedFile(null);
                  setCorrectionRemarks('');
                  setCorrectionTargetEvidenceId(null);
                }}
                className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!correctionRemarks || isUploading}
                onClick={async () => {
                  if (!correctionRemarks || !correctionTargetEvidenceId) return;
                  setIsUploading(true);
                  try {
                    let corrUrl = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600";
                    if (selectedFile) {
                      corrUrl = await uploadEvidenceFile(selectedFile);
                    }
                    await submitSystemCorrection(
                      activeShipment.id,
                      correctionTargetEvidenceId,
                      correctionRemarks,
                      corrUrl
                    );
                    setShowCorrectionModal(false);
                    setSelectedFile(null);
                    setCorrectionRemarks('');
                    setCorrectionTargetEvidenceId(null);
                  } catch (err) {
                    console.error("Correction error:", err);
                  } finally {
                    setIsUploading(false);
                  }
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold text-white shadow-sm flex items-center justify-center gap-1.5 transition-all ${
                  correctionRemarks && !isUploading
                    ? 'bg-amber-600 hover:bg-amber-500 cursor-pointer'
                    : 'bg-slate-300 cursor-not-allowed text-slate-500 shadow-none'
                }`}
              >
                {isUploading ? "Submitting..." : "Issue Correction"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
