import { Division, Depot, Stop, Route, Bus, ScheduledTrip, CourierCompany, Shipment, UserProfile } from './types';

export const INITIAL_DIVISIONS: Division[] = [
  { id: "DIV001", name: "Nashik" }
];

export const INITIAL_DEPOTS: Depot[] = [
  { id: "DEP001", divisionId: "DIV001", name: "Nashik CBS Depot", stopId: "STP001" },
  { id: "DEP002", divisionId: "DIV001", name: "Nashik Mela Bus Stand", stopId: "STP002" },
  { id: "DEP003", divisionId: "DIV001", name: "Mahamarg Bus Stand Nashik", stopId: "STP003" },
  { id: "DEP004", divisionId: "DIV001", name: "Pimpalgaon Baswant Depot", stopId: "STP007" },
  { id: "DEP005", divisionId: "DIV001", name: "Malegaon New Bus Stand", stopId: "STP009" },
  { id: "DEP006", divisionId: "DIV001", name: "Satana Bus Depot", stopId: "STP017" },
  { id: "DEP007", divisionId: "DIV001", name: "Kalwan Bus Depot", stopId: "STP015" },
  { id: "DEP008", divisionId: "DIV001", name: "Lasalgaon Bus Depot", stopId: "STP022" },
  { id: "DEP009", divisionId: "DIV001", name: "Sinnar Bus Stand", stopId: "STP004" },
  { id: "DEP010", divisionId: "DIV001", name: "Igatpuri Bus Station", stopId: "STP011" }
];

export const INITIAL_STOPS: Stop[] = [
  { id: "STP001", name: "Nashik CBS", latitude: 19.9975, longitude: 73.7898 },
  { id: "STP002", name: "Nashik Mela", latitude: 19.9995, longitude: 73.7852 },
  { id: "STP003", name: "Mahamarg Nashik", latitude: 19.9882, longitude: 73.7915 },
  { id: "STP004", name: "Sinnar", latitude: 19.8454, longitude: 73.9984 },
  { id: "STP005", name: "Sangamner", latitude: 19.5761, longitude: 74.2072 },
  { id: "STP006", name: "Narayangaon", latitude: 19.1171, longitude: 73.9802 },
  { id: "STP007", name: "Pimpalgaon Baswant", latitude: 20.1706, longitude: 73.9875 },
  { id: "STP008", name: "Chandwad", latitude: 20.3282, longitude: 74.2435 },
  { id: "STP009", name: "Malegaon", latitude: 20.5529, longitude: 74.5276 },
  { id: "STP010", name: "Dhule", latitude: 20.9042, longitude: 74.7749 },
  { id: "STP011", name: "Igatpuri", latitude: 19.6953, longitude: 73.5606 },
  { id: "STP012", name: "Kasara", latitude: 19.6468, longitude: 73.4831 },
  { id: "STP013", name: "Thane", latitude: 19.1860, longitude: 72.9759 },
  { id: "STP014", name: "Borivali", latitude: 19.2291, longitude: 72.8572 },
  { id: "STP015", name: "Kalwan", latitude: 20.4851, longitude: 73.8329 },
  { id: "STP016", name: "Devla", latitude: 20.4631, longitude: 74.1852 },
  { id: "STP017", name: "Satana", latitude: 20.5925, longitude: 74.2024 },
  { id: "STP018", name: "Dindori", latitude: 20.2036, longitude: 73.8311 },
  { id: "STP019", name: "Vani", latitude: 20.3475, longitude: 73.8942 },
  { id: "STP020", name: "Niphad", latitude: 20.0784, longitude: 74.1077 },
  { id: "STP021", name: "Yeola", latitude: 20.0421, longitude: 74.4883 },
  { id: "STP022", name: "Lasalgaon", latitude: 20.1471, longitude: 74.2301 },
  { id: "STP023", name: "Trimbakeshwar", latitude: 19.9323, longitude: 73.5303 },
  { id: "STP024", name: "Satpur", latitude: 19.9992, longitude: 73.7381 },
  { id: "STP025", name: "Manmad", latitude: 20.2522, longitude: 74.4385 },
  { id: "STP026", name: "Nandgaon", latitude: 20.3121, longitude: 74.6592 },
  { id: "STP027", name: "Jalgaon", latitude: 21.0077, longitude: 75.5626 },
  { id: "STP028", name: "Erandol", latitude: 20.9142, longitude: 75.3321 },
  { id: "STP029", name: "Bhusawal", latitude: 21.0452, longitude: 75.7891 },
  { id: "STP030", name: "Pune Shivajinagar", latitude: 18.5314, longitude: 73.8446 },
  { id: "STP031", name: "Pune Swargate", latitude: 18.5018, longitude: 73.8636 },
  { id: "STP032", name: "Shirdi", latitude: 19.7645, longitude: 74.4762 },
  { id: "STP033", name: "Ahmednagar Tarakpur", latitude: 19.1022, longitude: 74.7314 },
  { id: "STP034", name: "Chhatrapati Sambhajinagar", latitude: 19.8762, longitude: 75.3433 },
  { id: "STP035", name: "Solapur", latitude: 17.6599, longitude: 75.9064 },
  { id: "STP036", name: "Surat", latitude: 21.2052, longitude: 72.8408 },
  { id: "STP037", name: "Vapi", latitude: 20.3719, longitude: 72.9043 },
  { id: "STP038", name: "Navsari", latitude: 20.9467, longitude: 72.9520 },
  { id: "STP039", name: "Kalyan", latitude: 19.2354, longitude: 73.1299 },
  { id: "STP040", name: "Dahanu", latitude: 19.9712, longitude: 72.7331 },
  { id: "STP041", name: "Jawahar", latitude: 19.9073, longitude: 73.2301 },
  { id: "STP042", name: "Palghar", latitude: 19.6967, longitude: 72.7699 },
  { id: "STP043", name: "Manor", latitude: 19.7312, longitude: 72.9102 },
  { id: "STP044", name: "Nandurbar", latitude: 21.3712, longitude: 74.2415 },
  { id: "STP045", name: "Saptashrungi Gad", latitude: 20.3881, longitude: 73.9056 },
  { id: "STP046", name: "Alephata", latitude: 19.1171, longitude: 74.1021 },
  { id: "STP047", name: "Vaijapur", latitude: 19.9264, longitude: 74.7297 },
  { id: "STP048", name: "Rahuri", latitude: 19.3908, longitude: 74.6508 },
  { id: "STP049", name: "Tembhurni", latitude: 18.0614, longitude: 75.2012 },
  { id: "STP050", name: "Bhandardara", latitude: 19.5422, longitude: 73.7654 }
];

