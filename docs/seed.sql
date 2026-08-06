-- CargoFlow Production Dataset Seed Script (MSRTC Nashik Division)
-- Source: MSRTC Official Timetables + Network Graph Data

BEGIN;

-- 1. Division Seed
INSERT INTO divisions (id, name) VALUES
('DIV001', 'Nashik')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 2. Bus Stops Seed
INSERT INTO stops (id, name, latitude, longitude) VALUES
('STP001', 'Nashik CBS', 19.9975, 73.7898),
('STP002', 'Nashik Mela', 19.9995, 73.7852),
('STP003', 'Mahamarg Nashik', 19.9882, 73.7915),
('STP004', 'Sinnar', 19.8454, 73.9984),
('STP005', 'Sangamner', 19.5761, 74.2072),
('STP006', 'Narayangaon', 19.1171, 73.9802),
('STP007', 'Pimpalgaon Baswant', 20.1706, 73.9875),
('STP008', 'Chandwad', 20.3282, 74.2435),
('STP009', 'Malegaon', 20.5529, 74.5276),
('STP010', 'Dhule', 20.9042, 74.7749),
('STP011', 'Igatpuri', 19.6953, 73.5606),
('STP012', 'Kasara', 19.6468, 73.4831),
('STP013', 'Thane', 19.1860, 72.9759),
('STP014', 'Borivali', 19.2291, 72.8572),
('STP015', 'Kalwan', 20.4851, 73.8329),
('STP016', 'Devla', 20.4631, 74.1852),
('STP017', 'Satana', 20.5925, 74.2024),
('STP018', 'Dindori', 20.2036, 73.8311),
('STP019', 'Vani', 20.3475, 73.8942),
('STP020', 'Niphad', 20.0784, 74.1077),
('STP021', 'Yeola', 20.0421, 74.4883),
('STP022', 'Lasalgaon', 20.1471, 74.2301),
('STP023', 'Trimbakeshwar', 19.9323, 73.5303),
('STP024', 'Satpur', 19.9992, 73.7381),
('STP025', 'Manmad', 20.2522, 74.4385),
('STP026', 'Nandgaon', 20.3121, 74.6592),
('STP027', 'Jalgaon', 21.0077, 75.5626),
('STP028', 'Erandol', 20.9142, 75.3321),
('STP029', 'Bhusawal', 21.0452, 75.7891),
('STP030', 'Pune Shivajinagar', 18.5314, 73.8446),
('STP031', 'Pune Swargate', 18.5018, 73.8636),
('STP032', 'Shirdi', 19.7645, 74.4762),
('STP033', 'Ahmednagar Tarakpur', 19.1022, 74.7314),
('STP034', 'Chhatrapati Sambhajinagar', 19.8762, 75.3433),
('STP035', 'Solapur', 17.6599, 75.9064),
('STP036', 'Surat', 21.2052, 72.8408),
('STP037', 'Vapi', 20.3719, 72.9043),
('STP038', 'Navsari', 20.9467, 72.9520),
('STP039', 'Kalyan', 19.2354, 73.1299),
('STP040', 'Dahanu', 19.9712, 72.7331),
('STP041', 'Jawahar', 19.9073, 73.2301),
('STP042', 'Palghar', 19.6967, 72.7699),
('STP043', 'Manor', 19.7312, 72.9102),
('STP044', 'Nandurbar', 21.3712, 74.2415),
('STP045', 'Saptashrungi Gad', 20.3881, 73.9056),
('STP046', 'Alephata', 19.1171, 74.1021),
('STP047', 'Vaijapur', 19.9264, 74.7297),
('STP048', 'Rahuri', 19.3908, 74.6508),
('STP049', 'Tembhurni', 18.0614, 75.2012),
('STP050', 'Bhandardara', 19.5422, 73.7654)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;

