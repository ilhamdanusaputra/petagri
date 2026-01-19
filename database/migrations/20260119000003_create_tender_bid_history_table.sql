-- ================================================
-- Tender Bid History Table Migration
-- Description: Track history of bid changes for audit trail
-- ================================================

-- Create tender_bid_history table
CREATE TABLE IF NOT EXISTS tender_bid_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    tender_bid_id UUID NOT NULL REFERENCES tender_bids(id) ON DELETE CASCADE,
    tender_id UUID NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
    mitra_id UUID NOT NULL REFERENCES mitra(id) ON DELETE CASCADE,
    
    -- Historical Bid Data
    bid_price DECIMAL(12, 2) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    
    -- Change Tracking
    change_type VARCHAR(50) NOT NULL, -- 'created', 'updated', 'withdrawn', 'accepted', 'rejected'
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    changed_by UUID,
    change_reason TEXT,
    
    -- Previous and New Values (for updates)
    previous_data JSONB,
    new_data JSONB
);

-- Create indexes
CREATE INDEX idx_tender_bid_history_tender_bid_id ON tender_bid_history(tender_bid_id);
CREATE INDEX idx_tender_bid_history_tender_id ON tender_bid_history(tender_id);
CREATE INDEX idx_tender_bid_history_mitra_id ON tender_bid_history(mitra_id);
CREATE INDEX idx_tender_bid_history_changed_at ON tender_bid_history(changed_at DESC);

-- Add RLS policies
ALTER TABLE tender_bid_history ENABLE ROW LEVEL SECURITY;

-- Policy: Mitra can view their own bid history
CREATE POLICY "Mitra can view their own bid history"
    ON tender_bid_history FOR SELECT
    USING (mitra_id IN (SELECT id FROM mitra WHERE contact_email = auth.jwt() ->> 'email'));

-- Policy: Tender owners can view all bid history
CREATE POLICY "Tender owners can view all bid history"
    ON tender_bid_history FOR SELECT
    USING (
        tender_id IN (
            SELECT id FROM tenders WHERE created_by = auth.uid()
        )
    );

-- Create function to log bid changes
CREATE OR REPLACE FUNCTION log_tender_bid_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO tender_bid_history (
            tender_bid_id, tender_id, mitra_id,
            bid_price, quantity, notes,
            change_type, new_data
        ) VALUES (
            NEW.id, NEW.tender_id, NEW.mitra_id,
            NEW.bid_price, NEW.quantity, NEW.notes,
            'created', to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO tender_bid_history (
            tender_bid_id, tender_id, mitra_id,
            bid_price, quantity, notes,
            change_type, previous_data, new_data
        ) VALUES (
            NEW.id, NEW.tender_id, NEW.mitra_id,
            NEW.bid_price, NEW.quantity, NEW.notes,
            'updated', to_jsonb(OLD), to_jsonb(NEW)
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically log bid changes
CREATE TRIGGER tender_bid_change_trigger
    AFTER INSERT OR UPDATE ON tender_bids
    FOR EACH ROW
    EXECUTE FUNCTION log_tender_bid_change();
