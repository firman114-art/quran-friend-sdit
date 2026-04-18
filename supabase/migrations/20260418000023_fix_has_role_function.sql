-- Fix ambiguous column reference in has_role function
-- The issue is that user_id and role need table prefix

CREATE OR REPLACE FUNCTION public.has_role(p_user_id UUID, p_role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles AS p
    WHERE p.user_id = p_user_id AND p.role = p_role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT '✅ Function has_role berhasil diperbaiki!' AS status;
