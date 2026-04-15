
-- Create kelas table
CREATE TABLE public.kelas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_kelas TEXT NOT NULL,
  guru_id UUID NOT NULL REFERENCES public.guru(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.kelas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guru can view own classes" ON public.kelas FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.guru WHERE guru.id = kelas.guru_id AND guru.user_id = auth.uid())
);
CREATE POLICY "Guru can insert own classes" ON public.kelas FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.guru WHERE guru.id = kelas.guru_id AND guru.user_id = auth.uid())
);
CREATE POLICY "Guru can update own classes" ON public.kelas FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.guru WHERE guru.id = kelas.guru_id AND guru.user_id = auth.uid())
);
CREATE POLICY "Guru can delete own classes" ON public.kelas FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.guru WHERE guru.id = kelas.guru_id AND guru.user_id = auth.uid())
);
CREATE POLICY "Admin can manage all classes" ON public.kelas FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Public can view classes" ON public.kelas FOR SELECT USING (true);

CREATE TRIGGER update_kelas_updated_at BEFORE UPDATE ON public.kelas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Modify siswa table
ALTER TABLE public.siswa ADD COLUMN kelas_id UUID REFERENCES public.kelas(id) ON DELETE SET NULL;
ALTER TABLE public.siswa ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.siswa ADD COLUMN photo_url TEXT;

-- Add photo_url to guru
ALTER TABLE public.guru ADD COLUMN photo_url TEXT;

-- Add new columns to daily_records
ALTER TABLE public.daily_records
  ADD COLUMN hafalan_juz INTEGER,
  ADD COLUMN hafalan_surah TEXT,
  ADD COLUMN hafalan_ayat TEXT,
  ADD COLUMN hafalan_predikat TEXT,
  ADD COLUMN hafalan_jenis_setoran TEXT,
  ADD COLUMN hafalan_kesalahan_tajwid INTEGER DEFAULT 0,
  ADD COLUMN hafalan_kesalahan_kelancaran INTEGER DEFAULT 0,
  ADD COLUMN tilawah_surah TEXT,
  ADD COLUMN tilawah_ayat TEXT,
  ADD COLUMN tilawah_predikat TEXT,
  ADD COLUMN tilawah_kesalahan_tajwid INTEGER DEFAULT 0,
  ADD COLUMN tilawah_kesalahan_kelancaran INTEGER DEFAULT 0,
  ADD COLUMN jilid_buku TEXT,
  ADD COLUMN jilid_halaman INTEGER,
  ADD COLUMN jilid_predikat TEXT,
  ADD COLUMN catatan_guru TEXT;

-- Make old columns nullable
ALTER TABLE public.daily_records
  ALTER COLUMN tilpi_kategori DROP NOT NULL,
  ALTER COLUMN tilpi_halaman DROP NOT NULL,
  ALTER COLUMN tahfidz_surah DROP NOT NULL,
  ALTER COLUMN tahfidz_ayat DROP NOT NULL,
  ALTER COLUMN status DROP NOT NULL;

-- Migrate old data to new columns
UPDATE public.daily_records SET
  hafalan_juz = tahfidz_juz,
  hafalan_surah = tahfidz_surah,
  hafalan_ayat = tahfidz_ayat,
  catatan_guru = catatan
WHERE hafalan_surah IS NULL AND tahfidz_surah IS NOT NULL;

-- Storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-photos', 'profile-photos', true);

CREATE POLICY "Anyone can view profile photos" ON storage.objects FOR SELECT USING (bucket_id = 'profile-photos');
CREATE POLICY "Authenticated users can upload profile photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-photos' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own profile photos" ON storage.objects FOR UPDATE USING (bucket_id = 'profile-photos' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete own profile photos" ON storage.objects FOR DELETE USING (bucket_id = 'profile-photos' AND auth.uid() IS NOT NULL);

-- Admin RLS policies for existing tables
CREATE POLICY "Admin can view all records" ON public.daily_records FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin can view all siswa" ON public.siswa FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin can view all guru" ON public.guru FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin can view all profiles" ON public.profiles FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Public access for student search
CREATE POLICY "Public can search siswa" ON public.siswa FOR SELECT USING (true);
CREATE POLICY "Public can view daily records" ON public.daily_records FOR SELECT USING (true);

-- Guru CRUD on siswa (without edge function)
CREATE POLICY "Guru can update siswa" ON public.siswa FOR UPDATE USING (has_role(auth.uid(), 'guru'::app_role));
CREATE POLICY "Guru can delete siswa" ON public.siswa FOR DELETE USING (has_role(auth.uid(), 'guru'::app_role));
CREATE POLICY "Guru can insert siswa directly" ON public.siswa FOR INSERT WITH CHECK (has_role(auth.uid(), 'guru'::app_role));

-- Guru can delete records
CREATE POLICY "Guru can delete records" ON public.daily_records FOR DELETE USING (has_role(auth.uid(), 'guru'::app_role));
