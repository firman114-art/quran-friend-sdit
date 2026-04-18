-- Migration: Add Badges/Achievements Table
-- Description: Create badges table for student motivation system

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL UNIQUE,
  deskripsi TEXT,
  ikon TEXT, -- emoji or icon name
  kriteria TEXT, -- description of how to earn this badge
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create siswa_badges junction table
CREATE TABLE IF NOT EXISTS siswa_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  siswa_id UUID REFERENCES siswa(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  tanggal_diperoleh DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(siswa_id, badge_id)
);

-- Enable RLS
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE siswa_badges ENABLE ROW LEVEL SECURITY;

-- Policies for badges
CREATE POLICY "Public can read badges" ON badges
  FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage badges" ON badges
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Policies for siswa_badges
CREATE POLICY "Public can read siswa_badges" ON siswa_badges
  FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage siswa_badges" ON siswa_badges
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Guru can manage siswa_badges" ON siswa_badges
  FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'guru' AND
    EXISTS (
      SELECT 1 FROM siswa s
      JOIN kelas k ON s.kelas_id = k.id
      JOIN guru g ON k.guru_id = g.id
      WHERE s.id = siswa_badges.siswa_id AND g.id = auth.uid()
    )
  );

-- Insert default badges
INSERT INTO badges (nama, deskripsi, ikon, kriteria) VALUES
  ('Istiqamah', 'Setoran berturut-turut seminggu penuh', '🌟', 'Menyetorkan hafalan berturut-turut selama seminggu tanpa bolong'),
  ('Hafidz Juz 30', 'Selesai hafalan Juz 30', '📖', 'Menyelesaikan hafalan Juz 30'),
  ('Hafidz Juz 29', 'Selesai hafalan Juz 29', '📚', 'Menyelesaikan hafalan Juz 29'),
  ('Bintang Emas', 'Penilaian Mumtaz berturut-turut', '⭐', 'Mendapatkan penilaian Mumtaz berturut-turut'),
  ('Rajin Setoran', 'Setoran terbanyak bulan ini', '🏆', 'Menjadi murid dengan setoran terbanyak di bulan ini'),
  ('Kehadiran Sempurna', 'Hadir semua pertemuan bulan ini', '✅', 'Hadir semua pertemuan dalam satu bulan')
ON CONFLICT (nama) DO NOTHING;