-- 3. Depots Seed
INSERT INTO depots (id, division_id, name, stop_id) VALUES
('DEP001', 'DIV001', 'Nashik CBS Depot', 'STP001'),
('DEP002', 'DIV001', 'Nashik Mela Bus Stand', 'STP002'),
('DEP003', 'DIV001', 'Mahamarg Bus Stand Nashik', 'STP003'),
('DEP004', 'DIV001', 'Pimpalgaon Baswant Depot', 'STP007'),
('DEP005', 'DIV001', 'Malegaon New Bus Stand', 'STP009'),
('DEP006', 'DIV001', 'Satana Bus Depot', 'STP017'),
('DEP007', 'DIV001', 'Kalwan Bus Depot', 'STP015'),
('DEP008', 'DIV001', 'Lasalgaon Bus Depot', 'STP022'),
('DEP009', 'DIV001', 'Sinnar Bus Stand', 'STP004'),
('DEP010', 'DIV001', 'Igatpuri Bus Station', 'STP011')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 4. Routes Seed
INSERT INTO routes (id, division_id, name, source_stop_id, destination_stop_id) VALUES
('RTE001', 'DIV001', 'Nashik to Pune (Shivaji Nagar)', 'STP001', 'STP030'),
('RTE002', 'DIV001', 'Nashik to Chhatrapati Sambhajinagar', 'STP002', 'STP034'),
('RTE003', 'DIV001', 'Nashik to Borivali', 'STP003', 'STP014'),
('RTE004', 'DIV001', 'Nashik to Dhule', 'STP002', 'STP010'),
('RTE005', 'DIV001', 'Nashik to Shirdi', 'STP003', 'STP032'),
('RTE006', 'DIV001', 'Nashik to Surat', 'STP003', 'STP036'),
('RTE007', 'DIV001', 'Nashik CBS to Trimbakeshwar', 'STP001', 'STP023'),
('RTE008', 'DIV001', 'Nashik CBS to Kalwan', 'STP001', 'STP015'),
('RTE009', 'DIV001', 'Nashik CBS to Satana', 'STP001', 'STP017'),
('RTE010', 'DIV001', 'Nashik to Jalgaon', 'STP002', 'STP027'),
('RTE011', 'DIV001', 'Nashik to Ahmednagar', 'STP003', 'STP033'),
('RTE012', 'DIV001', 'Nashik CBS to Saptashrungi Gad', 'STP001', 'STP045'),
('RTE013', 'DIV001', 'Nashik to Kalyan', 'STP003', 'STP039'),
('RTE014', 'DIV001', 'Nashik to Solapur', 'STP003', 'STP035'),
('RTE015', 'DIV001', 'Nashik to Dahanu', 'STP003', 'STP040'),
('RTE016', 'DIV001', 'Nashik to Nandurbar', 'STP003', 'STP044'),
('RTE017', 'DIV001', 'Pimpalgaon to Pune Swargate', 'STP007', 'STP031'),
('RTE018', 'DIV001', 'Malegaon to Pune', 'STP009', 'STP030'),
('RTE019', 'DIV001', 'Igatpuri to Pune', 'STP011', 'STP031'),
('RTE020', 'DIV001', 'Yeola to Nashik', 'STP021', 'STP001'),
('RTE021', 'DIV001', 'Lasalgaon to Surat', 'STP022', 'STP036'),
('RTE022', 'DIV001', 'Sinnar to Pune', 'STP004', 'STP030'),
('RTE023', 'DIV001', 'Chandwad to Nashik', 'STP008', 'STP001'),
('RTE024', 'DIV001', 'Dindori to Pune Swargate', 'STP018', 'STP031'),
('RTE025', 'DIV001', 'Nandgaon to Pune', 'STP026', 'STP030')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 5. Route Stops Sequence Seed
-- RTE001: STP001 -> STP004 -> STP005 -> STP006 -> STP030
INSERT INTO route_stops (route_id, stop_id, stop_order) VALUES
('RTE001', 'STP001', 1), ('RTE001', 'STP004', 2), ('RTE001', 'STP005', 3), ('RTE001', 'STP006', 4), ('RTE001', 'STP030', 5),
-- RTE002: STP002 -> STP020 -> STP021 -> STP047 -> STP034
('RTE002', 'STP002', 1), ('RTE002', 'STP020', 2), ('RTE002', 'STP021', 3), ('RTE002', 'STP047', 4), ('RTE002', 'STP034', 5),
-- RTE003: STP003 -> STP011 -> STP012 -> STP013 -> STP014
('RTE003', 'STP003', 1), ('RTE003', 'STP011', 2), ('RTE003', 'STP012', 3), ('RTE003', 'STP013', 4), ('RTE003', 'STP014', 5),
-- RTE004: STP002 -> STP007 -> STP008 -> STP009 -> STP010
('RTE004', 'STP002', 1), ('RTE004', 'STP007', 2), ('RTE004', 'STP008', 3), ('RTE004', 'STP009', 4), ('RTE004', 'STP010', 5)
ON CONFLICT (route_id, stop_order) DO UPDATE SET stop_id = EXCLUDED.stop_id;