export const INITIAL_ROUTES: Route[] = [
  { id: "RTE001", divisionId: "DIV001", name: "Nashik to Pune (Shivaji Nagar)", sourceStopId: "STP001", destinationStopId: "STP030", intermediateStopIds: ["STP004", "STP005", "STP006"] },
  { id: "RTE002", divisionId: "DIV001", name: "Nashik to Chhatrapati Sambhajinagar", sourceStopId: "STP002", destinationStopId: "STP034", intermediateStopIds: ["STP020", "STP021", "STP047"] },
  { id: "RTE003", divisionId: "DIV001", name: "Nashik to Borivali", sourceStopId: "STP003", destinationStopId: "STP014", intermediateStopIds: ["STP011", "STP012", "STP013"] },
  { id: "RTE004", divisionId: "DIV001", name: "Nashik to Dhule", sourceStopId: "STP002", destinationStopId: "STP010", intermediateStopIds: ["STP007", "STP008", "STP009"] },
  { id: "RTE005", divisionId: "DIV001", name: "Nashik to Shirdi", sourceStopId: "STP003", destinationStopId: "STP032", intermediateStopIds: ["STP004"] },
  { id: "RTE006", divisionId: "DIV001", name: "Nashik to Surat", sourceStopId: "STP003", destinationStopId: "STP036", intermediateStopIds: ["STP018", "STP037", "STP038"] },
  { id: "RTE007", divisionId: "DIV001", name: "Nashik CBS to Trimbakeshwar", sourceStopId: "STP001", destinationStopId: "STP023", intermediateStopIds: ["STP024"] },
  { id: "RTE008", divisionId: "DIV001", name: "Nashik CBS to Kalwan", sourceStopId: "STP001", destinationStopId: "STP015", intermediateStopIds: ["STP018", "STP019"] },
  { id: "RTE009", divisionId: "DIV001", name: "Nashik CBS to Satana", sourceStopId: "STP001", destinationStopId: "STP017", intermediateStopIds: ["STP007", "STP016"] },
  { id: "RTE010", divisionId: "DIV001", name: "Nashik to Jalgaon", sourceStopId: "STP002", destinationStopId: "STP027", intermediateStopIds: ["STP009", "STP010", "STP028"] },
  { id: "RTE011", divisionId: "DIV001", name: "Nashik to Ahmednagar", sourceStopId: "STP003", destinationStopId: "STP033", intermediateStopIds: ["STP004", "STP005", "STP048"] },
  { id: "RTE012", divisionId: "DIV001", name: "Nashik CBS to Saptashrungi Gad", sourceStopId: "STP001", destinationStopId: "STP045", intermediateStopIds: ["STP018", "STP019"] },
  { id: "RTE013", divisionId: "DIV001", name: "Nashik to Kalyan", sourceStopId: "STP003", destinationStopId: "STP039", intermediateStopIds: ["STP011", "STP012"] },
  { id: "RTE014", divisionId: "DIV001", name: "Nashik to Solapur", sourceStopId: "STP003", destinationStopId: "STP035", intermediateStopIds: ["STP005", "STP033", "STP049"] },
  { id: "RTE015", divisionId: "DIV001", name: "Nashik to Dahanu", sourceStopId: "STP003", destinationStopId: "STP040", intermediateStopIds: ["STP023", "STP041"] },
  { id: "RTE016", divisionId: "DIV001", name: "Nashik to Nandurbar", sourceStopId: "STP003", destinationStopId: "STP044", intermediateStopIds: ["STP009", "STP010"] },
  { id: "RTE017", divisionId: "DIV001", name: "Pimpalgaon to Pune Swargate", sourceStopId: "STP007", destinationStopId: "STP031", intermediateStopIds: ["STP001", "STP004", "STP005"] },
  { id: "RTE018", divisionId: "DIV001", name: "Malegaon to Pune", sourceStopId: "STP009", destinationStopId: "STP030", intermediateStopIds: ["STP008", "STP001", "STP005"] },
  { id: "RTE019", divisionId: "DIV001", name: "Igatpuri to Pune", sourceStopId: "STP011", destinationStopId: "STP031", intermediateStopIds: ["STP050", "STP005"] },
  { id: "RTE020", divisionId: "DIV001", name: "Yeola to Nashik", sourceStopId: "STP021", destinationStopId: "STP001", intermediateStopIds: ["STP022", "STP020"] },
  { id: "RTE021", divisionId: "DIV001", name: "Lasalgaon to Surat", sourceStopId: "STP022", destinationStopId: "STP036", intermediateStopIds: ["STP008", "STP016", "STP017"] },
  { id: "RTE022", divisionId: "DIV001", name: "Sinnar to Pune", sourceStopId: "STP004", destinationStopId: "STP030", intermediateStopIds: ["STP005", "STP046", "STP006"] },
  { id: "RTE023", divisionId: "DIV001", name: "Chandwad to Nashik", sourceStopId: "STP008", destinationStopId: "STP001", intermediateStopIds: ["STP007"] },
  { id: "RTE024", divisionId: "DIV001", name: "Dindori to Pune Swargate", sourceStopId: "STP018", destinationStopId: "STP031", intermediateStopIds: ["STP001", "STP004", "STP005"] },
  { id: "RTE025", divisionId: "DIV001", name: "Nandgaon to Pune", sourceStopId: "STP026", destinationStopId: "STP030", intermediateStopIds: ["STP025", "STP021", "STP033"] }
];

