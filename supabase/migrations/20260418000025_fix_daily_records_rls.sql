-- Fix RLS policies for daily_records to support username-based auth
-- The issue: has_role checks profiles table, but guru uses username-based auth

-- 1. Drop old policies
DROP POLICY IF EXISTS "Guru can insert records" ON public.daily_records;
DROP POLICY IF EXISTS "Guru can update records" ON public.daily_records;
DROP POLICY IF EXISTS "Guru can delete records" ON public.daily_records;
DROP POLICY IF EXISTS "Guru can view all records" ON public.daily_records;

-- 2. Create new policies that check guru table directly
-- Policy: Allow authenticated users to insert if they are an active guru
CREATE POLICY "Guru can insert records" ON public.daily_records
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.guru g
      WHERE g.user_id = auth.uid() AND g.is_active = true
    )
  );

-- Policy: Allow authenticated users to update if they are an active guru  
CREATE POLICY "Guru can update records" ON public.daily_records
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.guru g
      WHERE g.user_id = auth.uid() AND g.is_active = true
    )
  );

-- Policy: Allow authenticated users to delete if they are an active guru
CREATE POLICY "Guru can delete records" ON public.daily_records
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.guru g
      WHERE g.user_id = auth.uid() AND g.is_active = true
    )
  );

-- Policy: Allow authenticated users to view if they are an active guru
CREATE POLICY "Guru can view all records" ON public.daily_records
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.guru g
      WHERE g.user_id = auth.uid() AND g.is_active = true
    )
  );

-- Keep Admin policy as is
DROP POLICY IF EXISTS "Admin can view all records" ON public.daily_records;
CREATE POLICY "Admin can view all records" ON public.daily_records
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

SELECT '✅ RLS policies untuk daily_records berhasil diperbaiki!' AS status;
