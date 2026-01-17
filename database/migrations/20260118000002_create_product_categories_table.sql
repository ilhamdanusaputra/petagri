-- ================================================
-- Migration: 20260118000002_create_product_categories_table
-- Description: Create product categories for organizing products
-- Author: System
-- Created: 2026-01-18
-- ================================================

-- Create product categories table
CREATE TABLE IF NOT EXISTS product_categories (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Category information
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) UNIQUE,
    
    -- Hierarchy support
    parent_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
    level INTEGER DEFAULT 0,
    path TEXT, -- Materialized path for efficient queries
    
    -- Display
    icon VARCHAR(100),
    image_url TEXT,
    color_code VARCHAR(7), -- Hex color code
    sort_order INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID,
    
    -- Constraints
    CONSTRAINT categories_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT categories_level_valid CHECK (level >= 0 AND level <= 5), -- Max 5 levels
    CONSTRAINT categories_no_self_parent CHECK (id != parent_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_categories_name ON product_categories USING btree (name);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON product_categories USING btree (slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON product_categories USING btree (parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_status ON product_categories USING btree (status);
CREATE INDEX IF NOT EXISTS idx_categories_level ON product_categories USING btree (level);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON product_categories USING btree (sort_order);
CREATE INDEX IF NOT EXISTS idx_categories_path ON product_categories USING btree (path);

-- Enable RLS
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "view_active_categories" ON product_categories
    FOR SELECT
    USING (status = 'active' OR auth.role() = 'authenticated');

CREATE POLICY "manage_categories" ON product_categories
    FOR ALL
    USING (auth.role() = 'authenticated');

-- Add foreign key constraint to products table
ALTER TABLE products 
ADD CONSTRAINT fk_products_category_id 
FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL;

-- Audit trigger
CREATE OR REPLACE FUNCTION set_categories_audit_fields()
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
        
        -- Set level and path
        IF NEW.parent_id IS NULL THEN
            NEW.level = 0;
            NEW.path = NEW.id::text;
        ELSE
            SELECT level + 1, path || '.' || NEW.id::text 
            INTO NEW.level, NEW.path
            FROM product_categories 
            WHERE id = NEW.parent_id;
        END IF;
        
    ELSIF TG_OP = 'UPDATE' THEN
        NEW.created_by = OLD.created_by;
        NEW.created_at = OLD.created_at;
        NEW.updated_by = auth.uid();
        NEW.updated_at = CURRENT_TIMESTAMP;
        
        -- Update path if parent changed
        IF OLD.parent_id IS DISTINCT FROM NEW.parent_id THEN
            IF NEW.parent_id IS NULL THEN
                NEW.level = 0;
                NEW.path = NEW.id::text;
            ELSE
                SELECT level + 1, path || '.' || NEW.id::text 
                INTO NEW.level, NEW.path
                FROM product_categories 
                WHERE id = NEW.parent_id;
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_categories_audit_fields
    BEFORE INSERT OR UPDATE ON product_categories
    FOR EACH ROW
    EXECUTE FUNCTION set_categories_audit_fields();

-- Comments
COMMENT ON TABLE product_categories IS 'Hierarchical product categories for organizing products';
COMMENT ON COLUMN product_categories.path IS 'Materialized path for efficient hierarchical queries';
COMMENT ON COLUMN product_categories.level IS 'Category level in hierarchy (0 = root)';

SELECT 'Migration 20260118000002_create_product_categories_table completed successfully' AS status;