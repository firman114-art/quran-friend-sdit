-- ============================================================================
-- JALANKAN FILE INI DI SUPABASE SQL EDITOR
-- Copy semua SQL di bawah dan paste di Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================================

-- 1. ENABLE EXTENSION
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. CREATE JURNAL PEMBELAJARAN TABLE (untuk Guru Dashboard)
CREATE TABLE IF NOT EXISTS public.jurnal_pembelajaran (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  kelas_id UUID REFERENCES public.kelas(id) ON DELETE CASCADE,
  guru_id UUID REFERENCES public.guru(id) ON DELETE SET NULL,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  hafalan TEXT,
  tilawah TEXT,
  tulisan TEXT,
  keterangan TEXT
);

ALTER TABLE public.jurnal_pembelajaran ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for authenticated" ON public.jurnal_pembelajaran;
CREATE POLICY "Enable all access for authenticated" ON public.jurnal_pembelajaran
  FOR ALL USING (auth.role() = 'authenticated');

GRANT SELECT, INSERT, UPDATE, DELETE ON public.jurnal_pembelajaran TO authenticated;
GRANT SELECT ON public.jurnal_pembelajaran TO anon;

-- 3. ADD COLUMNS TO DAILY_RECORDS TABLE
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'daily_records' AND column_name = 'hafalan_jenis_setoran') THEN
    ALTER TABLE public.daily_records ADD COLUMN hafalan_jenis_setoran VARCHAR(50);
  END IF;
END $$;

-- 4. ADD NIS TO SISWA
ALTER TABLE public.siswa ADD COLUMN IF NOT EXISTS nis VARCHAR(20) UNIQUE;

-- 5. ADD USERNAME COLUMNS TO GURU
ALTER TABLE public.guru ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;
ALTER TABLE public.guru ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE public.guru ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 6. DROP FK CONSTRAINT FOR USER_ID (allow null for username-based auth)
ALTER TABLE public.guru DROP CONSTRAINT IF EXISTS guru_user_id_fkey;
ALTER TABLE public.guru ALTER COLUMN user_id DROP NOT NULL;

-- 7. ADD NAMA_LENGKAP TO PROFILES
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nama_lengkap TEXT;

-- 8. CREATE AUTH FUNCTIONS

-- Verify guru login
CREATE OR REPLACE FUNCTION public.verify_guru_login(p_username TEXT, p_password TEXT)
RETURNS TABLE(id UUID, nama TEXT, email TEXT, role TEXT, is_active BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  SELECT g.id, g.nama, g.email, 'guru'::TEXT, g.is_active
  FROM public.guru g
  WHERE g.username = p_username 
    AND g.password_hash = crypt(p_password, g.password_hash)
    AND g.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set guru password
CREATE OR REPLACE FUNCTION public.set_guru_password(p_guru_id UUID, p_password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.guru SET password_hash = crypt(p_password, gen_salt('bf'))
  WHERE id = p_guru_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generate username
CREATE OR REPLACE FUNCTION public.generate_guru_username(p_nama TEXT)
RETURNS TEXT AS $$
DECLARE 
  base_username TEXT; 
  final_username TEXT; 
  counter INTEGER := 0;
BEGIN
  base_username := lower(regexp_replace(p_nama, '[^a-zA-Z0-9\s]', '', 'g'));
  base_username := regexp_replace(base_username, '\s+', '.', 'g');
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM public.guru WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::TEXT;
  END LOOP;
  RETURN final_username;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.verify_guru_login TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_guru_password TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_guru_username TO authenticated;

SELECT '✅ Semua tabel dan fungsi berhasil dibuat!' AS status;
