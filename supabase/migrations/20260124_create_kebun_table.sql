-- Create farm table
CREATE TABLE IF NOT EXISTS public.farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('Aktif', 'Nonaktif')),
  location VARCHAR(255) NOT NULL,
  commodity VARCHAR(255) NOT NULL,
  area_ha DECIMAL(10, 2) NOT NULL CHECK (area_ha > 0),
  latitude DECIMAL(10, 8) NULL,
  longitude DECIMAL(11, 8) NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX idx_farm_user_id ON public.farms(user_id);
CREATE INDEX idx_farm_status ON public.farms(status);
CREATE INDEX idx_farm_location ON public.farms(location);

-- Enable Row Level Security
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow users to view their own farm
CREATE POLICY "Users can view own farm"
  ON public.farms
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own farm
CREATE POLICY "Users can insert own farm"
  ON public.farms
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own farm
CREATE POLICY "Users can update own farm"
  ON public.farms
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own farm
CREATE POLICY "Users can delete own farm"
  ON public.farms
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER set_farm_updated_at
  BEFORE UPDATE ON public.farms
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample data (optional)
INSERT INTO public.farms (name, status, location, commodity, area_ha, latitude, longitude, user_id)
VALUES
  ('Kebun Suka Maju', 'Aktif', 'Kec. Lembang', 'Kopi', 2.5, -6.905977, 107.613144, (SELECT id FROM auth.users LIMIT 1)),
  ('Kebun Makmur', 'Aktif', 'Kec. Garut', 'Kakao', 1.2, -7.220000, 107.900000, (SELECT id FROM auth.users LIMIT 1)),
  ('Kebun Sejahtera', 'Nonaktif', 'Kec. Tasik', 'Teh', 3.1, -7.327000, 108.220000, (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT DO NOTHING;

-- Comment on table and columns
COMMENT ON TABLE public.farms IS 'Tabel untuk menyimpan data kebun/lahan pertanian';
COMMENT ON COLUMN public.farms.id IS 'Primary key UUID';
COMMENT ON COLUMN public.farms.name IS 'Nama kebun';
COMMENT ON COLUMN public.farms.status IS 'Status kebun: Aktif atau Nonaktif';
COMMENT ON COLUMN public.farms.location IS 'Lokasi kebun (kecamatan/desa)';
COMMENT ON COLUMN public.farms.commodity IS 'Komoditas yang ditanam (kopi, kakao, teh, dll)';
COMMENT ON COLUMN public.farms.area_ha IS 'Luas lahan dalam hektar';
COMMENT ON COLUMN public.farms.latitude IS 'Koordinat latitude';
COMMENT ON COLUMN public.farms.longitude IS 'Koordinat longitude';
COMMENT ON COLUMN public.farms.user_id IS 'Foreign key ke auth.users (pemilik kebun)';
