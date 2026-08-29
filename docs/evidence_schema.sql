-- CargoFlow Evidence-Based Verification System Schema Extension
-- Adds evidence tracking, multi-sided disputes, correction audits, and verification alerts.

-- 1. Custom Enum Types (If not already created)
DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('Verified', 'Pending', 'Disputed', 'Corrected', 'Rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Evidence Records Table (Nondestructive history tracking)
CREATE TABLE IF NOT EXISTS evidence_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id TEXT NOT NULL, -- Stored as TEXT to support local mock IDs like 'shp-1001'
    uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    uploader_name TEXT NOT NULL,
    uploader_role user_role NOT NULL,
    file_url TEXT NOT NULL,
    verification_status verification_status NOT NULL DEFAULT 'Pending',
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    location_name TEXT NOT NULL,
    remarks TEXT,
    is_correction BOOLEAN NOT NULL DEFAULT FALSE,
    corrected_evidence_id UUID REFERENCES evidence_records(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON COLUMN evidence_records.file_url IS 'Public url of verification evidence documents, signatures or photos';
COMMENT ON COLUMN evidence_records.is_correction IS 'True if this evidence record was issued as a corrective edit, preserving the original record';

-- 3. Dispute Log Table
CREATE TABLE IF NOT EXISTS disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id TEXT NOT NULL,
    raised_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    raiser_name TEXT NOT NULL,
    raised_role user_role NOT NULL,
    evidence_id UUID NOT NULL REFERENCES evidence_records(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    resolution TEXT,
    resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    counter_evidence_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Evidence Notifications Table (Verification Alerts Feed)
CREATE TABLE IF NOT EXISTS evidence_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    recipient_role user_role,
    shipment_id TEXT NOT NULL,
    waybill_number TEXT NOT NULL,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- INDEXES FOR OPTIMAL QUERY PERFORMANCE
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_evidence_records_shipment ON evidence_records(shipment_id);
CREATE INDEX IF NOT EXISTS idx_evidence_records_corrected ON evidence_records(corrected_evidence_id);
CREATE INDEX IF NOT EXISTS idx_disputes_shipment ON disputes(shipment_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_evidence_notifications_recipient ON evidence_notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_evidence_notifications_role ON evidence_notifications(recipient_role);

-- =========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================
ALTER TABLE evidence_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_notifications ENABLE ROW LEVEL SECURITY;

-- Read policies for evidence_records
CREATE POLICY "Users can read all evidence" ON evidence_records
    FOR SELECT TO authenticated USING (true);

-- Insert policies for evidence_records
CREATE POLICY "Users can insert own evidence" ON evidence_records
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = uploaded_by);

-- Admin update policy for evidence status/corrections
CREATE POLICY "Super Admins can update evidence records" ON evidence_records
    FOR UPDATE TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
    );

-- Read policies for disputes
CREATE POLICY "Users can read all disputes" ON disputes
    FOR SELECT TO authenticated USING (true);

-- Insert policies for disputes
CREATE POLICY "Users can insert own disputes" ON disputes
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = raised_by);

-- Admin resolve policy for disputes
CREATE POLICY "Super Admins can update disputes" ON disputes
    FOR UPDATE TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
    );

-- Read policies for notifications
CREATE POLICY "Users can read own notifications" ON evidence_notifications
    FOR SELECT TO authenticated USING (
        recipient_id = auth.uid() OR 
        (recipient_role IS NOT NULL AND EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role = recipient_role
        ))
    );

-- Update policies for notifications (marking as read)
CREATE POLICY "Users can mark own notifications as read" ON evidence_notifications
    FOR UPDATE TO authenticated USING (
        recipient_id = auth.uid()
    );
