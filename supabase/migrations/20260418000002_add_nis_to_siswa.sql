-- Migration: Add NIS to Siswa Table
-- Description: Add NIS (Nomor Induk Siswa) as unique identifier

-- Add nis column to siswa table
ALTER TABLE siswa ADD COLUMN IF NOT EXISTS nis TEXT UNIQUE;

-- Create index on nis for faster lookups
CREATE INDEX IF NOT EXISTS idx_siswa_nis ON siswa(nis);

-- Update existing records with auto-generated NIS (optional)
-- This will generate NIS based on existing data if needed
-- You can run this manually or leave it null for new entries only