export const INITIAL_BUSES: Bus[] = [
  { id: "BUS001", registration: "MH-15-BD-1021", busType: "Shivshahi", cargoCapacityKg: 80 },
  { id: "BUS002", registration: "MH-15-SH-4421", busType: "E-Shivai", cargoCapacityKg: 80 },
  { id: "BUS003", registration: "MH-15-BG-5512", busType: "Shivshahi", cargoCapacityKg: 80 },
  { id: "BUS004", registration: "MH-15-EP-2099", busType: "Ordinary", cargoCapacityKg: 40 },
  { id: "BUS005", registration: "MH-15-JK-9081", busType: "E-Shivai", cargoCapacityKg: 80 },
  { id: "BUS006", registration: "MH-15-GH-1290", busType: "Semi Luxury", cargoCapacityKg: 60 },
  { id: "BUS007", registration: "MH-15-TR-3341", busType: "Ordinary", cargoCapacityKg: 40 },
  { id: "BUS008", registration: "MH-15-KL-8822", busType: "Ordinary", cargoCapacityKg: 40 },
  { id: "BUS009", registration: "MH-15-ST-6721", busType: "Ordinary", cargoCapacityKg: 40 },
  { id: "BUS010", registration: "MH-15-JM-4100", busType: "Semi Luxury", cargoCapacityKg: 60 },
  { id: "BUS011", registration: "MH-15-AM-7721", busType: "Ordinary", cargoCapacityKg: 40 },
  { id: "BUS012", registration: "MH-15-SG-3112", busType: "Ordinary", cargoCapacityKg: 40 },
  { id: "BUS013", registration: "MH-15-KL-9011", busType: "Ordinary", cargoCapacityKg: 40 },
  { id: "BUS014", registration: "MH-15-SOL-5100", busType: "Semi Luxury", cargoCapacityKg: 60 },
  { id: "BUS015", registration: "MH-15-DH-7012", busType: "Ordinary", cargoCapacityKg: 40 },
  { id: "BUS016", registration: "MH-15-ND-3301", busType: "Ordinary", cargoCapacityKg: 40 },
  { id: "BUS017", registration: "MH-15-NIP-6612", busType: "Ordinary", cargoCapacityKg: 40 },
  { id: "BUS018", registration: "MH-15-MN-2020", busType: "Semi Luxury", cargoCapacityKg: 60 },
  { id: "BUS019", registration: "MH-15-IG-8111", busType: "Ordinary", cargoCapacityKg: 40 },
  { id: "BUS020", registration: "MH-15-YV-4432", busType: "Ordinary", cargoCapacityKg: 40 },
  { id: "BUS021", registration: "MH-15-LS-1088", busType: "Ordinary", cargoCapacityKg: 40 },
  { id: "BUS022", registration: "MH-15-SN-9912", busType: "Ordinary", cargoCapacityKg: 40 },
  { id: "BUS023", registration: "MH-15-CW-3412", busType: "Ordinary", cargoCapacityKg: 40 },
  { id: "BUS024", registration: "MH-15-DN-5050", busType: "Ordinary", cargoCapacityKg: 40 },
  { id: "BUS025", registration: "MH-15-NG-1122", busType: "Ordinary", cargoCapacityKg: 40 },
  { id: "BUS026", registration: "MH-15-ST-2041", busType: "Semi Luxury", cargoCapacityKg: 60 },
  { id: "BUS027", registration: "MH-15-KW-1209", busType: "Ordinary", cargoCapacityKg: 40 },
  { id: "BUS028", registration: "MH-15-MM-7102", busType: "Ordinary", cargoCapacityKg: 40 },
  { id: "BUS029", registration: "MH-15-TH-8901", busType: "Shivshahi", cargoCapacityKg: 80 },
  { id: "BUS030", registration: "MH-15-BH-2309", busType: "Ordinary", cargoCapacityKg: 40 }
];

