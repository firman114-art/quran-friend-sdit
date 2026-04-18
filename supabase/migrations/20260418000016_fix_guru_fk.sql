-- Migration: Fix guru table foreign key for username-based auth
-- Remove FK constraint since we don't use Supabase Auth for guru login

-- 1. Drop foreign key constraint
ALTER TABLE public.guru DROP CONSTRAINT IF EXISTS guru_user_id_fkey;

-- 2. Make user_id nullable (optional - for guru without Supabase Auth account)
ALTER TABLE public.guru ALTER COLUMN user_id DROP NOT NULL;

-- 3. Add comment
COMMENT ON COLUMN public.guru.user_id IS 'Optional: Supabase Auth user ID (null for username-based auth)';
