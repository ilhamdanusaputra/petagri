-- ================================================
-- Seed: Users with Roles
-- Date: 2026-01-19
-- Description: Create test users for each role
-- NOTE: Run this after roles are seeded
-- ================================================

-- This script assigns roles to existing users based on their email addresses
-- Users must be created first through the app registration or Supabase dashboard

-- IMPORTANT: Before running this script:
-- 1. Create users through the app with these emails (or via Supabase Dashboard):
--    - developer@petagri.com
--    - owner@petagri.com
--    - admin@petagri.com
--    - konsultan@petagri.com
--    - mitra@petagri.com
--    - pemilik@petagri.com
--    - supir@petagri.com
-- 2. Then run this script to assign roles

DO $$
DECLARE
    v_user_id UUID;
    v_role_id UUID;
    v_count INTEGER := 0;
BEGIN
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Assigning roles to test users...';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '';

    -- Developer role assignment
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'developer@petagri.com';
    IF v_user_id IS NOT NULL THEN
        SELECT id INTO v_role_id FROM roles WHERE name = 'developer';
        INSERT INTO user_roles (user_id, role_id)
        VALUES (v_user_id, v_role_id)
        ON CONFLICT (user_id, role_id) DO NOTHING;
        v_count := v_count + 1;
        RAISE NOTICE '✓ Assigned "developer" role to developer@petagri.com';
    ELSE
        RAISE NOTICE '✗ User not found: developer@petagri.com';
    END IF;

    -- Owner Platform role assignment
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'owner@petagri.com';
    IF v_user_id IS NOT NULL THEN
        SELECT id INTO v_role_id FROM roles WHERE name = 'owner_platform';
        INSERT INTO user_roles (user_id, role_id)
        VALUES (v_user_id, v_role_id)
        ON CONFLICT (user_id, role_id) DO NOTHING;
        v_count := v_count + 1;
        RAISE NOTICE '✓ Assigned "owner_platform" role to owner@petagri.com';
    ELSE
        RAISE NOTICE '✗ User not found: owner@petagri.com';
    END IF;

    -- Admin Platform role assignment
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@petagri.com';
    IF v_user_id IS NOT NULL THEN
        SELECT id INTO v_role_id FROM roles WHERE name = 'admin_platform';
        INSERT INTO user_roles (user_id, role_id)
        VALUES (v_user_id, v_role_id)
        ON CONFLICT (user_id, role_id) DO NOTHING;
        v_count := v_count + 1;
        RAISE NOTICE '✓ Assigned "admin_platform" role to admin@petagri.com';
    ELSE
        RAISE NOTICE '✗ User not found: admin@petagri.com';
    END IF;

    -- Konsultan role assignment
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'konsultan@petagri.com';
    IF v_user_id IS NOT NULL THEN
        SELECT id INTO v_role_id FROM roles WHERE name = 'konsultan';
        INSERT INTO user_roles (user_id, role_id)
        VALUES (v_user_id, v_role_id)
        ON CONFLICT (user_id, role_id) DO NOTHING;
        v_count := v_count + 1;
        RAISE NOTICE '✓ Assigned "konsultan" role to konsultan@petagri.com';
    ELSE
        RAISE NOTICE '✗ User not found: konsultan@petagri.com';
    END IF;

    -- Mitra Toko role assignment
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'mitra@petagri.com';
    IF v_user_id IS NOT NULL THEN
        SELECT id INTO v_role_id FROM roles WHERE name = 'mitra_toko';
        INSERT INTO user_roles (user_id, role_id)
        VALUES (v_user_id, v_role_id)
        ON CONFLICT (user_id, role_id) DO NOTHING;
        v_count := v_count + 1;
        RAISE NOTICE '✓ Assigned "mitra_toko" role to mitra@petagri.com';
    ELSE
        RAISE NOTICE '✗ User not found: mitra@petagri.com';
    END IF;

    -- Pemilik Kebun role assignment
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'pemilik@petagri.com';
    IF v_user_id IS NOT NULL THEN
        SELECT id INTO v_role_id FROM roles WHERE name = 'pemilik_kebun';
        INSERT INTO user_roles (user_id, role_id)
        VALUES (v_user_id, v_role_id)
        ON CONFLICT (user_id, role_id) DO NOTHING;
        v_count := v_count + 1;
        RAISE NOTICE '✓ Assigned "pemilik_kebun" role to pemilik@petagri.com';
    ELSE
        RAISE NOTICE '✗ User not found: pemilik@petagri.com';
    END IF;

    -- Supir role assignment
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'supir@petagri.com';
    IF v_user_id IS NOT NULL THEN
        SELECT id INTO v_role_id FROM roles WHERE name = 'supir';
        INSERT INTO user_roles (user_id, role_id)
        VALUES (v_user_id, v_role_id)
        ON CONFLICT (user_id, role_id) DO NOTHING;
        v_count := v_count + 1;
        RAISE NOTICE '✓ Assigned "supir" role to supir@petagri.com';
    ELSE
        RAISE NOTICE '✗ User not found: supir@petagri.com';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Summary: % role(s) assigned successfully', v_count;
    RAISE NOTICE '==========================================';
    
    IF v_count < 7 THEN
        RAISE NOTICE '';
        RAISE NOTICE 'Note: Some users were not found. Please create them first:';
        RAISE NOTICE '1. Register through the app at /register';
        RAISE NOTICE '2. Or create via Supabase Dashboard > Authentication > Users';
        RAISE NOTICE '3. Then run this script again to assign roles';
    END IF;
END $$;
