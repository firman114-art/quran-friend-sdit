-- Set admin role for the created user
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
