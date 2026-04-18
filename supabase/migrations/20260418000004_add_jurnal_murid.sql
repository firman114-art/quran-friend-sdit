-- Migration: Add Jurnal Murid Table
-- Description: Create jurnal_murid table for student home journal (filled by parents)

-- Create jurnal_murid table
CREATE TABLE IF NOT EXISTS jurnal_murid (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  siswa_id UUID REFERENCES siswa(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL,
  shalat_subuh BOOLEAN DEFAULT false,
  shalat_dzuhur BOOLEAN DEFAULT false,
  shalat_ashar BOOLEAN DEFAULT false,
  shalat_maghrib BOOLEAN DEFAULT false,
  shalat_isya BOOLEAN DEFAULT false,
  murojaah_hafalan TEXT,
  murojaah_tilawah TEXT,
  catatan_ortu TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE jurnal_murid ENABLE ROW LEVEL SECURITY;

-- Create policies for jurnal_murid
-- Admin can read all jurnal_murid
CREATE POLICY "Admin can read all jurnal_murid" ON jurnal_murid
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- Guru can read jurnal_murid for students in their classes
CREATE POLICY "Guru can read jurnal_murid" ON jurnal_murid
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'guru' AND
    EXISTS (
      SELECT 1 FROM siswa s
      JOIN kelas k ON s.kelas_id = k.id
      JOIN guru g ON k.guru_id = g.id
      WHERE s.id = jurnal_murid.siswa_id AND g.id = auth.uid()
    )
  );

-- Public can insert jurnal_murid (for parents without login)
CREATE POLICY "Public can insert jurnal_murid" ON jurnal_murid
  FOR INSERT
  WITH CHECK (true);

-- Public can read jurnal_murid (for parents to see their child's journal)
CREATE POLICY "Public can read jurnal_murid" ON jurnal_murid
  FOR SELECT
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at_jurnal_murid
  BEFORE UPDATE ON jurnal_murid
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_jurnal_murid_siswa_tanggal ON jurnal_murid(siswa_id, tanggal);
