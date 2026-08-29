'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase';
import {
  UserRole,
  UserProfile,
  ScheduledTrip,
  Shipment,
  Bus,
  Route,
  Stop,
  Depot,
  CourierCompany,
  ShipmentStatus,
  CourierRegistrationInput,
  AuthSession,
  EmailAlert,
  EvidenceVerificationStatus,
  EvidenceRecord,
  Dispute,
  CargoNotification
} from '@/lib/types';
import {
  INITIAL_STOPS,
  INITIAL_DEPOTS,
  INITIAL_ROUTES,
  INITIAL_BUSES,
  INITIAL_SCHEDULED_TRIPS,
  INITIAL_SHIPMENTS,
  DEMO_USER_PROFILES,
} from '@/lib/mock-data';
import {
  getCurrentAuthSession,
  loginWithEmailPassword,
  registerCourierPartner,
  signOutAuth,
  fetchAllCourierCompanies,
  updateCourierCompanyStatus,
} from '@/lib/auth-service';

interface CargoFlowContextType {
  currentRole: UserRole;
  currentProfile: UserProfile;
  currentCompany: CourierCompany | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  switchRole: (role: UserRole) => void;

  // Auth actions
  login: (email: string, pass: string) => Promise<{ success: boolean; session?: AuthSession; error?: string }>;
  registerCourier: (input: CourierRegistrationInput) => Promise<{ success: boolean; session?: AuthSession; error?: string }>;
  logout: () => Promise<void>;
  
  // Company management for Super Admin
  approveCompany: (companyId: string) => Promise<void>;
  rejectCompany: (companyId: string, reason?: string) => Promise<void>;
  refreshCompanies: () => Promise<void>;

  stops: Stop[];
  depots: Depot[];
  routes: Route[];
  buses: Bus[];
  trips: ScheduledTrip[];
  shipments: Shipment[];
  courierCompanies: CourierCompany[];

  createShipment: (shipmentData: Omit<Shipment, 'id' | 'waybillNumber' | 'createdAt' | 'statusHistory' | 'status'>) => Shipment;
  updateShipmentStatus: (
    shipmentId: string,
    newStatus: ShipmentStatus,
    locationRemarks?: string,
    verificationData?: {
      photoUrl?: string;
      latitude?: number;
      longitude?: number;
    }
  ) => void;
  emailAlerts: EmailAlert[];
  markEmailAsRead: (emailId: string) => void;
  
  // Evidence-Based Verification states & actions
  evidenceRecords: EvidenceRecord[];
  disputes: Dispute[];
  evidenceNotifications: CargoNotification[];
  uploadEvidenceFile: (file: File) => Promise<string>;
  addEvidenceRecord: (
    shipmentId: string,
    fileUrl: string,
    remarks: string,
    locationName: string,
    status?: EvidenceVerificationStatus,
    isCorrection?: boolean,
    correctedEvidenceId?: string
  ) => Promise<EvidenceRecord>;
  raiseDispute: (
    shipmentId: string,
    evidenceId: string,
    reason: string,
    counterEvidenceUrl?: string
  ) => Promise<void>;
  resolveDispute: (
    disputeId: string,
    resolution: string,
    action: 'APPROVE_COURIER' | 'APPROVE_CONDUCTOR'
  ) => Promise<void>;
  submitSystemCorrection: (
    shipmentId: string,
    originalEvidenceId: string,
    remarks: string,
    fileUrl: string
  ) => Promise<void>;
  confirmHandover: (
    shipmentId: string,
    fileUrl: string,
    remarks: string
  ) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => void;

  // Realtime Simulation State
  isSimulating: boolean;
  toggleSimulation: () => void;
  selectedTripId: string | null;
  setSelectedTripId: (tripId: string | null) => void;
  selectedShipmentId: string | null;
  setSelectedShipmentId: (shipmentId: string | null) => void;

  // Stats calculation
  totalRevenue: number;
  totalCapacityKg: number;
  utilizedCapacityKg: number;
  networkUtilizationPercentage: number;
}

