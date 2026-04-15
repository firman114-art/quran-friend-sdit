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
import { BookOpen, LogOut, Users, Plus, UserPlus, FolderPlus, ClipboardList, Calendar, Download } from 'lucide-react';
import DailyInputForm from '@/components/DailyInputForm';
import AddStudentForm from '@/components/AddStudentForm';
import MonthlyRecap from '@/components/MonthlyRecap';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

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

const GuruDashboard = () => {
  const navigate = useNavigate();
  const { profile, guruData, signOut, loading } = useAuth();
  const [kelasList, setKelasList] = useState<KelasRow[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<string>('');
  const [students, setStudents] = useState<SiswaRow[]>([]);
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<SiswaRow | null>(null);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddKelas, setShowAddKelas] = useState(false);
  const [newKelasName, setNewKelasName] = useState('');
  const [showRecap, setShowRecap] = useState(false);
  const [tab, setTab] = useState<'students' | 'recap'>('students');

  useEffect(() => {
    if (!loading && (!profile || profile.role !== 'guru')) {
      navigate('/');
    }
  }, [loading, profile, navigate]);

  useEffect(() => {
    if (guruData) fetchKelas();
  }, [guruData]);

  useEffect(() => {
    if (selectedKelas) fetchStudentsAndRecords();
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
            <div className="flex gap-2">
              <Button size="sm" variant={tab === 'students' ? 'default' : 'outline'} onClick={() => setTab('students')}
                className={tab === 'students' ? 'gradient-hero text-primary-foreground' : ''}>
                <Users className="w-4 h-4 mr-1" /> Daftar Murid
              </Button>
              <Button size="sm" variant={tab === 'recap' ? 'default' : 'outline'} onClick={() => setTab('recap')}
                className={tab === 'recap' ? 'gradient-hero text-primary-foreground' : ''}>
                <ClipboardList className="w-4 h-4 mr-1" /> Rekap Bulanan
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
                      const latest = records.find(r => r.siswa_id === student.id);
                      return (
                        <div key={student.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{student.nama}</p>
                            <p className="text-xs text-muted-foreground">
                              {latest ? `${latest.hafalan_surah || latest.tilawah_surah || latest.jilid_buku || '-'} • ${latest.tanggal}` : 'Belum ada catatan'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {latest?.hafalan_predikat && (
                              <Badge className="text-xs bg-primary/10 text-primary">{latest.hafalan_predikat}</Badge>
                            )}
                            <Button size="sm" variant="outline" className="border-primary text-primary"
                              onClick={() => { setSelectedStudent(student); setShowForm(true); }}>
                              <Plus className="w-3 h-3 mr-1" /> Input
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
    </div>
  );
};

export default GuruDashboard;
