-- Create table for student home journals (jurnal rumah)
CREATE TABLE IF NOT EXISTS public.jurnal_rumah (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siswa_id UUID NOT NULL REFERENCES public.siswa(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  hafalan_surah VARCHAR(100),
  hafalan_ayat VARCHAR(50),
  tilawah_surah VARCHAR(100),
  tilawah_ayat VARCHAR(50),
  jilid_buku VARCHAR(50),
  jilid_halaman INTEGER,
  catatan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.jurnal_rumah ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (students don't have accounts)
DROP POLICY IF EXISTS "Allow all insert jurnal_rumah" ON public.jurnal_rumah;
DROP POLICY IF EXISTS "Allow authenticated view jurnal_rumah" ON public.jurnal_rumah;

CREATE POLICY "Allow all insert jurnal_rumah" ON public.jurnal_rumah
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users (teachers) to view
CREATE POLICY "Allow authenticated view jurnal_rumah" ON public.jurnal_rumah
  FOR SELECT USING (auth.role() = 'authenticated');

SELECT '✅ Tabel jurnal_rumah berhasil dibuat!' AS status;
