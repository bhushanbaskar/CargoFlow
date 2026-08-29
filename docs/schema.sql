-- CargoFlow Production Database Schema (Supabase PostgreSQL Compatible)
-- Version 1.0 - Frozen MVP Schema

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom Type Definitions
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'COURIER_PARTNER', 'CONDUCTOR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE trip_status AS ENUM ('SCHEDULED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE shipment_status AS ENUM ('DRAFT', 'RESERVED', 'LOADED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Administrative Divisions
CREATE TABLE IF NOT EXISTS divisions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Network Bus Stops / Terminals
CREATE TABLE IF NOT EXISTS stops (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    latitude NUMERIC(9,6) NOT NULL,
    longitude NUMERIC(9,6) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. MSRTC Depots
CREATE TABLE IF NOT EXISTS depots (
    id TEXT PRIMARY KEY,
    division_id TEXT NOT NULL REFERENCES divisions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    stop_id TEXT REFERENCES stops(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Route Definitions
CREATE TABLE IF NOT EXISTS routes (
    id TEXT PRIMARY KEY,
    division_id TEXT NOT NULL REFERENCES divisions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    source_stop_id TEXT NOT NULL REFERENCES stops(id),
    destination_stop_id TEXT NOT NULL REFERENCES stops(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Route Stops Sequence
CREATE TABLE IF NOT EXISTS route_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id TEXT NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    stop_id TEXT NOT NULL REFERENCES stops(id) ON DELETE CASCADE,
    stop_order INT NOT NULL,
    CONSTRAINT unique_route_stop_order UNIQUE (route_id, stop_order)
);

-- 6. Bus Fleet Inventory
CREATE TABLE IF NOT EXISTS buses (
    id TEXT PRIMARY KEY,
    registration TEXT NOT NULL UNIQUE,
    bus_type TEXT NOT NULL, -- e.g. Ordinary, Semi Luxury, Shivshahi, E-Shivai
    cargo_capacity_kg NUMERIC(8,2) NOT NULL DEFAULT 40.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Registered Courier Companies
CREATE TABLE IF NOT EXISTS courier_companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    legal_name TEXT,
    code TEXT NOT NULL UNIQUE,
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT DEFAULT 'Maharashtra',
    gstin TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, ACTIVE, REJECTED
    credit_limit NUMERIC(12,2) NOT NULL DEFAULT 100000.00,
    used_credit NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. User Profiles (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'COURIER_PARTNER',
    phone TEXT,
    company_id UUID REFERENCES courier_companies(id) ON DELETE SET NULL,
    depot_id TEXT REFERENCES depots(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Conductors Staff Information
CREATE TABLE IF NOT EXISTS conductors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    employee_id TEXT NOT NULL UNIQUE,
    assigned_depot_id TEXT REFERENCES depots(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Scheduled Trips & Capacity
CREATE TABLE IF NOT EXISTS scheduled_trips (
    id TEXT PRIMARY KEY,
    bus_id TEXT NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
    route_id TEXT NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    total_cargo_capacity_kg NUMERIC(8,2) NOT NULL,
    available_cargo_capacity_kg NUMERIC(8,2) NOT NULL,
    trip_status trip_status NOT NULL DEFAULT 'SCHEDULED',
    booking_cutoff_minutes INT NOT NULL DEFAULT 30,
    current_latitude NUMERIC(9,6),
    current_longitude NUMERIC(9,6),
    current_between_stop_a_id TEXT REFERENCES stops(id),
    current_between_stop_b_id TEXT REFERENCES stops(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Shipments / Cargo Waybills
CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    waybill_number TEXT NOT NULL UNIQUE,
    courier_company_id UUID NOT NULL REFERENCES courier_companies(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    sender_phone TEXT NOT NULL,
    receiver_name TEXT NOT NULL,
    receiver_phone TEXT NOT NULL,
    origin_stop_id TEXT NOT NULL REFERENCES stops(id),
    destination_stop_id TEXT NOT NULL REFERENCES stops(id),
    weight_kg NUMERIC(8,2) NOT NULL,
    dimensions_cm TEXT,
    declared_value NUMERIC(10,2) DEFAULT 0.00,
    status shipment_status NOT NULL DEFAULT 'RESERVED',
    qr_code_hash TEXT NOT NULL UNIQUE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Shipment Trip Reservations
CREATE TABLE IF NOT EXISTS shipment_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    trip_id TEXT NOT NULL REFERENCES scheduled_trips(id) ON DELETE CASCADE,
    reserved_capacity_kg NUMERIC(8,2) NOT NULL,
    fare_amount NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Shipment Tracking History Logs
CREATE TABLE IF NOT EXISTS shipment_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    status shipment_status NOT NULL,
    location_note TEXT,
    remarks TEXT,
    updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. Simplified Invoices (MVP)
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL UNIQUE,
    courier_company_id UUID NOT NULL REFERENCES courier_companies(id) ON DELETE CASCADE,
    shipment_id UUID REFERENCES shipments(id) ON DELETE SET NULL,
    total_amount NUMERIC(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'UNPAID', -- UNPAID, PAID, CANCELLED
    due_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- INDEXES FOR OPTIMAL QUERY PERFORMANCE
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_depots_division ON depots(division_id);
CREATE INDEX IF NOT EXISTS idx_routes_division ON routes(division_id);
CREATE INDEX IF NOT EXISTS idx_route_stops_route_order ON route_stops(route_id, stop_order);
CREATE INDEX IF NOT EXISTS idx_scheduled_trips_route ON scheduled_trips(route_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_trips_bus ON scheduled_trips(bus_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_trips_status ON scheduled_trips(trip_status);
CREATE INDEX IF NOT EXISTS idx_shipments_company ON shipments(courier_company_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_waybill ON shipments(waybill_number);
CREATE INDEX IF NOT EXISTS idx_reservations_trip ON shipment_reservations(trip_id);
CREATE INDEX IF NOT EXISTS idx_reservations_shipment ON shipment_reservations(shipment_id);
CREATE INDEX IF NOT EXISTS idx_status_history_shipment ON shipment_status_history(shipment_id);

-- =========================================================
-- AUTOMATED UPDATED_AT TRIGGER
-- =========================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION update_updated_at_column() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER update_shipments_updated_at
    BEFORE UPDATE ON shipments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courier_companies_updated_at
    BEFORE UPDATE ON courier_companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE depots ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE courier_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE conductors ENABLE ROW LEVEL SECURITY;

-- Read policies for public reference master data (routes, stops, trips, buses)
CREATE POLICY "Public read for network master data" ON stops FOR SELECT USING (true);
CREATE POLICY "Public read for divisions" ON divisions FOR SELECT USING (true);
CREATE POLICY "Public read for depots" ON depots FOR SELECT USING (true);
CREATE POLICY "Public read for routes" ON routes FOR SELECT USING (true);
CREATE POLICY "Public read for route_stops" ON route_stops FOR SELECT USING (true);
CREATE POLICY "Public read for buses" ON buses FOR SELECT USING (true);
CREATE POLICY "Public read for scheduled_trips" ON scheduled_trips FOR SELECT USING (true);

-- Courier Companies Policies
CREATE POLICY "Courier companies select policy" ON courier_companies FOR SELECT TO public USING (true);
CREATE POLICY "Courier companies insert policy" ON courier_companies FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Courier companies update policy" ON courier_companies FOR UPDATE TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.role = 'SUPER_ADMIN' OR profiles.company_id = courier_companies.id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.role = 'SUPER_ADMIN' OR profiles.company_id = courier_companies.id)
  )
);

-- Profile Policies
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT TO authenticated 
USING (
  auth.uid() = id OR 
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
);

CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated 
USING (
  auth.uid() = id OR 
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
)
WITH CHECK (
  auth.uid() = id OR 
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
);

-- Conductors Policies
CREATE POLICY "Conductors select policy" ON conductors FOR SELECT TO authenticated 
USING (
  profile_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
);

CREATE POLICY "Super Admins manage conductors" ON conductors FOR ALL TO authenticated 
USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
);

-- Shipments RLS Policies
CREATE POLICY "Courier partners read own shipments" ON shipments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND (profiles.role = 'SUPER_ADMIN' OR profiles.company_id = shipments.courier_company_id)
    )
);

CREATE POLICY "Courier partners insert own shipments" ON shipments FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'COURIER_PARTNER' 
        AND profiles.company_id = shipments.courier_company_id
    )
);

CREATE POLICY "Conductors and Admins update shipments" ON shipments FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('SUPER_ADMIN', 'CONDUCTOR')
    )
);

-- Reservations RLS Policies
CREATE POLICY "Read reservations" ON shipment_reservations FOR SELECT USING (true);
CREATE POLICY "Create reservations" ON shipment_reservations FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('SUPER_ADMIN', 'COURIER_PARTNER')
    )
);

-- Status History RLS Policies
CREATE POLICY "Read shipment history" ON shipment_status_history FOR SELECT USING (true);
CREATE POLICY "Insert shipment history" ON shipment_status_history FOR INSERT WITH CHECK (true);

-- Invoices RLS Policies
CREATE POLICY "Read company invoices" ON invoices FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND (profiles.role = 'SUPER_ADMIN' OR profiles.company_id = invoices.courier_company_id)
    )
);

