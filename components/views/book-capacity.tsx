'use client';

import React, { useState, useMemo } from 'react';
import { useCargoFlow } from '@/components/context/cargoflow-context';
import { findMatchingTrips } from '@/lib/matching-engine';
import { MatchOption, Shipment } from '@/lib/types';
import {
  Sparkles,
  MapPin,
  ArrowRight,
  Weight,
  Bus as BusIcon,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  QrCode,
  Calendar,
  Clock,
  Building2,
  DollarSign,
  PackageCheck
} from 'lucide-react';

export function BookCapacityView() {
  const {
    stops,
    routes,
    buses,
    trips,
    createShipment,
    currentProfile,
    courierCompanies,
    setActiveTab,
    backendStatus,
  } = useCargoFlow();

  const isOffline = backendStatus === 'SIMULATED_OFFLINE';

  const [originStopId, setOriginStopId] = useState<string>('STP001'); // Nashik CBS
  const [destinationStopId, setDestinationStopId] = useState<string>('STP030'); // Pune Shivajinagar
  const [weightKg, setWeightKg] = useState<number>(15);
  const [dimensionsCm, setDimensionsCm] = useState<string>('40 x 30 x 25');
  const [declaredValue, setDeclaredValue] = useState<number>(25000);

  // Sender & Receiver Details
  const [senderName, setSenderName] = useState<string>('Sahyadri Precision Tools');
  const [senderPhone, setSenderPhone] = useState<string>('+91 98220 11223');
  const [receiverName, setReceiverName] = useState<string>('Kirloskar Automotives Pune');
  const [receiverPhone, setReceiverPhone] = useState<string>('+91 98900 44556');

  const [selectedMatch, setSelectedMatch] = useState<MatchOption | null>(null);
  const [createdShipment, setCreatedShipment] = useState<Shipment | null>(null);
  const [isReserving, setIsReserving] = useState<boolean>(false);

  const currentCompany = useMemo(() => {
    return (
      courierCompanies.find(c => c.id === currentProfile.companyId) ||
      courierCompanies[0] ||
      {
        id: 'c0000000-0000-0000-0000-000000000001',
        name: 'BlueDart Express',
        legalName: 'Blue Dart Express Limited',
        code: 'BLUEDART',
        contactEmail: 'dispatch@bluedart.com',
        contactPhone: '+91 98230 11223',
        creditLimit: 250000,
        usedCredit: 34500,
        status: 'ACTIVE' as const,
        createdAt: '2026-08-01T10:00:00Z',
      }
    );
  }, [courierCompanies, currentProfile]);

  // Deterministic Matching Execution
  const matchingOptions = useMemo(() => {
    if (!originStopId || !destinationStopId || originStopId === destinationStopId) {
      return [];
    }

    return findMatchingTrips({
      originStopId,
      destinationStopId,
      weightKg,
      allTrips: trips,
      allBuses: buses,
      allRoutes: routes,
      allStops: stops
    });
  }, [originStopId, destinationStopId, weightKg, trips, buses, routes, stops]);

  const originStop = stops.find(s => s.id === originStopId);
  const destinationStop = stops.find(s => s.id === destinationStopId);

  const handleBookingConfirm = async () => {
    if (!selectedMatch) return;
    setIsReserving(true);

    try {
      const shipment = await createShipment({
        courierCompanyId: currentCompany.id,
        courierCompanyName: currentCompany.name,
        senderName,
        senderPhone,
        receiverName,
        receiverPhone,
        originStopId,
        destinationStopId,
        weightKg,
        dimensionsCm,
        declaredValue,
        qrCodeHash: '',
        tripId: selectedMatch.trip.id,
        fareAmount: selectedMatch.fareAmount
      });

      setCreatedShipment(shipment);
    } catch (e) {
      console.error('Booking failed:', e);
    } finally {
      setIsReserving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-zinc-900 text-white rounded-3xl p-6 lg:p-8 shadow-sm border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#d9f99d] text-slate-900 font-extrabold text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-slate-900" />
              Deterministic Bus Hold Engine
            </span>
            <span className="text-xs text-zinc-400 font-mono">Real-time MSRTC Capacity</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight font-sans text-white">
            Reserve Unused Bus Luggage Hold
          </h1>
          <p className="text-zinc-300 text-xs max-w-2xl">
            Courier partners can instantly query scheduled MSRTC passenger buses for available cargo capacity, route compatibility, and lock in waybills.
          </p>
        </div>

        <div className="bg-zinc-800/90 backdrop-blur-md p-4 rounded-2xl border border-zinc-700/80 shrink-0 space-y-1 text-right">
          <div className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">
            {currentCompany?.name || 'Partner'} Credit
          </div>
          <div className="text-xl font-mono font-bold text-lime-300">
            ₹{((currentCompany?.creditLimit ?? 100000) - (currentCompany?.usedCredit ?? 0)).toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-zinc-400">
            Limit: ₹{(currentCompany?.creditLimit ?? 100000).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form Column: Shipment Query Parameters */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
          <h2 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin className="w-5 h-5 text-blue-600" />
            1. Shipment Route & Weight Parameters
          </h2>

          {/* Route Origin & Destination */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ORIGIN BUS TERMINAL
              </label>
              <select
                value={originStopId}
                onChange={e => setOriginStopId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
              >
                {stops.map(stop => (
                  <option key={stop.id} value={stop.id}>
                    {stop.name} ({stop.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                DESTINATION BUS TERMINAL
              </label>
              <select
                value={destinationStopId}
                onChange={e => setDestinationStopId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
              >
                {stops.map(stop => (
                  <option key={stop.id} value={stop.id}>
                    {stop.name} ({stop.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Parcel Weight & Specs */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Weight className="w-3.5 h-3.5 text-slate-500" />
                PARCEL WEIGHT (KG)
              </label>
              <input
                type="number"
                min={1}
                max={80}
                value={weightKg}
                onChange={e => setWeightKg(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-slate-900 focus:border-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                DIMENSIONS (CM)
              </label>
              <input
                type="text"
                value={dimensionsCm}
                onChange={e => setDimensionsCm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 outline-none"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Sender & Consignee Details
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Sender Name</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={e => setSenderName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Receiver Name</label>
                <input
                  type="text"
                  value={receiverName}
                  onChange={e => setReceiverName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Matched Scheduled Bus Trips */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              2. Deterministic Matching Bus Results ({matchingOptions.length})
            </h2>

            <span className="text-xs font-mono text-slate-500">
              {originStop?.name} → {destinationStop?.name}
            </span>
          </div>

          {matchingOptions.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">No Direct Bus Hold Capacity Available</h3>
              <p className="text-slate-500 text-xs max-w-md mx-auto">
                No active MSRTC bus on this route has {weightKg}kg free hold capacity at this moment. Try adjusting origin/destination or reducing weight.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {matchingOptions.map((match, idx) => {
                const isSelected = selectedMatch?.trip.id === match.trip.id;

                return (
                  <div
                    key={match.trip.id}
                    onClick={() => setSelectedMatch(match)}
                    className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer shadow-xs ${
                      isSelected
                        ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md bg-blue-50/20'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      
                      {/* Left Bus Spec */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                            {match.bus.registration}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            {match.bus.busType}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 font-mono">
                            {match.compatibilityScore}% Match
                          </span>
                        </div>

                        <div className="font-semibold text-sm text-slate-900 pt-1">
                          {match.route.name}
                        </div>

                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Departure: <strong className="text-slate-800">{match.trip.departureTime}</strong> • Arrival: <strong className="text-slate-800">{match.trip.arrivalTime}</strong> (~{match.estimatedDeliveryHours}h)
                        </p>
                      </div>

                      {/* Right Fare & Action */}
                      <div className="text-right shrink-0 space-y-1">
                        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          Freight Fare
                        </div>
                        <div className="text-2xl font-mono font-extrabold text-blue-600">
                          ₹{match.fareAmount}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMatch(match);
                          }}
                          className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Select Trip'}
                        </button>
                      </div>
                    </div>

                    {/* Reasoning Explanation Pill */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg font-medium text-[11px] flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        {match.reason}
                      </span>

                      <span className="font-mono text-[11px] text-slate-500">
                        Trip ID: <strong>{match.trip.id}</strong>
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Confirm Booking CTA */}
              {selectedMatch && (
                <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="font-bold text-base text-white">Confirm Capacity Reservation</h3>
                      <p className="text-xs text-slate-400">
                        {currentCompany.name} • Waybill will be issued immediately.
                      </p>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-xs text-slate-400">Total Waybill Amount</div>
                      <div className="text-2xl font-bold text-emerald-400">₹{selectedMatch.fareAmount}</div>
                    </div>
                  </div>

                  <button
                    onClick={handleBookingConfirm}
                    disabled={isReserving}
                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    {isReserving ? (
                      <span>Generating QR Waybill...</span>
                    ) : (
                      <>
                        <PackageCheck className="w-5 h-5" />
                        Reserve Hold Space & Generate QR Waybill
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Waybill Confirmation Modal */}
      {createdShipment && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 lg:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="text-center space-y-2">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${
                isOffline ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-emerald-100 text-emerald-600'
              }`}>
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                {isOffline ? '✓ Saved on this device' : 'Waybill Reserved Successfully!'}
              </h3>
              <p className="text-xs text-slate-500">
                {isOffline ? (
                  <span className="text-amber-800 font-medium">
                    Pending synchronization · Primary datastore is unavailable, so this shipment is protected locally and will sync upon restoration.
                  </span>
                ) : (
                  <span>
                    Capacity has been deducted from MSRTC Bus Trip <strong>{createdShipment.tripId}</strong> and committed to central datastore.
                  </span>
                )}
              </p>
            </div>

            {/* QR Code Container */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="w-40 h-40 bg-white p-3 rounded-xl border border-slate-300 mx-auto shadow-inner flex flex-col items-center justify-center">
                <QrCode className="w-28 h-28 text-slate-900" />
                <span className="text-[10px] font-mono text-slate-500 mt-1">
                  {createdShipment.qrCodeHash}
                </span>
              </div>

              <div>
                <div className="font-mono text-base font-extrabold text-slate-900">
                  {createdShipment.waybillNumber}
                </div>
                <div className="text-xs text-slate-500">
                  Show QR code to MSRTC Conductor at depot loading bay.
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
              <div className="flex justify-between">
                <span>Consignee:</span>
                <strong className="text-slate-900">{createdShipment.receiverName}</strong>
              </div>
              <div className="flex justify-between">
                <span>Weight & Fare:</span>
                <strong className="text-slate-900">{createdShipment.weightKg} kg • ₹{createdShipment.fareAmount}</strong>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCreatedShipment(null)}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Book Another Parcel
              </button>
              <button
                onClick={() => {
                  setCreatedShipment(null);
                  setActiveTab('my-shipments');
                }}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
              >
                View My Waybills
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
