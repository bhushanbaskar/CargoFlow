export type UserRole = 'SUPER_ADMIN' | 'COURIER_PARTNER' | 'CONDUCTOR';

export type CompanyStatus = 'PENDING' | 'ACTIVE' | 'REJECTED';

export interface Division {
  id: string;
  name: string;
}

export interface Depot {
  id: string;
  divisionId: string;
  name: string;
  stopId: string;
}

export interface Stop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface Route {
  id: string;
  divisionId: string;
  name: string;
  sourceStopId: string;
  destinationStopId: string;
  intermediateStopIds: string[];
}

export interface Bus {
  id: string;
  registration: string;
  busType: 'Ordinary' | 'Semi Luxury' | 'Shivshahi' | 'E-Shivai' | string;
  cargoCapacityKg: number;
}

export type TripStatus = 'SCHEDULED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';

export interface ScheduledTrip {
  id: string;
  busId: string;
  routeId: string;
  departureTime: string;
  arrivalTime: string;
  availableCargoCapacityKg: number;
  totalCargoCapacityKg: number;
  tripStatus: TripStatus;
  bookingCutoffMinutes?: number;
  currentLocation?: {
    latitude: number;
    longitude: number;
    betweenStopIds: [string, string];
  };
}

export type ShipmentStatus = 'DRAFT' | 'RESERVED' | 'LOADED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

export interface StatusHistoryItem {
  status: ShipmentStatus;
  timestamp: string;
  location: string;
  remarks: string;
}

export interface Shipment {
  id: string;
  waybillNumber: string;
  courierCompanyId: string;
  courierCompanyName: string;
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  originStopId: string;
  destinationStopId: string;
  weightKg: number;
  dimensionsCm: string;
  declaredValue: number;
  status: ShipmentStatus;
  qrCodeHash: string;
  tripId: string;
  fareAmount: number;
  createdAt: string;
  statusHistory: StatusHistoryItem[];
}

export interface CourierCompany {
  id: string;
  name: string;
  legalName: string;
  code: string;
  contactEmail: string;
  contactPhone: string;
  creditLimit: number;
  usedCredit: number;
  address?: string;
  city?: string;
  state?: string;
  gstin?: string;
  status: CompanyStatus;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  companyId?: string;
  companyName?: string;
  companyStatus?: CompanyStatus;
  depotId?: string;
  depotName?: string;
}

export interface CourierRegistrationInput {
  legalName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  city: string;
  state: string;
  gstin?: string;
  fullName: string;
  workEmail: string;
  password: string;
}

export interface AuthSession {
  user: UserProfile;
  company?: CourierCompany;
}

export interface MatchOption {
  trip: ScheduledTrip;
  bus: Bus;
  route: Route;
  fareAmount: number;
  compatibilityScore: number;
  departureEtaMinutes: number;
  estimatedDeliveryHours: number;
  pathStops: Stop[];
  reason: string;
}

