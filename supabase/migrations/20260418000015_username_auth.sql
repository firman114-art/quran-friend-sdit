-- Migration: Username-based authentication for Guru
-- Add username and password_hash columns to guru table

-- 1. Add columns to guru table
ALTER TABLE public.guru 
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Create index for faster username lookup
CREATE INDEX IF NOT EXISTS idx_guru_username ON public.guru(username);

-- 3. Create function to verify guru login
CREATE OR REPLACE FUNCTION public.verify_guru_login(p_username TEXT, p_password TEXT)
RETURNS TABLE(
  id UUID,
  nama TEXT,
  email TEXT,
  role TEXT,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id,
    g.nama,
    g.email,
    'guru'::TEXT as role,
    g.is_active
  FROM public.guru g
  WHERE g.username = p_username 
    AND g.password_hash = crypt(p_password, g.password_hash)
    AND g.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create function to set guru password (for admin)
CREATE OR REPLACE FUNCTION public.set_guru_password(p_guru_id UUID, p_password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.guru 
  SET password_hash = crypt(p_password, gen_salt('bf'))
  WHERE id = p_guru_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create function to generate username from nama
CREATE OR REPLACE FUNCTION public.generate_guru_username(p_nama TEXT)
RETURNS TEXT AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
BEGIN
  -- Clean nama: lowercase, replace spaces with dots, remove special chars
  base_username := lower(regexp_replace(p_nama, '[^a-zA-Z0-9\s]', '', 'g'));
  base_username := regexp_replace(base_username, '\s+', '.', 'g');
  
  final_username := base_username;
  
  -- Check if exists, if yes append number
  WHILE EXISTS (SELECT 1 FROM public.guru WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::TEXT;
  END LOOP;
  
  RETURN final_username;
END;
$$ LANGUAGE plpgsql;

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION public.verify_guru_login TO anon;
GRANT EXECUTE ON FUNCTION public.verify_guru_login TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_guru_password TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_guru_username TO authenticated;

-- 7. Add RLS policy for guru to view own data
CREATE POLICY "Guru can view own data" ON public.guru
  FOR SELECT USING (
    username = current_setting('app.current_username', true)::TEXT
    OR public.has_role(auth.uid(), 'admin')
  );

-- 8. Add comments
COMMENT ON COLUMN public.guru.username IS 'Unique username for login (e.g., budi.santoso)';
COMMENT ON COLUMN public.guru.password_hash IS 'Bcrypt hashed password';
COMMENT ON COLUMN public.guru.is_active IS 'Whether the guru account is active';
