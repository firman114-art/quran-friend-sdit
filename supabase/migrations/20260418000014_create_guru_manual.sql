-- Manual create guru user
-- Jalankan ini untuk membuat guru tanpa sign up via aplikasi
-- Ganti 'Nama Guru' dengan nama yang diinginkan

-- 1. Create auth user via SQL (requires service role or admin access)
-- Note: This is for Supabase Dashboard SQL Editor with appropriate permissions

-- Alternative: Create guru directly in database (user must be created in Auth first via Dashboard)

-- Insert into guru table (after creating user in Auth Dashboard)
-- Ganti 'USER_ID_DARI_AUTH' dengan ID user yang dibuat di Dashboard

-- Contoh untuk guru dengan nama "Ahmad Fauzi":
-- Email yang digenerate: ahmad.fauzi.guru@sdit.internal
-- Password: Guru123456 (bisa diganti setelah login)

-- Langkah:
-- 1. Buka Supabase Dashboard → Authentication → Users
-- 2. Add user → Create new user
-- 3. Email: ahmad.fauzi.guru@sdit.internal
-- 4. Password: Guru123456
-- 5. Copy USER_ID yang dihasilkan
-- 6. Ganti 'USER_ID_DARI_AUTH' di bawah dengan ID tersebut
-- 7. Jalankan SQL

-- INSERT INTO public.guru (id, nama, email, user_id)
-- VALUES ('USER_ID_DARI_AUTH', 'Ahmad Fauzi', 'ahmad.fauzi.guru@sdit.internal', 'USER_ID_DARI_AUTH');

-- INSERT INTO public.profiles (id, user_id, nama_lengkap, role)
-- VALUES ('USER_ID_DARI_AUTH', 'USER_ID_DARI_AUTH', 'Ahmad Fauzi', 'guru');

-- Create function to generate credentials
CREATE OR REPLACE FUNCTION public.generate_guru_credentials(nama_input TEXT)
RETURNS TABLE(email TEXT, password TEXT, clean_name TEXT) AS $$
DECLARE
  clean_name TEXT;
  generated_email TEXT;
  generated_password TEXT;
BEGIN
  clean_name := lower(trim(regexp_replace(nama_input, '\s+', '.', 'g')));
  generated_email := clean_name || '.guru@sdit.internal';
  generated_password := 'Guru' || upper(substring(md5(random()::text), 1, 6));
  
  RETURN QUERY SELECT generated_email, generated_password, clean_name;
END;
$$ LANGUAGE plpgsql;
