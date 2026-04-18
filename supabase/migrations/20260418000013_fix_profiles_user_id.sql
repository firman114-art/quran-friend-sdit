-- Migration: Fix profiles table - add user_id column
-- Description: Add user_id column to profiles table to match app expectations

-- Add user_id column if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing rows to set user_id = id
UPDATE public.profiles SET user_id = id WHERE user_id IS NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