-- 6. Buses Seed
INSERT INTO buses (id, registration, bus_type, cargo_capacity_kg) VALUES
('BUS001', 'MH-15-BD-1021', 'Shivshahi', 80.00),
('BUS002', 'MH-15-SH-4421', 'E-Shivai', 80.00),
('BUS003', 'MH-15-BG-5512', 'Shivshahi', 80.00),
('BUS004', 'MH-15-EP-2099', 'Ordinary', 40.00),
('BUS005', 'MH-15-JK-9081', 'E-Shivai', 80.00),
('BUS006', 'MH-15-GH-1290', 'Semi Luxury', 60.00),
('BUS007', 'MH-15-TR-3341', 'Ordinary', 40.00),
('BUS008', 'MH-15-KL-8822', 'Ordinary', 40.00),
('BUS009', 'MH-15-ST-6721', 'Ordinary', 40.00),
('BUS010', 'MH-15-JM-4100', 'Semi Luxury', 60.00),
('BUS011', 'MH-15-AM-7721', 'Ordinary', 40.00),
('BUS012', 'MH-15-SG-3112', 'Ordinary', 40.00),
('BUS013', 'MH-15-KL-9011', 'Ordinary', 40.00),
('BUS014', 'MH-15-SOL-5100', 'Semi Luxury', 60.00),
('BUS015', 'MH-15-DH-7012', 'Ordinary', 40.00),
('BUS016', 'MH-15-ND-3301', 'Ordinary', 40.00),
('BUS017', 'MH-15-NIP-6612', 'Ordinary', 40.00),
('BUS018', 'MH-15-MN-2020', 'Semi Luxury', 60.00),
('BUS019', 'MH-15-IG-8111', 'Ordinary', 40.00),
('BUS020', 'MH-15-YV-4432', 'Ordinary', 40.00),
('BUS021', 'MH-15-LS-1088', 'Ordinary', 40.00),
('BUS022', 'MH-15-SN-9912', 'Ordinary', 40.00),
('BUS023', 'MH-15-CW-3412', 'Ordinary', 40.00),
('BUS024', 'MH-15-DN-5050', 'Ordinary', 40.00),
('BUS025', 'MH-15-NG-1122', 'Ordinary', 40.00),
('BUS026', 'MH-15-ST-2041', 'Semi Luxury', 60.00),
('BUS027', 'MH-15-KW-1209', 'Ordinary', 40.00),
('BUS028', 'MH-15-MM-7102', 'Ordinary', 40.00),
('BUS029', 'MH-15-TH-8901', 'Shivshahi', 80.00),
('BUS030', 'MH-15-BH-2309', 'Ordinary', 40.00)
ON CONFLICT (id) DO UPDATE SET registration = EXCLUDED.registration;