export const INITIAL_SCHEDULED_TRIPS: ScheduledTrip[] = [
  { id: "TRP001", busId: "BUS001", routeId: "RTE001", departureTime: "06:00", arrivalTime: "11:30", availableCargoCapacityKg: 65, totalCargoCapacityKg: 80, tripStatus: "IN_TRANSIT", currentLocation: { latitude: 19.6012, longitude: 74.2114, betweenStopIds: ["STP004", "STP005"] } },
  { id: "TRP002", busId: "BUS001", routeId: "RTE001", departureTime: "14:30", arrivalTime: "20:00", availableCargoCapacityKg: 80, totalCargoCapacityKg: 80, tripStatus: "SCHEDULED", currentLocation: { latitude: 19.9975, longitude: 73.7898, betweenStopIds: ["STP001", "STP004"] } },
  { id: "TRP003", busId: "BUS002", routeId: "RTE002", departureTime: "07:00", arrivalTime: "11:30", availableCargoCapacityKg: 50, totalCargoCapacityKg: 80, tripStatus: "IN_TRANSIT", currentLocation: { latitude: 20.0245, longitude: 74.5218, betweenStopIds: ["STP021", "STP047"] } },
  { id: "TRP004", busId: "BUS002", routeId: "RTE002", departureTime: "15:00", arrivalTime: "19:30", availableCargoCapacityKg: 80, totalCargoCapacityKg: 80, tripStatus: "SCHEDULED", currentLocation: { latitude: 19.9995, longitude: 73.7852, betweenStopIds: ["STP002", "STP020"] } },
  { id: "TRP005", busId: "BUS003", routeId: "RTE003", departureTime: "08:00", arrivalTime: "12:30", availableCargoCapacityKg: 75, totalCargoCapacityKg: 80, tripStatus: "IN_TRANSIT", currentLocation: { latitude: 19.3412, longitude: 73.1311, betweenStopIds: ["STP012", "STP013"] } },
  { id: "TRP006", busId: "BUS004", routeId: "RTE004", departureTime: "06:30", arrivalTime: "10:30", availableCargoCapacityKg: 30, totalCargoCapacityKg: 40, tripStatus: "IN_TRANSIT", currentLocation: { latitude: 20.5512, longitude: 74.5211, betweenStopIds: ["STP009", "STP010"] } },
  { id: "TRP007", busId: "BUS004", routeId: "RTE004", departureTime: "14:30", arrivalTime: "18:30", availableCargoCapacityKg: 40, totalCargoCapacityKg: 40, tripStatus: "SCHEDULED", currentLocation: { latitude: 19.9995, longitude: 73.7852, betweenStopIds: ["STP002", "STP007"] } },
  { id: "TRP008", busId: "BUS005", routeId: "RTE005", departureTime: "07:30", arrivalTime: "09:45", availableCargoCapacityKg: 60, totalCargoCapacityKg: 80, tripStatus: "IN_TRANSIT", currentLocation: { latitude: 19.8214, longitude: 74.2105, betweenStopIds: ["STP004", "STP032"] } },
  { id: "TRP009", busId: "BUS005", routeId: "RTE005", departureTime: "11:30", arrivalTime: "13:45", availableCargoCapacityKg: 80, totalCargoCapacityKg: 80, tripStatus: "SCHEDULED", currentLocation: { latitude: 19.9882, longitude: 73.7915, betweenStopIds: ["STP003", "STP004"] } },
  { id: "TRP010", busId: "BUS006", routeId: "RTE006", departureTime: "10:45", arrivalTime: "16:30", availableCargoCapacityKg: 45, totalCargoCapacityKg: 60, tripStatus: "IN_TRANSIT", currentLocation: { latitude: 20.8912, longitude: 73.2105, betweenStopIds: ["STP037", "STP038"] } },
  { id: "TRP011", busId: "BUS007", routeId: "RTE007", departureTime: "08:00", arrivalTime: "09:00", availableCargoCapacityKg: 25, totalCargoCapacityKg: 40, tripStatus: "COMPLETED", currentLocation: { latitude: 19.9323, longitude: 73.5303, betweenStopIds: ["STP024", "STP023"] } },
  { id: "TRP012", busId: "BUS007", routeId: "RTE007", departureTime: "11:00", arrivalTime: "12:00", availableCargoCapacityKg: 40, totalCargoCapacityKg: 40, tripStatus: "SCHEDULED", currentLocation: { latitude: 19.9975, longitude: 73.7898, betweenStopIds: ["STP001", "STP024"] } },
  { id: "TRP013", busId: "BUS008", routeId: "RTE008", departureTime: "09:30", arrivalTime: "11:45", availableCargoCapacityKg: 20, totalCargoCapacityKg: 40, tripStatus: "IN_TRANSIT", currentLocation: { latitude: 20.3105, longitude: 73.8322, betweenStopIds: ["STP018", "STP019"] } },
  { id: "TRP014", busId: "BUS009", routeId: "RTE009", departureTime: "10:30", arrivalTime: "13:00", availableCargoCapacityKg: 35, totalCargoCapacityKg: 40, tripStatus: "IN_TRANSIT", currentLocation: { latitude: 20.5102, longitude: 74.1215, betweenStopIds: ["STP016", "STP017"] } },
  { id: "TRP015", busId: "BUS010", routeId: "RTE010", departureTime: "07:00", arrivalTime: "12:30", availableCargoCapacityKg: 40, totalCargoCapacityKg: 60, tripStatus: "IN_TRANSIT", currentLocation: { latitude: 20.9122, longitude: 75.2514, betweenStopIds: ["STP010", "STP028"] } }
];

