-- Migration: Create Missing Tables
-- Description: Create pengumuman, jurnal_kelas, jurnal_murid, and daily_records tables with RLS policies

-- Create has_role function if it doesn't exist
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = has_role.user_id AND role = has_role.role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create pengumuman table
CREATE TABLE IF NOT EXISTS public.pengumuman (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  judul TEXT NOT NULL,
  isi TEXT NOT NULL,
  prioritas TEXT DEFAULT 'normal' CHECK (prioritas IN ('low', 'normal', 'high')),
  tanggal TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on pengumuman
ALTER TABLE public.pengumuman ENABLE ROW LEVEL SECURITY;

-- RLS policies for pengumuman
CREATE POLICY "Admin can manage pengumuman" ON public.pengumuman
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Guru can create pengumuman" ON public.pengumuman
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'guru'));

CREATE POLICY "Public can read pengumuman" ON public.pengumuman
  FOR SELECT
  USING (true);

-- Create trigger for updated_at on pengumuman
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pengumuman_updated_at
  BEFORE UPDATE ON public.pengumuman
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create jurnal_kelas table
CREATE TABLE IF NOT EXISTS public.jurnal_kelas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guru_id UUID REFERENCES auth.users(id) NOT NULL,
  kelas_id UUID NOT NULL,
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

-- Enable RLS on jurnal_kelas
ALTER TABLE public.jurnal_kelas ENABLE ROW LEVEL SECURITY;

-- RLS policies for jurnal_kelas
CREATE POLICY "Admin can read all jurnal_kelas" ON public.jurnal_kelas
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Guru can insert jurnal_kelas" ON public.jurnal_kelas
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'guru'));

CREATE POLICY "Guru can update jurnal_kelas" ON public.jurnal_kelas
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'guru'));

CREATE POLICY "Guru can read own jurnal_kelas" ON public.jurnal_kelas
  FOR SELECT
  USING (public.has_role(auth.uid(), 'guru'));

CREATE POLICY "Public can read jurnal_kelas" ON public.jurnal_kelas
  FOR SELECT
  USING (true);

-- Create trigger for updated_at on jurnal_kelas
CREATE TRIGGER update_jurnal_kelas_updated_at
  BEFORE UPDATE ON public.jurnal_kelas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create jurnal_murid table
CREATE TABLE IF NOT EXISTS public.jurnal_murid (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  siswa_id UUID NOT NULL,
  tanggal DATE NOT NULL,
  shalat_subuh TEXT,
  shalat_dzuhur TEXT,
  shalat_ashar TEXT,
  shalat_maghrib TEXT,
  shalat_isya TEXT,
  murojaah_hafalan TEXT,
  murojaah_tilawah TEXT,
  catatan_ortu TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on jurnal_murid
ALTER TABLE public.jurnal_murid ENABLE ROW LEVEL SECURITY;

-- RLS policies for jurnal_murid
CREATE POLICY "Admin can read all jurnal_murid" ON public.jurnal_murid
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Guru can read jurnal_murid" ON public.jurnal_murid
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'guru') AND
    EXISTS (
      SELECT 1 FROM siswa s
      JOIN kelas k ON s.kelas_id = k.id
      JOIN guru g ON k.guru_id = g.id
      WHERE s.id = jurnal_murid.siswa_id AND g.id = auth.uid()
    )
  );

CREATE POLICY "Public can insert jurnal_murid" ON public.jurnal_murid
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can read jurnal_murid" ON public.jurnal_murid
  FOR SELECT
  USING (true);

-- Create trigger for updated_at on jurnal_murid
CREATE TRIGGER update_jurnal_murid_updated_at
  BEFORE UPDATE ON public.jurnal_murid
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create daily_records table
CREATE TABLE IF NOT EXISTS public.daily_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  siswa_id UUID NOT NULL,
  guru_id UUID REFERENCES auth.users(id) NOT NULL,
  tanggal DATE NOT NULL,
  hafalan_jenis TEXT,
  hafalan_juz INTEGER,
  hafalan_surah TEXT,
  hafalan_ayat_dari INTEGER,
  hafalan_ayat_sampai INTEGER,
  hafalan_lancar BOOLEAN DEFAULT false,
  hafalan_catatan TEXT,
  tilawah_jenis TEXT,
  tilawah_juz INTEGER,
  tilawah_surah TEXT,
  tilawah_ayat_dari INTEGER,
  tilawah_ayat_sampai INTEGER,
  tilawah_lancar BOOLEAN DEFAULT false,
  tilawah_catatan TEXT,
  catatan_guru TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on daily_records
ALTER TABLE public.daily_records ENABLE ROW LEVEL SECURITY;

-- RLS policies for daily_records
CREATE POLICY "Admin can view all records" ON public.daily_records
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Guru can insert records" ON public.daily_records
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'guru'));

CREATE POLICY "Guru can update records" ON public.daily_records
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'guru'));

CREATE POLICY "Guru can delete records" ON public.daily_records
  FOR DELETE
  USING (public.has_role(auth.uid(), 'guru'));

CREATE POLICY "Guru can view all records" ON public.daily_records
  FOR SELECT
  USING (public.has_role(auth.uid(), 'guru'));

CREATE POLICY "Siswa can view own records" ON public.daily_records
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM siswa 
      WHERE siswa.id = daily_records.siswa_id AND siswa.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view daily records" ON public.daily_records
  FOR SELECT
  USING (true);

-- Create trigger for updated_at on daily_records
CREATE TRIGGER update_daily_records_updated_at
  BEFORE UPDATE ON public.daily_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