-- 7. Courier Companies Seed
INSERT INTO courier_companies (id, name, code, contact_email, contact_phone, credit_limit) VALUES
('c0000000-0000-0000-0000-000000000001', 'BlueDart Express', 'BLUEDART', 'dispatch@bluedart.com', '+91 98230 11223', 250000.00),
('c0000000-0000-0000-0000-000000000002', 'Delhivery Logistics', 'DELHIVERY', 'ops@delhivery.com', '+91 98190 44556', 200000.00),
('c0000000-0000-0000-0000-000000000003', 'DTDC Express India', 'DTDC', 'support@dtdc.in', '+91 97650 77889', 150000.00)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 8. Scheduled Trips Seed
INSERT INTO scheduled_trips (id, bus_id, route_id, departure_time, arrival_time, total_cargo_capacity_kg, available_cargo_capacity_kg, trip_status, current_latitude, current_longitude, current_between_stop_a_id, current_between_stop_b_id) VALUES
('TRP001', 'BUS001', 'RTE001', '06:00', '11:30', 80.00, 65.00, 'IN_TRANSIT', 19.6012, 74.2114, 'STP004', 'STP005'),
('TRP002', 'BUS001', 'RTE001', '14:30', '20:00', 80.00, 80.00, 'SCHEDULED', 19.9975, 73.7898, 'STP001', 'STP004'),
('TRP003', 'BUS002', 'RTE002', '07:00', '11:30', 80.00, 50.00, 'IN_TRANSIT', 20.0245, 74.5218, 'STP021', 'STP047'),
('TRP004', 'BUS002', 'RTE002', '15:00', '19:30', 80.00, 80.00, 'SCHEDULED', 19.9995, 73.7852, 'STP002', 'STP020'),
('TRP005', 'BUS003', 'RTE003', '08:00', '12:30', 80.00, 75.00, 'IN_TRANSIT', 19.3412, 73.1311, 'STP012', 'STP013'),
('TRP006', 'BUS004', 'RTE004', '06:30', '10:30', 40.00, 30.00, 'IN_TRANSIT', 20.5512, 74.5211, 'STP009', 'STP010'),
('TRP007', 'BUS004', 'RTE004', '14:30', '18:30', 40.00, 40.00, 'SCHEDULED', 19.9995, 73.7852, 'STP002', 'STP007'),
('TRP008', 'BUS005', 'RTE005', '07:30', '09:45', 80.00, 60.00, 'IN_TRANSIT', 19.8214, 74.2105, 'STP004', 'STP032'),
('TRP009', 'BUS005', 'RTE005', '11:30', '13:45', 80.00, 80.00, 'SCHEDULED', 19.9882, 73.7915, 'STP003', 'STP004'),
('TRP010', 'BUS006', 'RTE006', '10:45', '16:30', 60.00, 45.00, 'IN_TRANSIT', 20.8912, 73.2105, 'STP037', 'STP038'),
('TRP011', 'BUS007', 'RTE007', '08:00', '09:00', 40.00, 25.00, 'COMPLETED', 19.9323, 73.5303, 'STP024', 'STP023'),
('TRP012', 'BUS007', 'RTE007', '11:00', '12:00', 40.00, 40.00, 'SCHEDULED', 19.9975, 73.7898, 'STP001', 'STP024'),
('TRP013', 'BUS008', 'RTE008', '09:30', '11:45', 40.00, 20.00, 'IN_TRANSIT', 20.3105, 73.8322, 'STP018', 'STP019'),
('TRP014', 'BUS009', 'RTE009', '10:30', '13:00', 40.00, 35.00, 'IN_TRANSIT', 20.5102, 74.1215, 'STP016', 'STP017'),
('TRP015', 'BUS010', 'RTE010', '07:00', '12:30', 60.00, 40.00, 'IN_TRANSIT', 20.9122, 75.2514, 'STP010', 'STP028')
ON CONFLICT (id) DO UPDATE SET available_cargo_capacity_kg = EXCLUDED.available_cargo_capacity_kg, trip_status = EXCLUDED.trip_status;

COMMIT;
