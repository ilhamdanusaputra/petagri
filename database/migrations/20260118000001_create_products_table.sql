-- ================================================
-- Migration: 20260118000001_create_products_table
-- Description: Create products table for product management
-- Author: System
-- Created: 2026-01-18
-- ================================================

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Product basic information
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100),
    
    -- Categorization
    category_id UUID,
    subcategory VARCHAR(100),
    brand VARCHAR(100),
    
    -- Pricing
    base_price DECIMAL(15,2) NOT NULL DEFAULT 0,
    selling_price DECIMAL(15,2) NOT NULL DEFAULT 0,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    
    -- Inventory
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER,
    unit_type VARCHAR(50) DEFAULT 'pcs',
    weight DECIMAL(10,3),
    dimensions JSONB, -- {length, width, height, unit}
    
    -- Product status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft', 'discontinued')),
    is_featured BOOLEAN DEFAULT FALSE,
    is_digital BOOLEAN DEFAULT FALSE,
    
    -- SEO and media
    slug VARCHAR(255) UNIQUE,
    meta_title VARCHAR(255),
    meta_description TEXT,
    images JSONB, -- Array of image URLs
    
    -- Additional attributes
    attributes JSONB, -- Flexible attributes like color, size, etc.
    tags TEXT[], -- Array of tags
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID,
    
    -- Constraints
    CONSTRAINT products_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT products_sku_not_empty CHECK (LENGTH(TRIM(sku)) > 0),
    CONSTRAINT products_base_price_positive CHECK (base_price >= 0),
    CONSTRAINT products_selling_price_positive CHECK (selling_price >= 0),
    CONSTRAINT products_stock_non_negative CHECK (stock_quantity >= 0),
    CONSTRAINT products_discount_percentage_valid CHECK (discount_percentage >= 0 AND discount_percentage <= 100)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_name ON products USING btree (name);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products USING btree (sku);
CREATE INDEX IF NOT EXISTS idx_products_status ON products USING btree (status);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products USING btree (category_id);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_selling_price ON products USING btree (selling_price);
CREATE INDEX IF NOT EXISTS idx_products_stock_quantity ON products USING btree (stock_quantity);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products USING btree (is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_active ON products USING btree (status) WHERE status = 'active';

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin (
    to_tsvector('indonesian', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(brand, ''))
);

-- Create unique slug index
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug_unique ON products (slug) WHERE slug IS NOT NULL;

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- SELECT: Authenticated users can view active products or their own products
CREATE POLICY "view_own_products" ON products
    FOR SELECT
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() = created_by
    );

-- SELECT: Admins/managers can view all products
CREATE POLICY "view_all_products_admin" ON products
    FOR SELECT
    USING (
        auth.role() = 'authenticated'
        AND (
            auth.jwt() ->> 'role' = 'admin'
            OR auth.jwt() ->> 'role' = 'manager'
        )
    );

-- INSERT: Authenticated users can create products
-- The created_by will be automatically set to auth.uid() by trigger
CREATE POLICY "insert_products" ON products
    FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated'
    );

-- UPDATE: Product owners can update their own products
CREATE POLICY "update_own_products" ON products
    FOR UPDATE
    USING (
        auth.role() = 'authenticated'
        AND auth.uid() = created_by
    );

-- UPDATE: Admins/managers can update any products
CREATE POLICY "update_products_admin" ON products
    FOR UPDATE
    USING (
        auth.role() = 'authenticated'
        AND (
            auth.jwt() ->> 'role' = 'admin'
            OR auth.jwt() ->> 'role' = 'manager'
        )
    );

-- DELETE: Product owners can delete their own products
CREATE POLICY "delete_own_products" ON products
    FOR DELETE
    USING (
        auth.role() = 'authenticated'
        AND auth.uid() = created_by
    );

-- DELETE: Admins can delete any products
CREATE POLICY "delete_products_admin" ON products
    FOR DELETE
    USING (
        auth.role() = 'authenticated'
        AND auth.jwt() ->> 'role' = 'admin'
    );

-- Audit trigger
CREATE OR REPLACE FUNCTION set_products_audit_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        NEW.created_by = auth.uid();
        NEW.created_at = CURRENT_TIMESTAMP;
        NEW.updated_by = auth.uid();
        NEW.updated_at = CURRENT_TIMESTAMP;
        
        -- Auto-generate slug if not provided
        IF NEW.slug IS NULL THEN
            NEW.slug = lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        NEW.created_by = OLD.created_by;
        NEW.created_at = OLD.created_at;
        NEW.updated_by = auth.uid();
        NEW.updated_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_products_audit_fields
    BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION set_products_audit_fields();

-- Comments
COMMENT ON TABLE products IS 'Product catalog and inventory management';
COMMENT ON COLUMN products.id IS 'Unique product identifier';
COMMENT ON COLUMN products.name IS 'Product name';
COMMENT ON COLUMN products.sku IS 'Stock Keeping Unit - unique product code';
COMMENT ON COLUMN products.base_price IS 'Base/cost price of the product';
COMMENT ON COLUMN products.selling_price IS 'Current selling price';
COMMENT ON COLUMN products.stock_quantity IS 'Current stock quantity';
COMMENT ON COLUMN products.status IS 'Product status: active, inactive, draft, discontinued';

SELECT 'Migration 20260118000001_create_products_table completed successfully' AS status;