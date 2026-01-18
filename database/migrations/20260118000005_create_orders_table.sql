-- ================================================
-- Migration: 20260118000005_create_orders_table
-- Description: Create orders table for tracking mitra performance
-- Author: System
-- Created: 2026-01-18
-- ================================================

-- UP MIGRATION
-- Create orders table for tracking mitra performance
CREATE TABLE IF NOT EXISTS orders (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign keys
    mitra_id UUID NOT NULL REFERENCES mitra(id) ON DELETE CASCADE,
    
    -- Order information
    order_number VARCHAR(50) NOT NULL UNIQUE,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    
    -- Order details
    items_count INTEGER DEFAULT 1 NOT NULL,
    notes TEXT,
    delivery_date DATE,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_mitra_id ON orders(mitra_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Create function to update updated_at automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add constraints
ALTER TABLE orders ADD CONSTRAINT check_orders_amount_positive 
    CHECK (total_amount >= 0);

ALTER TABLE orders ADD CONSTRAINT check_orders_status_valid 
    CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'));

-- Comment on table and columns
COMMENT ON TABLE orders IS 'Orders table for tracking mitra business performance and transactions';
COMMENT ON COLUMN orders.id IS 'Primary key UUID for orders';
COMMENT ON COLUMN orders.mitra_id IS 'Foreign key reference to mitra table';
COMMENT ON COLUMN orders.order_number IS 'Unique order number for tracking';
COMMENT ON COLUMN orders.total_amount IS 'Total order amount in IDR';
COMMENT ON COLUMN orders.status IS 'Order status (pending, confirmed, processing, shipped, delivered, cancelled)';
COMMENT ON COLUMN orders.items_count IS 'Number of items in the order';
COMMENT ON COLUMN orders.notes IS 'Additional notes for the order';
COMMENT ON COLUMN orders.delivery_date IS 'Expected or actual delivery date';
COMMENT ON COLUMN orders.created_at IS 'Order creation timestamp';
COMMENT ON COLUMN orders.updated_at IS 'Last update timestamp';

-- DOWN MIGRATION (for rollback)
-- DROP TABLE IF EXISTS orders CASCADE;
-- DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;