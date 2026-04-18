-- Migration: Add Jurnal Kelas Table
-- Description: Create jurnal_kelas table for teacher daily journal per class

-- Create jurnal_kelas table
CREATE TABLE IF NOT EXISTS jurnal_kelas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guru_id UUID REFERENCES guru(id) ON DELETE CASCADE,
  kelas_id UUID REFERENCES kelas(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL,
  hafalan TEXT,
  tilawah TEXT,
  tulisan TEXT,
  materi_pendamping TEXT,
  jumlah_hadir INTEGER DEFAULT 0,
  jumlah_sakit INTEGER DEFAULT 0,
  jumlah_izin INTEGER DEFAULT 0,
  jumlah_alpa INTEGER DEFAULT 0,
  tugas_rumah TEXT,
  catatan_kelas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE jurnal_kelas ENABLE ROW LEVEL SECURITY;

-- Create policies for jurnal_kelas
-- Admin can read all jurnal_kelas
CREATE POLICY "Admin can read all jurnal_kelas" ON jurnal_kelas
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- Guru can manage jurnal_kelas for their own classes
CREATE POLICY "Guru can manage jurnal_kelas" ON jurnal_kelas
  FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'guru' AND 
    guru_id = auth.uid()
  );

-- Public can read jurnal_kelas (for parents to see homework)
CREATE POLICY "Public can read jurnal_kelas" ON jurnal_kelas
  FOR SELECT
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at_jurnal_kelas
  BEFORE UPDATE ON jurnal_kelas
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_jurnal_kelas_kelas_tanggal ON jurnal_kelas(kelas_id, tanggal);
CREATE INDEX IF NOT EXISTS idx_jurnal_kelas_guru ON jurnal_kelas(guru_id);
