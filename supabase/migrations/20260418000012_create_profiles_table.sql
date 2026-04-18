-- Migration: Create profiles table
-- Description: Create profiles table for user roles

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama_lengkap TEXT,
  role TEXT NOT NULL DEFAULT 'siswa' CHECK (role IN ('admin', 'guru', 'siswa')),
  kelas_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Public can read profiles" ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admin can manage all profiles" ON public.profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Grant permissions
GRANT ALL ON TABLE public.profiles TO anon, authenticated;

-- Now insert admin user (must exist in auth.users first)
-- Note: First create user via Supabase Dashboard, then run this INSERT
INSERT INTO public.profiles (id, nama_lengkap, role, kelas_id, created_at, updated_at)
SELECT 
  id,
  'Administrator SDIT Al-Insan',
  'admin',
  NULL,
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'admin@sdit-alinsan.com'
ON CONFLICT (id) DO UPDATE SET 
  role = 'admin',
  nama_lengkap = 'Administrator SDIT Al-Insan',
  updated_at = NOW();
