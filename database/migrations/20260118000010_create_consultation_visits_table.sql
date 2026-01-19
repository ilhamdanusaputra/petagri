-- ================================================
-- Migration: 20260118000010_create_consultation_visits_table
-- Description: Create consultation visits table for managing farm consultations
-- Author: System
-- Created: 2026-01-18
-- ================================================

-- UP MIGRATION
-- Create consultation_visits table
CREATE TABLE IF NOT EXISTS consultation_visits (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relationships
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    consultant_id UUID NOT NULL REFERENCES consultants(id) ON DELETE CASCADE,
    
    -- Visit scheduling
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    estimated_duration INTEGER DEFAULT 120, -- minutes
    visit_type VARCHAR(50) DEFAULT 'regular' CHECK (visit_type IN ('regular', 'emergency', 'follow_up', 'initial')),
    
    -- Visit details
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    visit_status VARCHAR(20) DEFAULT 'scheduled' CHECK (visit_status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled')),
    
    -- Consultation outcomes
    consultation_notes TEXT,
    problems_identified TEXT[],
    recommendations TEXT[],
    recommended_products UUID[], -- References to products table
    
    -- Visit assessment
    visit_rating DECIMAL(3,2) CHECK (visit_rating >= 0 AND visit_rating <= 5),
    farmer_feedback TEXT,
    consultant_feedback TEXT,
    
    -- Follow-up
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date TIMESTAMP WITH TIME ZONE,
    follow_up_notes TEXT,
    
    -- Documentation
    photos TEXT[], -- Array of photo URLs
    documents TEXT[], -- Array of document URLs
    
    -- Billing and cost
    consultation_fee DECIMAL(10,2) DEFAULT 0.00,
    travel_cost DECIMAL(10,2) DEFAULT 0.00,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_consultation_visits_farm_id ON consultation_visits(farm_id);
CREATE INDEX IF NOT EXISTS idx_consultation_visits_consultant_id ON consultation_visits(consultant_id);
CREATE INDEX IF NOT EXISTS idx_consultation_visits_scheduled_date ON consultation_visits(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_consultation_visits_status ON consultation_visits(visit_status);
CREATE INDEX IF NOT EXISTS idx_consultation_visits_type ON consultation_visits(visit_type);
CREATE INDEX IF NOT EXISTS idx_consultation_visits_problems ON consultation_visits USING GIN(problems_identified);
CREATE INDEX IF NOT EXISTS idx_consultation_visits_products ON consultation_visits USING GIN(recommended_products);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_consultation_visits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER consultation_visits_updated_at_trigger
    BEFORE UPDATE ON consultation_visits
    FOR EACH ROW
    EXECUTE FUNCTION update_consultation_visits_updated_at();

-- DOWN MIGRATION
-- Drop triggers and functions
DROP TRIGGER IF EXISTS consultation_visits_updated_at_trigger ON consultation_visits;
DROP FUNCTION IF EXISTS update_consultation_visits_updated_at();

-- Drop indexes
DROP INDEX IF EXISTS idx_consultation_visits_products;
DROP INDEX IF EXISTS idx_consultation_visits_problems;
DROP INDEX IF EXISTS idx_consultation_visits_type;
DROP INDEX IF EXISTS idx_consultation_visits_status;
DROP INDEX IF EXISTS idx_consultation_visits_scheduled_date;
DROP INDEX IF EXISTS idx_consultation_visits_consultant_id;
DROP INDEX IF EXISTS idx_consultation_visits_farm_id;

-- Drop table
DROP TABLE IF EXISTS consultation_visits;