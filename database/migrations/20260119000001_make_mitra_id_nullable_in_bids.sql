-- ================================================
-- Migration: Make mitra_id nullable in tender_bids
-- Date: 2026-01-19
-- Description: Allow any authenticated user to place bids, not just mitra partners
-- ================================================

-- Make mitra_id nullable in tender_bids table
ALTER TABLE tender_bids 
ALTER COLUMN mitra_id DROP NOT NULL;

-- Update the foreign key constraint to allow NULL
ALTER TABLE tender_bids 
DROP CONSTRAINT IF EXISTS tender_bids_mitra_id_fkey;

ALTER TABLE tender_bids 
ADD CONSTRAINT tender_bids_mitra_id_fkey 
FOREIGN KEY (mitra_id) 
REFERENCES mitra(id) 
ON DELETE SET NULL;

-- Make mitra_id nullable in tender_bid_history table
ALTER TABLE tender_bid_history 
ALTER COLUMN mitra_id DROP NOT NULL;

-- Update the foreign key constraint in history table
ALTER TABLE tender_bid_history 
DROP CONSTRAINT IF EXISTS tender_bid_history_mitra_id_fkey;

ALTER TABLE tender_bid_history 
ADD CONSTRAINT tender_bid_history_mitra_id_fkey 
FOREIGN KEY (mitra_id) 
REFERENCES mitra(id) 
ON DELETE SET NULL;

-- Add a user_id column for non-mitra users (for future use with proper authentication)
ALTER TABLE tender_bids 
ADD COLUMN IF NOT EXISTS user_id UUID;

ALTER TABLE tender_bid_history 
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Add check constraint to ensure either mitra_id or user_id is set
ALTER TABLE tender_bids 
ADD CONSTRAINT tender_bids_user_check 
CHECK (mitra_id IS NOT NULL OR user_id IS NOT NULL);

-- Add comment explaining the change
COMMENT ON COLUMN tender_bids.mitra_id IS 'Mitra ID - optional, allows NULL for non-mitra users';
COMMENT ON COLUMN tender_bids.user_id IS 'User ID for non-mitra authenticated users';
COMMENT ON COLUMN tender_bid_history.mitra_id IS 'Mitra ID - optional, allows NULL for non-mitra users';
COMMENT ON COLUMN tender_bid_history.user_id IS 'User ID for non-mitra authenticated users';
