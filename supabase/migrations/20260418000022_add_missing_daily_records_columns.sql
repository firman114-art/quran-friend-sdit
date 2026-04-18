-- Add missing columns to daily_records table
-- These columns are used in DailyInputForm but missing from database

-- Hafalan columns
ALTER TABLE public.daily_records 
ADD COLUMN IF NOT EXISTS hafalan_kesalahan_fasohah INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hafalan_penilaian VARCHAR(50);

-- Tilawah columns  
ALTER TABLE public.daily_records
ADD COLUMN IF NOT EXISTS tilawah_kesalahan_fasohah INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tilawah_penilaian VARCHAR(50),
ADD COLUMN IF NOT EXISTS tilawah_tipe VARCHAR(20);

-- Jilid columns
ALTER TABLE public.daily_records
ADD COLUMN IF NOT EXISTS jilid_kesalahan_tajwid INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS jilid_kesalahan_kelancaran INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS jilid_penilaian VARCHAR(50);

SELECT '✅ All missing columns added to daily_records!' AS status;
