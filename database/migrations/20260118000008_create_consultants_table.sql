-- ================================================
-- Migration: 20260118000008_create_consultants_table
-- Description: Create consultants table for managing agricultural consultants
-- Author: System
-- Created: 2026-01-18
-- ================================================

-- UP MIGRATION
-- Create consultants table
CREATE TABLE IF NOT EXISTS consultants (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Personal information
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL,
    
    -- Professional details
    specialization VARCHAR(255) NOT NULL, -- e.g., 'Crop Management', 'Soil Health', 'Pest Control'
    experience_years INTEGER DEFAULT 0,
    certification TEXT[], -- Array of certifications
    bio TEXT,
    
    -- Location and availability
    service_areas VARCHAR(255)[], -- Array of areas they serve
    availability_status VARCHAR(20) DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'unavailable')),
    
    -- Professional metrics
    rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    total_consultations INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00 CHECK (success_rate >= 0 AND success_rate <= 100),
    
    -- Status management
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_consultants_email ON consultants(email);
CREATE INDEX IF NOT EXISTS idx_consultants_status ON consultants(status);
CREATE INDEX IF NOT EXISTS idx_consultants_availability ON consultants(availability_status);
CREATE INDEX IF NOT EXISTS idx_consultants_specialization ON consultants(specialization);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_consultants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER consultants_updated_at_trigger
    BEFORE UPDATE ON consultants
    FOR EACH ROW
    EXECUTE FUNCTION update_consultants_updated_at();

-- DOWN MIGRATION
-- Drop triggers and functions
DROP TRIGGER IF EXISTS consultants_updated_at_trigger ON consultants;
DROP FUNCTION IF EXISTS update_consultants_updated_at();

-- Drop indexes
DROP INDEX IF EXISTS idx_consultants_specialization;
DROP INDEX IF EXISTS idx_consultants_availability;
DROP INDEX IF EXISTS idx_consultants_status;
DROP INDEX IF EXISTS idx_consultants_email;

-- Drop table
DROP TABLE IF EXISTS consultants;