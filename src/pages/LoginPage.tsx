import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import logoSekolah from '@/assets/logo-sekolah.jpg';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, GraduationCap, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type UserRole = 'guru' | 'siswa';

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn, signUp, profile, loading } = useAuth();
  const { toast } = useToast();
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<UserRole | ''>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nama, setNama] = useState('');
  const [kelas, setKelas] = useState('');
  const [noHpOrtu, setNoHpOrtu] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast({ title: 'Lengkapi email dan password!', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) {
      toast({ title: 'Gagal masuk', description: error.message, variant: 'destructive' });
    }
    // Navigation handled by useEffect below
  };

  const handleRegister = async () => {
    if (!email || !password || !role || !nama) {
      toast({ title: 'Lengkapi semua field!', variant: 'destructive' });
      return;
    }
    if (role === 'siswa' && !kelas) {
      toast({ title: 'Masukkan kelas!', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const metadata: Record<string, string> = { role, nama };
    if (role === 'siswa') {
      metadata.kelas = kelas;
      if (noHpOrtu) metadata.no_hp_ortu = noHpOrtu;
    }
    const { error } = await signUp(email, password, metadata);
    setSubmitting(false);
    if (error) {
      toast({ title: 'Gagal daftar', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Berhasil!', description: 'Akun berhasil dibuat. Silakan masuk.' });
      setIsRegister(false);
    }
  };

  // Redirect if already logged in
  const auth = useAuth();
  if (!loading && auth.session && auth.profile) {
    if (auth.profile.role === 'guru') {
      navigate('/guru');
    } else {
      navigate('/siswa');
    }
    return null;
  }

  return (
    <div className="min-h-screen islamic-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-hero mb-4 shadow-lg">
            <BookOpen className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Manajemen Al-Qur'an</h1>
          <p className="text-muted-foreground mt-1">SDIT Al-Insan Pinrang</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardContent className="p-6 space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {isRegister ? 'Buat akun baru' : 'Silakan masuk untuk melanjutkan'}
              </p>
            </div>

            {isRegister && (
              <>
                {/* Role Selection */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setRole('guru')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                      role === 'guru'
                        ? 'border-primary bg-secondary text-secondary-foreground'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <GraduationCap className="w-8 h-8" />
                    <span className="font-medium text-sm">Guru</span>
                  </button>
                  <button
                    onClick={() => setRole('siswa')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                      role === 'siswa'
                        ? 'border-primary bg-secondary text-secondary-foreground'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Users className="w-8 h-8" />
                    <span className="font-medium text-sm">Siswa</span>
                  </button>
                </div>

                <div>
                  <Label className="text-xs">Nama Lengkap</Label>
                  <Input value={nama} onChange={e => setNama(e.target.value)} placeholder="Masukkan nama lengkap" />
                </div>

                {role === 'siswa' && (
                  <>
                    <div>
                      <Label className="text-xs">Kelas</Label>
                      <Input value={kelas} onChange={e => setKelas(e.target.value)} placeholder="Contoh: 5A" />
                    </div>
                    <div>
                      <Label className="text-xs">No. HP Orang Tua (opsional)</Label>
                      <Input value={noHpOrtu} onChange={e => setNoHpOrtu(e.target.value)} placeholder="6281234567890" />
                    </div>
                  </>
                )}
              </>
            )}

            <div>
              <Label className="text-xs">Email</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@contoh.com" />
            </div>
            <div>
              <Label className="text-xs">Password</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimal 6 karakter" />
            </div>

            <Button
              className="w-full gradient-hero text-primary-foreground"
              size="lg"
              disabled={submitting}
              onClick={isRegister ? handleRegister : handleLogin}
            >
              {submitting ? 'Memproses...' : isRegister ? 'Daftar' : 'Masuk'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
              <button onClick={() => setIsRegister(!isRegister)} className="text-primary font-medium hover:underline">
                {isRegister ? 'Masuk' : 'Daftar'}
              </button>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
