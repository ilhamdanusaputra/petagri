-- ================================================
-- Tender Bids Table Migration
-- Description: Create table for managing bids on tenders
-- ================================================

-- Create enum for bid status
CREATE TYPE bid_status AS ENUM ('draft', 'submitted', 'withdrawn', 'accepted', 'rejected');

-- Create tender_bids table
CREATE TABLE IF NOT EXISTS tender_bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    tender_id UUID NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
    mitra_id UUID NOT NULL REFERENCES mitra(id) ON DELETE CASCADE,
    
    -- Bid Details
    bid_price DECIMAL(12, 2) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    
    -- Additional Information
    notes TEXT,
    delivery_terms TEXT,
    payment_terms TEXT,
    proposed_delivery_date TIMESTAMPTZ,
    
    -- Attachments
    documents JSONB DEFAULT '[]'::jsonb,
    
    -- Status
    status bid_status NOT NULL DEFAULT 'draft',
    submitted_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_bid_price CHECK (bid_price > 0),
    CONSTRAINT valid_bid_quantity CHECK (quantity > 0),
    CONSTRAINT unique_mitra_tender_active_bid UNIQUE (tender_id, mitra_id, status)
);

-- Create indexes
CREATE INDEX idx_tender_bids_tender_id ON tender_bids(tender_id);
CREATE INDEX idx_tender_bids_mitra_id ON tender_bids(mitra_id);
CREATE INDEX idx_tender_bids_status ON tender_bids(status);
CREATE INDEX idx_tender_bids_submitted_at ON tender_bids(submitted_at);

-- Create updated_at trigger
CREATE TRIGGER update_tender_bids_updated_at
    BEFORE UPDATE ON tender_bids
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE tender_bids ENABLE ROW LEVEL SECURITY;

-- Policy: Mitra can view their own bids
CREATE POLICY "Mitra can view their own bids"
    ON tender_bids FOR SELECT
    USING (mitra_id IN (SELECT id FROM mitra WHERE contact_email = auth.jwt() ->> 'email'));

-- Policy: Tender owners can view all bids for their tenders
CREATE POLICY "Tender owners can view all bids"
    ON tender_bids FOR SELECT
    USING (
        tender_id IN (
            SELECT id FROM tenders WHERE created_by = auth.uid()
        )
    );

-- Policy: Mitra can create bids
CREATE POLICY "Mitra can create bids"
    ON tender_bids FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM tenders 
            WHERE id = tender_id 
            AND status = 'open'
        )
    );

-- Policy: Mitra can update their own bids if tender is still open
CREATE POLICY "Mitra can update their own bids"
    ON tender_bids FOR UPDATE
    USING (
        mitra_id IN (SELECT id FROM mitra WHERE contact_email = auth.jwt() ->> 'email')
        AND EXISTS (
            SELECT 1 FROM tenders 
            WHERE id = tender_id 
            AND status = 'open'
        )
    );
