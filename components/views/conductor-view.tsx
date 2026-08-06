'use client';

import React, { useState, useMemo } from 'react';
import { useCargoFlow } from '@/components/context/cargoflow-context';
import {
  Smartphone,
  QrCode,
  Bus as BusIcon,
  CheckCircle2,
  Package,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Search
} from 'lucide-react';

export function ConductorView({ isScannerTab = false }: { isScannerTab?: boolean }) {
  const {
    trips,
    buses,
    routes,
    shipments,
    updateShipmentStatus,
    currentProfile
  } = useCargoFlow();

  // Conductor is assigned to Trip TRP001 (Bus MH-15-BD-1021)
  const assignedTrip = useMemo(() => {
    return trips.find(t => t.id === 'TRP001') || trips[0];
  }, [trips]);

  const assignedBus = buses.find(b => b.id === assignedTrip?.busId);
  const assignedRoute = routes.find(r => r.id === assignedTrip?.routeId);
  const assignedShipments = shipments.filter(s => s.tripId === assignedTrip?.id);

  const [scanInput, setScanInput] = useState<string>('');
  const [activeTabSub, setActiveTabSub] = useState<'LIST' | 'SCAN'>(isScannerTab ? 'SCAN' : 'LIST');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput) return;

    // Find shipment by waybill # or QR hash
    const match = shipments.find(
      s =>
        s.waybillNumber.toLowerCase() === scanInput.trim().toLowerCase() ||
        s.qrCodeHash.toLowerCase() === scanInput.trim().toLowerCase()
    );

    if (match) {
      const nextStatus = match.status === 'RESERVED' ? 'LOADED' : 'DELIVERED';
      updateShipmentStatus(match.id, nextStatus, `Scanned & processed by Conductor ${currentProfile.fullName}`);
      setSuccessMessage(`Waybill ${match.waybillNumber} updated to ${nextStatus}!`);
      setScanInput('');
      setTimeout(() => setSuccessMessage(null), 4000);
    } else {
      alert(`Waybill or QR hash '${scanInput}' not found on active trip roster.`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      {/* Conductor Badge Header */}
      <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-amber-950 text-white rounded-3xl p-6 shadow-xl border border-amber-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-semibold border border-amber-400/30 flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              Conductor Terminal Interface
            </span>
            <span className="text-xs text-amber-200/70 font-mono">Nashik CBS Depot</span>
          </div>

          <h1 className="text-2xl font-extrabold text-white font-sans">
            {assignedBus?.registration || 'MH-15-BD-1021'} Cargo Hold Roster
          </h1>
          <p className="text-slate-300 text-xs">
            Assigned Conductor: <strong>{currentProfile.fullName}</strong> • Trip ID: <strong>{assignedTrip?.id}</strong>
          </p>
        </div>

        <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-700 text-right font-mono text-xs space-y-0.5">
          <div className="text-slate-400">Available Cargo Hold</div>
          <div className="text-lg font-bold text-emerald-400">
            {assignedTrip?.availableCargoCapacityKg} kg free
          </div>
          <div className="text-[10px] text-slate-400">Total Limit: {assignedBus?.cargoCapacityKg} kg</div>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex items-center gap-2 bg-slate-200/80 p-1 rounded-2xl max-w-md mx-auto border border-slate-300">
        <button
          onClick={() => setActiveTabSub('LIST')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTabSub === 'LIST'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Assigned Parcels ({assignedShipments.length})
        </button>

        <button
          onClick={() => setActiveTabSub('SCAN')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTabSub === 'SCAN'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <QrCode className="w-4 h-4" />
          QR Scanner Verification
        </button>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          {successMessage}
        </div>
      )}

      {/* Content Section */}
      {activeTabSub === 'SCAN' ? (
        <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="text-center space-y-2 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-sm">
              <QrCode className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Waybill QR Scanner</h2>
            <p className="text-slate-500 text-xs">
              Scan parcel QR barcode or manually type the waybill number to mark cargo as <strong>LOADED</strong> into bus hold or <strong>DELIVERED</strong> at destination depot.
            </p>
          </div>

          <form onSubmit={handleScanSubmit} className="max-w-md mx-auto space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                WAYBILL NUMBER OR QR HASH
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. WB-2026-NSS-0891 or CF-QR-891"
                  value={scanInput}
                  onChange={e => setScanInput(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3 text-sm font-mono font-bold text-slate-900 focus:border-amber-600 outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
                >
                  Verify QR
                </button>
              </div>
            </div>

            <div className="pt-2 text-center">
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                Quick Scan Demo Shortcuts
              </span>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {assignedShipments.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setScanInput(s.waybillNumber)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 text-[11px] font-mono font-bold transition-colors"
                  >
                    {s.waybillNumber} ({s.status})
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="font-bold text-slate-900 text-sm flex items-center justify-between">
            <span>Parcel Hold Manifest for {assignedTrip?.id}</span>
            <span className="text-xs text-slate-500 font-normal">
              {assignedRoute?.name}
            </span>
          </h2>

          {assignedShipments.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 text-slate-500 text-xs">
              No parcels currently assigned to this bus trip.
            </div>
          ) : (
            assignedShipments.map(shp => (
              <div
                key={shp.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-900">
                        {shp.waybillNumber}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {shp.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      {shp.courierCompanyName} • Weight: <strong className="text-slate-900">{shp.weightKg} kg</strong>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900">Fare: ₹{shp.fareAmount}</div>
                    <div className="text-[10px] text-slate-400 font-mono">Val: ₹{shp.declaredValue}</div>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">RECEIVER</span>
                    <strong className="text-slate-900">{shp.receiverName}</strong> ({shp.receiverPhone})
                  </div>

                  {shp.status === 'RESERVED' && (
                    <button
                      onClick={() => updateShipmentStatus(shp.id, 'LOADED', `Loaded by Conductor ${currentProfile.fullName}`)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs"
                    >
                      Mark LOADED
                    </button>
                  )}

                  {shp.status === 'LOADED' && (
                    <button
                      onClick={() => updateShipmentStatus(shp.id, 'IN_TRANSIT', `En-route bus departure`)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs"
                    >
                      Depart (EN-ROUTE)
                    </button>
                  )}

                  {shp.status === 'IN_TRANSIT' && (
                    <button
                      onClick={() => updateShipmentStatus(shp.id, 'DELIVERED', `Handed over to consignee`)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs"
                    >
                      Mark DELIVERED
                    </button>
                  )}

                  {shp.status === 'DELIVERED' && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Delivered
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
