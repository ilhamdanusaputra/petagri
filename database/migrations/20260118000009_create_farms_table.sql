-- ================================================
-- Migration: 20260118000009_create_farms_table
-- Description: Create farms table for managing agricultural farms
-- Author: System
-- Created: 2026-01-18
-- ================================================

-- UP MIGRATION
-- Create farms table
CREATE TABLE IF NOT EXISTS farms (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic farm information
    farm_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    
    -- Location details
    address TEXT NOT NULL,
    coordinates POINT, -- Geographic coordinates (lat, lng)
    province VARCHAR(100),
    city VARCHAR(100),
    postal_code VARCHAR(10),
    
    -- Farm characteristics
    total_area DECIMAL(10,2) NOT NULL, -- in hectares
    crop_types VARCHAR(255)[], -- Array of crops grown
    farming_method VARCHAR(50) DEFAULT 'conventional' CHECK (farming_method IN ('organic', 'conventional', 'hydroponic', 'mixed')),
    
    -- Operational details
    established_year INTEGER,
    current_season VARCHAR(50),
    irrigation_system VARCHAR(100),
    soil_type VARCHAR(100),
    climate_zone VARCHAR(50),
    
    -- Business information
    annual_production_capacity DECIMAL(12,2), -- in tons
    primary_market VARCHAR(100), -- 'local', 'national', 'export'
    certification_status VARCHAR(50), -- 'organic', 'gap', 'halal', etc.
    
    -- Status and health
    farm_status VARCHAR(20) DEFAULT 'active' CHECK (farm_status IN ('active', 'inactive', 'maintenance')),
    health_score DECIMAL(3,2) DEFAULT 0.00 CHECK (health_score >= 0 AND health_score <= 5),
    last_consultation_date TIMESTAMP WITH TIME ZONE,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_farms_owner_name ON farms(owner_name);
CREATE INDEX IF NOT EXISTS idx_farms_status ON farms(farm_status);
CREATE INDEX IF NOT EXISTS idx_farms_crop_types ON farms USING GIN(crop_types);
CREATE INDEX IF NOT EXISTS idx_farms_location ON farms(province, city);
CREATE INDEX IF NOT EXISTS idx_farms_coordinates ON farms USING GIST(coordinates);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_farms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER farms_updated_at_trigger
    BEFORE UPDATE ON farms
    FOR EACH ROW
    EXECUTE FUNCTION update_farms_updated_at();

-- DOWN MIGRATION
-- Drop triggers and functions
DROP TRIGGER IF EXISTS farms_updated_at_trigger ON farms;
DROP FUNCTION IF EXISTS update_farms_updated_at();

-- Drop indexes
DROP INDEX IF EXISTS idx_farms_coordinates;
DROP INDEX IF EXISTS idx_farms_location;
DROP INDEX IF EXISTS idx_farms_crop_types;
DROP INDEX IF EXISTS idx_farms_status;
DROP INDEX IF EXISTS idx_farms_owner_name;

-- Drop table
DROP TABLE IF EXISTS farms;