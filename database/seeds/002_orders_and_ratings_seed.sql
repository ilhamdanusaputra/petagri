-- ================================================
-- Seed: 002_orders_and_ratings_seed
-- Description: Seed data for orders and mitra ratings
-- Author: System
-- Created: 2026-01-18
-- ================================================

-- Seed orders data (using existing mitra IDs from previous seed)
INSERT INTO orders (id, mitra_id, order_number, total_amount, status, items_count, notes, delivery_date, created_at, created_by) VALUES 
-- PT Agro Mandiri Sejahtera orders (simulate high performer)
('550e8400-e29b-41d4-a716-446655440001', 
 (SELECT id FROM mitra WHERE company_name = 'PT Agro Mandiri Sejahtera' LIMIT 1), 
 'ORD-2026-001', 15500000.00, 'delivered', 25, 'Pembelian pupuk organik bulk', '2026-01-15', '2025-12-20 09:30:00', 'system'),

('550e8400-e29b-41d4-a716-446655440002', 
 (SELECT id FROM mitra WHERE company_name = 'PT Agro Mandiri Sejahtera' LIMIT 1), 
 'ORD-2026-002', 8750000.00, 'delivered', 15, 'Pestisida organik', '2026-01-10', '2026-01-02 14:20:00', 'system'),

('550e8400-e29b-41d4-a716-446655440003', 
 (SELECT id FROM mitra WHERE company_name = 'PT Agro Mandiri Sejahtera' LIMIT 1), 
 'ORD-2026-003', 22500000.00, 'shipped', 35, 'Bibit unggul dan pupuk kombo', '2026-01-20', '2026-01-15 10:15:00', 'system'),

-- CV Tani Makmur Bersama orders (medium performer)
('550e8400-e29b-41d4-a716-446655440004', 
 (SELECT id FROM mitra WHERE company_name = 'CV Tani Makmur Bersama' LIMIT 1), 
 'ORD-2026-004', 12300000.00, 'delivered', 20, 'Alat pertanian modern', '2026-01-12', '2025-12-28 11:45:00', 'system'),

('550e8400-e29b-41d4-a716-446655440005', 
 (SELECT id FROM mitra WHERE company_name = 'CV Tani Makmur Bersama' LIMIT 1), 
 'ORD-2026-005', 6800000.00, 'processing', 12, 'Sistem irigasi tetes', '2026-01-22', '2026-01-16 16:30:00', 'system'),

-- UD Berkah Tani Nusantara orders (lower performer)
('550e8400-e29b-41d4-a716-446655440006', 
 (SELECT id FROM mitra WHERE company_name = 'UD Berkah Tani Nusantara' LIMIT 1), 
 'ORD-2026-006', 4500000.00, 'delivered', 8, 'Benih sayuran organik', '2026-01-08', '2025-12-30 13:20:00', 'system'),

('550e8400-e29b-41d4-a716-446655440007', 
 (SELECT id FROM mitra WHERE company_name = 'UD Berkah Tani Nusantara' LIMIT 1), 
 'ORD-2026-007', 3200000.00, 'cancelled', 5, 'Pupuk kandang organik', NULL, '2026-01-14 09:10:00', 'system'),

-- Additional orders from other mitra
('550e8400-e29b-41d4-a716-446655440008', 
 (SELECT id FROM mitra WHERE company_name LIKE 'PT%' AND company_name != 'PT Agro Mandiri Sejahtera' LIMIT 1), 
 'ORD-2026-008', 9500000.00, 'delivered', 18, 'Mixed agriculture supplies', '2026-01-11', '2026-01-03 08:45:00', 'system'),

('550e8400-e29b-41d4-a716-446655440009', 
 (SELECT id FROM mitra WHERE company_name LIKE 'CV%' AND company_name != 'CV Tani Makmur Bersama' LIMIT 1), 
 'ORD-2026-009', 7200000.00, 'confirmed', 14, 'Greenhouse equipment', '2026-01-25', '2026-01-17 15:00:00', 'system'),

('550e8400-e29b-41d4-a716-446655440010', 
 (SELECT id FROM mitra LIMIT 1 OFFSET 5), 
 'ORD-2026-010', 11800000.00, 'delivered', 22, 'Complete farming kit', '2026-01-13', '2026-01-05 12:30:00', 'system');

-- Seed ratings data
INSERT INTO mitra_ratings (id, mitra_id, order_id, rating, review, delivery_rating, quality_rating, service_rating, created_at, created_by) VALUES 
-- Ratings for PT Agro Mandiri Sejahtera (excellent ratings)
('660e8400-e29b-41d4-a716-446655440001',
 (SELECT mitra_id FROM orders WHERE order_number = 'ORD-2026-001'),
 '550e8400-e29b-41d4-a716-446655440001',
 5, 'Pelayanan sangat baik, produk berkualitas tinggi dan pengiriman tepat waktu', 5, 5, 5, '2026-01-16 10:00:00', 'customer'),

('660e8400-e29b-41d4-a716-446655440002',
 (SELECT mitra_id FROM orders WHERE order_number = 'ORD-2026-002'),
 '550e8400-e29b-41d4-a716-446655440002',
 5, 'Produk pestisida organik sangat efektif, akan order lagi', 5, 5, 4, '2026-01-11 14:30:00', 'customer'),

-- Ratings for CV Tani Makmur Bersama (good ratings)
('660e8400-e29b-41d4-a716-446655440003',
 (SELECT mitra_id FROM orders WHERE order_number = 'ORD-2026-004'),
 '550e8400-e29b-41d4-a716-446655440004',
 4, 'Alat pertanian bagus, namun pengiriman agak terlambat', 3, 5, 4, '2026-01-13 09:15:00', 'customer'),

-- Ratings for UD Berkah Tani Nusantara (mixed ratings)
('660e8400-e29b-41d4-a716-446655440004',
 (SELECT mitra_id FROM orders WHERE order_number = 'ORD-2026-006'),
 '550e8400-e29b-41d4-a716-446655440006',
 4, 'Benih bagus tapi kemasan kurang rapi', 4, 4, 3, '2026-01-09 16:45:00', 'customer'),

-- Additional ratings for better statistics
('660e8400-e29b-41d4-a716-446655440005',
 (SELECT mitra_id FROM orders WHERE order_number = 'ORD-2026-008'),
 '550e8400-e29b-41d4-a716-446655440008',
 4, 'Pelayanan memuaskan, produk sesuai harapan', 4, 4, 4, '2026-01-12 11:20:00', 'customer'),

('660e8400-e29b-41d4-a716-446655440006',
 (SELECT mitra_id FROM orders WHERE order_number = 'ORD-2026-010'),
 '550e8400-e29b-41d4-a716-446655440010',
 5, 'Paket farming kit lengkap dan berkualitas', 5, 5, 5, '2026-01-14 13:50:00', 'customer');