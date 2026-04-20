-- Add jilid_kesalahan_fasohah column to daily_records table
ALTER TABLE daily_records 
ADD COLUMN IF NOT EXISTS jilid_kesalahan_fasohah INTEGER DEFAULT 0;
