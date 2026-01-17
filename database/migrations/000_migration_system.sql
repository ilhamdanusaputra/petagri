-- ================================================
-- Migration Runner for Supabase
-- Description: Helper script to track and run migrations
-- ================================================

-- Create migrations tracking table if it doesn't exist
CREATE TABLE IF NOT EXISTS schema_migrations (
    id SERIAL PRIMARY KEY,
    version VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    checksum TEXT,
    execution_time_ms INTEGER,
    success BOOLEAN DEFAULT TRUE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_schema_migrations_version ON schema_migrations(version);

-- Function to record migration execution
CREATE OR REPLACE FUNCTION record_migration(
    migration_version VARCHAR(50),
    migration_name VARCHAR(255),
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) RETURNS void AS $$
DECLARE
    execution_time INTEGER;
BEGIN
    execution_time := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
    
    INSERT INTO schema_migrations (version, name, executed_at, execution_time_ms)
    VALUES (migration_version, migration_name, start_time, execution_time)
    ON CONFLICT (version) 
    DO UPDATE SET 
        executed_at = start_time,
        execution_time_ms = execution_time;
END;
$$ LANGUAGE plpgsql;

-- Check if migration has been executed
CREATE OR REPLACE FUNCTION migration_exists(migration_version VARCHAR(50))
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM schema_migrations 
        WHERE version = migration_version AND success = TRUE
    );
END;
$$ LANGUAGE plpgsql;

-- View to see all migrations
CREATE OR REPLACE VIEW migrations_status AS
SELECT 
    version,
    name,
    executed_at,
    execution_time_ms,
    success,
    CASE 
        WHEN success THEN '✅ Success'
        ELSE '❌ Failed'
    END as status
FROM schema_migrations
ORDER BY version;

-- Grant permissions
-- GRANT SELECT ON migrations_status TO authenticated;
-- GRANT SELECT, INSERT, UPDATE ON schema_migrations TO authenticated;

SELECT 'Migration tracking system created successfully' AS status;