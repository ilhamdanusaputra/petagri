-- ================================================
-- Migration: 20260118000004_create_inventory_tracking_table
-- Description: Create inventory tracking system for stock management
-- Author: System
-- Created: 2026-01-18
-- ================================================

-- Create inventory transactions table
CREATE TABLE IF NOT EXISTS inventory_transactions (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Product reference
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    
    -- Transaction details
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN (
        'stock_in', 'stock_out', 'adjustment', 'transfer', 'return', 'waste', 'sold'
    )),
    reference_type VARCHAR(20) CHECK (reference_type IN (
        'purchase', 'sale', 'adjustment', 'transfer', 'return', 'waste', 'manual'
    )),
    reference_id UUID, -- Reference to related record (order, purchase, etc.)
    
    -- Quantity changes
    quantity_before INTEGER NOT NULL DEFAULT 0,
    quantity_change INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL DEFAULT 0,
    
    -- Cost information
    unit_cost DECIMAL(15,2),
    total_cost DECIMAL(15,2),
    
    -- Location tracking
    warehouse_location VARCHAR(100),
    storage_location VARCHAR(100),
    
    -- Additional details
    reason VARCHAR(255),
    notes TEXT,
    batch_number VARCHAR(100),
    expiry_date DATE,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    
    -- Constraints
    CONSTRAINT inventory_transactions_quantity_change_not_zero CHECK (quantity_change != 0)
);

-- Create inventory alerts table
CREATE TABLE IF NOT EXISTS inventory_alerts (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Product reference
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    
    -- Alert details
    alert_type VARCHAR(20) NOT NULL CHECK (alert_type IN (
        'low_stock', 'out_of_stock', 'overstock', 'expiring', 'expired'
    )),
    threshold_value INTEGER,
    current_value INTEGER,
    
    -- Alert status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    
    -- Notification tracking
    notification_sent BOOLEAN DEFAULT FALSE,
    notification_sent_at TIMESTAMP WITH TIME ZONE,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    acknowledged_by UUID,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID,
    
    -- Additional details
    message TEXT,
    action_required TEXT,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create stock movements view for easy reporting
CREATE OR REPLACE VIEW stock_movements AS
SELECT 
    it.id,
    it.product_id,
    p.name as product_name,
    p.sku,
    it.transaction_type,
    it.reference_type,
    it.quantity_before,
    it.quantity_change,
    it.quantity_after,
    it.unit_cost,
    it.total_cost,
    it.warehouse_location,
    it.storage_location,
    it.reason,
    it.batch_number,
    it.expiry_date,
    it.created_at,
    it.created_by
FROM inventory_transactions it
JOIN products p ON it.product_id = p.id
ORDER BY it.created_at DESC;

-- Create current stock view
CREATE OR REPLACE VIEW current_stock AS
SELECT 
    p.id as product_id,
    p.name as product_name,
    p.sku,
    p.stock_quantity,
    p.min_stock_level,
    CASE 
        WHEN p.stock_quantity <= 0 THEN 'out_of_stock'
        WHEN p.stock_quantity <= p.min_stock_level THEN 'low_stock'
        WHEN p.stock_quantity > p.min_stock_level * 3 THEN 'overstock'
        ELSE 'normal'
    END as stock_status,
    COALESCE(SUM(CASE WHEN it.transaction_type IN ('stock_in', 'return') THEN it.quantity_change ELSE 0 END), 0) as total_stock_in,
    COALESCE(SUM(CASE WHEN it.transaction_type IN ('stock_out', 'sold', 'waste') THEN ABS(it.quantity_change) ELSE 0 END), 0) as total_stock_out,
    COUNT(it.id) as transaction_count,
    MAX(it.created_at) as last_transaction_date
FROM products p
LEFT JOIN inventory_transactions it ON p.id = it.product_id
WHERE p.status = 'active'
GROUP BY p.id, p.name, p.sku, p.stock_quantity, p.min_stock_level;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_product_id ON inventory_transactions USING btree (product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type ON inventory_transactions USING btree (transaction_type);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_created_at ON inventory_transactions USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_reference ON inventory_transactions USING btree (reference_type, reference_id);

CREATE INDEX IF NOT EXISTS idx_inventory_alerts_product_id ON inventory_alerts USING btree (product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_status ON inventory_alerts USING btree (status);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_type ON inventory_alerts USING btree (alert_type);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_priority ON inventory_alerts USING btree (priority);

-- Enable RLS
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inventory_transactions
CREATE POLICY "view_inventory_transactions" ON inventory_transactions
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "insert_inventory_transactions" ON inventory_transactions
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for inventory_alerts
CREATE POLICY "view_inventory_alerts" ON inventory_alerts
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "manage_inventory_alerts" ON inventory_alerts
    FOR ALL
    USING (auth.role() = 'authenticated');

-- Auto-update inventory alerts trigger
CREATE OR REPLACE FUNCTION update_inventory_alerts()
RETURNS TRIGGER AS $$
BEGIN
    -- Create low stock alert if needed
    IF NEW.stock_quantity <= NEW.min_stock_level THEN
        INSERT INTO inventory_alerts (product_id, alert_type, threshold_value, current_value, message)
        VALUES (
            NEW.id,
            CASE WHEN NEW.stock_quantity <= 0 THEN 'out_of_stock' ELSE 'low_stock' END,
            NEW.min_stock_level,
            NEW.stock_quantity,
            CASE 
                WHEN NEW.stock_quantity <= 0 THEN 'Product is out of stock'
                ELSE 'Product stock is below threshold'
            END
        )
        ON CONFLICT DO NOTHING;
    ELSE
        -- Resolve alerts if stock is restored
        UPDATE inventory_alerts 
        SET status = 'resolved', resolved_at = CURRENT_TIMESTAMP, resolved_by = auth.uid()
        WHERE product_id = NEW.id 
        AND alert_type IN ('low_stock', 'out_of_stock')
        AND status = 'active';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_inventory_alerts
    AFTER UPDATE OF stock_quantity ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_alerts();

-- Inventory transaction audit trigger
CREATE OR REPLACE FUNCTION set_inventory_transaction_audit_fields()
RETURNS TRIGGER AS $$
BEGIN
    NEW.created_by = auth.uid();
    NEW.created_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_inventory_transaction_audit_fields
    BEFORE INSERT ON inventory_transactions
    FOR EACH ROW
    EXECUTE FUNCTION set_inventory_transaction_audit_fields();

-- Comments
COMMENT ON TABLE inventory_transactions IS 'Track all inventory movements and stock changes';
COMMENT ON TABLE inventory_alerts IS 'System alerts for inventory management';
COMMENT ON VIEW stock_movements IS 'Detailed view of all stock movements with product information';
COMMENT ON VIEW current_stock IS 'Current stock levels and status for all trackable products';

SELECT 'Migration 20260118000004_create_inventory_tracking_table completed successfully' AS status;