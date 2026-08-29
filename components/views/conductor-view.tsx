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
  Search,
  Camera,
  Upload,
  X,
  RefreshCw,
  Globe
} from 'lucide-react';

export function ConductorView({ isScannerTab = false }: { isScannerTab?: boolean }) {
  const {
    trips,
    buses,
    routes,
    shipments,
    updateShipmentStatus,
    currentProfile,
    addEvidenceRecord,
    raiseDispute
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

  // Verification Modal States
  const [verifyingShipment, setVerifyingShipment] = useState<any | null>(null);
  const [targetStatus, setTargetStatus] = useState<'LOADED' | 'DELIVERED' | null>(null);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [gpsCoords, setGpsCoords] = useState<{ latitude: number; longitude: number; accuracy?: number; source: string } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [remarks, setRemarks] = useState('');
  const [isDisputing, setIsDisputing] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');

  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  // Start Camera
  const startCamera = async () => {
    setCameraError(null);
    setPhotoData(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setActiveStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Could not access camera. Please upload an image or allow permissions.');
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (activeStream) {
      activeStream.getTracks().forEach(track => track.stop());
      setActiveStream(null);
    }
  };

  // Capture Photo
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.85);
        setPhotoData(base64);
        stopCamera();
      }
    }
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoData(event.target.result as string);
          stopCamera();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Geolocation and Camera mount hook
  React.useEffect(() => {
    if (verifyingShipment) {
      setGpsLoading(true);
      setGpsCoords(null);
      setRemarks('');
      setPhotoData(null);
      setCameraError(null);

      startCamera();

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setGpsCoords({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: Math.round(position.coords.accuracy),
              source: 'Device GPS'
            });
            setGpsLoading(false);
          },
          (err) => {
            console.warn('Geolocation failed:', err);
            setGpsCoords({
              latitude: 19.9975,
              longitude: 73.7898,
              accuracy: 50,
              source: 'Depot Fallback (Default)'
            });
            setGpsLoading(false);
          },
          { enableHighAccuracy: true, timeout: 6000 }
        );
      } else {
        setGpsCoords({
          latitude: 19.9975,
          longitude: 73.7898,
          accuracy: 50,
          source: 'System Fallback'
        });
        setGpsLoading(false);
      }
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [verifyingShipment]);

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
      let nextStatus: 'LOADED' | 'DELIVERED' | null = null;
      if (match.status === 'RESERVED') {
        nextStatus = 'LOADED';
      } else if (match.status === 'LOADED' || match.status === 'IN_TRANSIT') {
        nextStatus = 'DELIVERED';
      }

      if (nextStatus) {
        setVerifyingShipment(match);
        setTargetStatus(nextStatus);
        setScanInput('');
      } else {
        alert(`Shipment ${match.waybillNumber} is currently in '${match.status}' status. Verification is only for Loading or Unloading events.`);
      }
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
                      onClick={() => {
                        setVerifyingShipment(shp);
                        setTargetStatus('LOADED');
                      }}
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
                      onClick={() => {
                        setVerifyingShipment(shp);
                        setTargetStatus('DELIVERED');
                      }}
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

      {/* Verification Capture Modal Overlay */}
      {verifyingShipment && targetStatus && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden border border-slate-100 shadow-2xl flex flex-col p-6 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 font-sans flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  {targetStatus === 'LOADED' ? 'Step 1: Pickup Verification' : 'Step 2: Unload Verification'}
                </h3>
                <p className="text-xs text-slate-500 font-semibold font-mono mt-0.5">
                  Waybill: {verifyingShipment.waybillNumber} • Action: <span className="text-amber-700 font-bold">{targetStatus === 'LOADED' ? 'PICKUP / LOADING' : 'DELIVERY / UNLOADING'}</span>
                </p>
              </div>
              <button 
                onClick={() => setVerifyingShipment(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Camera View & Capture */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                1. Capture Waypoint Photo Proof
              </label>

              <div className="relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center aspect-video shadow-inner">
                {activeStream && !photoData && (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover"
                  />
                )}

                {photoData && (
                  <img 
                    src={photoData} 
                    alt="Captured Proof" 
                    className="w-full h-full object-cover"
                  />
                )}

                {!activeStream && !photoData && (
                  <div className="p-6 text-center space-y-2">
                    <Camera className="w-10 h-10 text-slate-600 mx-auto" />
                    <p className="text-slate-400 text-xs font-medium">Camera stream is loading or inactive.</p>
                    {cameraError && <p className="text-rose-400 text-[11px] px-4">{cameraError}</p>}
                  </div>
                )}

                <canvas ref={canvasRef} className="hidden" />

                {/* Overlaid Camera Action Controls */}
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 px-4">
                  {activeStream && !photoData && (
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <Camera className="w-4 h-4" />
                      Take Photo
                    </button>
                  )}

                  {photoData && (
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-4 py-2 bg-slate-900/90 hover:bg-slate-950 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1.5 transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Retake
                    </button>
                  )}

                  {/* Device File Input Backup */}
                  <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-full shadow-lg flex items-center gap-1.5 cursor-pointer transition-all border border-slate-700">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Present Geolocation Telemetry */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Globe className="w-4 h-4 text-amber-600" />
                2. Live GPS Telemetry (Present Location)
              </label>

              {gpsLoading && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                  <span>Retrieving satellite coordinate telemetry...</span>
                </div>
              )}

              {gpsCoords && (
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Present Latitude:</span>
                    <strong className="text-slate-950 font-mono font-bold">{gpsCoords.latitude.toFixed(6)}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Present Longitude:</span>
                    <strong className="text-slate-950 font-mono font-bold">{gpsCoords.longitude.toFixed(6)}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200 text-slate-400">
                    <span>Source: {gpsCoords.source}</span>
                    <span>Accuracy: &plusmn;{gpsCoords.accuracy || 15}m</span>
                  </div>
                </div>
              )}
            </div>

            {/* Dispute Checkbox */}
            <div className="bg-rose-50/40 border border-rose-200/60 p-3 rounded-2xl flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={isDisputing}
                  onChange={e => {
                    setIsDisputing(e.target.checked);
                    if (!e.target.checked) setDisputeReason('');
                  }}
                  className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-rose-700">Flag Discrepancy / Raise Dispute</span>
              </label>

              {isDisputing && (
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-rose-800 uppercase font-mono">Reason for Discrepancy</label>
                  <input
                    type="text"
                    value={disputeReason}
                    onChange={e => setDisputeReason(e.target.value)}
                    placeholder="e.g. Weight mismatch: actual weight is 22kg, waybill says 15kg."
                    className="w-full bg-white border border-rose-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-rose-600 font-semibold"
                  />
                </div>
              )}
            </div>

            {/* Remarks Input */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                3. Dispatch Notes / Verification Remarks
              </label>
              <input
                type="text"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="e.g. Seal checked. Loaded on Bay 4 hold."
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-amber-600 font-semibold"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setVerifyingShipment(null)}
                className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-extrabold text-slate-600 transition-colors"
              >
                Cancel Scan
              </button>
              <button
                type="button"
                disabled={!photoData || gpsLoading}
                onClick={async () => {
                  const finalRemarks = remarks.trim() || `${targetStatus === 'LOADED' ? 'Loaded' : 'Unloaded'} at present waypoint stop.`;
                  
                  // Update shipment status in context
                  updateShipmentStatus(verifyingShipment.id, targetStatus, finalRemarks, {
                    photoUrl: photoData || undefined,
                    latitude: gpsCoords?.latitude,
                    longitude: gpsCoords?.longitude
                  });

                  // Add evidence record
                  const status = isDisputing ? 'Disputed' : 'Pending';
                  const record = await addEvidenceRecord(
                    verifyingShipment.id,
                    photoData || '',
                    finalRemarks,
                    currentProfile.depotName || 'Depot Hub',
                    status
                  );

                  // If Conductor raised a dispute, log it
                  if (isDisputing && disputeReason) {
                    await raiseDispute(
                      verifyingShipment.id,
                      record.id,
                      disputeReason,
                      photoData || undefined
                    );
                  }

                  setSuccessMessage(`Waybill ${verifyingShipment.waybillNumber} verified & updated to ${targetStatus}!`);
                  setVerifyingShipment(null);
                  setIsDisputing(false);
                  setDisputeReason('');
                  setTimeout(() => setSuccessMessage(null), 4000);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-98 ${
                  photoData && !gpsLoading
                    ? 'bg-amber-600 hover:bg-amber-500 cursor-pointer'
                    : 'bg-slate-300 cursor-not-allowed text-slate-500 shadow-none'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Submit Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
