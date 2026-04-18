-- Migration: Add Pengumuman Table
-- Description: Create pengumuman table for bulletin board

-- Create pengumuman table
CREATE TABLE IF NOT EXISTS pengumuman (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  judul TEXT NOT NULL,
  isi TEXT NOT NULL,
  tanggal_mulai DATE NOT NULL,
  tanggal_selesai DATE,
  prioritas TEXT DEFAULT 'normal', -- 'normal', 'penting', 'urgent'
  created_by UUID REFERENCES guru(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE pengumuman ENABLE ROW LEVEL SECURITY;

-- Create policies for pengumuman
-- Admin can manage all pengumuman
CREATE POLICY "Admin can manage pengumuman" ON pengumuman
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Guru can create and read pengumuman
CREATE POLICY "Guru can create pengumuman" ON pengumuman
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'guru' AND created_by = auth.uid());

CREATE POLICY "Guru can read pengumuman" ON pengumuman
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'guru');

-- Public can read pengumuman
CREATE POLICY "Public can read pengumuman" ON pengumuman
  FOR SELECT
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at_pengumuman
  BEFORE UPDATE ON pengumuman
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_pengumuman_tanggal ON pengumuman(tanggal_mulai, tanggal_selesai);
