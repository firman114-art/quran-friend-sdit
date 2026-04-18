import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, LogOut, Users, Plus, UserPlus, FolderPlus, ClipboardList, Calendar, Download, Trash2, Check, Clock } from 'lucide-react';
import DailyInputForm from '@/components/DailyInputForm';
import AddStudentForm from '@/components/AddStudentForm';
import MonthlyRecap from '@/components/MonthlyRecap';
import JurnalKelasForm from '@/components/JurnalKelasForm';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';

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
  hafalan_penilaian: string | null;
  hafalan_predikat: string | null;
  tilawah_surah: string | null;
  tilawah_ayat: string | null;
  tilawah_penilaian: string | null;
  tilawah_predikat: string | null;
  jilid_buku: string | null;
  jilid_halaman: number | null;
  jilid_penilaian: string | null;
  jilid_predikat: string | null;
  catatan_guru: string | null;
}

interface JurnalRow {
  id: string;
  kelas_id: string;
  tanggal: string;
  hafalan: string | null;
  tilawah: string | null;
  tulisan: string | null;
  keterangan: string | null;
}

const GuruDashboard = () => {
  const navigate = useNavigate();
  const { profile, guruData, signOut, loading } = useAuth();
  const { toast } = useToast();
  const [kelasList, setKelasList] = useState<KelasRow[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<string>('');
  const [students, setStudents] = useState<SiswaRow[]>([]);
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [jurnals, setJurnals] = useState<JurnalRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<SiswaRow | null>(null);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddKelas, setShowAddKelas] = useState(false);
  const [newKelasName, setNewKelasName] = useState('');
  const [showRecap, setShowRecap] = useState(false);
  const [showJurnalForm, setShowJurnalForm] = useState(false);
  const [showJurnalKelasForm, setShowJurnalKelasForm] = useState(false);
  const [jurnalTanggal, setJurnalTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [jurnalHafalan, setJurnalHafalan] = useState('');
  const [jurnalTilawah, setJurnalTilawah] = useState('');
  const [jurnalTulisan, setJurnalTulisan] = useState('');
  const [jurnalKeterangan, setJurnalKeterangan] = useState('');
  const [tab, setTab] = useState<'students' | 'recap' | 'jurnal'>('students');

  useEffect(() => {
    if (!loading && (!profile || profile.role !== 'guru')) {
      navigate('/');
    }
  }, [loading, profile, navigate]);

  useEffect(() => {
    if (guruData) fetchKelas();
  }, [guruData]);

  useEffect(() => {
    if (selectedKelas) {
      fetchStudentsAndRecords();
      fetchJurnals();
    }
  }, [selectedKelas]);

  const fetchKelas = async () => {
    if (!guruData) return;
    const { data } = await supabase.from('kelas').select('*').eq('guru_id', guruData.id).order('nama_kelas');
    if (data) {
      setKelasList(data as any);
      if (data.length > 0 && !selectedKelas) setSelectedKelas(data[0].id);
    }
  };

  const fetchStudentsAndRecords = async () => {
    const kelas = kelasList.find(k => k.id === selectedKelas);
    if (!kelas) return;
    const [studentsRes, recordsRes] = await Promise.all([
      supabase.from('siswa').select('*').eq('kelas_id', selectedKelas).order('nama'),
      supabase.from('daily_records').select('*').order('tanggal', { ascending: false }),
    ]);
    if (studentsRes.data) setStudents(studentsRes.data as any);
    if (recordsRes.data) setRecords(recordsRes.data as any);
  };

  const getTodaySetoranStatus = (studentId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = records.filter(r => r.siswa_id === studentId && r.tanggal === today);
    return todayRecords.length > 0;
  };

  const fetchJurnals = async () => {
    const { data } = await supabase
      .from('jurnal_pembelajaran' as any)
      .select('*')
      .eq('kelas_id', selectedKelas)
      .order('tanggal', { ascending: false });
    if (data) setJurnals(data as any);
  };

  const handleCreateKelas = async () => {
    if (!newKelasName.trim() || !guruData) return;
    const { error } = await supabase.from('kelas').insert({ nama_kelas: newKelasName.trim(), guru_id: guruData.id } as any);
    if (!error) {
      setNewKelasName('');
      setShowAddKelas(false);
      await fetchKelas();
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (loading || !profile || !guruData) return null;

  const currentKelas = kelasList.find(k => k.id === selectedKelas);
  const filteredStudents = students;
  const kelasStudentIds = filteredStudents.map(s => s.id);
  const kelasRecords = records.filter(r => kelasStudentIds.includes(r.siswa_id));

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6" />
            <div>
              <h1 className="font-bold text-lg">Dashboard Guru</h1>
              <p className="text-xs opacity-80">Assalamu'alaikum, {guruData.nama}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-primary-foreground hover:bg-primary-foreground/20">
            <LogOut className="w-4 h-4 mr-1" /> Keluar
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-4">
        {/* Kelas selector */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Select value={selectedKelas} onValueChange={setSelectedKelas}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kelas..." />
                  </SelectTrigger>
                  <SelectContent>
                    {kelasList.map(k => (
                      <SelectItem key={k.id} value={k.id}>{k.nama_kelas}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" variant="outline" onClick={() => setShowAddKelas(true)}>
                <FolderPlus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {showAddKelas && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 flex gap-2">
              <Input placeholder="Nama kelas baru (contoh: 5A)" value={newKelasName} onChange={e => setNewKelasName(e.target.value)} />
              <Button size="sm" className="gradient-hero text-primary-foreground" onClick={handleCreateKelas}>Buat</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAddKelas(false)}>Batal</Button>
            </CardContent>
          </Card>
        )}

        {currentKelas && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <Users className="w-6 h-6 mx-auto text-primary mb-1" />
                  <p className="text-2xl font-bold">{filteredStudents.length}</p>
                  <p className="text-xs text-muted-foreground">Murid</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <ClipboardList className="w-6 h-6 mx-auto text-primary mb-1" />
                  <p className="text-2xl font-bold">{kelasRecords.length}</p>
                  <p className="text-xs text-muted-foreground">Catatan</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <Calendar className="w-6 h-6 mx-auto text-success mb-1" />
                  <p className="text-2xl font-bold">{new Set(kelasRecords.map(r => r.tanggal)).size}</p>
                  <p className="text-xs text-muted-foreground">Pertemuan</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <Button size="sm" variant={tab === 'students' ? 'default' : 'outline'} onClick={() => setTab('students')}
                className={tab === 'students' ? 'gradient-hero text-primary-foreground' : ''}>
                <Users className="w-4 h-4 mr-1" /> Murid
              </Button>
              <Button size="sm" variant={tab === 'recap' ? 'default' : 'outline'} onClick={() => setTab('recap')}
                className={tab === 'recap' ? 'gradient-hero text-primary-foreground' : ''}>
                <ClipboardList className="w-4 h-4 mr-1" /> Rekap
              </Button>
              <Button size="sm" variant={tab === 'jurnal' ? 'default' : 'outline'} onClick={() => setTab('jurnal')}
                className={tab === 'jurnal' ? 'gradient-hero text-primary-foreground' : ''}>
                <BookOpen className="w-4 h-4 mr-1" /> Jurnal
              </Button>
            </div>

            {tab === 'students' && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Murid — {currentKelas.nama_kelas}
                  </CardTitle>
                  <Button size="sm" onClick={() => setShowAddStudent(true)} className="gradient-hero text-primary-foreground">
                    <UserPlus className="w-4 h-4 mr-1" /> Tambah
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {filteredStudents.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Belum ada murid di kelas ini.</p>
                  ) : (
                    filteredStudents.map(student => {
                      const studentRecords = records.filter(r => r.siswa_id === student.id);
                      const lastHafalan = studentRecords.find(r => r.hafalan_surah);
                      const lastTilawah = studentRecords.find(r => r.tilawah_surah);
                      const lastJilid = studentRecords.find(r => r.jilid_buku);
                      const latest = studentRecords[0];
                      const hasSetoranToday = getTodaySetoranStatus(student.id);
                      return (
                        <div key={student.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm">{student.nama}</p>
                              {hasSetoranToday ? (
                                <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs">
                                  <Check className="w-3 h-3 mr-1" /> Sudah
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-xs">
                                  <Clock className="w-3 h-3 mr-1" /> Belum
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground space-y-1">
                              {lastHafalan && <p>🕌 {lastHafalan.hafalan_surah} {lastHafalan.hafalan_penilaian && `(${lastHafalan.hafalan_penilaian})`}</p>}
                              {lastTilawah && <p>📖 {lastTilawah.tilawah_surah} {lastTilawah.tilawah_penilaian && `(${lastTilawah.tilawah_penilaian})`}</p>}
                              {lastJilid && <p>📕 {lastJilid.jilid_buku} Hal. {lastJilid.jilid_halaman} {lastJilid.jilid_penilaian && `(${lastJilid.jilid_penilaian})`}</p>}
                              {!lastHafalan && !lastTilawah && !lastJilid && <p>Belum ada catatan</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="border-primary text-primary"
                              onClick={() => { setSelectedStudent(student); setShowForm(true); }}>
                              <Plus className="w-3 h-3 mr-1" /> Input
                            </Button>
                            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive"
                              onClick={async () => {
                                if (confirm(`Hapus murid ${student.nama}?`)) {
                                  const { error } = await supabase.from('siswa').delete().eq('id', student.id);
                                  if (!error) {
                                    toast({ title: 'Berhasil', description: `Murid ${student.nama} telah dihapus.` });
                                    fetchStudentsAndRecords();
                                  } else {
                                    toast({ title: 'Gagal', description: error.message, variant: 'destructive' });
                                  }
                                }
                              }}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            )}

            {tab === 'recap' && (
              <MonthlyRecap
                students={filteredStudents}
                records={kelasRecords}
                kelasNama={currentKelas.nama_kelas}
              />
            )}

            {tab === 'jurnal' && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Jurnal Pembelajaran — {currentKelas.nama_kelas}</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setShowJurnalKelasForm(true)}>
                      <Calendar className="w-4 h-4 mr-1" /> Jurnal Kelas
                    </Button>
                    <Button size="sm" className="gradient-hero text-primary-foreground" onClick={() => setShowJurnalForm(true)}>
                      <Plus className="w-4 h-4 mr-1" /> Tambah
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {jurnals.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Belum ada jurnal pembelajaran.</p>
                  ) : (
                    jurnals.map(j => (
                      <div key={j.id} className="p-3 rounded-lg bg-muted/50 space-y-2">
                        <p className="font-medium text-sm">{j.tanggal}</p>
                        <div className="text-xs space-y-1">
                          {j.hafalan && <p>🕌 Hafalan: {j.hafalan}</p>}
                          {j.tilawah && <p>📖 Tilawah: {j.tilawah}</p>}
                          {j.tulisan && <p>✍️ Tulisan: {j.tulisan}</p>}
                          {j.keterangan && <p>📝 Keterangan: {j.keterangan}</p>}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}

        {!currentKelas && kelasList.length === 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center">
              <FolderPlus className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Buat kelas terlebih dahulu untuk mulai menambahkan murid.</p>
              <Button className="mt-4 gradient-hero text-primary-foreground" onClick={() => setShowAddKelas(true)}>
                <FolderPlus className="w-4 h-4 mr-2" /> Buat Kelas
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {showForm && selectedStudent && guruData && (
        <DailyInputForm
          student={{ id: selectedStudent.id, name: selectedStudent.nama, kelas: selectedStudent.kelas, noHpOrtu: selectedStudent.no_hp_ortu }}
          guruId={guruData.id}
          onClose={() => { setShowForm(false); setSelectedStudent(null); fetchStudentsAndRecords(); }}
        />
      )}

      {showAddStudent && currentKelas && (
        <AddStudentForm
          kelasId={currentKelas.id}
          kelasNama={currentKelas.nama_kelas}
          onClose={() => setShowAddStudent(false)}
          onSuccess={fetchStudentsAndRecords}
        />
      )}

      {showJurnalForm && currentKelas && guruData && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md border-0 shadow-2xl animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg">Tambah Jurnal Pembelajaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs">Tanggal</Label>
                <Input type="date" value={jurnalTanggal} onChange={e => setJurnalTanggal(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Hafalan</Label>
                <Input placeholder="Catatan hafalan..." value={jurnalHafalan} onChange={e => setJurnalHafalan(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Tilawah</Label>
                <Input placeholder="Catatan tilawah..." value={jurnalTilawah} onChange={e => setJurnalTilawah(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Tulisan</Label>
                <Input placeholder="Catatan tulisan..." value={jurnalTulisan} onChange={e => setJurnalTulisan(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Keterangan</Label>
                <Input placeholder="Keterangan tambahan..." value={jurnalKeterangan} onChange={e => setJurnalKeterangan(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 gradient-hero text-primary-foreground" onClick={async () => {
                  const { error } = await supabase
                    .from('jurnal_pembelajaran' as any)
                    .insert({
                      kelas_id: currentKelas.id,
                      tanggal: jurnalTanggal,
                      hafalan: jurnalHafalan || null,
                      tilawah: jurnalTilawah || null,
                      tulisan: jurnalTulisan || null,
                      keterangan: jurnalKeterangan || null,
                      guru_id: guruData.id,
                    } as any);
                  if (!error) {
                    toast({ title: 'Berhasil', description: 'Jurnal pembelajaran telah ditambahkan.' });
                    setJurnalTanggal(new Date().toISOString().split('T')[0]);
                    setJurnalHafalan('');
                    setJurnalTilawah('');
                    setJurnalTulisan('');
                    setJurnalKeterangan('');
                    setShowJurnalForm(false);
                    fetchJurnals();
                  } else {
                    toast({ title: 'Gagal', description: error.message, variant: 'destructive' });
                  }
                }}>
                  Simpan
                </Button>
                <Button variant="outline" onClick={() => setShowJurnalForm(false)}>Batal</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {showJurnalKelasForm && currentKelas && guruData && (
        <JurnalKelasForm
          kelasId={currentKelas.id}
          kelasNama={currentKelas.nama_kelas}
          guruId={guruData.id}
          onClose={() => setShowJurnalKelasForm(false)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
};

export default GuruDashboard;
