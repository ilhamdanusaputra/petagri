CREATE VIEW v_profiles AS
SELECT
    u.id,
    u.email,
    u.raw_user_meta_data->>'full_name' AS full_name,
    u.raw_user_meta_data->>'phone' AS phone,
    array_agg(r.name) AS roles
FROM auth.users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN roles r ON r.id = ur.role_id
GROUP BY u.id;
