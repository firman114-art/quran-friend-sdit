import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, LogOut, Users, GraduationCap, BookOpen, UserPlus, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MonthlyRecap from '@/components/MonthlyRecap';
import AddStudentForm from '@/components/AddStudentForm';

interface GuruRow {
  id: string;
  nama: string;
  email: string;
  user_id: string;
}

interface KelasRow {
  id: string;
  nama_kelas: string;
  guru_id: string;
}

interface SiswaRow {
  id: string;
  nama: string;
  kelas: string;
  kelas_id: string | null;
  no_hp_ortu: string | null;
}

interface RecordRow {
  id: string;
  siswa_id: string;
  tanggal: string;
  hafalan_surah: string | null;
  hafalan_ayat: string | null;
  hafalan_predikat: string | null;
  tilawah_surah: string | null;
  tilawah_ayat: string | null;
  tilawah_predikat: string | null;
  jilid_buku: string | null;
  jilid_halaman: number | null;
  jilid_predikat: string | null;
  catatan_guru: string | null;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { profile, signOut, loading } = useAuth();
  const { toast } = useToast();
  const [guruList, setGuruList] = useState<GuruRow[]>([]);
  const [kelasList, setKelasList] = useState<KelasRow[]>([]);
  const [students, setStudents] = useState<SiswaRow[]>([]);
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [tab, setTab] = useState<'guru' | 'kelas' | 'murid' | 'recap'>('guru');
  const [selectedKelasId, setSelectedKelasId] = useState('');
  const [selectedKelasIdForMurid, setSelectedKelasIdForMurid] = useState('');
  // Add guru form
  const [showAddGuru, setShowAddGuru] = useState(false);
  const [guruNama, setGuruNama] = useState('');
  const [guruEmail, setGuruEmail] = useState('');
  const [guruPassword, setGuruPassword] = useState('');
  const [showGuruPass, setShowGuruPass] = useState(false);
  const [addingGuru, setAddingGuru] = useState(false);
  // Add student form
  const [showAddStudent, setShowAddStudent] = useState(false);

  useEffect(() => {
    if (!loading && (!profile || profile.role !== 'admin')) {
      navigate('/');
    }
  }, [loading, profile, navigate]);

  useEffect(() => {
    if (profile?.role === 'admin') fetchAll();
  }, [profile]);

  const fetchAll = async () => {
    const [guruRes, kelasRes, siswaRes, recRes] = await Promise.all([
      supabase.from('guru').select('*').order('nama'),
      supabase.from('kelas').select('*').order('nama_kelas'),
      supabase.from('siswa').select('*').order('nama'),
      supabase.from('daily_records').select('*').order('tanggal', { ascending: false }),
    ]);
    if (guruRes.data) setGuruList(guruRes.data as any);
    if (kelasRes.data) setKelasList(kelasRes.data as any);
    if (siswaRes.data) setStudents(siswaRes.data as any);
    if (recRes.data) setRecords(recRes.data as any);
  };

