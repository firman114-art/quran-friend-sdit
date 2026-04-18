-- Migration: Fix RLS Policies for Data Insertion
-- Description: Fix RLS policies to allow proper data insertion for jurnal_kelas, jurnal_murid, and daily_records

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

-- Drop existing policies for jurnal_kelas
DROP POLICY IF EXISTS "Admin can read all jurnal_kelas" ON jurnal_kelas;
DROP POLICY IF EXISTS "Guru can manage jurnal_kelas" ON jurnal_kelas;
DROP POLICY IF EXISTS "Public can read jurnal_kelas" ON jurnal_kelas;

-- Create new policies for jurnal_kelas
CREATE POLICY "Admin can read all jurnal_kelas" ON jurnal_kelas
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Guru can insert jurnal_kelas" ON jurnal_kelas
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'guru'));

CREATE POLICY "Guru can update jurnal_kelas" ON jurnal_kelas
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'guru'));

CREATE POLICY "Guru can delete jurnal_kelas" ON jurnal_kelas
  FOR DELETE
  USING (public.has_role(auth.uid(), 'guru'));

CREATE POLICY "Guru can read own jurnal_kelas" ON jurnal_kelas
  FOR SELECT
  USING (public.has_role(auth.uid(), 'guru'));

CREATE POLICY "Public can read jurnal_kelas" ON jurnal_kelas
  FOR SELECT
  USING (true);

-- Drop existing policies for jurnal_murid
DROP POLICY IF EXISTS "Admin can read all jurnal_murid" ON jurnal_murid;
DROP POLICY IF EXISTS "Guru can read jurnal_murid" ON jurnal_murid;
DROP POLICY IF EXISTS "Public can insert jurnal_murid" ON jurnal_murid;
DROP POLICY IF EXISTS "Public can read jurnal_murid" ON jurnal_murid;

-- Create new policies for jurnal_murid
CREATE POLICY "Admin can read all jurnal_murid" ON jurnal_murid
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Guru can read jurnal_murid" ON jurnal_murid
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

CREATE POLICY "Public can insert jurnal_murid" ON jurnal_murid
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can read jurnal_murid" ON jurnal_murid
  FOR SELECT
  USING (true);

-- Drop existing policies for daily_records
DROP POLICY IF EXISTS "Guru can view all records" ON daily_records;
DROP POLICY IF EXISTS "Guru can insert records" ON daily_records;
DROP POLICY IF EXISTS "Guru can update records" ON daily_records;
DROP POLICY IF EXISTS "Siswa can view own records" ON daily_records;
DROP POLICY IF EXISTS "Admin can view all records" ON daily_records;
DROP POLICY IF EXISTS "Public can view daily records" ON daily_records;
DROP POLICY IF EXISTS "Guru can delete records" ON daily_records;

-- Create new policies for daily_records
CREATE POLICY "Admin can view all records" ON daily_records
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Guru can insert records" ON daily_records
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'guru'));

CREATE POLICY "Guru can update records" ON daily_records
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'guru'));

CREATE POLICY "Guru can delete records" ON daily_records
  FOR DELETE
  USING (public.has_role(auth.uid(), 'guru'));

CREATE POLICY "Guru can view all records" ON daily_records
  FOR SELECT
  USING (public.has_role(auth.uid(), 'guru'));

CREATE POLICY "Siswa can view own records" ON daily_records
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM siswa 
      WHERE siswa.id = daily_records.siswa_id AND siswa.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view daily records" ON daily_records
  FOR SELECT
  USING (true);
