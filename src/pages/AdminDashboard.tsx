import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, LogOut, Users, GraduationCap, BookOpen, UserPlus, Shield, TrendingUp, Activity, Calendar, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MonthlyRecap from '@/components/MonthlyRecap';
import AddStudentForm from '@/components/AddStudentForm';

interface GuruRow {
  id: string;
  nama: string;
  email: string;
  user_id: string;
  username: string | null;
  password_plain: string | null;
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
  const [tab, setTab] = useState<'guru' | 'kelas' | 'murid' | 'recap' | 'pengaturan'>('guru');
  const [semesterAktif, setSemesterAktif] = useState('GANJIL');
  const [pengumumanList, setPengumumanList] = useState<any[]>([]);
  const [newPengumuman, setNewPengumuman] = useState({ judul: '', isi: '', tipe: 'info' });
  const [selectedKelasId, setSelectedKelasId] = useState('');
  const [selectedKelasIdForMurid, setSelectedKelasIdForMurid] = useState('');
  // Add guru form
  const [showAddGuru, setShowAddGuru] = useState(false);
  const [guruNama, setGuruNama] = useState('');
  const [generatedUsername, setGeneratedUsername] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [addingGuru, setAddingGuru] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
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
    const [guruRes, kelasRes, siswaRes, recRes, semesterRes] = await Promise.all([
      supabase.from('guru').select('id, nama, email, user_id, username, password_plain').order('nama'),
      supabase.from('kelas').select('*').order('nama_kelas'),
      supabase.from('siswa').select('*').order('nama'),
      supabase.from('daily_records').select('*').order('tanggal', { ascending: false }),
      supabase.from('pengaturan' as any).select('*').eq('key', 'semester_aktif').maybeSingle(),
    ]);
    if (guruRes.data) setGuruList(guruRes.data as any);
    if (kelasRes.data) setKelasList(kelasRes.data as any);
    if (siswaRes.data) setStudents(siswaRes.data as any);
    if (recRes.data) setRecords(recRes.data as any);
    if (semesterRes.data?.value) setSemesterAktif(semesterRes.data.value);
  };

  const getTodayRecords = () => {
    const today = new Date().toISOString().split('T')[0];
    return records.filter(r => r.tanggal === today).length;
  };

  const getMonthRecords = () => {
    const thisMonth = new Date().toISOString().substring(0, 7);
    return records.filter(r => r.tanggal.startsWith(thisMonth)).length;
  };

  const getActiveStudents = () => {
    const thisMonth = new Date().toISOString().substring(0, 7);
    const activeStudentIds = new Set(
      records.filter(r => r.tanggal.startsWith(thisMonth)).map(r => r.siswa_id)
    );
    return activeStudentIds.size;
  };

  // Generate username and password from nama
  const generateCredentials = (nama: string): { username: string; password: string } => {
    const cleanNama = nama.toLowerCase().trim().replace(/\s+/g, '.');
    // Generate unique username by checking existing
    const baseUsername = cleanNama;
    const password = `Guru${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return { username: baseUsername, password };
  };

  const handleAddGuru = async () => {
    if (!guruNama) {
      toast({ title: 'Masukkan nama guru!', variant: 'destructive' });
      return;
    }
    
    const { username: baseUsername, password } = generateCredentials(guruNama);
    setGeneratedPassword(password);
    
    setAddingGuru(true);
    
    try {
      // Generate unique username using SQL function
      const { data: usernameData, error: usernameError } = await supabase.rpc('generate_guru_username', {
        p_nama: guruNama
      });
      
      if (usernameError) {
        toast({ title: 'Gagal generate username', description: usernameError.message, variant: 'destructive' });
        setAddingGuru(false);
        return;
      }
      
      const finalUsername: string = (usernameData as string) || baseUsername;
      setGeneratedUsername(finalUsername);
      
      // Check if username already exists
      const { data: existingGuru } = await supabase
        .from('guru')
        .select('id')
        .eq('username', finalUsername)
        .maybeSingle();
        
      if (existingGuru) {
        toast({ title: 'Username sudah terdaftar', description: `Username ${finalUsername} sudah digunakan. Gunakan nama lain.`, variant: 'destructive' });
        setAddingGuru(false);
        return;
      }
      
      // Generate a dummy UUID for guru id (since we're not using Supabase Auth)
      const guruId = crypto.randomUUID();
      
      // Insert into guru table with username and password (no user_id for username-based auth)
      const { error: guruError } = await (supabase.from('guru' as any).insert({
        id: guruId,
        user_id: guruId,
        nama: guruNama,
        email: `${finalUsername}@sdit.local`, // Dummy email
        username: finalUsername,
        password_hash: password, // Will be hashed by SQL function
        password_plain: password, // Store plain password for admin view
        is_active: true
      }));
      
      if (guruError) {
        console.error('Error inserting guru:', guruError);
        toast({ 
          title: 'Gagal membuat guru', 
          description: guruError.message || 'Terjadi kesalahan saat menyimpan data guru.',
          variant: 'destructive' 
        });
        setAddingGuru(false);
        return;
      }
      
      // Set password using SQL function (this will hash it properly)
      const { error: passwordError } = await supabase.rpc('set_guru_password', {
        p_guru_id: guruId,
        p_password: password
      });
      
      if (passwordError) {
        console.error('Error setting password:', passwordError);
      }
      
      // Also insert into profiles for consistency
      const { error: profileError } = await supabase.from('profiles').insert({
        id: guruId,
        user_id: guruId,
        nama_lengkap: guruNama,
        role: 'guru'
      });
      
      if (profileError) {
        console.error('Error inserting profile:', profileError);
      }
      
      toast({ title: 'Berhasil!', description: `Akun guru ${guruNama} telah dibuat.` });
      setShowCredentials(true);
      fetchAll();
    } catch (err: any) {
      console.error('Error creating guru:', err);
      toast({ title: 'Gagal', description: err.message || 'Terjadi kesalahan tak terduga.', variant: 'destructive' });
    }
    
    setAddingGuru(false);
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

        <div className="grid grid-cols-3 gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <Activity className="w-6 h-6 mx-auto text-success mb-1" />
              <p className="text-2xl font-bold">{getTodayRecords()}</p>
              <p className="text-xs text-muted-foreground">Setoran Hari Ini</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <Calendar className="w-6 h-6 mx-auto text-primary mb-1" />
              <p className="text-2xl font-bold">{getMonthRecords()}</p>
              <p className="text-xs text-muted-foreground">Setoran Bulan Ini</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto text-accent mb-1" />
              <p className="text-2xl font-bold">{getActiveStudents()}</p>
              <p className="text-xs text-muted-foreground">Murid Aktif</p>
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
          <Button size="sm" variant={tab === 'pengaturan' ? 'default' : 'outline'} onClick={() => setTab('pengaturan')}
            className={tab === 'pengaturan' ? 'gradient-hero text-primary-foreground' : ''}>
            Pengaturan
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
                <div key={g.id} className="p-3 rounded-lg bg-muted/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{g.nama}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {kelasList.filter(k => k.guru_id === g.id).length} kelas
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        className="h-7 w-7 p-0"
                        onClick={async () => {
                          if (confirm(`Hapus guru ${g.nama}?\n\nSemua kelas yang diampu guru ini akan kehilangan pengampu.`)) {
                            // Check if guru has classes
                            const guruKelas = kelasList.filter(k => k.guru_id === g.id);
                            
                            // Delete guru from guru table
                            const { error } = await supabase.from('guru').delete().eq('id', g.id);
                            
                            if (!error) {
                              // Also delete from profiles
                              await supabase.from('profiles').delete().eq('id', g.user_id);
                              
                              toast({ title: 'Berhasil', description: `Guru ${g.nama} telah dihapus.` });
                              fetchAll();
                            } else {
                              toast({ title: 'Gagal', description: error.message, variant: 'destructive' });
                            }
                          }
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{g.email}</p>
                  {g.username && <p className="text-xs">👤 Username: <span className="font-mono">{g.username}</span></p>}
                  {g.password_plain && <p className="text-xs">🔑 Password: <span className="font-mono">{g.password_plain}</span></p>}
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
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{count} murid</Badge>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        className="h-7 w-7 p-0"
                        onClick={async () => {
                          if (confirm(`Hapus kelas ${k.nama_kelas}?\n\n${count} murid di kelas ini akan ikut terhapus. Tindakan ini tidak dapat dibatalkan.`)) {
                            // Delete all students in this class
                            const { error: deleteStudentsError } = await supabase
                              .from('siswa')
                              .delete()
                              .eq('kelas_id', k.id);
                            
                            if (deleteStudentsError) {
                              toast({ title: 'Gagal hapus murid', description: deleteStudentsError.message, variant: 'destructive' });
                              return;
                            }
                            
                            // Delete the class
                            const { error: deleteKelasError } = await supabase
                              .from('kelas')
                              .delete()
                              .eq('id', k.id);
                            
                            if (!deleteKelasError) {
                              toast({ 
                                title: 'Berhasil', 
                                description: `Kelas ${k.nama_kelas} dan ${count} murid telah dihapus.` 
                              });
                              fetchAll();
                            } else {
                              toast({ title: 'Gagal hapus kelas', description: deleteKelasError.message, variant: 'destructive' });
                            }
                          }
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
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
      {showAddGuru && !showCredentials && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md border-0 shadow-2xl animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg">Tambah Guru Baru</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs">Nama Guru *</Label>
                <Input 
                  value={guruNama} 
                  onChange={e => setGuruNama(e.target.value)} 
                  placeholder="Contoh: Budi Santoso" 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email dan password akan digenerate otomatis
                </p>
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

      {/* Show Generated Credentials */}
      {showCredentials && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md border-0 shadow-2xl animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg text-success">Akun Guru Berhasil Dibuat!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div>
                  <Label className="text-xs">Nama</Label>
                  <p className="font-medium">{guruNama}</p>
                </div>
                <div>
                  <Label className="text-xs">Username</Label>
                  <p className="font-medium text-primary">{generatedUsername}</p>
                </div>
                <div>
                  <Label className="text-xs">Password</Label>
                  <p className="font-medium text-primary">{generatedPassword}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Simpan informasi ini! Guru dapat login menggunakan email dan password di atas.
              </p>
              <Button 
                className="w-full gradient-hero text-primary-foreground" 
                onClick={() => {
                  setShowCredentials(false);
                  setShowAddGuru(false);
                  setGuruNama('');
                  setGeneratedUsername('');
                  setGeneratedPassword('');
                }}
              >
                Tutup
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === 'pengaturan' && (
        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Pengaturan Semester</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Semester Aktif</Label>
                <select 
                  value={semesterAktif} 
                  onChange={(e) => setSemesterAktif(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="GANJIL">Ganjil</option>
                  <option value="GENAP">Genap</option>
                </select>
              </div>
              <Button onClick={async () => {
                const { error } = await supabase.from('pengaturan' as any).upsert({
                  key: 'semester_aktif',
                  value: semesterAktif,
                  deskripsi: 'Semester yang sedang berjalan (GANJIL/GENAP)'
                }, { onConflict: 'key' });
                if (error) toast({ title: 'Gagal', description: error.message, variant: 'destructive' });
                else toast({ title: 'Berhasil', description: 'Semester aktif diperbarui' });
              }}>
                Simpan Semester
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Pengumuman</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Input 
                  placeholder="Judul pengumuman" 
                  value={newPengumuman.judul}
                  onChange={(e) => setNewPengumuman({...newPengumuman, judul: e.target.value})}
                />
                <textarea 
                  placeholder="Isi pengumuman"
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={newPengumuman.isi}
                  onChange={(e) => setNewPengumuman({...newPengumuman, isi: e.target.value})}
                />
                <select 
                  value={newPengumuman.tipe}
                  onChange={(e) => setNewPengumuman({...newPengumuman, tipe: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="success">Success</option>
                </select>
              </div>
              <Button onClick={async () => {
                if (!newPengumuman.judul || !newPengumuman.isi) {
                  toast({ title: 'Error', description: 'Judul dan isi harus diisi', variant: 'destructive' });
                  return;
                }
                const { error } = await (supabase.from('pengumuman' as any).insert({
                  judul: newPengumuman.judul,
                  isi: newPengumuman.isi,
                  tipe: newPengumuman.tipe,
                  aktif: true
                }));
                if (error) toast({ title: 'Gagal', description: error.message, variant: 'destructive' });
                else {
                  toast({ title: 'Berhasil', description: 'Pengumuman ditambahkan' });
                  setNewPengumuman({ judul: '', isi: '', tipe: 'info' });
                }
              }}>
                Tambah Pengumuman
              </Button>
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
