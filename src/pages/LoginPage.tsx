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

type LoginType = 'email' | 'username';

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn, signInWithUsername, session, profile, guruData, loading } = useAuth();
  const { toast } = useToast();
  const [loginType, setLoginType] = useState<LoginType>('username'); // Default to username for guru
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading) {
      // Handle email-based auth (admin)
      if (session && profile) {
        if (profile.role === 'admin') navigate('/admin');
        else if (profile.role === 'guru') navigate('/guru');
        else navigate('/');
      }
      // Handle username-based auth (guru)
      else if (guruData && profile?.role === 'guru') {
        navigate('/guru');
      }
    }
  }, [loading, session, profile, guruData, navigate]);

  const handleLogin = async () => {
    if (loginType === 'email' && !email) {
      toast({ title: 'Masukkan email!', variant: 'destructive' });
      return;
    }
    if (loginType === 'username' && !username) {
      toast({ title: 'Masukkan username!', variant: 'destructive' });
      return;
    }
    if (!password) {
      toast({ title: 'Masukkan password!', variant: 'destructive' });
      return;
    }
    
    setSubmitting(true);
    
    let error;
    if (loginType === 'email') {
      const result = await signIn(email, password);
      error = result.error;
    } else {
      const result = await signInWithUsername(username, password);
      error = result.error;
    }
    
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
            
            {/* Login Type Toggle */}
            <div className="flex gap-2 bg-muted rounded-lg p-1">
              <button
                onClick={() => setLoginType('username')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  loginType === 'username' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Username (Guru)
              </button>
              <button
                onClick={() => setLoginType('email')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  loginType === 'email' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Email (Admin)
              </button>
            </div>

            {loginType === 'email' ? (
              <div>
                <Label className="text-xs">Email</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@contoh.com" />
              </div>
            ) : (
              <div>
                <Label className="text-xs">Username</Label>
                <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="nama.guru" />
                <p className="text-xs text-muted-foreground mt-1">Contoh: budi.santoso</p>
              </div>
            )}
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
