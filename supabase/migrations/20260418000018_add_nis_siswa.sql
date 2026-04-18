-- Migration: Add NIS (Nomor Induk Siswa) column to siswa table
-- For distinguishing students with the same name

-- 1. Add NIS column
ALTER TABLE public.siswa 
ADD COLUMN IF NOT EXISTS nis VARCHAR(20) UNIQUE;

-- 2. Add index for faster NIS lookup
CREATE INDEX IF NOT EXISTS idx_siswa_nis ON public.siswa(nis);

-- 3. Add comment
COMMENT ON COLUMN public.siswa.nis IS 'Nomor Induk Siswa - unique identifier for each student';

-- 4. Update RLS policies if needed (NIS should be viewable by relevant users)
