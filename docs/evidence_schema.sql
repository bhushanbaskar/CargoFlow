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
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    uploader_name TEXT NOT NULL,
    uploader_role user_role NOT NULL,
    file_url TEXT NOT NULL, -- URL path to Supabase Storage or Base64 fallback data
    verification_status verification_status NOT NULL DEFAULT 'Pending',
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    location_name TEXT NOT NULL,
    remarks TEXT,
    is_correction BOOLEAN NOT NULL DEFAULT FALSE,
    corrected_evidence_id UUID REFERENCES evidence_records(id) ON DELETE SET NULL, -- Pointer to corrected item
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON COLUMN evidence_records.file_url IS 'Public url of verification evidence documents, signatures or photos';
COMMENT ON COLUMN evidence_records.is_correction IS 'True if this evidence record was issued as a corrective edit, preserving the original record';

-- 3. Dispute Log Table
CREATE TABLE IF NOT EXISTS disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    raised_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    raiser_name TEXT NOT NULL,
    raised_role user_role NOT NULL,
    evidence_id UUID NOT NULL REFERENCES evidence_records(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, RESOLVED, CLOSED
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
    recipient_role user_role, -- For notifications sent to all users with a specific role
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    waybill_number TEXT NOT NULL,
    type TEXT NOT NULL, -- VERIFICATION_REQUEST, DISPUTE_RAISED, DISPUTE_RESOLVED
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
CREATE POLICY "Users can read evidence of their shipments" ON evidence_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM shipments s
            JOIN profiles p ON p.id = auth.uid()
            WHERE s.id = evidence_records.shipment_id
            AND (p.role = 'SUPER_ADMIN' OR p.role = 'CONDUCTOR' OR s.courier_company_id = p.company_id)
        )
    );

-- Insert policies for evidence_records
CREATE POLICY "Users can insert evidence for their shipments" ON evidence_records
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM shipments s
            JOIN profiles p ON p.id = auth.uid()
            WHERE s.id = evidence_records.shipment_id
            AND (p.role = 'SUPER_ADMIN' OR p.role = 'CONDUCTOR' OR s.courier_company_id = p.company_id)
        )
    );

-- Admin update policy (for correcting status)
CREATE POLICY "Super Admins can update evidence records" ON evidence_records
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
        )
    );

-- Read policies for disputes
CREATE POLICY "Users can read disputes of their shipments" ON disputes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM shipments s
            JOIN profiles p ON p.id = auth.uid()
            WHERE s.id = disputes.shipment_id
            AND (p.role = 'SUPER_ADMIN' OR p.role = 'CONDUCTOR' OR s.courier_company_id = p.company_id)
        )
    );

-- Insert policies for disputes
CREATE POLICY "Users can insert disputes for their shipments" ON disputes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM shipments s
            JOIN profiles p ON p.id = auth.uid()
            WHERE s.id = disputes.shipment_id
            AND (p.role = 'SUPER_ADMIN' OR p.role = 'CONDUCTOR' OR s.courier_company_id = p.company_id)
        )
    );

-- Admin resolve policy for disputes
CREATE POLICY "Super Admins can update disputes" ON disputes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
        )
    );

-- Read policies for notifications
CREATE POLICY "Users can read own notifications" ON evidence_notifications
    FOR SELECT USING (
        recipient_id = auth.uid() OR 
        (recipient_role IS NOT NULL AND EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role = recipient_role
        ))
    );

-- Update policies for notifications
CREATE POLICY "Users can mark own notifications as read" ON evidence_notifications
    FOR UPDATE USING (
        recipient_id = auth.uid()
    );
