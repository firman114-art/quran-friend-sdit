-- Migration: Add Master Kelas Table
-- Description: Create master kelas table for class management

-- Create master_kelas table
CREATE TABLE IF NOT EXISTS master_kelas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kode_kelas TEXT NOT NULL UNIQUE,
  nama_kelas TEXT NOT NULL,
  wali_kelas TEXT,
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE master_kelas ENABLE ROW LEVEL SECURITY;

-- Create policies for master_kelas
-- Admin can do everything
CREATE POLICY "Admin can manage master_kelas" ON master_kelas
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Guru can read master_kelas
CREATE POLICY "Guru can read master_kelas" ON master_kelas
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'guru');

-- Public can read master_kelas (for dropdown in public access)
CREATE POLICY "Public can read master_kelas" ON master_kelas
  FOR SELECT
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at_master_kelas
  BEFORE UPDATE ON master_kelas
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Insert sample data
INSERT INTO master_kelas (kode_kelas, nama_kelas, wali_kelas, keterangan) VALUES
  ('K-001', 'Kelas 1 Abu Bakar', 'Ustazah Siti', NULL),
  ('K-002', 'Kelas 1 Umar', 'Ustaz Ahmad', NULL),
  ('K-003', 'Kelas 2 Ali', 'Ustazah Fatimah', NULL)
ON CONFLICT (kode_kelas) DO NOTHING;
