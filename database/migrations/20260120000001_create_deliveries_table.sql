-- ================================================
-- Migration: 20260120000001_create_deliveries_table
-- Description: Create deliveries table for tracking product deliveries from tenders to farms
-- Author: System
-- Created: 2026-01-20
-- ================================================

-- UP MIGRATION
-- Create deliveries table
CREATE TABLE IF NOT EXISTS deliveries (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relationships
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    tender_id UUID REFERENCES tenders(id) ON DELETE SET NULL,
    mitra_id UUID NOT NULL REFERENCES mitra(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    consultation_visit_id UUID REFERENCES consultation_visits(id) ON DELETE SET NULL,
    farm_id UUID REFERENCES farms(id) ON DELETE SET NULL,
    
    -- Delivery information
    delivery_number VARCHAR(50) NOT NULL UNIQUE,
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL DEFAULT 'kg',
    
    -- Driver and vehicle information
    driver_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    driver_name VARCHAR(255),
    driver_phone VARCHAR(50),
    driver_id VARCHAR(50), -- ID KTP or driver license
    vehicle_number VARCHAR(20),
    vehicle_type VARCHAR(50),
    
    -- Delivery address (from farm)
    delivery_address TEXT NOT NULL,
    delivery_coordinates POINT,
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending',          -- Order created, waiting to be picked up
        'picked_up',        -- Driver has picked up the goods
        'in_transit',       -- On the way to farm
        'arrived',          -- Arrived at destination
        'delivered',        -- Delivered to farm owner
        'approved',         -- Approved by farm owner
        'rejected',         -- Rejected by farm owner
        'cancelled'         -- Delivery cancelled
    )),
    
    -- Timestamps
    scheduled_pickup_date TIMESTAMP WITH TIME ZONE,
    actual_pickup_date TIMESTAMP WITH TIME ZONE,
    scheduled_delivery_date TIMESTAMP WITH TIME ZONE,
    actual_delivery_date TIMESTAMP WITH TIME ZONE,
    
    -- Approval tracking
    approved_by_farm_owner BOOLEAN DEFAULT FALSE,
    farm_owner_email VARCHAR(255), -- From farms.contact_email
    farm_owner_name VARCHAR(255), -- From farms.owner_name
    approved_at TIMESTAMP WITH TIME ZONE,
    approval_signature TEXT, -- Base64 signature image or approval token
    
    -- Rejection tracking
    rejection_reason TEXT,
    rejected_at TIMESTAMP WITH TIME ZONE,
    
    -- Delivery notes
    pickup_notes TEXT,
    delivery_notes TEXT,
    farm_owner_notes TEXT,
    
    -- Documentation
    pickup_photos TEXT[], -- Array of photo URLs taken at pickup
    delivery_photos TEXT[], -- Array of photo URLs taken at delivery
    proof_of_delivery TEXT, -- URL to POD document/image
    
    -- Quality check
    product_condition VARCHAR(20) DEFAULT 'good' CHECK (product_condition IN ('excellent', 'good', 'fair', 'damaged')),
    quality_notes TEXT,
    temperature_recorded DECIMAL(5,2), -- For temperature-sensitive products
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_tender_id ON deliveries(tender_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_mitra_id ON deliveries(mitra_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_product_id ON deliveries(product_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_consultation_visit_id ON deliveries(consultation_visit_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_farm_id ON deliveries(farm_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_delivery_number ON deliveries(delivery_number);
CREATE INDEX IF NOT EXISTS idx_deliveries_scheduled_delivery ON deliveries(scheduled_delivery_date);
CREATE INDEX IF NOT EXISTS idx_deliveries_driver_phone ON deliveries(driver_phone);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_deliveries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deliveries_updated_at_trigger
    BEFORE UPDATE ON deliveries
    FOR EACH ROW
    EXECUTE FUNCTION update_deliveries_updated_at();

-- Create function to automatically populate farm details from consultation visit
CREATE OR REPLACE FUNCTION populate_delivery_farm_details()
RETURNS TRIGGER AS $$
BEGIN
    -- If consultation_visit_id is provided, get farm details
    IF NEW.consultation_visit_id IS NOT NULL THEN
        SELECT 
            cv.farm_id,
            f.address,
            f.coordinates,
            f.contact_email,
            f.owner_name
        INTO 
            NEW.farm_id,
            NEW.delivery_address,
            NEW.delivery_coordinates,
            NEW.farm_owner_email,
            NEW.farm_owner_name
        FROM consultation_visits cv
        JOIN farms f ON cv.farm_id = f.id
        WHERE cv.id = NEW.consultation_visit_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER populate_farm_details_trigger
    BEFORE INSERT ON deliveries
    FOR EACH ROW
    EXECUTE FUNCTION populate_delivery_farm_details();

-- Enable Row Level Security
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view deliveries related to their mitra
-- This checks if the user created the mitra associated with the delivery
CREATE POLICY "view_own_mitra_deliveries" ON deliveries
    FOR SELECT
    USING (
        auth.role() = 'authenticated'
        AND EXISTS (
            SELECT 1 FROM mitra
            WHERE mitra.id = deliveries.mitra_id
            AND mitra.created_by = auth.uid()
        )
    );

-- RLS Policy: Owner can view all deliveries
CREATE POLICY "view_all_deliveries_owner" ON deliveries
    FOR SELECT
    USING (
        auth.role() = 'authenticated'
        AND EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.name IN ('owner_platform')
        )
    );

-- RLS Policy: Only platform owners can create deliveries
CREATE POLICY "create_deliveries_platform_owner" ON deliveries
    FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated'
        AND EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.name = 'owner_platform'
        )
    );

-- RLS Policy: Only drivers can update deliveries
CREATE POLICY "update_deliveries_driver" ON deliveries
    FOR UPDATE
    USING (
        auth.role() = 'authenticated'
        AND EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.name = 'driver'
        )
    );

-- RLS Policy: Only platform owners can delete deliveries
CREATE POLICY "delete_deliveries_platform_owner" ON deliveries
    FOR DELETE
    USING (
        auth.role() = 'authenticated'
        AND EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.name = 'owner_platform'
        )
    );

-- Comments
COMMENT ON TABLE deliveries IS 'Deliveries table for tracking product deliveries from tenders to farms';
COMMENT ON COLUMN deliveries.tender_id IS 'Reference to the tender that created this delivery';
COMMENT ON COLUMN deliveries.consultation_visit_id IS 'Reference to consultation visit that recommended the product';
COMMENT ON COLUMN deliveries.farm_id IS 'Destination farm for delivery';
COMMENT ON COLUMN deliveries.status IS 'Delivery status from pending to approved/rejected';
COMMENT ON COLUMN deliveries.approved_by_farm_owner IS 'Whether farm owner has approved the delivery';
COMMENT ON COLUMN deliveries.farm_owner_email IS 'Farm owner email for approval notifications (from farms.contact_email)';

-- DOWN MIGRATION
-- DROP TRIGGER IF EXISTS populate_farm_details_trigger ON deliveries;
-- DROP FUNCTION IF EXISTS populate_delivery_farm_details();
-- DROP TRIGGER IF EXISTS deliveries_updated_at_trigger ON deliveries;
-- DROP FUNCTION IF EXISTS update_deliveries_updated_at();
-- DROP TABLE IF EXISTS deliveries CASCADE;
