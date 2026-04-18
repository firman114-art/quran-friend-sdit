-- Add no_hp_ortu column to siswa table
ALTER TABLE public.siswa 
ADD COLUMN IF NOT EXISTS no_hp_ortu VARCHAR(50);

SELECT '✅ Kolom no_hp_ortu ditambahkan ke tabel siswa!' AS status;
