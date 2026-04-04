
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('guru', 'siswa');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create guru table
CREATE TABLE public.guru (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nama TEXT NOT NULL,
  email TEXT NOT NULL,
  no_hp TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create siswa table
CREATE TABLE public.siswa (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nama TEXT NOT NULL,
  kelas TEXT NOT NULL,
  no_hp_ortu TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily_records table
CREATE TABLE public.daily_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  siswa_id UUID REFERENCES public.siswa(id) ON DELETE CASCADE NOT NULL,
  guru_id UUID REFERENCES public.guru(id) NOT NULL,
  tanggal DATE NOT NULL,
  tilpi_kategori TEXT NOT NULL,
  tilpi_halaman INTEGER NOT NULL,
  tahfidz_juz INTEGER,
  tahfidz_surah TEXT NOT NULL,
  tahfidz_ayat TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Lancar', 'Perlu Mengulang', 'Murajaah')),
  catatan TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guru ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.siswa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_records ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Security definer function for role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Guru policies
CREATE POLICY "Guru can view own data" ON public.guru FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Guru can insert own data" ON public.guru FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Guru can update own data" ON public.guru FOR UPDATE USING (auth.uid() = user_id);

-- Siswa policies
CREATE POLICY "Siswa can view own data" ON public.siswa FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Siswa can insert own data" ON public.siswa FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Guru can view all siswa" ON public.siswa FOR SELECT USING (public.has_role(auth.uid(), 'guru'));

-- Daily records policies
CREATE POLICY "Guru can view all records" ON public.daily_records FOR SELECT USING (public.has_role(auth.uid(), 'guru'));
CREATE POLICY "Guru can insert records" ON public.daily_records FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'guru'));
CREATE POLICY "Guru can update records" ON public.daily_records FOR UPDATE USING (public.has_role(auth.uid(), 'guru'));
CREATE POLICY "Siswa can view own records" ON public.daily_records FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.siswa WHERE siswa.id = daily_records.siswa_id AND siswa.user_id = auth.uid())
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_guru_updated_at BEFORE UPDATE ON public.guru FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_siswa_updated_at BEFORE UPDATE ON public.siswa FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_daily_records_updated_at BEFORE UPDATE ON public.daily_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup (role from metadata)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role)
  VALUES (NEW.id, (NEW.raw_user_meta_data->>'role')::app_role);
  
  IF (NEW.raw_user_meta_data->>'role') = 'guru' THEN
    INSERT INTO public.guru (user_id, nama, email)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nama', ''), NEW.email);
  ELSIF (NEW.raw_user_meta_data->>'role') = 'siswa' THEN
    INSERT INTO public.siswa (user_id, nama, kelas, no_hp_ortu)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nama', ''), COALESCE(NEW.raw_user_meta_data->>'kelas', ''), COALESCE(NEW.raw_user_meta_data->>'no_hp_ortu', ''));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
