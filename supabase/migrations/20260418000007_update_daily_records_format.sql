-- Migration: Update Daily Records Format
-- Description: Update daily_records table to support new format with jenis hafalan and penilaian options

-- Add columns for jenis hafalan
ALTER TABLE daily_records ADD COLUMN IF NOT EXISTS hafalan_jenis TEXT; -- 'Ziyadah', 'Murojaa', 'Talaqqi'

-- Add columns for penilaian options
ALTER TABLE daily_records ADD COLUMN IF NOT EXISTS hafalan_penilaian TEXT; -- 'Mumtaz', 'Jayyid Jiddan', 'Jayyid', 'Maqbul'
ALTER TABLE daily_records ADD COLUMN IF NOT EXISTS tilawah_penilaian TEXT; -- 'Mumtaz', 'Jayyid Jiddan', 'Jayyid', 'Maqbul'
ALTER TABLE daily_records ADD COLUMN IF NOT EXISTS jilid_penilaian TEXT; -- 'Mumtaz', 'Jayyid Jiddan', 'Jayyid', 'Maqbul'

-- Add column for tilawah type (Quran or Jilid)
ALTER TABLE daily_records ADD COLUMN IF NOT EXISTS tilawah_tipe TEXT; -- 'quran', 'jilid'

-- Update check constraint for penilaian
ALTER TABLE daily_records DROP CONSTRAINT IF EXISTS daily_records_hafalan_predikat_check;
ALTER TABLE daily_records ADD CONSTRAINT daily_records_hafalan_penilaian_check 
  CHECK (hafalan_penilaian IN ('Mumtaz', 'Jayyid Jiddan', 'Jayyid', 'Maqbul') OR hafalan_penilaian IS NULL);

ALTER TABLE daily_records DROP CONSTRAINT IF EXISTS daily_records_tilawah_predikat_check;
ALTER TABLE daily_records ADD CONSTRAINT daily_records_tilawah_penilaian_check 
  CHECK (tilawah_penilaian IN ('Mumtaz', 'Jayyid Jiddan', 'Jayyid', 'Maqbul') OR tilawah_penilaian IS NULL);

ALTER TABLE daily_records DROP CONSTRAINT IF EXISTS daily_records_jilid_predikat_check;
ALTER TABLE daily_records ADD CONSTRAINT daily_records_jilid_penilaian_check 
  CHECK (jilid_penilaian IN ('Mumtaz', 'Jayyid Jiddan', 'Jayyid', 'Maqbul') OR jilid_penilaian IS NULL);

-- Update check constraint for hafalan jenis
ALTER TABLE daily_records ADD CONSTRAINT daily_records_hafalan_jenis_check 
  CHECK (hafalan_jenis IN ('Ziyadah', 'Murojaa', 'Talaqqi') OR hafalan_jenis IS NULL);

-- Update check constraint for tilawah tipe
ALTER TABLE daily_records ADD CONSTRAINT daily_records_tilawah_tipe_check 
  CHECK (tilawah_tipe IN ('quran', 'jilid') OR tilawah_tipe IS NULL);