export const INITIAL_COURIER_COMPANIES: CourierCompany[] = [
  {
    id: "c0000000-0000-0000-0000-000000000001",
    name: "BlueDart Express",
    legalName: "Blue Dart Express Limited",
    code: "BLUEDART",
    contactEmail: "dispatch@bluedart.com",
    contactPhone: "+91 98230 11223",
    creditLimit: 250000,
    usedCredit: 34500,
    address: "Plot 12, MIDC Ambad",
    city: "Nashik",
    state: "Maharashtra",
    gstin: "27AAACB0000A1Z5",
    status: "ACTIVE",
    createdAt: "2026-08-01T10:00:00Z"
  },
  {
    id: "c0000000-0000-0000-0000-000000000002",
    name: "Delhivery Logistics",
    legalName: "Delhivery Private Limited",
    code: "DELHIVERY",
    contactEmail: "ops@delhivery.com",
    contactPhone: "+91 98190 44556",
    creditLimit: 200000,
    usedCredit: 18200,
    address: "Block B, Hadapsar Industrial Estate",
    city: "Pune",
    state: "Maharashtra",
    gstin: "27AAACD9999B1Z2",
    status: "ACTIVE",
    createdAt: "2026-08-05T11:30:00Z"
  },
  {
    id: "c0000000-0000-0000-0000-000000000003",
    name: "DTDC Express India",
    legalName: "DTDC Express India Limited",
    code: "DTDC",
    contactEmail: "support@dtdc.in",
    contactPhone: "+91 97650 77889",
    creditLimit: 150000,
    usedCredit: 9800,
    address: "Station Road",
    city: "Chhatrapati Sambhajinagar",
    state: "Maharashtra",
    gstin: "27AAACD1234C1Z9",
    status: "ACTIVE",
    createdAt: "2026-08-08T09:15:00Z"
  },
  {
    id: "c0000000-0000-0000-0000-000000000004",
    name: "SwiftLog Logistics",
    legalName: "SwiftLog Parcel Services Pvt Ltd",
    code: "SWIFTLOG",
    contactEmail: "contact@swiftlog.in",
    contactPhone: "+91 98221 55443",
    creditLimit: 100000,
    usedCredit: 0,
    address: "7th Lane, Shivaji Nagar",
    city: "Pune",
    state: "Maharashtra",
    gstin: "27AABCS8811P1Z4",
    status: "PENDING",
    createdAt: "2026-08-12T04:20:00Z"
  },
  {
    id: "c0000000-0000-0000-0000-000000000005",
    name: "Apex Couriers",
    legalName: "Apex IntraCity Express",
    code: "APEX",
    contactEmail: "admin@apexcouriers.com",
    contactPhone: "+91 97110 33221",
    creditLimit: 50000,
    usedCredit: 0,
    address: "Transport Nagar",
    city: "Nagpur",
    state: "Maharashtra",
    gstin: "27AABCA4433E1Z1",
    status: "REJECTED",
    rejectionReason: "Incomplete GST documentation provided.",
    createdAt: "2026-08-10T14:10:00Z"
  }
];

