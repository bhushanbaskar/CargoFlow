'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

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
  updateShipmentStatus: (shipmentId: string, newStatus: ShipmentStatus, locationRemarks?: string) => void;
  
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
          setIsAuthenticated(false);
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

    // Listen to Supabase auth events (sign in, sign out, token refresh)
    if (isSupabaseConfigured) {
      try {
        const supabase = getSupabase();
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            const authSession = await getCurrentAuthSession();
            if (authSession) {
              setCurrentProfile(authSession.user);
              setCurrentRole(authSession.user.role);
              setCurrentCompany(authSession.company || null);
              setIsAuthenticated(true);
            }
          } else if (event === 'SIGNED_OUT') {
            setIsAuthenticated(false);
            setCurrentCompany(null);
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (e) {
        console.error('Supabase auth state listener error:', e);
      }
    }
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
    // 1. Optimistic immediate local state update so UI reacts in 0ms
    setCourierCompanies((prev) =>
      prev.map((c) =>
        c.id === companyId ? { ...c, status: 'ACTIVE' as const, rejectionReason: undefined } : c
      )
    );

    if (currentCompany && currentCompany.id === companyId) {
      setCurrentCompany((prev) => (prev ? { ...prev, status: 'ACTIVE', rejectionReason: undefined } : null));
      setCurrentProfile((prev) => ({ ...prev, companyStatus: 'ACTIVE' }));
    }

    // 2. Persist to database
    try {
      await updateCourierCompanyStatus(companyId, 'ACTIVE');
    } catch (e) {
      console.error('Failed to update company status in database:', e);
    }
    await refreshCompanies();
  };

  const rejectCompany = async (companyId: string, reason?: string) => {
    // 1. Optimistic immediate local state update
    setCourierCompanies((prev) =>
      prev.map((c) =>
        c.id === companyId ? { ...c, status: 'REJECTED' as const, rejectionReason: reason } : c
      )
    );

    if (currentCompany && currentCompany.id === companyId) {
      setCurrentCompany((prev) => (prev ? { ...prev, status: 'REJECTED', rejectionReason: reason } : null));
      setCurrentProfile((prev) => ({ ...prev, companyStatus: 'REJECTED' }));
    }

    // 2. Persist to database
    try {
      await updateCourierCompanyStatus(companyId, 'REJECTED', reason);
    } catch (e) {
      console.error('Failed to reject company in database:', e);
    }
    await refreshCompanies();
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

  // Update Shipment Status Function
  const updateShipmentStatus = (shipmentId: string, newStatus: ShipmentStatus, locationRemarks?: string) => {
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
              remarks: locationRemarks || `Status updated to ${newStatus}`
            }
          ];
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
