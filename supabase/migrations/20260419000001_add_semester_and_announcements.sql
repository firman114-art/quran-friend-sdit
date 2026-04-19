-- Add semester column to siswa table
ALTER TABLE public.siswa ADD COLUMN IF NOT EXISTS semester VARCHAR(10) DEFAULT 'GANJIL';

-- Create table for semester settings
CREATE TABLE IF NOT EXISTS public.pengaturan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(50) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  deskripsi TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default semester setting
INSERT INTO public.pengaturan (key, value, deskripsi)
VALUES ('semester_aktif', 'GANJIL', 'Semester yang sedang berjalan (GANJIL/GENAP)')
ON CONFLICT (key) DO NOTHING;

-- Drop existing pengumuman table if it exists (to recreate with proper schema)
DROP TABLE IF EXISTS public.pengumuman CASCADE;

-- Create table for announcements
CREATE TABLE public.pengumuman (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judul VARCHAR(200) NOT NULL,
  isi TEXT NOT NULL,
  tipe VARCHAR(20) DEFAULT 'info', -- info, warning, success
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.pengaturan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengumuman ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow admin manage pengaturan" ON public.pengaturan;
DROP POLICY IF EXISTS "Allow all view pengaturan" ON public.pengaturan;
DROP POLICY IF EXISTS "Allow admin manage pengumuman" ON public.pengumuman;
DROP POLICY IF EXISTS "Allow all view active pengumuman" ON public.pengumuman;

-- Policies for pengaturan (admin can manage, all can view)
CREATE POLICY "Allow admin manage pengaturan" ON public.pengaturan
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Allow all view pengaturan" ON public.pengaturan
  FOR SELECT USING (true);

-- Policies for pengumuman (admin can manage, all can view active)
CREATE POLICY "Allow admin manage pengumuman" ON public.pengumuman
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Allow all view active pengumuman" ON public.pengumuman
  FOR SELECT USING (aktif = true);

-- Add password_plain column to guru (for admin view only - not secure but required by user)
ALTER TABLE public.guru ADD COLUMN IF NOT EXISTS password_plain TEXT;

-- Create function to get active semester
CREATE OR REPLACE FUNCTION public.get_semester_aktif()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT value FROM public.pengaturan 
    WHERE key = 'semester_aktif' 
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT '✅ Migration berhasil: Semester, Pengumuman, dan Pengaturan' AS status;
