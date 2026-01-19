-- ================================================
-- Migration: 20260117000001_create_mitra_table
-- Description: Create mitra (business partners) table
-- Author: System
-- Created: 2026-01-17
-- ================================================

-- UP MIGRATION
-- Create mitra table with all necessary columns and constraints
CREATE TABLE IF NOT EXISTS mitra (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Company information
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    
    -- Optional details
    address TEXT,
    business_type VARCHAR(100),
    description TEXT,
    website VARCHAR(255),
    
    -- Status management
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID,
    
    -- Constraints
    CONSTRAINT mitra_email_unique UNIQUE (email),
    CONSTRAINT mitra_status_check CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
    CONSTRAINT mitra_email_format CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$'),
    CONSTRAINT mitra_company_name_not_empty CHECK (LENGTH(TRIM(company_name)) > 0),
    CONSTRAINT mitra_contact_person_not_empty CHECK (LENGTH(TRIM(contact_person)) > 0)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_mitra_company_name ON mitra USING btree (company_name);
CREATE INDEX IF NOT EXISTS idx_mitra_email ON mitra USING btree (email);
CREATE INDEX IF NOT EXISTS idx_mitra_status ON mitra USING btree (status);
CREATE INDEX IF NOT EXISTS idx_mitra_created_by ON mitra USING btree (created_by);
CREATE INDEX IF NOT EXISTS idx_mitra_created_at ON mitra USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mitra_business_type ON mitra USING btree (business_type);
CREATE INDEX IF NOT EXISTS idx_mitra_active_status ON mitra USING btree (status) WHERE status = 'active';

-- Full-text search index for company name and contact person
CREATE INDEX IF NOT EXISTS idx_mitra_search ON mitra USING gin (
    to_tsvector('indonesian', coalesce(company_name, '') || ' ' || coalesce(contact_person, ''))
);

-- Enable Row Level Security (RLS) for Supabase
ALTER TABLE mitra ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Policy: Allow authenticated users to view active mitra
CREATE POLICY "view_active_mitra" ON mitra
    FOR SELECT
    USING (
        auth.role() = 'authenticated' 
        AND status IN ('active', 'pending')
    );

-- Policy: Allow users to view their own mitra records
CREATE POLICY "view_own_mitra" ON mitra
    FOR SELECT
    USING (
        auth.role() = 'authenticated'
        AND auth.uid() = created_by
    );

-- Policy: Allow authenticated users to view all mitra (admin level)
CREATE POLICY "view_all_mitra" ON mitra
    FOR SELECT
    USING (
        auth.role() = 'authenticated'
        AND (
            auth.jwt() ->> 'role' = 'admin'
            OR auth.jwt() ->> 'role' = 'manager'
        )
    );

-- Policy: Allow authenticated users to insert new mitra
CREATE POLICY "insert_mitra" ON mitra
    FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated'
    );

-- Policy: Allow users to update mitra they created or admins
CREATE POLICY "update_mitra" ON mitra
    FOR UPDATE
    USING (
        auth.role() = 'authenticated'
        AND (
            auth.uid() = created_by
            OR auth.jwt() ->> 'role' = 'admin'
            OR auth.jwt() ->> 'role' = 'manager'
        )
    );

-- Policy: Allow admins to delete mitra
CREATE POLICY "delete_mitra" ON mitra
    FOR DELETE
    USING (
        auth.role() = 'authenticated'
        AND (
            auth.jwt() ->> 'role' = 'admin'
        )
    );

-- Create function to automatically set created_by and updated_by
CREATE OR REPLACE FUNCTION set_mitra_audit_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        NEW.created_by = auth.uid();
        NEW.created_at = CURRENT_TIMESTAMP;
        NEW.updated_by = auth.uid();
        NEW.updated_at = CURRENT_TIMESTAMP;
    ELSIF TG_OP = 'UPDATE' THEN
        NEW.created_by = OLD.created_by; -- Preserve original creator
        NEW.created_at = OLD.created_at; -- Preserve original creation time
        NEW.updated_by = auth.uid();
        NEW.updated_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for audit fields
CREATE TRIGGER trigger_mitra_audit_fields
    BEFORE INSERT OR UPDATE ON mitra
    FOR EACH ROW
    EXECUTE FUNCTION set_mitra_audit_fields();

-- Create function for updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_mitra_updated_at
    BEFORE UPDATE ON mitra
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add table and column comments for documentation
COMMENT ON TABLE mitra IS 'Business partners/mitra information and management';
COMMENT ON COLUMN mitra.id IS 'Unique identifier for the business partner';
COMMENT ON COLUMN mitra.company_name IS 'Official name of the partner company';
COMMENT ON COLUMN mitra.contact_person IS 'Primary contact person name';
COMMENT ON COLUMN mitra.email IS 'Primary contact email address (must be unique)';
COMMENT ON COLUMN mitra.phone IS 'Primary contact phone number';
COMMENT ON COLUMN mitra.address IS 'Complete business address';
COMMENT ON COLUMN mitra.business_type IS 'Type of business partnership (e.g., Distributor, Supplier, Retailer)';
COMMENT ON COLUMN mitra.description IS 'Detailed description of the partner business';
COMMENT ON COLUMN mitra.website IS 'Official company website URL';
COMMENT ON COLUMN mitra.status IS 'Current partnership status: active, inactive, pending, suspended';
COMMENT ON COLUMN mitra.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN mitra.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN mitra.created_by IS 'UUID of user who created this record';
COMMENT ON COLUMN mitra.updated_by IS 'UUID of user who last updated this record';

-- Grant necessary permissions (adjust based on your user roles)
-- GRANT SELECT, INSERT, UPDATE ON mitra TO authenticated;
-- GRANT USAGE ON SEQUENCE mitra_id_seq TO authenticated;

-- Success message
SELECT 'Migration 20260117000001_create_mitra_table completed successfully' AS status;