export const DEMO_USER_PROFILES: UserProfile[] = [
  {
    id: "usr-admin-01",
    email: "admin@msrtc.gov.in",
    fullName: "Rajesh Patil (MSRTC Network Controller)",
    role: "SUPER_ADMIN",
    depotId: "DEP001",
    depotName: "Nashik CBS Control Division"
  },
  {
    id: "usr-courier-01",
    email: "dispatch@bluedart.com",
    fullName: "Amit Deshmukh (BlueDart Logistics Lead)",
    role: "COURIER_PARTNER",
    companyId: "c0000000-0000-0000-0000-000000000001",
    companyName: "BlueDart Express",
    companyStatus: "ACTIVE"
  },
  {
    id: "usr-courier-pending",
    email: "contact@swiftlog.in",
    fullName: "Priya Sharma (SwiftLog Operations Manager)",
    role: "COURIER_PARTNER",
    companyId: "c0000000-0000-0000-0000-000000000004",
    companyName: "SwiftLog Logistics",
    companyStatus: "PENDING"
  },
  {
    id: "usr-courier-rejected",
    email: "admin@apexcouriers.com",
    fullName: "Vikram Mehta (Apex Transport Owner)",
    role: "COURIER_PARTNER",
    companyId: "c0000000-0000-0000-0000-000000000005",
    companyName: "Apex Couriers",
    companyStatus: "REJECTED"
  },
  {
    id: "usr-conductor-01",
    email: "conductor.nashik@msrtc.gov.in",
    fullName: "Suresh Pawar (Bus #MH-15-BD-1021 Conductor)",
    role: "CONDUCTOR",
    depotId: "DEP001",
    depotName: "Nashik CBS Depot"
  }
];

// Demo Simulation Constants
export const DEMO_ACTIVE_TASK_ID = 'shp-482';
export const DEMO_CACHED_TASK_ID = 'shp-470';
export const DEMO_UNCACHED_TASK_IDS = ['shp-471', 'shp-472', 'shp-475'];

export const DEMO_ACTIVE_SHIPMENT: Shipment = {
  id: "shp-482",
  waybillNumber: "WB-2026-KPG-0482",
  courierCompanyId: "c0000000-0000-0000-0000-000000000001",
  courierCompanyName: "BlueDart Express",
  senderName: "Sahyadri Agro Export Hub (Nashik CBS)",
  senderPhone: "+91 98221 44551",
  receiverName: "Kopargaon APMC Mandi / Pune Agro Terminal",
  receiverPhone: "+91 98901 22334",
  originStopId: "STP001",
  destinationStopId: "STP030",
  weightKg: 120.0,
  dimensionsCm: "80 x 60 x 50",
  declaredValue: 65000,
  status: "IN_TRANSIT",
  qrCodeHash: "CF-QR-482-KP003-MH15BD1021",
  tripId: "TRP001",
  fareAmount: 1450,
  createdAt: "2026-08-29T10:20:00.000Z",
  statusHistory: [
    {
      status: "RESERVED",
      timestamp: "2026-08-29T10:20:00.000Z",
      location: "Nashik CBS Booking Bay",
      remarks: "Task created & cargo reserved on Bus KP003 (Server confirmed)"
    },
    {
      status: "LOADED",
      timestamp: "2026-08-29T10:25:00.000Z",
      location: "Nashik CBS Platform 4",
      remarks: "Assigned & verified by Conductor Suresh Pawar (Server confirmed)"
    },
    {
      status: "IN_TRANSIT",
      timestamp: "2026-08-29T10:30:00.000Z",
      location: "Nashik CBS Departure Gate",
      remarks: "Pickup confirmed, departed toward Kopargaon APMC (Server confirmed)"
    }
  ]
};

