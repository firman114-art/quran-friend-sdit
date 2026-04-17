-- Add Fasohah error counter for hafalan and tilawah
ALTER TABLE public.daily_records
  ADD COLUMN hafalan_kesalahan_fasohah INTEGER DEFAULT 0,
  ADD COLUMN tilawah_kesalahan_fasohah INTEGER DEFAULT 0;
