-- ================================================
-- Migration: 20260118000006_create_mitra_ratings_table
-- Description: Create ratings table for mitra performance tracking
-- Author: System
-- Created: 2026-01-18
-- ================================================

-- UP MIGRATION
-- Create mitra_ratings table for tracking ratings and reviews
CREATE TABLE IF NOT EXISTS mitra_ratings (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign keys
    mitra_id UUID NOT NULL REFERENCES mitra(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    
    -- Rating information
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    
    -- Additional metrics
    delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_mitra_ratings_mitra_id ON mitra_ratings(mitra_id);
CREATE INDEX IF NOT EXISTS idx_mitra_ratings_order_id ON mitra_ratings(order_id);
CREATE INDEX IF NOT EXISTS idx_mitra_ratings_rating ON mitra_ratings(rating);
CREATE INDEX IF NOT EXISTS idx_mitra_ratings_created_at ON mitra_ratings(created_at);

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_mitra_ratings_updated_at ON mitra_ratings;
CREATE TRIGGER update_mitra_ratings_updated_at
    BEFORE UPDATE ON mitra_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comment on table and columns
COMMENT ON TABLE mitra_ratings IS 'Ratings and reviews table for mitra performance evaluation';
COMMENT ON COLUMN mitra_ratings.id IS 'Primary key UUID for ratings';
COMMENT ON COLUMN mitra_ratings.mitra_id IS 'Foreign key reference to mitra table';
COMMENT ON COLUMN mitra_ratings.order_id IS 'Optional foreign key reference to orders table';
COMMENT ON COLUMN mitra_ratings.rating IS 'Overall rating from 1-5 stars';
COMMENT ON COLUMN mitra_ratings.review IS 'Text review/feedback';
COMMENT ON COLUMN mitra_ratings.delivery_rating IS 'Rating for delivery service (1-5)';
COMMENT ON COLUMN mitra_ratings.quality_rating IS 'Rating for product quality (1-5)';
COMMENT ON COLUMN mitra_ratings.service_rating IS 'Rating for customer service (1-5)';

-- DOWN MIGRATION (for rollback)
-- DROP TABLE IF EXISTS mitra_ratings CASCADE;