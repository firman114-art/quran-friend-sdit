-- Add prayer tracking and murojaah columns to jurnal_rumah table
ALTER TABLE jurnal_rumah 
ADD COLUMN IF NOT EXISTS sholat_subuh BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sholat_dzuhur BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sholat_ashar BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sholat_maghrib BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sholat_isya BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS murojaah_hafalan TEXT,
ADD COLUMN IF NOT EXISTS murojaah_tilawah TEXT;