  const handleAddGuru = async () => {
    if (!guruNama || !guruEmail || !guruPassword) {
      toast({ title: 'Lengkapi semua field!', variant: 'destructive' });
      return;
    }
    setAddingGuru(true);
    // Use edge function to create guru account
    const { data, error } = await supabase.functions.invoke('create-guru', {
      body: { email: guruEmail, password: guruPassword, nama: guruNama },
    });
    setAddingGuru(false);
    if (error || data?.error) {
      toast({ title: 'Gagal', description: data?.error || error?.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Berhasil!', description: `Akun guru ${guruNama} telah dibuat.` });
    setShowAddGuru(false);
    setGuruNama('');
    setGuruEmail('');
    setGuruPassword('');
    fetchAll();
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (loading || !profile) return null;

  const selectedKelas = kelasList.find(k => k.id === selectedKelasId);
  const kelasStudents = selectedKelasId ? students.filter(s => s.kelas_id === selectedKelasId) : [];
  const kelasStudentIds = kelasStudents.map(s => s.id);
  const kelasRecords = records.filter(r => kelasStudentIds.includes(r.siswa_id));

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6" />
            <div>
              <h1 className="font-bold text-lg">Dashboard Admin</h1>
              <p className="text-xs opacity-80">Manajemen Guru & Kelas</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-primary-foreground hover:bg-primary-foreground/20">
            <LogOut className="w-4 h-4 mr-1" /> Keluar
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <GraduationCap className="w-6 h-6 mx-auto text-primary mb-1" />
              <p className="text-2xl font-bold">{guruList.length}</p>
              <p className="text-xs text-muted-foreground">Guru</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <BookOpen className="w-6 h-6 mx-auto text-primary mb-1" />
              <p className="text-2xl font-bold">{kelasList.length}</p>
              <p className="text-xs text-muted-foreground">Kelas</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto text-primary mb-1" />
              <p className="text-2xl font-bold">{students.length}</p>
              <p className="text-xs text-muted-foreground">Murid</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant={tab === 'guru' ? 'default' : 'outline'} onClick={() => setTab('guru')}
            className={tab === 'guru' ? 'gradient-hero text-primary-foreground' : ''}>
            <GraduationCap className="w-4 h-4 mr-1" /> Guru
          </Button>
          <Button size="sm" variant={tab === 'kelas' ? 'default' : 'outline'} onClick={() => setTab('kelas')}
            className={tab === 'kelas' ? 'gradient-hero text-primary-foreground' : ''}>
            <BookOpen className="w-4 h-4 mr-1" /> Kelas
          </Button>
          <Button size="sm" variant={tab === 'murid' ? 'default' : 'outline'} onClick={() => setTab('murid')}
            className={tab === 'murid' ? 'gradient-hero text-primary-foreground' : ''}>
            <Users className="w-4 h-4 mr-1" /> Murid
          </Button>
          <Button size="sm" variant={tab === 'recap' ? 'default' : 'outline'} onClick={() => setTab('recap')}
            className={tab === 'recap' ? 'gradient-hero text-primary-foreground' : ''}>
            Rekap
          </Button>
        </div>

        {tab === 'guru' && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Daftar Guru</CardTitle>
              <Button size="sm" className="gradient-hero text-primary-foreground" onClick={() => setShowAddGuru(true)}>
                <UserPlus className="w-4 h-4 mr-1" /> Tambah Guru
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {guruList.map(g => (
                <div key={g.id} className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{g.nama}</p>
                    <p className="text-xs text-muted-foreground">{g.email}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {kelasList.filter(k => k.guru_id === g.id).length} kelas
                  </Badge>
                </div>
              ))}
              {guruList.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Belum ada guru.</p>}
            </CardContent>
          </Card>
        )}

        {tab === 'kelas' && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Semua Kelas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {kelasList.map(k => {
                const guru = guruList.find(g => g.id === k.guru_id);
                const count = students.filter(s => s.kelas_id === k.id).length;
                return (
                  <div key={k.id} className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{k.nama_kelas}</p>
                      <p className="text-xs text-muted-foreground">Guru: {guru?.nama || '-'}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{count} murid</Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {tab === 'murid' && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Daftar Murid</CardTitle>
              <div className="flex gap-2">
                <select
                  className="text-sm rounded-md border border-input bg-background px-3 py-1"
                  value={selectedKelasIdForMurid}
                  onChange={e => setSelectedKelasIdForMurid(e.target.value)}
                >
                  <option value="">Semua Kelas</option>
                  {kelasList.map(k => (
                    <option key={k.id} value={k.id}>{k.nama_kelas}</option>
                  ))}
                </select>
                <Button size="sm" className="gradient-hero text-primary-foreground" onClick={() => setShowAddStudent(true)}>
                  <UserPlus className="w-4 h-4 mr-1" /> Tambah
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {(() => {
                const filteredStudents = selectedKelasIdForMurid
                  ? students.filter(s => s.kelas_id === selectedKelasIdForMurid)
                  : students;
                return filteredStudents.map(s => {
                  const kelas = kelasList.find(k => k.id === s.kelas_id);
                  return (
                    <div key={s.id} className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{s.nama}</p>
                        <p className="text-xs text-muted-foreground">Kelas: {kelas?.nama_kelas || s.kelas} | No HP: {s.no_hp_ortu || '-'}</p>
                      </div>
                      <Button size="sm" variant="destructive" onClick={async () => {
                        if (confirm(`Hapus murid ${s.nama}?`)) {
                          const { error } = await supabase.from('siswa').delete().eq('id', s.id);
                          if (!error) {
                            toast({ title: 'Berhasil', description: `Murid ${s.nama} telah dihapus.` });
                            fetchAll();
                          } else {
                            toast({ title: 'Gagal', description: error.message, variant: 'destructive' });
                          }
                        }
                      }}>
                        Hapus
                      </Button>
                    </div>
                  );
                });
              })()}
              {(!selectedKelasIdForMurid ? students : students.filter(s => s.kelas_id === selectedKelasIdForMurid)).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Tidak ada murid.</p>
              )}
            </CardContent>
          </Card>
        )}

        {tab === 'recap' && (
          <div className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <Label className="text-xs">Pilih Kelas untuk Rekap</Label>
                <select
                  className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedKelasId}
                  onChange={e => setSelectedKelasId(e.target.value)}
                >
                  <option value="">Pilih kelas...</option>
                  {kelasList.map(k => (
                    <option key={k.id} value={k.id}>{k.nama_kelas}</option>
                  ))}
                </select>
              </CardContent>
            </Card>
            {selectedKelas && (
              <MonthlyRecap
                students={kelasStudents}
                records={kelasRecords}
                kelasNama={selectedKelas.nama_kelas}
              />
            )}
          </div>
        )}
      </main>

      {/* Add Guru Modal */}
      {showAddGuru && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md border-0 shadow-2xl animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg">Tambah Guru Baru</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs">Nama *</Label>
                <Input value={guruNama} onChange={e => setGuruNama(e.target.value)} placeholder="Nama guru" />
              </div>
              <div>
                <Label className="text-xs">Email *</Label>
                <Input type="email" value={guruEmail} onChange={e => setGuruEmail(e.target.value)} placeholder="email@contoh.com" />
              </div>
              <div>
                <Label className="text-xs">Password *</Label>
                <div className="relative">
                  <Input
                    type={showGuruPass ? 'text' : 'password'}
                    value={guruPassword}
                    onChange={e => setGuruPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="pr-10"
                  />
                  <button type="button" onClick={() => setShowGuruPass(!showGuruPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showGuruPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 gradient-hero text-primary-foreground" onClick={handleAddGuru} disabled={addingGuru}>
                  {addingGuru ? 'Membuat...' : 'Buat Akun Guru'}
                </Button>
                <Button variant="outline" onClick={() => setShowAddGuru(false)}>Batal</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudent && selectedKelasIdForMurid && (
        <AddStudentForm
          kelasId={selectedKelasIdForMurid}
          kelasNama={kelasList.find(k => k.id === selectedKelasIdForMurid)?.nama_kelas || ''}
          onClose={() => setShowAddStudent(false)}
          onSuccess={fetchAll}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
