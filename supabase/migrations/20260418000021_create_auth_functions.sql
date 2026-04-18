-- Create functions for username-based authentication

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to verify guru login with username/password
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

-- Function to set guru password (for admin)
CREATE OR REPLACE FUNCTION public.set_guru_password(p_guru_id UUID, p_password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.guru 
  SET password_hash = crypt(p_password, gen_salt('bf'))
  WHERE id = p_guru_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate unique username from nama
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.verify_guru_login TO anon;
GRANT EXECUTE ON FUNCTION public.verify_guru_login TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_guru_password TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_guru_username TO authenticated;

SELECT 'Auth functions created successfully!' as status;
