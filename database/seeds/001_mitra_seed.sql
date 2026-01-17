-- Seed data for mitra (partners) table
-- Insert sample partner data for testing

INSERT INTO mitra (
    company_name,
    contact_person,
    email,
    phone,
    address,
    business_type,
    description,
    website,
    status
) VALUES 
(
    'PT Agro Mandiri Sejahtera',
    'Budi Santoso',
    'budi@agromandiri.com',
    '+62-21-5555-1234',
    'Jl. Sudirman No. 123, Jakarta Pusat, Jakarta 10220',
    'Distributor',
    'Distributor utama untuk produk pertanian organik di wilayah Jakarta dan sekitarnya. Melayani petani, toko tani, dan konsumen akhir.',
    'https://www.agromandiri.com',
    'active'
),
(
    'CV Tani Makmur Bersama',
    'Siti Rahayu',
    'siti@tanimakmur.co.id',
    '+62-274-555-5678',
    'Jl. Malioboro No. 45, Yogyakarta 55271',
    'Supplier',
    'Supplier pupuk organik dan pestisida alami. Fokus pada produk ramah lingkungan dan berkelanjutan.',
    'https://tanimakmur.co.id',
    'active'
),
(
    'UD Berkah Tani Nusantara',
    'Ahmad Wijaya',
    'ahmad@berkahtani.com',
    '+62-31-7777-9012',
    'Jl. Raya Surabaya-Malang KM 15, Surabaya, Jawa Timur 60199',
    'Retailer',
    'Toko ritel lengkap untuk kebutuhan pertanian modern. Menyediakan bibit, pupuk, alat pertanian, dan konsultasi.',
    'https://berkahtani.com',
    'active'
),
(
    'PT Sumber Rejeki Pertanian',
    'Indira Kusuma',
    'indira@sumberrejeki.id',
    '+62-22-4444-3456',
    'Jl. Asia Afrika No. 88, Bandung, Jawa Barat 40112',
    'Distributor',
    'Distributor alat dan mesin pertanian terbesar di Jawa Barat. Melayani B2B dan B2C.',
    'https://sumberrejeki.id',
    'pending'
),
(
    'Koperasi Tani Harapan Jaya',
    'Bambang Suprianto',
    'bambang@koperasitani.org',
    '+62-541-888-2468',
    'Jl. Veteran No. 67, Samarinda, Kalimantan Timur 75123',
    'Supplier',
    'Koperasi yang mengkhususkan diri pada penyediaan bibit unggul dan teknologi pertanian modern.',
    null,
    'active'
),
(
    'PT Agro Tech Solutions',
    'Dr. Maria Andayani',
    'maria@agrotech.co.id',
    '+62-361-999-1357',
    'Jl. Bypass Ngurah Rai No. 234, Denpasar, Bali 80361',
    'Technology Provider',
    'Penyedia solusi teknologi pertanian pintar (smart farming) dan sistem IoT untuk monitoring pertanian.',
    'https://agrotech.co.id',
    'active'
);

-- Verify the inserted data
SELECT 
    company_name,
    contact_person,
    email,
    business_type,
    status,
    created_at
FROM mitra 
ORDER BY created_at ASC;