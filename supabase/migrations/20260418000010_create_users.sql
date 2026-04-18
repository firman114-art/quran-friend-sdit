-- Migration: Create Users and Profiles
-- Description: Insert users into auth.users and create corresponding profiles

-- Note: Passwords are handled by Supabase Auth. 
-- For production, create users via Supabase Dashboard or use sign-up API
-- This SQL creates profiles for existing auth users

-- Create admin user profile (if auth user exists)
INSERT INTO public.profiles (id, nama_lengkap, role, kelas_id, created_at, updated_at)
SELECT 
  id,
  'Administrator',
  'admin',
  NULL,
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'admin@sekolah.com'
ON CONFLICT (id) DO NOTHING;

-- Create guru user profile
INSERT INTO public.profiles (id, nama_lengkap, role, kelas_id, created_at, updated_at)
SELECT 
  id,
  'Guru Kelas 1',
  'guru',
  NULL,
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'guru@sekolah.com'
ON CONFLICT (id) DO NOTHING;

-- Create siswa user profile
INSERT INTO public.profiles (id, nama_lengkap, role, kelas_id, created_at, updated_at)
SELECT 
  id,
  'Siswa Contoh',
  'siswa',
  NULL,
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'siswa@sekolah.com'
ON CONFLICT (id) DO NOTHING;

-- Alternative: Create users via Supabase Auth API
-- The recommended way is to use the Supabase Dashboard or the sign-up endpoint:
-- POST /auth/v1/signup
-- {
--   "email": "your-email@example.com",
--   "password": "your-password",
--   "data": {
--     "nama_lengkap": "Your Name",
--     "role": "admin"
--   }
-- }