const INITIAL_EVIDENCE_RECORDS: EvidenceRecord[] = [
  {
    id: "ev-1001",
    shipmentId: "shp-1001",
    uploadedBy: "usr-courier-01",
    uploaderName: "Amit Deshmukh",
    uploaderRole: "COURIER_PARTNER",
    fileUrl: "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?w=600&auto=format&fit=crop&q=80",
    verificationStatus: "Verified",
    locationName: "Nashik CBS Office",
    remarks: "Initial dispatch manifest verified. 15.0 kg parcel weight confirmed.",
    isCorrection: false,
    createdAt: "2026-08-27T09:15:00.000Z"
  },
  {
    id: "ev-1002",
    shipmentId: "shp-1001",
    uploadedBy: "usr-conductor-01",
    uploaderName: "Suresh Pawar",
    uploaderRole: "CONDUCTOR",
    fileUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80",
    verificationStatus: "Verified",
    latitude: 19.9975,
    longitude: 73.7898,
    locationName: "Nashik CBS Depot Bay 4",
    remarks: "QR Scanned, barcode verified, cargo loaded into bus MH-15-BD-1021 hold.",
    isCorrection: false,
    createdAt: "2026-08-27T10:30:00.000Z"
  },
  {
    id: "ev-2001",
    shipmentId: "shp-1002",
    uploadedBy: "usr-courier-01",
    uploaderName: "Amit Deshmukh",
    uploaderRole: "COURIER_PARTNER",
    fileUrl: "https://images.unsplash.com/photo-1538356111088-7463f8d59bf3?w=600&auto=format&fit=crop&q=80",
    verificationStatus: "Disputed",
    locationName: "Nashik Mela Counter",
    remarks: "Declared weight: 30.0 kg. Box dimension 60x50x40 cm.",
    isCorrection: false,
    createdAt: "2026-08-27T11:15:00.000Z"
  },
  {
    id: "ev-2002",
    shipmentId: "shp-1002",
    uploadedBy: "usr-conductor-01",
    uploaderName: "Suresh Pawar",
    uploaderRole: "CONDUCTOR",
    fileUrl: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=600&auto=format&fit=crop&q=80",
    verificationStatus: "Pending",
    latitude: 20.0245,
    longitude: 74.5218,
    locationName: "Nashik Mela Bus Stand",
    remarks: "Weighing discrepancy: Physical weight is 38.5 kg, waybill says 30.0 kg. Loading denied.",
    isCorrection: false,
    createdAt: "2026-08-27T12:30:00.000Z"
  }
];

const INITIAL_DISPUTES: Dispute[] = [
  {
    id: "disp-1001",
    shipmentId: "shp-1002",
    raisedBy: "usr-conductor-01",
    raiserName: "Suresh Pawar",
    raisedRole: "CONDUCTOR",
    evidenceId: "ev-2001",
    reason: "Weight mismatch. Discovered that the box weighs 38.5 kg, which is 8.5 kg over the declared 30.0 kg on the waybill. Requesting fare correction or offloading.",
    status: "PENDING",
    counterEvidenceUrl: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=600&auto=format&fit=crop&q=80",
    createdAt: "2026-08-27T12:35:00.000Z"
  }
];

const INITIAL_NOTIFICATIONS: CargoNotification[] = [
  {
    id: "notif-1001",
    recipientRole: "SUPER_ADMIN",
    shipmentId: "shp-1002",
    waybillNumber: "WB-2026-NSM-0412",
    type: "DISPUTE_RAISED",
    message: "Dispute raised by Conductor Suresh Pawar on Waybill WB-2026-NSM-0412: Weight discrepancy found.",
    isRead: false,
    timestamp: "2026-08-27T12:35:00.000Z"
  },
  {
    id: "notif-1002",
    recipientRole: "COURIER_PARTNER",
    shipmentId: "shp-1002",
    waybillNumber: "WB-2026-NSM-0412",
    type: "DISPUTE_RAISED",
    message: "Conductor Suresh Pawar disputed your Waybill WB-2026-NSM-0412 due to a weight mismatch.",
    isRead: false,
    timestamp: "2026-08-27T12:35:00.000Z"
  }
];

const CargoFlowContext = createContext<CargoFlowContextType | undefined>(undefined);

