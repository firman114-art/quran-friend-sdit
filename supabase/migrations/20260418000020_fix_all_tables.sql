-- Fix all missing tables and columns
-- Run this in Supabase SQL Editor

-- 1. Create jurnal_pembelajaran table
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

CREATE POLICY "Enable all access for authenticated" ON public.jurnal_pembelajaran
  FOR ALL USING (auth.role() = 'authenticated');

GRANT SELECT, INSERT, UPDATE, DELETE ON public.jurnal_pembelajaran TO authenticated;

-- 2. Check and fix daily_records columns
DO $$
BEGIN
  -- Add missing columns to daily_records if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_records' AND column_name = 'hafalan_jenis_setoran') THEN
    ALTER TABLE public.daily_records ADD COLUMN hafalan_jenis_setoran VARCHAR(50);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_records' AND column_name = 'hafalan_kesalahan_fasohah') THEN
    ALTER TABLE public.daily_records ADD COLUMN hafalan_kesalahan_fasohah INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_records' AND column_name = 'tilawah_kesalahan_fasohah') THEN
    ALTER TABLE public.daily_records ADD COLUMN tilawah_kesalahan_fasohah INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_records' AND column_name = 'jilid_kesalahan_tajwid') THEN
    ALTER TABLE public.daily_records ADD COLUMN jilid_kesalahan_tajwid INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_records' AND column_name = 'jilid_kesalahan_kelancaran') THEN
    ALTER TABLE public.daily_records ADD COLUMN jilid_kesalahan_kelancaran INTEGER DEFAULT 0;
  END IF;
END $$;

-- 3. Add NIS to siswa if not exists
ALTER TABLE public.siswa ADD COLUMN IF NOT EXISTS nis VARCHAR(20) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_siswa_nis ON public.siswa(nis);

-- 4. Add username/password columns to guru if not exists
ALTER TABLE public.guru ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;
ALTER TABLE public.guru ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE public.guru ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
CREATE INDEX IF NOT EXISTS idx_guru_username ON public.guru(username);

-- 5. Drop FK constraint for guru.user_id to allow null
ALTER TABLE public.guru DROP CONSTRAINT IF EXISTS guru_user_id_fkey;
ALTER TABLE public.guru ALTER COLUMN user_id DROP NOT NULL;

-- 6. Add nama_lengkap to profiles if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nama_lengkap TEXT;

SELECT 'All tables fixed successfully!' as status;