export const DEMO_CACHED_SHIPMENT: Shipment = {
  id: "shp-470",
  waybillNumber: "WB-2026-NSH-0470",
  courierCompanyId: "c0000000-0000-0000-0000-000000000002",
  courierCompanyName: "Delhivery Logistics",
  senderName: "Nashik Engineering Tools",
  senderPhone: "+91 98220 99881",
  receiverName: "Sangamner Industrial Hub",
  receiverPhone: "+91 94220 11223",
  originStopId: "STP001",
  destinationStopId: "STP005",
  weightKg: 45.0,
  dimensionsCm: "50 x 40 x 30",
  declaredValue: 32000,
  status: "IN_TRANSIT",
  qrCodeHash: "CF-QR-470-MH15BD1021",
  tripId: "TRP001",
  fareAmount: 520,
  createdAt: "2026-08-29T08:15:00.000Z",
  statusHistory: [
    {
      status: "RESERVED",
      timestamp: "2026-08-29T08:15:00.000Z",
      location: "Nashik CBS Depot",
      remarks: "Initial reservation confirmed"
    },
    {
      status: "IN_TRANSIT",
      timestamp: "2026-08-29T10:18:00.000Z",
      location: "Sinnar Toll Gate",
      remarks: "Last synchronized checkpoint data (10:18 AM)"
    }
  ]
};

export const DEMO_BACKEND_ONLY_SHIPMENTS: Shipment[] = [
  {
    id: "shp-471",
    waybillNumber: "WB-2026-PUN-0471",
    courierCompanyId: "c0000000-0000-0000-0000-000000000001",
    courierCompanyName: "BlueDart Express",
    senderName: "Pune Precision Bearings",
    senderPhone: "+91 98230 44556",
    receiverName: "Nashik Auto Ancillary",
    receiverPhone: "+91 98110 22334",
    originStopId: "STP030",
    destinationStopId: "STP001",
    weightKg: 28.0,
    dimensionsCm: "35 x 30 x 20",
    declaredValue: 21000,
    status: "DELIVERED",
    qrCodeHash: "CF-QR-471-MH15GH1290",
    tripId: "TRP006",
    fareAmount: 410,
    createdAt: "2026-08-26T09:30:00.000Z",
    statusHistory: [
      {
        status: "DELIVERED",
        timestamp: "2026-08-26T15:30:00.000Z",
        location: "Nashik CBS Counter",
        remarks: "Historical delivered record (Backend datastore only)"
      }
    ]
  },
  {
    id: "shp-472",
    waybillNumber: "WB-2026-AUR-0472",
    courierCompanyId: "c0000000-0000-0000-0000-000000000003",
    courierCompanyName: "DTDC Express India",
    senderName: "Aurangabad Pharma Supplies",
    senderPhone: "+91 97650 33441",
    receiverName: "Nashik Civil Hospital Bay",
    receiverPhone: "+91 94221 88990",
    originStopId: "STP034",
    destinationStopId: "STP002",
    weightKg: 18.0,
    dimensionsCm: "30 x 25 x 20",
    declaredValue: 55000,
    status: "DELIVERED",
    qrCodeHash: "CF-QR-472-MH15SH4421",
    tripId: "TRP003",
    fareAmount: 380,
    createdAt: "2026-08-25T11:00:00.000Z",
    statusHistory: [
      {
        status: "DELIVERED",
        timestamp: "2026-08-25T17:00:00.000Z",
        location: "Nashik Mela Stand",
        remarks: "Delivered parcel (Backend datastore only)"
      }
    ]
  },
  {
    id: "shp-475",
    waybillNumber: "WB-2026-MUM-0475",
    courierCompanyId: "c0000000-0000-0000-0000-000000000001",
    courierCompanyName: "BlueDart Express",
    senderName: "Mumbai Electronics Hub",
    senderPhone: "+91 98200 44332",
    receiverName: "Nashik Telecom Repairs",
    receiverPhone: "+91 98221 66554",
    originStopId: "STP014",
    destinationStopId: "STP003",
    weightKg: 12.0,
    dimensionsCm: "25 x 25 x 15",
    declaredValue: 42000,
    status: "DELIVERED",
    qrCodeHash: "CF-QR-475-MH15BG5512",
    tripId: "TRP005",
    fareAmount: 290,
    createdAt: "2026-08-24T14:00:00.000Z",
    statusHistory: [
      {
        status: "DELIVERED",
        timestamp: "2026-08-24T19:30:00.000Z",
        location: "Mahamarg Nashik",
        remarks: "Archived ledger entry (Backend datastore only)"
      }
    ]
  }
];

