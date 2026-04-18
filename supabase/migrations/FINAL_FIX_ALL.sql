-- ============================================================================
-- COPY SEMUA SQL INI DAN PASTE DI SUPABASE SQL EDITOR
-- ============================================================================

-- 1. Add missing columns to daily_records
ALTER TABLE public.daily_records 
ADD COLUMN IF NOT EXISTS hafalan_kesalahan_fasohah INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hafalan_penilaian VARCHAR(50),
ADD COLUMN IF NOT EXISTS tilawah_kesalahan_fasohah INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tilawah_penilaian VARCHAR(50),
ADD COLUMN IF NOT EXISTS tilawah_tipe VARCHAR(20),
ADD COLUMN IF NOT EXISTS jilid_kesalahan_tajwid INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS jilid_kesalahan_kelancaran INTEGER DEFAULT 0;

-- 2. Create jurnal_pembelajaran table (if not exists)
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
DROP POLICY IF EXISTS "Enable all access" ON public.jurnal_pembelajaran;
CREATE POLICY "Enable all access" ON public.jurnal_pembelajaran
  FOR ALL USING (auth.role() = 'authenticated');
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jurnal_pembelajaran TO authenticated;

-- 3. Add username columns to guru (if not exists)
ALTER TABLE public.guru 
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 4. Drop FK constraint for guru.user_id
ALTER TABLE public.guru DROP CONSTRAINT IF EXISTS guru_user_id_fkey;
ALTER TABLE public.guru ALTER COLUMN user_id DROP NOT NULL;

-- 5. Add NIS to siswa
ALTER TABLE public.siswa ADD COLUMN IF NOT EXISTS nis VARCHAR(20) UNIQUE;

-- 6. Add nama_lengkap to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nama_lengkap TEXT;

-- 7. Create auth functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

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

CREATE OR REPLACE FUNCTION public.set_guru_password(p_guru_id UUID, p_password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.guru SET password_hash = crypt(p_password, gen_salt('bf'))
  WHERE id = p_guru_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

GRANT EXECUTE ON FUNCTION public.verify_guru_login TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_guru_password TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_guru_username TO authenticated;

SELECT '✅ SEMUA KOLOM DAN FUNGSI BERHASIL DIBUAT!' AS status;
