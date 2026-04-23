import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import logoSekolah from '@/assets/logo-sekolah.jpg';
import { Search, BookOpen, LogIn } from 'lucide-react';
import BulletinBoard from '@/components/BulletinBoard';

interface SiswaResult {
  id: string;
  nama: string;
  kelas: string;
}


const Index = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SiswaResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [pengumumanList, setPengumumanList] = useState<any[]>([]);

  useEffect(() => {
    // Fetch active announcements
    const fetchPengumuman = async () => {
      try {
        const { data, error } = await supabase.from('pengumuman' as any).select('*').eq('aktif', true).order('created_at', { ascending: false }).limit(5);
        if (data) setPengumumanList(data);
        if (error) console.error('Error fetching announcements:', error);
      } catch (e) {
        console.error('Pengumuman fetch error:', e);
      }
    };
    fetchPengumuman();
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setSearching(true);
      const { data } = await supabase
        .from('siswa')
        .select('id, nama, kelas')
        .ilike('nama', `%${query.trim()}%`)
        .order('nama')
        .limit(10);
      setResults(data || []);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="min-h-screen islamic-pattern">
      <div className="text-center py-4 text-sm text-muted-foreground">
        بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
      </div>
      <header className="gradient-hero text-primary-foreground py-4 relative z-50">
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Kiri: Logo + Nama */}
          <div className="flex items-center gap-3">
            <img src={logoSekolah} alt="Logo SDIT Al-Insan" className="w-12 h-12 rounded-full object-cover shadow-lg border-2 border-primary-foreground/30" />
            <div>
              <h1 className="font-bold text-lg leading-tight">AISHA</h1>
              <p className="text-[10px] opacity-80 italic">Al-Insan Student Hafidz Achievement</p>
              <p className="text-[10px] opacity-90">SDIT Al-Insan Pinrang</p>
            </div>
          </div>
          {/* Kanan: Login Button */}
          <div className="relative z-[100]">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/login')} 
              className="border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/20 bg-transparent"
            >
              <LogIn className="w-4 h-4 mr-2" /> Masuk
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-lg space-y-6">
        {pengumumanList.length > 0 && (
          <div className="space-y-3">
            {pengumumanList.map((p) => (
              <Card key={p.id} className={`border-l-4 ${
                p.tipe === 'warning' ? 'border-l-warning' : 
                p.tipe === 'success' ? 'border-l-success' : 'border-l-primary'
              }`}>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm">{p.judul}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{p.isi}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6 space-y-4">
            <div className="text-center">
              <Search className="w-10 h-10 mx-auto text-primary mb-2" />
              <h2 className="font-semibold text-lg text-foreground">Cari Progres Murid</h2>
              <p className="text-sm text-muted-foreground">Ketik nama murid untuk melihat perkembangan Al-Qur'an</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Ketik nama murid..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {searching && <p className="text-sm text-muted-foreground text-center">Mencari...</p>}
            {results.length > 0 && (
              <div className="space-y-2">
                {results.map(s => (
                  <button
                    key={s.id}
                    onClick={() => navigate(`/murid/${s.id}`)}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-secondary hover:bg-primary/10 transition-colors text-left"
                  >
                    <div>
                      <p className="font-medium text-sm text-foreground">{s.nama}</p>
                      <p className="text-xs text-muted-foreground">Kelas {s.kelas}</p>
                    </div>
                    <BookOpen className="w-4 h-4 text-primary" />
                  </button>
                ))}
              </div>
            )}
            {query.trim().length >= 2 && !searching && results.length === 0 && (
              <p className="text-sm text-muted-foreground text-center">Murid tidak ditemukan.</p>
            )}
          </CardContent>
        </Card>
        <BulletinBoard />
      </main>
      <footer className="text-center py-6 text-sm text-muted-foreground">
        <p className="italic">"Mencetak Generasi Qurani yang Cerdas dan Berakhlak Mulia."</p>
      </footer>
    </div>
  );
};

export default Index;
