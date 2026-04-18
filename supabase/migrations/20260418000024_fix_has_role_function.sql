-- Fix ambiguous column reference in has_role function
-- Must use CASCADE to drop dependent policies, then recreate them

-- 1. Drop function and all dependent policies
DROP FUNCTION IF EXISTS public.has_role(uuid, text) CASCADE;

-- 2. Recreate function with unambiguous column references
CREATE FUNCTION public.has_role(p_user_id UUID, p_role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles AS p
    WHERE p.user_id = p_user_id AND p.role = p_role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recreate RLS policies for daily_records
ALTER TABLE public.daily_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can view all records" ON public.daily_records;
CREATE POLICY "Admin can view all records" ON public.daily_records
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Guru can view all records" ON public.daily_records;
CREATE POLICY "Guru can view all records" ON public.daily_records
  FOR SELECT USING (public.has_role(auth.uid(), 'guru'));

DROP POLICY IF EXISTS "Guru can insert records" ON public.daily_records;
CREATE POLICY "Guru can insert records" ON public.daily_records
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'guru'));

DROP POLICY IF EXISTS "Guru can update records" ON public.daily_records;
CREATE POLICY "Guru can update records" ON public.daily_records
  FOR UPDATE USING (public.has_role(auth.uid(), 'guru'));

DROP POLICY IF EXISTS "Guru can delete records" ON public.daily_records;
CREATE POLICY "Guru can delete records" ON public.daily_records
  FOR DELETE USING (public.has_role(auth.uid(), 'guru'));

DROP POLICY IF EXISTS "Siswa can view own records" ON public.daily_records;
CREATE POLICY "Siswa can view own records" ON public.daily_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.siswa s 
      WHERE s.id = daily_records.siswa_id AND s.user_id = auth.uid()
    )
  );

-- 4. Recreate policies for jurnal_kelas
ALTER TABLE public.jurnal_kelas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can read all jurnal_kelas" ON public.jurnal_kelas;
CREATE POLICY "Admin can read all jurnal_kelas" ON public.jurnal_kelas
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Guru can insert jurnal_kelas" ON public.jurnal_kelas;
CREATE POLICY "Guru can insert jurnal_kelas" ON public.jurnal_kelas
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'guru'));

DROP POLICY IF EXISTS "Guru can update jurnal_kelas" ON public.jurnal_kelas;
CREATE POLICY "Guru can update jurnal_kelas" ON public.jurnal_kelas
  FOR UPDATE USING (public.has_role(auth.uid(), 'guru'));

DROP POLICY IF EXISTS "Guru can delete jurnal_kelas" ON public.jurnal_kelas;
CREATE POLICY "Guru can delete jurnal_kelas" ON public.jurnal_kelas
  FOR DELETE USING (public.has_role(auth.uid(), 'guru'));

DROP POLICY IF EXISTS "Guru can read own jurnal_kelas" ON public.jurnal_kelas;
CREATE POLICY "Guru can read own jurnal_kelas" ON public.jurnal_kelas
  FOR SELECT USING (public.has_role(auth.uid(), 'guru'));

DROP POLICY IF EXISTS "Public can read jurnal_kelas" ON public.jurnal_kelas;
CREATE POLICY "Public can read jurnal_kelas" ON public.jurnal_kelas
  FOR SELECT USING (true);

-- 5. Recreate policies for jurnal_murid
ALTER TABLE public.jurnal_murid ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can read all jurnal_murid" ON public.jurnal_murid;
CREATE POLICY "Admin can read all jurnal_murid" ON public.jurnal_murid
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Guru can read jurnal_murid" ON public.jurnal_murid;
CREATE POLICY "Guru can read jurnal_murid" ON public.jurnal_murid
  FOR SELECT USING (public.has_role(auth.uid(), 'guru'));

DROP POLICY IF EXISTS "Public can insert jurnal_murid" ON public.jurnal_murid;
CREATE POLICY "Public can insert jurnal_murid" ON public.jurnal_murid
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read jurnal_murid" ON public.jurnal_murid;
CREATE POLICY "Public can read jurnal_murid" ON public.jurnal_murid
  FOR SELECT USING (true);

-- 6. Recreate policies for pengumuman
ALTER TABLE public.pengumuman ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Guru can manage pengumuman" ON public.pengumuman;
CREATE POLICY "Guru can manage pengumuman" ON public.pengumuman
  FOR ALL USING (public.has_role(auth.uid(), 'guru'));

DROP POLICY IF EXISTS "Admin can manage pengumuman" ON public.pengumuman;
CREATE POLICY "Admin can manage pengumuman" ON public.pengumuman
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Guru can create pengumuman" ON public.pengumuman;
CREATE POLICY "Guru can create pengumuman" ON public.pengumuman
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'guru'));

SELECT '✅ Function has_role dan semua policies berhasil diperbaiki!' AS status;