export const INITIAL_SHIPMENTS: Shipment[] = [
  DEMO_ACTIVE_SHIPMENT,
  DEMO_CACHED_SHIPMENT,
  ...DEMO_BACKEND_ONLY_SHIPMENTS,
  {
    id: "shp-1001",
    waybillNumber: "WB-2026-NSS-0891",
    courierCompanyId: "c0000000-0000-0000-0000-000000000001",
    courierCompanyName: "BlueDart Express",
    senderName: "Sahyadri Agro Tech",
    senderPhone: "+91 98221 44551",
    receiverName: "Kirloskar Pumps Pune",
    receiverPhone: "+91 98901 22334",
    originStopId: "STP001",
    destinationStopId: "STP030",
    weightKg: 15.0,
    dimensionsCm: "40 x 30 x 25",
    declaredValue: 24500,
    status: "IN_TRANSIT",
    qrCodeHash: "CF-QR-891-MH15BD1021",
    tripId: "TRP001",
    fareAmount: 450,
    createdAt: "2026-08-27T10:00:00.000Z",
    statusHistory: [
      { status: "RESERVED", timestamp: "2026-08-27T09:00:00.000Z", location: "Nashik CBS Office", remarks: "Capacity reserved on TRP001" },
      { status: "LOADED", timestamp: "2026-08-27T10:30:00.000Z", location: "Nashik CBS Depot Bay 4", remarks: "Scanned by Conductor Suresh Pawar" },
      { status: "IN_TRANSIT", timestamp: "2026-08-27T12:00:00.000Z", location: "En-Route (Near Sangamner)", remarks: "Bus MH-15-BD-1021 in transit" }
    ]
  },
  {
    id: "shp-1002",
    waybillNumber: "WB-2026-NSM-0412",
    courierCompanyId: "c0000000-0000-0000-0000-000000000002",
    courierCompanyName: "Delhivery Logistics",
    senderName: "Nashik Vineyard Supplies",
    senderPhone: "+91 97631 88990",
    receiverName: "Sula Wines Outlet Sambhajinagar",
    receiverPhone: "+91 94220 55667",
    originStopId: "STP002",
    destinationStopId: "STP034",
    weightKg: 30.0,
    dimensionsCm: "60 x 50 x 40",
    declaredValue: 48000,
    status: "LOADED",
    qrCodeHash: "CF-QR-412-MH15SH4421",
    tripId: "TRP003",
    fareAmount: 780,
    createdAt: "2026-08-27T11:00:00.000Z",
    statusHistory: [
      { status: "RESERVED", timestamp: "2026-08-27T10:00:00.000Z", location: "Nashik Mela Counter", remarks: "Capacity reserved on TRP003" },
      { status: "LOADED", timestamp: "2026-08-27T12:30:00.000Z", location: "Nashik Mela Bus Stand", remarks: "Verified & loaded into E-Shivai hold" }
    ]
  },
  {
    id: "shp-1003",
    waybillNumber: "WB-2026-NSB-0734",
    courierCompanyId: "c0000000-0000-0000-0000-000000000001",
    courierCompanyName: "BlueDart Express",
    senderName: "Hindustan Engineering Satpur",
    senderPhone: "+91 91580 33445",
    receiverName: "L&T Defense Borivali",
    receiverPhone: "+91 98200 99887",
    originStopId: "STP003",
    destinationStopId: "STP014",
    weightKg: 5.0,
    dimensionsCm: "20 x 20 x 15",
    declaredValue: 12000,
    status: "RESERVED",
    qrCodeHash: "CF-QR-734-MH15BG5512",
    tripId: "TRP005",
    fareAmount: 220,
    createdAt: "2026-08-27T12:00:00.000Z",
    statusHistory: [
      { status: "RESERVED", timestamp: "2026-08-27T12:00:00.000Z", location: "Mahamarg Nashik Depot", remarks: "Awaiting departure at 08:00 AM" }
    ]
  }
];
