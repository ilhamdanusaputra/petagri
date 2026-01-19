-- ================================================
-- Migration: Create roles table
-- Date: 2026-01-19
-- Description: User roles system for access control
-- ================================================

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES auth.users(id),
    UNIQUE(user_id, role_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION update_roles_updated_at();

-- Enable Row Level Security
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for roles table
CREATE POLICY "Anyone can view active roles"
    ON roles FOR SELECT
    USING (is_active = true);

CREATE POLICY "Only admins can insert roles"
    ON roles FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.name IN ('developer', 'owner_platform', 'admin_platform')
        )
    );

CREATE POLICY "Only admins can update roles"
    ON roles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.name IN ('developer', 'owner_platform', 'admin_platform')
        )
    );

-- RLS Policies for user_roles table
CREATE POLICY "Users can view their own roles"
    ON user_roles FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Admins can view all user roles"
    ON user_roles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.name IN ('developer', 'owner_platform', 'admin_platform')
        )
    );

CREATE POLICY "Only admins can assign roles"
    ON user_roles FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.name IN ('developer', 'owner_platform', 'admin_platform')
        )
    );

CREATE POLICY "Only admins can remove role assignments"
    ON user_roles FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.name IN ('developer', 'owner_platform', 'admin_platform')
        )
    );

-- Add comments
COMMENT ON TABLE roles IS 'System roles for user access control';
COMMENT ON TABLE user_roles IS 'Junction table for user-role assignments (many-to-many)';
COMMENT ON COLUMN roles.name IS 'Unique role identifier (snake_case)';
COMMENT ON COLUMN roles.display_name IS 'Human-readable role name';
COMMENT ON COLUMN roles.permissions IS 'JSON object containing role permissions';
