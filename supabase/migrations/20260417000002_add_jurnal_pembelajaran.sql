-- Create jurnal_pembelajaran table
CREATE TABLE public.jurnal_pembelajaran (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kelas_id UUID NOT NULL REFERENCES public.kelas(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL,
  hafalan TEXT,
  tilawah TEXT,
  tulisan TEXT,
  keterangan TEXT,
  guru_id UUID NOT NULL REFERENCES public.guru(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on kelas_id
CREATE INDEX idx_jurnal_pembelajaran_kelas_id ON public.jurnal_pembelajaran(kelas_id);
CREATE INDEX idx_jurnal_pembelajaran_tanggal ON public.jurnal_pembelajaran(tanggal DESC);

-- Enable RLS
ALTER TABLE public.jurnal_pembelajaran ENABLE ROW LEVEL SECURITY;

-- Policies for Guru
CREATE POLICY "Guru can view own class jurnal" ON public.jurnal_pembelajaran FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.kelas
    WHERE kelas.id = jurnal_pembelajaran.kelas_id
    AND kelas.guru_id = auth.uid()
  )
);

CREATE POLICY "Guru can insert own class jurnal" ON public.jurnal_pembelajaran FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.kelas
    WHERE kelas.id = jurnal_pembelajaran.kelas_id
    AND kelas.guru_id = auth.uid()
  )
);

CREATE POLICY "Guru can update own class jurnal" ON public.jurnal_pembelajaran FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.kelas
    WHERE kelas.id = jurnal_pembelajaran.kelas_id
    AND kelas.guru_id = auth.uid()
  )
);

CREATE POLICY "Guru can delete own class jurnal" ON public.jurnal_pembelajaran FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.kelas
    WHERE kelas.id = jurnal_pembelajaran.kelas_id
    AND kelas.guru_id = auth.uid()
  )
);

-- Policies for Admin (can manage all)
CREATE POLICY "Admin can view all jurnal" ON public.jurnal_pembelajaran FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can insert jurnal" ON public.jurnal_pembelajaran FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can update jurnal" ON public.jurnal_pembelajaran FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can delete jurnal" ON public.jurnal_pembelajaran FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_jurnal_pembelajaran_updated_at BEFORE UPDATE ON public.jurnal_pembelajaran
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
