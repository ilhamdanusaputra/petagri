-- ================================================
-- Tenders Table Migration
-- Description: Create table for managing product tenders/offers
-- ================================================

-- Create enum for tender status
CREATE TYPE tender_status AS ENUM ('draft', 'open', 'closed', 'locked', 'completed', 'cancelled');

-- Create tenders table
CREATE TABLE IF NOT EXISTS tenders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic Information
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Product Reference (from consultation recommendations)
    consultation_visit_id UUID REFERENCES consultation_visits(id) ON DELETE SET NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    
    -- Tender Details
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL DEFAULT 'kg',
    estimated_price DECIMAL(12, 2),
    
    -- Status and Dates
    status tender_status NOT NULL DEFAULT 'open',
    open_date TIMESTAMPTZ,
    close_date TIMESTAMPTZ,
    locked_at TIMESTAMPTZ,
    
    -- Requirements
    requirements TEXT[],
    terms_conditions TEXT,
    delivery_location TEXT,
    delivery_deadline TIMESTAMPTZ,
    
    -- Winner Information
    winner_mitra_id UUID REFERENCES mitra(id) ON DELETE SET NULL,
    winning_bid_id UUID,
    winner_selected_at TIMESTAMPTZ,
    winner_selected_by UUID,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    
    -- Constraints
    CONSTRAINT valid_dates CHECK (
        (close_date IS NULL OR open_date IS NULL OR close_date > open_date)
    ),
    CONSTRAINT valid_quantity CHECK (quantity > 0)
);

-- Create index for performance
CREATE INDEX idx_tenders_status ON tenders(status);
CREATE INDEX idx_tenders_product_id ON tenders(product_id);
CREATE INDEX idx_tenders_consultation_visit_id ON tenders(consultation_visit_id);
CREATE INDEX idx_tenders_winner_mitra_id ON tenders(winner_mitra_id);
CREATE INDEX idx_tenders_dates ON tenders(open_date, close_date);

-- Create updated_at trigger
CREATE TRIGGER update_tenders_updated_at
    BEFORE UPDATE ON tenders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE tenders ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view open tenders
CREATE POLICY "Anyone can view open tenders"
    ON tenders FOR SELECT
    USING (status IN ('open', 'closed', 'locked', 'completed'));

-- Policy: Authenticated users can create tenders
CREATE POLICY "Authenticated users can create tenders"
    ON tenders FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Policy: Creators can update their own tenders
CREATE POLICY "Creators can update their own tenders"
    ON tenders FOR UPDATE
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());
