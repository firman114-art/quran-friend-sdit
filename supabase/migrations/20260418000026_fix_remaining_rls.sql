-- Fix remaining RLS issues for profiles and jurnal_kelas

-- 1. Fix profiles table RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Allow authenticated users to manage their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2. Fix jurnal_kelas table RLS
ALTER TABLE public.jurnal_kelas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Guru can insert jurnal_kelas" ON public.jurnal_kelas;
DROP POLICY IF EXISTS "Guru can update jurnal_kelas" ON public.jurnal_kelas;
DROP POLICY IF EXISTS "Guru can delete jurnal_kelas" ON public.jurnal_kelas;
DROP POLICY IF EXISTS "Guru can read own jurnal_kelas" ON public.jurnal_kelas;
DROP POLICY IF EXISTS "Admin can read all jurnal_kelas" ON public.jurnal_kelas;

-- Allow authenticated users (guru) to manage jurnal_kelas
CREATE POLICY "Authenticated can insert jurnal_kelas" ON public.jurnal_kelas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can update jurnal_kelas" ON public.jurnal_kelas
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can delete jurnal_kelas" ON public.jurnal_kelas
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can view jurnal_kelas" ON public.jurnal_kelas
  FOR SELECT USING (auth.role() = 'authenticated');

SELECT '✅ RLS untuk profiles dan jurnal_kelas diperbaiki!' AS status;
