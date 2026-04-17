-- Add error counters for Jilid section
ALTER TABLE public.daily_records
  ADD COLUMN jilid_kesalahan_tajwid INTEGER DEFAULT 0,
  ADD COLUMN jilid_kesalahan_kelancaran INTEGER DEFAULT 0;
