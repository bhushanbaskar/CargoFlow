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
  HardDrive,
  AlertTriangle,
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
  } = useCargoFlow();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
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
    const isProtected = isOffline && (shipmentId === DEMO_ACTIVE_TASK_ID || shipmentId.startsWith('shp-') && !DEMO_UNCACHED_TASK_IDS.includes(shipmentId));
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

                  <div className="w-16 h-16 bg-slate-50 p-1.5 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
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
                        <div key={idx} className="relative pl-4 space-y-0.5">
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
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Transport Vehicle Info */}
                {activeTrip && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-blue-600" />
                        Assigned MSRTC Bus
                      </span>
                      <span className="font-mono text-blue-700 bg-blue-100 px-2 py-0.5 rounded font-bold">
                        {activeBus?.registration}
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
            )
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-slate-400 text-xs">
              Select a waybill on the left to inspect detailed tracking timeline.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
