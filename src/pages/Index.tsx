import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import logoSekolah from '@/assets/logo-sekolah.jpg';
import { Search, BookOpen, LogIn, Moon, Star, GraduationCap, Target, Award, ChevronRight, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-50">
      {/* Bismillah Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 text-white py-3 text-center">
        <p className="text-lg font-arabic tracking-wide">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
      </div>

      {/* Navigation Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={logoSekolah} 
              alt="Logo SDIT Al-Insan" 
              className="w-10 h-10 rounded-full object-cover shadow-md border-2 border-amber-200" 
            />
            <div>
              <h1 className="font-bold text-emerald-800 text-lg leading-tight">AISHA</h1>
              <p className="text-[10px] text-amber-600 font-medium">SDIT Al-Insan Pinrang</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/login')} 
            className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
          >
            <LogIn className="w-4 h-4 mr-2" /> Masuk
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-800 via-emerald-700 to-amber-600 text-white py-16 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 opacity-20">
          <Moon className="w-20 h-20 text-amber-300" />
        </div>
        <div className="absolute top-20 right-20 opacity-20">
          <Star className="w-16 h-16 text-amber-300" />
        </div>
        <div className="absolute bottom-10 left-1/4 opacity-10">
          <Star className="w-24 h-24 text-white" />
        </div>
        
        {/* Mosque Silhouette */}
        <div className="absolute bottom-0 left-0 right-0 h-32 opacity-15">
          <svg viewBox="0 0 1440 120" className="w-full h-full" preserveAspectRatio="none">
            <path 
              fill="currentColor" 
              d="M0,120 L0,80 Q20,60 40,80 Q60,100 80,80 Q100,60 120,80 L120,60 Q140,40 160,60 L160,80 Q180,60 200,80 Q220,100 240,80 L240,50 Q260,30 280,50 L280,80 Q320,60 360,80 L360,40 Q380,20 400,40 L400,80 Q440,60 480,80 L480,55 Q500,35 520,55 L520,80 Q560,60 600,80 L600,45 Q620,25 640,45 L640,80 Q680,60 720,80 L720,50 Q740,30 760,50 L760,80 Q800,60 840,80 L840,40 Q860,20 880,40 L880,80 Q920,60 960,80 L960,55 Q980,35 1000,55 L1000,80 Q1040,60 1080,80 L1080,45 Q1100,25 1120,45 L1120,80 Q1160,60 1200,80 L1200,50 Q1220,30 1240,50 L1240,80 Q1280,60 1320,80 L1320,60 Q1340,40 1360,60 L1360,80 Q1380,60 1400,80 Q1420,100 1440,80 L1440,120 Z"
            />
          </svg>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <GraduationCap className="w-12 h-12 text-amber-300" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-2">SDIT Al-Insan Pinrang</h2>
          <p className="text-xl md:text-2xl text-amber-200 mb-4">AISHA - Al-Insan Student Hafidz Achievement</p>
          <p className="text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
            Sistem Monitoring Perkembangan Al-Qur'an Santri
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button 
              onClick={() => navigate('/login')} 
              className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              <LogIn className="w-5 h-5 mr-2" /> Login Guru
            </Button>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12 max-w-6xl space-y-12">
        {/* Quick Info Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Vision Card */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-white overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-100 p-3 rounded-xl">
                  <Target className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-800 mb-1">Visi Sekolah</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Mencetak generasi Qurani yang cerdas, berakhlak mulia, dan berprestasi
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AISHA Features Card */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-white overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-amber-100 p-3 rounded-xl">
                  <Sparkles className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-800 mb-1">Fitur AISHA</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Monitoring hafalan, tilawah, dan jilid santri secara real-time
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievement Card */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800 mb-1">Prestasi Santri</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Pantau perkembangan Al-Qur'an setiap santri dengan mudah
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Student Search Section */}
        <section className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-100 to-amber-100 rounded-full mb-4">
                  <Search className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Cari Progres Murid</h2>
                <p className="text-gray-600">Ketik nama murid untuk melihat perkembangan Al-Qur'an</p>
              </div>
              
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Ketik nama murid..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="pl-12 py-6 text-lg border-2 border-gray-200 focus:border-emerald-500 rounded-xl"
                />
              </div>
              
              {searching && (
                <p className="text-center text-gray-500 flex items-center justify-center gap-2">
                  <span className="animate-spin w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full"></span>
                  Mencari...
                </p>
              )}
              
              {results.length > 0 && (
                <div className="space-y-3 mt-4">
                  {results.map(s => (
                    <button
                      key={s.id}
                      onClick={() => navigate(`/murid/${s.id}`)}
                      className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-white border border-emerald-100 hover:from-emerald-100 hover:to-emerald-50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-200 rounded-full flex items-center justify-center">
                          <span className="text-emerald-700 font-semibold">{s.nama.charAt(0)}</span>
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-800">{s.nama}</p>
                          <p className="text-sm text-gray-500">Kelas {s.kelas}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-emerald-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              )}
              
              {query.trim().length >= 2 && !searching && results.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <p className="text-gray-500">Murid tidak ditemukan.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Bulletin Board Section */}
        <section>
          <BulletinBoard />
        </section>

        {/* About AISHA Section */}
        <section className="bg-gradient-to-r from-emerald-800 to-emerald-900 rounded-3xl p-8 md:p-12 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Tentang AISHA</h2>
              <p className="text-emerald-100 leading-relaxed mb-6">
                AISHA (Al-Insan Student Hafidz Achievement) adalah sistem monitoring digital 
                yang membantu guru dan wali murid memantau perkembangan hafalan Al-Qur'an, 
                tilawah, dan jilid santri SDIT Al-Insan Pinrang secara real-time.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-white/20 rounded-full text-sm">📖 Hafalan</span>
                <span className="px-4 py-2 bg-white/20 rounded-full text-sm">📚 Tilawah</span>
                <span className="px-4 py-2 bg-white/20 rounded-full text-sm">✏️ Jilid</span>
                <span className="px-4 py-2 bg-white/20 rounded-full text-sm">📊 Laporan</span>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-48 h-48 bg-amber-400/20 rounded-full absolute -top-4 -right-4"></div>
                <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center relative">
                  <BookOpen className="w-24 h-24 text-amber-300" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 text-white py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src={logoSekolah} 
                  alt="Logo" 
                  className="w-12 h-12 rounded-full border-2 border-amber-400"
                />
                <div>
                  <h3 className="font-bold text-lg">SDIT Al-Insan</h3>
                  <p className="text-xs text-amber-300">Pinrang</p>
                </div>
              </div>
              <p className="text-sm text-emerald-100 leading-relaxed">
                Sekolah Islam Terpadu yang berkomitmen mencetak generasi Qurani 
                yang cerdas dan berakhlak mulia.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-amber-300">Sistem AISHA</h4>
              <ul className="space-y-2 text-sm text-emerald-100">
                <li>• Monitoring Hafalan</li>
                <li>• Tracking Tilawah</li>
                <li>• Jurnal Kelas Digital</li>
                <li>• Laporan Perkembangan</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-amber-300">Kontak</h4>
              <p className="text-sm text-emerald-100 leading-relaxed">
                Jl. [Alamat Sekolah]<br />
                Pinrang, Sulawesi Selatan<br />
                Telepon: [Nomor Telepon]
              </p>
            </div>
          </div>
          
          <div className="border-t border-emerald-700 pt-6 text-center">
            <p className="text-amber-300 font-medium mb-2">
              "Mencetak Generasi Qurani yang Cerdas dan Berakhlak Mulia"
            </p>
            <p className="text-xs text-emerald-400">
              © {new Date().getFullYear()} SDIT Al-Insan Pinrang. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