export function CargoFlowProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('SUPER_ADMIN');
  const [currentProfile, setCurrentProfile] = useState<UserProfile>(DEMO_USER_PROFILES[0]);
  const [currentCompany, setCurrentCompany] = useState<CourierCompany | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  const [activeTab, setActiveTab] = useState<string>('fleet-map');

  const [stops] = useState<Stop[]>(INITIAL_STOPS);
  const [depots] = useState<Depot[]>(INITIAL_DEPOTS);
  const [routes] = useState<Route[]>(INITIAL_ROUTES);
  const [buses] = useState<Bus[]>(INITIAL_BUSES);
  const [trips, setTrips] = useState<ScheduledTrip[]>(INITIAL_SCHEDULED_TRIPS);
  const [shipments, setShipments] = useState<Shipment[]>(INITIAL_SHIPMENTS);
  const [courierCompanies, setCourierCompanies] = useState<CourierCompany[]>([]);
  const [emailAlerts, setEmailAlerts] = useState<EmailAlert[]>([]);
  const [evidenceRecords, setEvidenceRecords] = useState<EvidenceRecord[]>(INITIAL_EVIDENCE_RECORDS);
  const [disputes, setDisputes] = useState<Dispute[]>(INITIAL_DISPUTES);
  const [evidenceNotifications, setEvidenceNotifications] = useState<CargoNotification[]>(INITIAL_NOTIFICATIONS);

  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [selectedTripId, setSelectedTripId] = useState<string | null>('TRP001');
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>('shp-1001');

  // Load session & companies on mount
  useEffect(() => {
    async function loadInitialData() {
      setIsLoadingAuth(true);
      try {
        const session = await getCurrentAuthSession();
        if (session) {
          setCurrentProfile(session.user);
          setCurrentRole(session.user.role);
          setCurrentCompany(session.company || null);
          setIsAuthenticated(true);
        } else {
          // Default to demo admin profile for initial guest state if not explicitly signed out
          setCurrentProfile(DEMO_USER_PROFILES[0]);
          setCurrentRole('SUPER_ADMIN');
          setIsAuthenticated(true);
        }

        const companiesList = await fetchAllCourierCompanies();
        setCourierCompanies(companiesList);
      } catch (err) {
        console.error('Error loading initial auth context:', err);
      } finally {
        setIsLoadingAuth(false);
      }
    }

    loadInitialData();
  }, []);

  const refreshCompanies = async () => {
    const list = await fetchAllCourierCompanies();
    setCourierCompanies(list);
  };

  // Switch role function for quick demo testing
  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    const profile = DEMO_USER_PROFILES.find((p) => p.role === role) || DEMO_USER_PROFILES[0];
    setCurrentProfile(profile);

    if (role === 'SUPER_ADMIN') {
      setActiveTab('fleet-map');
      setCurrentCompany(null);
    } else if (role === 'COURIER_PARTNER') {
      setActiveTab('book-capacity');
      const comp = courierCompanies.find((c) => c.id === profile.companyId) || courierCompanies[0] || null;
      setCurrentCompany(comp);
    } else if (role === 'CONDUCTOR') {
      setActiveTab('today-trips');
      setCurrentCompany(null);
    }
  };

  const login = async (email: string, pass: string) => {
    const res = await loginWithEmailPassword(email, pass);
    if (res.session) {
      setCurrentProfile(res.session.user);
      setCurrentRole(res.session.user.role);
      setCurrentCompany(res.session.company || null);
      setIsAuthenticated(true);

      if (res.session.user.role === 'SUPER_ADMIN') {
        setActiveTab('fleet-map');
      } else if (res.session.user.role === 'COURIER_PARTNER') {
        setActiveTab('book-capacity');
      } else if (res.session.user.role === 'CONDUCTOR') {
        setActiveTab('today-trips');
      }

      await refreshCompanies();
      return { success: true, session: res.session };
    }
    return { success: false, error: res.error || 'Login failed.' };
  };

  const registerCourier = async (input: CourierRegistrationInput) => {
    const res = await registerCourierPartner(input);
    if (res.session) {
      setCurrentProfile(res.session.user);
      setCurrentRole(res.session.user.role);
      setCurrentCompany(res.session.company || null);
      setIsAuthenticated(true);
      await refreshCompanies();
      return { success: true, session: res.session };
    }
    return { success: false, error: res.error || 'Registration failed.' };
  };

  const logout = async () => {
    await signOutAuth();
    setIsAuthenticated(false);
    setCurrentCompany(null);
    setCurrentRole('SUPER_ADMIN');
    setCurrentProfile(DEMO_USER_PROFILES[0]);
  };

  const approveCompany = async (companyId: string) => {
    await updateCourierCompanyStatus(companyId, 'ACTIVE');
    await refreshCompanies();

    // If current logged-in company matches, update current state
    if (currentCompany && currentCompany.id === companyId) {
      setCurrentCompany({ ...currentCompany, status: 'ACTIVE' });
      setCurrentProfile({ ...currentProfile, companyStatus: 'ACTIVE' });
    }
  };

  const rejectCompany = async (companyId: string, reason?: string) => {
    await updateCourierCompanyStatus(companyId, 'REJECTED', reason);
    await refreshCompanies();

    if (currentCompany && currentCompany.id === companyId) {
      setCurrentCompany({ ...currentCompany, status: 'REJECTED', rejectionReason: reason });
      setCurrentProfile({ ...currentProfile, companyStatus: 'REJECTED' });
    }
  };

  // Create Shipment Function
  const createShipment = (
    data: Omit<Shipment, 'id' | 'waybillNumber' | 'createdAt' | 'statusHistory' | 'status'>
  ): Shipment => {
    const timestamp = new Date().toISOString();
    const waybillNumber = `WB-${new Date().getFullYear()}-MSR-${Math.floor(1000 + Math.random() * 9000)}`;
    const qrCodeHash = `CF-QR-${Math.floor(100 + Math.random() * 900)}-${data.tripId}`;

    const newShipment: Shipment = {
      ...data,
      id: `shp-${Date.now()}`,
      waybillNumber,
      qrCodeHash,
      status: 'RESERVED',
      createdAt: timestamp,
      statusHistory: [
        {
          status: 'RESERVED',
          timestamp,
          location: 'Origin Depot Station',
          remarks: `Capacity reserved on Bus Trip ${data.tripId}`
        }
      ]
    };

    setShipments(prev => [newShipment, ...prev]);

    // Deduct capacity from the trip
    setTrips(prev =>
      prev.map(t => {
        if (t.id === data.tripId) {
          const newAvail = Math.max(0, t.availableCargoCapacityKg - data.weightKg);
          return { ...t, availableCargoCapacityKg: newAvail };
        }
        return t;
      })
    );

    return newShipment;
  };

  const markEmailAsRead = (emailId: string) => {
    setEmailAlerts(prev =>
      prev.map(alert => (alert.id === emailId ? { ...alert, isRead: true } : alert))
    );
  };

  const uploadEvidenceFile = async (file: File): Promise<string> => {
    try {
      const supabase = getSupabase();
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('evidence')
        .upload(fileName, file);

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('evidence')
        .getPublicUrl(data.path);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.warn('Supabase storage upload failed or not configured, using base64 fallback:', err);
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) resolve(e.target.result as string);
          else reject(new Error('Failed to read file'));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const addEvidenceRecord = async (
    shipmentId: string,
    fileUrl: string,
    remarks: string,
    locationName: string,
    status: EvidenceVerificationStatus = 'Pending',
    isCorrection = false,
    correctedEvidenceId?: string
  ): Promise<EvidenceRecord> => {
    const timestamp = new Date().toISOString();
    const newRecord: EvidenceRecord = {
      id: `ev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      shipmentId,
      uploadedBy: currentProfile.id,
      uploaderName: currentProfile.fullName,
      uploaderRole: currentRole,
      fileUrl,
      verificationStatus: status,
      locationName,
      remarks,
      isCorrection,
      correctedEvidenceId,
      createdAt: timestamp
    };

    setEvidenceRecords(prev => [newRecord, ...prev]);

    // Add a status history entry to the shipment
    setShipments(prev =>
      prev.map(shp => {
        if (shp.id === shipmentId) {
          return {
            ...shp,
            statusHistory: [
              ...shp.statusHistory,
              {
                status: shp.status,
                timestamp,
                location: locationName,
                remarks: `[Evidence Uploaded - ${currentRole}] ${remarks}`,
                photoUrl: fileUrl
              }
            ]
          };
        }
        return shp;
      })
    );

    // Create verification request notification
    const shp = shipments.find(s => s.id === shipmentId);
    if (shp) {
      const recipientRole: UserRole = currentRole === 'COURIER_PARTNER' ? 'CONDUCTOR' : 'COURIER_PARTNER';
      const newNotif: CargoNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        recipientRole,
        shipmentId,
        waybillNumber: shp.waybillNumber,
        type: 'VERIFICATION_REQUEST',
        message: `New evidence uploaded by ${currentProfile.fullName} (${currentRole}) for waybill ${shp.waybillNumber}. Action: verify status.`,
        isRead: false,
        timestamp
      };
      setEvidenceNotifications(prev => [newNotif, ...prev]);
    }

    return newRecord;
  };

  const raiseDispute = async (
    shipmentId: string,
    evidenceId: string,
    reason: string,
    counterEvidenceUrl?: string
  ): Promise<void> => {
    const timestamp = new Date().toISOString();
    const shp = shipments.find(s => s.id === shipmentId);
    if (!shp) return;

    // 1. Create Dispute Record
    const newDispute: Dispute = {
      id: `disp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      shipmentId,
      raisedBy: currentProfile.id,
      raiserName: currentProfile.fullName,
      raisedRole: currentRole,
      evidenceId,
      reason,
      status: 'PENDING',
      counterEvidenceUrl,
      createdAt: timestamp
    };
    setDisputes(prev => [newDispute, ...prev]);

    // 2. Mark the targeted evidence record as 'Disputed'
    setEvidenceRecords(prev =>
      prev.map(rec => (rec.id === evidenceId ? { ...rec, verificationStatus: 'Disputed' } : rec))
    );

    // 3. Update shipment status history
    setShipments(prev =>
      prev.map(s => {
        if (s.id === shipmentId) {
          return {
            ...s,
            statusHistory: [
              ...s.statusHistory,
              {
                status: s.status,
                timestamp,
                location: currentProfile.depotName || 'Depot Hub',
                remarks: `[DISPUTE RAISED] By ${currentProfile.fullName} (${currentRole}): ${reason}`,
                photoUrl: counterEvidenceUrl
              }
            ]
          };
        }
        return s;
      })
    );

    // 4. Create Notifications for Admin and opposite party
    const newNotifAdmin: CargoNotification = {
      id: `notif-${Date.now()}-adm`,
      recipientRole: 'SUPER_ADMIN',
      shipmentId,
      waybillNumber: shp.waybillNumber,
      type: 'DISPUTE_RAISED',
      message: `Dispute raised on Waybill ${shp.waybillNumber} by ${currentProfile.fullName} (${currentRole}): ${reason}`,
      isRead: false,
      timestamp
    };

    const oppositeRole: UserRole = currentRole === 'COURIER_PARTNER' ? 'CONDUCTOR' : 'COURIER_PARTNER';
    const newNotifOpposite: CargoNotification = {
      id: `notif-${Date.now()}-opp`,
      recipientRole: oppositeRole,
      shipmentId,
      waybillNumber: shp.waybillNumber,
      type: 'DISPUTE_RAISED',
      message: `Dispute raised on your evidence for Waybill ${shp.waybillNumber} by ${currentProfile.fullName}: ${reason}`,
      isRead: false,
      timestamp
    };

    setEvidenceNotifications(prev => [newNotifAdmin, newNotifOpposite, ...prev]);
  };

  const resolveDispute = async (
    disputeId: string,
    resolution: string,
    action: 'APPROVE_COURIER' | 'APPROVE_CONDUCTOR'
  ): Promise<void> => {
    const timestamp = new Date().toISOString();
    const targetDispute = disputes.find(d => d.id === disputeId);
    if (!targetDispute) return;

    // 1. Update Dispute Status
    setDisputes(prev =>
      prev.map(d =>
        d.id === disputeId
          ? {
              ...d,
              status: 'RESOLVED',
              resolution,
              resolvedBy: currentProfile.id,
              resolvedAt: timestamp
            }
          : d
      )
    );

    // 2. Resolve Evidence status based on Admin decision
    const resolvedStatus: EvidenceVerificationStatus = action === 'APPROVE_COURIER' ? 'Verified' : 'Rejected';
    setEvidenceRecords(prev =>
      prev.map(rec => {
        if (rec.id === targetDispute.evidenceId) {
          return { ...rec, verificationStatus: resolvedStatus };
        }
        if (action === 'APPROVE_CONDUCTOR' && rec.uploadedBy === targetDispute.raisedBy) {
          return { ...rec, verificationStatus: 'Verified' };
        }
        return rec;
      })
    );

    const shp = shipments.find(s => s.id === targetDispute.shipmentId);
    if (shp) {
      // 3. Update Shipment History
      setShipments(prev =>
        prev.map(s => {
          if (s.id === shp.id) {
            return {
              ...s,
              statusHistory: [
                ...s.statusHistory,
                {
                  status: s.status,
                  timestamp,
                  location: currentProfile.depotName || 'Control Center',
                  remarks: `[DISPUTE RESOLVED] Admin ${currentProfile.fullName}: ${resolution} (Favored: ${action})`
                }
              ]
            };
          }
          return s;
        })
      );

      // 4. Create Notifications for both Courier and Conductor
      const newNotifCourier: CargoNotification = {
        id: `notif-${Date.now()}-c`,
        recipientRole: 'COURIER_PARTNER',
        shipmentId: shp.id,
        waybillNumber: shp.waybillNumber,
        type: 'DISPUTE_RESOLVED',
        message: `Dispute resolved on Waybill ${shp.waybillNumber} by Admin: ${resolution}`,
        isRead: false,
        timestamp
      };

      const newNotifConductor: CargoNotification = {
        id: `notif-${Date.now()}-d`,
        recipientRole: 'CONDUCTOR',
        shipmentId: shp.id,
        waybillNumber: shp.waybillNumber,
        type: 'DISPUTE_RESOLVED',
        message: `Dispute resolved on Waybill ${shp.waybillNumber} by Admin: ${resolution}`,
        isRead: false,
        timestamp
      };

      setEvidenceNotifications(prev => [newNotifCourier, newNotifConductor, ...prev]);
    }
  };

  const submitSystemCorrection = async (
    shipmentId: string,
    originalEvidenceId: string,
    remarks: string,
    fileUrl: string
  ): Promise<void> => {
    const timestamp = new Date().toISOString();
    const shp = shipments.find(s => s.id === shipmentId);
    if (!shp) return;

    // 1. Create a Corrected Evidence Record pointing to original
    const correctedRecord: EvidenceRecord = {
      id: `ev-${Date.now()}-corr`,
      shipmentId,
      uploadedBy: currentProfile.id,
      uploaderName: currentProfile.fullName,
      uploaderRole: currentRole,
      fileUrl,
      verificationStatus: 'Corrected',
      locationName: currentProfile.depotName || 'Control Center',
      remarks: `[Correction] ${remarks}`,
      isCorrection: true,
      correctedEvidenceId: originalEvidenceId,
      createdAt: timestamp
    };

    // 2. Mark original evidence status as 'Corrected'
    setEvidenceRecords(prev =>
      [correctedRecord, ...prev].map(rec =>
        rec.id === originalEvidenceId ? { ...rec, verificationStatus: 'Corrected' } : rec
      )
    );

    // 3. Update shipment history
    setShipments(prev =>
      prev.map(s => {
        if (s.id === shipmentId) {
          return {
            ...s,
            statusHistory: [
              ...s.statusHistory,
              {
                status: s.status,
                timestamp,
                location: currentProfile.depotName || 'Control Center',
                remarks: `[SYSTEM CORRECTION] Issued by Admin ${currentProfile.fullName}: ${remarks}`,
                photoUrl: fileUrl
              }
            ]
          };
        }
        return s;
      })
    );

    // 4. Notify parties of correction
    const notifCourier: CargoNotification = {
      id: `notif-${Date.now()}-cc`,
      recipientRole: 'COURIER_PARTNER',
      shipmentId,
      waybillNumber: shp.waybillNumber,
      type: 'DISPUTE_RESOLVED',
      message: `System correction issued for Waybill ${shp.waybillNumber} by Admin: ${remarks}`,
      isRead: false,
      timestamp
    };

    const notifConductor: CargoNotification = {
      id: `notif-${Date.now()}-dc`,
      recipientRole: 'CONDUCTOR',
      shipmentId,
      waybillNumber: shp.waybillNumber,
      type: 'DISPUTE_RESOLVED',
      message: `System correction issued for Waybill ${shp.waybillNumber} by Admin: ${remarks}`,
      isRead: false,
      timestamp
    };

    setEvidenceNotifications(prev => [notifCourier, notifConductor, ...prev]);
  };

  const confirmHandover = async (
    shipmentId: string,
    fileUrl: string,
    remarks: string
  ): Promise<void> => {
    const timestamp = new Date().toISOString();
    const shp = shipments.find(s => s.id === shipmentId);
    if (!shp) return;

    // 1. Add final Handover Evidence Record as 'Verified'
    const finalRecord: EvidenceRecord = {
      id: `ev-${Date.now()}-final`,
      shipmentId,
      uploadedBy: currentProfile.id,
      uploaderName: currentProfile.fullName,
      uploaderRole: currentRole,
      fileUrl,
      verificationStatus: 'Verified',
      locationName: 'Destination Depot Station',
      remarks: `[Final Handover Confirmed] ${remarks}`,
      isCorrection: false,
      createdAt: timestamp
    };

    // 2. Set all other pending evidence records of this shipment to 'Verified'
    setEvidenceRecords(prev =>
      [finalRecord, ...prev].map(rec =>
        rec.shipmentId === shipmentId && rec.verificationStatus === 'Pending'
          ? { ...rec, verificationStatus: 'Verified' }
          : rec
      )
    );

    // 3. Update shipment status and history
    setShipments(prev =>
      prev.map(s => {
        if (s.id === shipmentId) {
          return {
            ...s,
            statusHistory: [
              ...s.statusHistory,
              {
                status: s.status,
                timestamp,
                location: 'Destination Depot Station',
                remarks: `[HANDOVER CONFIRMED] Courier Amit Deshmukh confirmed final delivery: ${remarks}`,
                photoUrl: fileUrl
              }
            ]
          };
        }
        return s;
      })
    );

    // 4. Create completion notification
    const notifAdmin: CargoNotification = {
      id: `notif-${Date.now()}-fa`,
      recipientRole: 'SUPER_ADMIN',
      shipmentId,
      waybillNumber: shp.waybillNumber,
      type: 'DISPUTE_RESOLVED',
      message: `Final handover verification completed for Waybill ${shp.waybillNumber}.`,
      isRead: false,
      timestamp
    };
    setEvidenceNotifications(prev => [notifAdmin, ...prev]);
  };

  const markNotificationAsRead = (notificationId: string) => {
    setEvidenceNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
  };

  // Update Shipment Status Function
  const updateShipmentStatus = (
    shipmentId: string,
    newStatus: ShipmentStatus,
    locationRemarks?: string,
    verificationData?: {
      photoUrl?: string;
      latitude?: number;
      longitude?: number;
    }
  ) => {
    const timestamp = new Date().toISOString();

    setShipments(prev =>
      prev.map(shp => {
        if (shp.id === shipmentId) {
          const updatedHistory = [
            ...shp.statusHistory,
            {
              status: newStatus,
              timestamp,
              location: currentProfile.depotName || 'Depot Bay Station',
              remarks: locationRemarks || `Status updated to ${newStatus}`,
              photoUrl: verificationData?.photoUrl,
              latitude: verificationData?.latitude,
              longitude: verificationData?.longitude
            }
          ];

          // Trigger email notification for LOADED or DELIVERED status changes
          if (newStatus === 'LOADED' || newStatus === 'DELIVERED') {
            const company = courierCompanies.find(c => c.id === shp.courierCompanyId);
            const courierEmail = company?.contactEmail || `${shp.courierCompanyName.toLowerCase().replace(/\s+/g, '')}@example.com`;

            const isLoaded = newStatus === 'LOADED';
            const actionText = isLoaded ? 'LOADED INTO HOLD' : 'UNLOADED (DELIVERED)';
            const locationName = currentProfile.depotName || 'Nashik CBS Depot';

            const emailSubject = `[${newStatus}] Waybill ${shp.waybillNumber} - Parcel ${isLoaded ? 'Loaded' : 'Unloaded'} at ${locationName}`;
            const emailBody = `Waybill: ${shp.waybillNumber}\nStatus: ${actionText}\nCourier: ${shp.courierCompanyName}\nLocation: ${locationName}\nTimestamp: ${new Date(timestamp).toLocaleString()}\nGPS Coordinates: ${verificationData?.latitude || 'N/A'}, ${verificationData?.longitude || 'N/A'}`;

            // Create client-side simulated inbox alert
            const newAlert: EmailAlert = {
              id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              waybillNumber: shp.waybillNumber,
              courierCompanyId: shp.courierCompanyId,
              courierCompanyName: shp.courierCompanyName,
              courierEmail,
              status: newStatus as 'LOADED' | 'DELIVERED',
              locationName,
              latitude: verificationData?.latitude,
              longitude: verificationData?.longitude,
              photoUrl: verificationData?.photoUrl,
              timestamp,
              subject: emailSubject,
              body: emailBody,
              isRead: false,
            };

            setEmailAlerts(prevAlerts => [newAlert, ...prevAlerts]);

            // Dispatch actual HTTP fetch to backend api
            fetch('/api/notify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                waybillNumber: shp.waybillNumber,
                courierEmail,
                courierCompanyName: shp.courierCompanyName,
                status: newStatus,
                locationName,
                latitude: verificationData?.latitude,
                longitude: verificationData?.longitude,
                photoUrl: verificationData?.photoUrl,
                timestamp,
              }),
            })
              .then(res => res.json())
              .then(data => {
                console.log('[Notify API Response]', data);
              })
              .catch(err => {
                console.error('[Notify API Error]', err);
              });
          }

          return {
            ...shp,
            status: newStatus,
            statusHistory: updatedHistory
          };
        }
        return shp;
      })
    );

    // If shipment is DELIVERED or CANCELLED, restore capacity to trip
    if (newStatus === 'DELIVERED' || newStatus === 'CANCELLED') {
      const targetShipment = shipments.find(s => s.id === shipmentId);
      if (targetShipment) {
        setTrips(prev =>
          prev.map(t => {
            if (t.id === targetShipment.tripId) {
              const restoredAvail = Math.min(t.totalCargoCapacityKg, t.availableCargoCapacityKg + targetShipment.weightKg);
              return { ...t, availableCargoCapacityKg: restoredAvail };
            }
            return t;
          })
        );
      }
    }
  };

  // Realtime bus GPS jitter animation simulator
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setTrips(prevTrips =>
        prevTrips.map(trip => {
          if (trip.tripStatus === 'IN_TRANSIT' && trip.currentLocation) {
            const latDelta = (Math.random() - 0.48) * 0.0015;
            const lngDelta = (Math.random() - 0.48) * 0.0015;
            return {
              ...trip,
              currentLocation: {
                ...trip.currentLocation,
                latitude: Number((trip.currentLocation.latitude + latDelta).toFixed(6)),
                longitude: Number((trip.currentLocation.longitude + lngDelta).toFixed(6))
              }
            };
          }
          return trip;
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Network stats calculations
  const totalRevenue = shipments.reduce((sum, s) => sum + (s.status !== 'CANCELLED' ? s.fareAmount : 0), 12850);
  const totalCapacityKg = trips.reduce((sum, t) => sum + t.totalCargoCapacityKg, 0);
  const availableCapacityKg = trips.reduce((sum, t) => sum + t.availableCargoCapacityKg, 0);
  const utilizedCapacityKg = Math.max(0, totalCapacityKg - availableCapacityKg);
  const networkUtilizationPercentage = Math.round((utilizedCapacityKg / (totalCapacityKg || 1)) * 100);

  return (
    <CargoFlowContext.Provider
      value={{
        currentRole,
        currentProfile,
        currentCompany,
        isAuthenticated,
        isLoadingAuth,
        activeTab,
        setActiveTab,
        switchRole,
        login,
        registerCourier,
        logout,
        approveCompany,
        rejectCompany,
        refreshCompanies,
        stops,
        depots,
        routes,
        buses,
        trips,
        shipments,
        courierCompanies,
        createShipment,
        updateShipmentStatus,
        emailAlerts,
        markEmailAsRead,
        evidenceRecords,
        disputes,
        evidenceNotifications,
        uploadEvidenceFile,
        addEvidenceRecord,
        raiseDispute,
        resolveDispute,
        submitSystemCorrection,
        confirmHandover,
        markNotificationAsRead,
        isSimulating,
        toggleSimulation: () => setIsSimulating(!isSimulating),
        selectedTripId,
        setSelectedTripId,
        selectedShipmentId,
        setSelectedShipmentId,
        totalRevenue,
        totalCapacityKg,
        utilizedCapacityKg,
        networkUtilizationPercentage,
      }}
    >
      {children}
    </CargoFlowContext.Provider>
  );
}

export function useCargoFlow() {
  const context = useContext(CargoFlowContext);
  if (!context) {
    throw new Error('useCargoFlow must be used within a CargoFlowProvider');
  }
  return context;
}
