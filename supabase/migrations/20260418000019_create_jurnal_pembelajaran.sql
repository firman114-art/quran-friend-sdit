-- Migration: Create jurnal_pembelajaran table
-- For recording daily learning activities per class

-- Create table
CREATE TABLE IF NOT EXISTS public.jurnal_pembelajaran (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Foreign keys
  kelas_id UUID REFERENCES public.kelas(id) ON DELETE CASCADE,
  guru_id UUID REFERENCES public.guru(id) ON DELETE SET NULL,
  
  -- Data fields
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  hafalan TEXT,
  tilawah TEXT,
  tulisan TEXT,
  keterangan TEXT
);

-- Enable RLS
ALTER TABLE public.jurnal_pembelajaran ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_jurnal_pembelajaran_kelas_id ON public.jurnal_pembelajaran(kelas_id);
CREATE INDEX IF NOT EXISTS idx_jurnal_pembelajaran_guru_id ON public.jurnal_pembelajaran(guru_id);
CREATE INDEX IF NOT EXISTS idx_jurnal_pembelajaran_tanggal ON public.jurnal_pembelajaran(tanggal);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_jurnal_pembelajaran_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_jurnal_pembelajaran_updated_at ON public.jurnal_pembelajaran;
CREATE TRIGGER update_jurnal_pembelajaran_updated_at
  BEFORE UPDATE ON public.jurnal_pembelajaran
  FOR EACH ROW
  EXECUTE FUNCTION update_jurnal_pembelajaran_updated_at();

-- RLS Policies
-- Allow all authenticated users to view
CREATE POLICY "Enable read access for authenticated users" ON public.jurnal_pembelajaran
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow all authenticated users to insert
CREATE POLICY "Enable insert access for authenticated users" ON public.jurnal_pembelajaran
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow all authenticated users to update their own records
CREATE POLICY "Enable update access for authenticated users" ON public.jurnal_pembelajaran
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jurnal_pembelajaran TO authenticated;
GRANT SELECT ON public.jurnal_pembelajaran TO anon;

-- Add comments
COMMENT ON TABLE public.jurnal_pembelajaran IS 'Daily learning journal/records for each class';
COMMENT ON COLUMN public.jurnal_pembelajaran.kelas_id IS 'Reference to kelas';
COMMENT ON COLUMN public.jurnal_pembelajaran.guru_id IS 'Reference to guru who created the record';
COMMENT ON COLUMN public.jurnal_pembelajaran.hafalan IS 'Hafalan activity notes';
COMMENT ON COLUMN public.jurnal_pembelajaran.tilawah IS 'Tilawah activity notes';
COMMENT ON COLUMN public.jurnal_pembelajaran.tulisan IS 'Tulisan (writing) activity notes';
COMMENT ON COLUMN public.jurnal_pembelajaran.keterangan IS 'Additional notes/remarks';
