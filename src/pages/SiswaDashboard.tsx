import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, LogOut, TrendingUp, Star, MessageSquare } from 'lucide-react';

interface RecordRow {
  id: string;
  tanggal: string;
  tilpi_kategori: string;
  tilpi_halaman: number;
  tahfidz_juz: number | null;
  tahfidz_surah: string;
  tahfidz_ayat: string;
  status: string;
  catatan: string | null;
}

const SiswaDashboard = () => {
  const navigate = useNavigate();
  const { profile, siswaData, signOut, loading } = useAuth();
  const [records, setRecords] = useState<RecordRow[]>([]);

  useEffect(() => {
    if (!loading && (!profile || profile.role !== 'siswa')) {
      navigate('/');
    }
  }, [loading, profile, navigate]);

  useEffect(() => {
    if (siswaData) {
      supabase
        .from('daily_records')
        .select('*')
        .eq('siswa_id', siswaData.id)
        .order('tanggal', { ascending: true })
        .then(({ data }) => {
          if (data) setRecords(data);
        });
    }
  }, [siswaData]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (loading || !profile || !siswaData) return null;

  const lancarRecords = records.filter(r => r.status === 'Lancar');
  const uniqueSurah = [...new Set(lancarRecords.map(r => r.tahfidz_surah))];
  const notesFromGuru = records.filter(r => r.catatan && r.catatan.trim() !== '');

  const maxHalaman = records.length > 0 ? Math.max(...records.map(r => r.tilpi_halaman)) : 0;
  const progressPercent = Math.min((maxHalaman / 50) * 100, 100);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Lancar': return 'bg-success text-success-foreground';
      case 'Perlu Mengulang': return 'bg-warning text-warning-foreground';
      case 'Murajaah': return 'bg-info text-info-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6" />
            <div>
              <h1 className="font-bold text-lg">Dashboard Siswa</h1>
              <p className="text-xs opacity-80">Assalamu'alaikum, {siswaData.nama}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-primary-foreground hover:bg-primary-foreground/20">
            <LogOut className="w-4 h-4 mr-1" /> Keluar
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto text-primary mb-1" />
              <p className="text-2xl font-bold text-foreground">{records.length}</p>
              <p className="text-xs text-muted-foreground">Total Setoran</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <Star className="w-6 h-6 mx-auto text-accent mb-1" />
              <p className="text-2xl font-bold text-foreground">{lancarRecords.length}</p>
              <p className="text-xs text-muted-foreground">Lancar</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <BookOpen className="w-6 h-6 mx-auto text-success mb-1" />
              <p className="text-2xl font-bold text-foreground">{uniqueSurah.length}</p>
              <p className="text-xs text-muted-foreground">Surah Hafal</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Tilawah */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Progres Tilawah
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Halaman terakhir: {maxHalaman}</span>
                <span className="font-medium text-foreground">{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full gradient-hero transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-end gap-1 h-16 mt-4">
                {records.slice(-10).map((r) => {
                  const height = (r.tilpi_halaman / Math.max(maxHalaman, 1)) * 100;
                  return (
                    <div key={r.id} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t gradient-hero opacity-70 hover:opacity-100 transition-opacity"
                        style={{ height: `${Math.max(height, 10)}%` }}
                        title={`Hal. ${r.tilpi_halaman} - ${r.tanggal}`}
                      />
                      <span className="text-[9px] text-muted-foreground">{r.tanggal.slice(-2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hafalan List */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="w-5 h-5 text-accent" />
              Daftar Hafalan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {records.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Belum ada catatan hafalan.</p>
            ) : (
              records.map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm text-foreground">{r.tahfidz_surah} (Ayat {r.tahfidz_ayat})</p>
                    <p className="text-xs text-muted-foreground">
                      {r.tanggal} • {r.tahfidz_juz ? `Juz ${r.tahfidz_juz} • ` : ''}{r.tilpi_kategori} Hal. {r.tilpi_halaman}
                    </p>
                  </div>
                  <Badge className={`text-xs ${getStatusColor(r.status)}`}>{r.status}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Catatan Guru */}
        {notesFromGuru.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Catatan dari Guru
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {notesFromGuru.map(r => (
                <div key={r.id} className="p-3 rounded-lg bg-secondary border-l-4 border-primary">
                  <p className="text-sm text-foreground">{r.catatan}</p>
                  <p className="text-xs text-muted-foreground mt-1">{r.tanggal} • {r.tahfidz_surah}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default SiswaDashboard;
