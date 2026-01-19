-- ================================================
-- Seed: Roles
-- Date: 2026-01-19
-- Description: Insert default system roles
-- ================================================

-- Insert default roles
INSERT INTO roles (name, display_name, description, permissions, is_active) VALUES
(
    'developer',
    'Developer',
    'Full system access for development and debugging',
    '{
        "system": ["read", "write", "delete", "debug"],
        "users": ["read", "write", "delete", "manage_roles"],
        "mitra": ["read", "write", "delete"],
        "products": ["read", "write", "delete"],
        "tenders": ["read", "write", "delete", "manage_winners"],
        "consultations": ["read", "write", "delete"],
        "orders": ["read", "write", "delete"],
        "reports": ["read", "export"]
    }'::jsonb,
    true
),
(
    'owner_platform',
    'Owner Platform',
    'Platform owner with full administrative access',
    '{
        "system": ["read", "write"],
        "users": ["read", "write", "delete", "manage_roles"],
        "mitra": ["read", "write", "delete", "approve"],
        "products": ["read", "write", "delete", "approve"],
        "tenders": ["read", "write", "delete", "manage_winners"],
        "consultations": ["read", "write", "delete"],
        "orders": ["read", "write", "delete"],
        "reports": ["read", "export"],
        "finance": ["read", "write", "approve"]
    }'::jsonb,
    true
),
(
    'admin_platform',
    'Admin Platform',
    'Platform administrator with management capabilities',
    '{
        "users": ["read", "write"],
        "mitra": ["read", "write", "approve"],
        "products": ["read", "write", "approve"],
        "tenders": ["read", "write"],
        "consultations": ["read", "write"],
        "orders": ["read", "write"],
        "reports": ["read", "export"]
    }'::jsonb,
    true
),
(
    'konsultan',
    'Konsultan',
    'Agricultural consultant providing expert advice',
    '{
        "consultations": ["read", "write", "manage_own"],
        "farms": ["read", "write"],
        "products": ["read", "recommend"],
        "tenders": ["read", "create_from_visit"],
        "reports": ["read", "export_own"]
    }'::jsonb,
    true
),
(
    'mitra_toko',
    'Mitra Toko',
    'Shop partner managing products and orders',
    '{
        "products": ["read", "write", "manage_own"],
        "orders": ["read", "write", "manage_own"],
        "tenders": ["read", "bid", "manage_own_bids"],
        "inventory": ["read", "write", "manage_own"],
        "reports": ["read", "export_own"]
    }'::jsonb,
    true
),
(
    'pemilik_kebun',
    'Pemilik Kebun',
    'Farm owner managing their agricultural operations',
    '{
        "farms": ["read", "write", "manage_own"],
        "consultations": ["read", "request", "manage_own"],
        "products": ["read"],
        "tenders": ["read", "view_own"],
        "orders": ["read", "create"],
        "reports": ["read", "export_own"]
    }'::jsonb,
    true
),
(
    'supir',
    'Supir',
    'Driver managing deliveries and logistics',
    '{
        "orders": ["read", "view_assigned"],
        "deliveries": ["read", "write", "update_status"],
        "routes": ["read"],
        "reports": ["read", "export_own"]
    }'::jsonb,
    true
)
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    permissions = EXCLUDED.permissions,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();
