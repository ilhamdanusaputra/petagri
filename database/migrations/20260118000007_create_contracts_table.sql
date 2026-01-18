-- ================================================
-- Migration: 20260118000007_create_contracts_table
-- Description: Create contracts table for mitra partnership agreements
-- Author: System
-- Created: 2026-01-18
-- ================================================

-- UP MIGRATION
-- Create contracts table for partnership agreements
CREATE TABLE IF NOT EXISTS contracts (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign keys
    mitra_id UUID NOT NULL REFERENCES mitra(id) ON DELETE CASCADE,
    
    -- Contract information
    contract_number VARCHAR(100) NOT NULL UNIQUE,
    contract_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Contract terms
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    value DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    
    -- Contract status
    status VARCHAR(20) DEFAULT 'draft' NOT NULL,
    
    -- Additional details
    terms_conditions TEXT,
    payment_terms TEXT,
    delivery_terms TEXT,
    penalties TEXT,
    renewal_options TEXT,
    
    -- File attachments (store file paths/URLs)
    contract_file_url VARCHAR(500),
    signed_file_url VARCHAR(500),
    
    -- Signature information
    signed_by_mitra VARCHAR(255),
    signed_date_mitra DATE,
    signed_by_company VARCHAR(255),
    signed_date_company DATE,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contracts_mitra_id ON contracts(mitra_id);
CREATE INDEX IF NOT EXISTS idx_contracts_contract_number ON contracts(contract_number);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_start_date ON contracts(start_date);
CREATE INDEX IF NOT EXISTS idx_contracts_end_date ON contracts(end_date);
CREATE INDEX IF NOT EXISTS idx_contracts_contract_type ON contracts(contract_type);

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_contracts_updated_at ON contracts;
CREATE TRIGGER update_contracts_updated_at
    BEFORE UPDATE ON contracts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add constraints
ALTER TABLE contracts ADD CONSTRAINT check_contracts_value_positive 
    CHECK (value >= 0);

ALTER TABLE contracts ADD CONSTRAINT check_contracts_dates_valid 
    CHECK (start_date <= end_date);

ALTER TABLE contracts ADD CONSTRAINT check_contracts_status_valid 
    CHECK (status IN ('draft', 'pending', 'active', 'expired', 'cancelled', 'suspended'));

-- Comment on table and columns
COMMENT ON TABLE contracts IS 'Partnership contracts table for managing mitra agreements';
COMMENT ON COLUMN contracts.id IS 'Primary key UUID for contracts';
COMMENT ON COLUMN contracts.mitra_id IS 'Foreign key reference to mitra table';
COMMENT ON COLUMN contracts.contract_number IS 'Unique contract reference number';
COMMENT ON COLUMN contracts.contract_type IS 'Type of contract (Distribusi Eksklusif, Supply Agreement, etc.)';
COMMENT ON COLUMN contracts.title IS 'Contract title or name';
COMMENT ON COLUMN contracts.description IS 'Brief description of the contract';
COMMENT ON COLUMN contracts.start_date IS 'Contract effective start date';
COMMENT ON COLUMN contracts.end_date IS 'Contract expiration date';
COMMENT ON COLUMN contracts.value IS 'Total contract value in IDR';
COMMENT ON COLUMN contracts.status IS 'Contract status (draft, pending, active, expired, cancelled, suspended)';
COMMENT ON COLUMN contracts.terms_conditions IS 'Detailed terms and conditions';
COMMENT ON COLUMN contracts.payment_terms IS 'Payment terms and conditions';
COMMENT ON COLUMN contracts.delivery_terms IS 'Delivery terms and conditions';
COMMENT ON COLUMN contracts.penalties IS 'Penalty clauses and conditions';
COMMENT ON COLUMN contracts.renewal_options IS 'Contract renewal options and terms';
COMMENT ON COLUMN contracts.contract_file_url IS 'URL path to contract document file';
COMMENT ON COLUMN contracts.signed_file_url IS 'URL path to signed contract file';
COMMENT ON COLUMN contracts.signed_by_mitra IS 'Name of person who signed for mitra';
COMMENT ON COLUMN contracts.signed_date_mitra IS 'Date when mitra signed the contract';
COMMENT ON COLUMN contracts.signed_by_company IS 'Name of person who signed for company';
COMMENT ON COLUMN contracts.signed_date_company IS 'Date when company signed the contract';

-- DOWN MIGRATION (for rollback)
-- DROP TABLE IF EXISTS contracts CASCADE;