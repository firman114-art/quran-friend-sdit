import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import logoSekolah from '@/assets/logo-sekolah.jpg';
import { Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn, session, profile, loading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session && profile) {
      if (profile.role === 'admin') navigate('/admin');
      else if (profile.role === 'guru') navigate('/guru');
      else navigate('/');
    }
  }, [loading, session, profile, navigate]);

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
  };

  return (
    <div className="min-h-screen islamic-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <img src={logoSekolah} alt="Logo SDIT Al-Insan Pinrang" className="w-24 h-24 mx-auto mb-4 rounded-full object-cover shadow-lg" />
          <h1 className="text-2xl font-bold text-foreground">Capaian Kelas Minat dan Bakat</h1>
          <p className="text-muted-foreground mt-1">SDIT Al-Insan Pinrang</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardContent className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground text-center">Masuk sebagai Guru atau Admin</p>

            <div>
              <Label className="text-xs">Email</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@contoh.com" />
            </div>
            <div>
              <Label className="text-xs">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              className="w-full gradient-hero text-primary-foreground"
              size="lg"
              disabled={submitting}
              onClick={handleLogin}
            >
              <LogIn className="w-4 h-4 mr-2" />
              {submitting ? 'Memproses...' : 'Masuk'}
            </Button>

            <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Beranda
            </Button>
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
