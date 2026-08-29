-- CargoFlow Database Schema Update
-- Adds verification photo and GPS location tracking to shipment logs

-- Update the shipment status history logs table to support verification metadata
ALTER TABLE IF EXISTS shipment_status_history 
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS latitude NUMERIC(9,6),
ADD COLUMN IF NOT EXISTS longitude NUMERIC(9,6);

-- Comment on fields for documentation
COMMENT ON COLUMN shipment_status_history.photo_url IS 'Base64 image URL or Supabase storage path of the verification photo captured during scan';
COMMENT ON COLUMN shipment_status_history.latitude IS 'GPS latitude captured at the present location during scan';
COMMENT ON COLUMN shipment_status_history.longitude IS 'GPS longitude captured at the present location during scan';
