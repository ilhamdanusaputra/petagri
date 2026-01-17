-- ================================================
-- Down Migration: 20260117000001_create_mitra_table
-- Description: Rollback mitra (business partners) table creation
-- Author: System
-- Created: 2026-01-17
-- ================================================

-- DOWN MIGRATION
-- This file contains commands to rollback the mitra table creation

-- Drop triggers first (dependencies)
DROP TRIGGER IF EXISTS trigger_mitra_audit_fields ON mitra;
DROP TRIGGER IF EXISTS trigger_mitra_updated_at ON mitra;

-- Drop functions
DROP FUNCTION IF EXISTS set_mitra_audit_fields();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop RLS policies
DROP POLICY IF EXISTS "view_active_mitra" ON mitra;
DROP POLICY IF EXISTS "view_all_mitra" ON mitra;
DROP POLICY IF EXISTS "insert_mitra" ON mitra;
DROP POLICY IF EXISTS "update_mitra" ON mitra;
DROP POLICY IF EXISTS "delete_mitra" ON mitra;

-- Drop indexes (they will be dropped automatically with table, but being explicit)
DROP INDEX IF EXISTS idx_mitra_company_name;
DROP INDEX IF EXISTS idx_mitra_email;
DROP INDEX IF EXISTS idx_mitra_status;
DROP INDEX IF EXISTS idx_mitra_created_at;
DROP INDEX IF EXISTS idx_mitra_business_type;
DROP INDEX IF EXISTS idx_mitra_active_status;
DROP INDEX IF EXISTS idx_mitra_search;

-- Drop the table (this will cascade and remove all constraints and indexes)
DROP TABLE IF EXISTS mitra CASCADE;

-- Success message
SELECT 'Rollback 20260117000001_create_mitra_table completed successfully - mitra table removed' AS status;