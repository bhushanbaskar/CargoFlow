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
  UserCheck
} from 'lucide-react';

export function ShipmentsView({ isMasterLedger = false }: { isMasterLedger?: boolean }) {
  const {
    shipments,
    currentRole,
    currentProfile,
    stops,
    trips,
    buses,
    selectedShipmentId,
    setSelectedShipmentId
  } = useCargoFlow();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const stopsMap = useMemo(() => new Map(stops.map(s => [s.id, s])), [stops]);
  const tripsMap = useMemo(() => new Map(trips.map(t => [t.id, t])), [trips]);
  const busesMap = useMemo(() => new Map(buses.map(b => [b.id, b])), [buses]);

  // Filter shipments based on role (Courier Partner sees company shipments, Admin sees all)
  const roleFilteredShipments = useMemo(() => {
    if (currentRole === 'COURIER_PARTNER' && currentProfile.companyId && !isMasterLedger) {
      return shipments.filter(s => s.courierCompanyId === currentProfile.companyId);
    }
    return shipments;
  }, [shipments, currentRole, currentProfile, isMasterLedger]);

  const displayedShipments = useMemo(() => {
    return roleFilteredShipments.filter(s => {
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
    () => shipments.find(s => s.id === selectedShipmentId) || displayedShipments[0] || null,
    [shipments, selectedShipmentId, displayedShipments]
  );

  const activeTrip = activeShipment ? tripsMap.get(activeShipment.tripId) : null;
  const activeBus = activeTrip ? busesMap.get(activeTrip.busId) : null;

  const getStatusBadge = (status: ShipmentStatus) => {
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
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      {/* View Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans">
            {isMasterLedger ? 'Network Master Shipments Ledger' : 'My Active Waybills'}
          </h1>
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
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
            {['ALL', 'RESERVED', 'LOADED', 'IN_TRANSIT', 'DELIVERED'].map(st => (
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
          {displayedShipments.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-900 text-base">No Waybills Found</h3>
              <p className="text-slate-500 text-xs">No shipments match your current search or status filter.</p>
            </div>
          ) : (
            displayedShipments.map(shp => {
              const origin = stopsMap.get(shp.originStopId);
              const dest = stopsMap.get(shp.destinationStopId);
              const badge = getStatusBadge(shp.status);
              const isSelected = selectedShipmentId === shp.id;

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
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          {shp.waybillNumber}
                        </span>
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

        {/* Right Column: Detailed Active Waybill Drawer */}
        <div className="lg:col-span-5">
          {activeShipment ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6 sticky top-24">
              
              {/* Top Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Waybill Document
                  </div>
                  <div className="font-mono text-lg font-extrabold text-slate-900">
                    {activeShipment.waybillNumber}
                  </div>
                  <div className="text-xs text-slate-500">{activeShipment.courierCompanyName}</div>
                </div>

                <div className="w-16 h-16 bg-slate-50 p-1.5 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
                  <QrCode className="w-10 h-10 text-slate-900" />
                </div>
              </div>

              {/* Status Timeline */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Audit Trail & Status Timeline
                </h3>

                <div className="space-y-3 pl-2 border-l-2 border-slate-100">
                  {activeShipment.statusHistory.map((item, idx) => (
                    <div key={idx} className="relative pl-4 space-y-0.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600 absolute -left-[5px] top-1 ring-4 ring-white" />
                      <div className="flex items-center justify-between text-xs">
                        <strong className="text-slate-900 font-bold">{item.status}</strong>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600">{item.location}</div>
                      <div className="text-[11px] text-slate-400 italic">{item.remarks}</div>
                    </div>
                  ))}
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
                    <strong className="text-slate-800">{activeTrip.id} ({activeTrip.departureTime} → {activeTrip.arrivalTime})</strong>
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
