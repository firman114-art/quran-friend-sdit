import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Search, LogOut, UserCircle, FileText, BookOpen, Users, Home, Calendar, ChevronDown, ChevronUp, Trash2, FileSpreadsheet, School, FolderPlus, ClipboardList, UserPlus, Check, Clock } from 'lucide-react';
import DailyInputForm from '@/components/DailyInputForm';
import AddStudentForm from '@/components/AddStudentForm';
import MonthlyRecap from '@/components/MonthlyRecap';
import JurnalRecap from '@/components/JurnalRecap';
import JurnalRumahRecap from '@/components/JurnalRumahRecap';
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
  tilawah_kesalahan_tajwid: number | null;
  tilawah_kesalahan_kelancaran: number | null;
  tilawah_kesalahan_fasohah: number | null;
  jilid_buku: string | null;
  jilid_halaman: number | null;
  jilid_penilaian: string | null;
  jilid_predikat: string | null;
  jilid_kesalahan_tajwid: number | null;
  jilid_kesalahan_kelancaran: number | null;
  jilid_kesalahan_fasohah: number | null;
  catatan_guru: string | null;
}

interface JurnalRow {
  id: string;
  guru_id: string;
  kelas_id: string;
  tanggal: string;
  hafalan: string | null;
  tilawah: string | null;
  tulisan: string | null;
  materi_pendamping: string | null;
  jumlah_hadir: number | null;
  jumlah_sakit: number | null;
  jumlah_izin: number | null;
  jumlah_alpa: number | null;
  tugas_rumah: string | null;
  catatan_kelas: string | null;
  created_at: string;
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
  const [jurnalRumah, setJurnalRumah] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<SiswaRow | null>(null);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddKelas, setShowAddKelas] = useState(false);
  const [newKelasName, setNewKelasName] = useState('');
  const [showRecap, setShowRecap] = useState(false);
  const [showJurnalKelasForm, setShowJurnalKelasForm] = useState(false);
  const [tab, setTab] = useState<'students' | 'log' | 'recap' | 'jurnal'>('students');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandJurnalSekolah, setExpandJurnalSekolah] = useState(false);
  const [expandJurnalRumah, setExpandJurnalRumah] = useState(false);

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
    console.log('Fetching for kelas:', selectedKelas);
    
    // Fetch students first
    const studentsRes = await supabase.from('siswa').select('*').eq('kelas_id', selectedKelas).order('nama');
    console.log('Students:', studentsRes.data?.length, studentsRes.error);
    
    if (studentsRes.data) {
      setStudents(studentsRes.data as any);
      const studentIds = studentsRes.data.map(s => s.id);
      
      // Fetch records only for these students
      const recordsRes = await supabase
        .from('daily_records')
        .select('*')
        .in('siswa_id', studentIds)
        .order('tanggal', { ascending: false });
      console.log('Records for class:', recordsRes.data?.length, recordsRes.error);
      
      if (recordsRes.data) setRecords(recordsRes.data as any);
      else if (recordsRes.error) {
        console.error('Records error:', recordsRes.error);
        toast({ title: 'Error fetch records', description: recordsRes.error.message, variant: 'destructive' });
      }
      
      // Fetch jurnal rumah for these students (optional)
      try {
        console.log('Fetching jurnal_rumah for studentIds:', studentIds);
        console.log('First 3 studentIds:', studentIds.slice(0, 3));
        
        // Try fetching ALL jurnal_rumah first (for debugging)
        const allJurnalRes = await (supabase as any).from('jurnal_rumah').select('*').limit(5);
        console.log('Sample jurnal_rumah from DB:', allJurnalRes.data?.length, allJurnalRes.data?.[0]);
        console.log('Sample siswa_id from DB:', allJurnalRes.data?.[0]?.siswa_id);
        
        // Fetch with filter
        const jurnalRumahRes = await (supabase as any)
          .from('jurnal_rumah')
          .select('*')
          .in('siswa_id', studentIds)
          .order('tanggal', { ascending: false });
        console.log('Jurnal Rumah response count:', jurnalRumahRes.data?.length);
        console.log('Jurnal Rumah error:', jurnalRumahRes.error);
        
        // Try alternative query - fetch one by one
        if (!jurnalRumahRes.data || jurnalRumahRes.data.length === 0) {
          console.log('Trying alternative fetch for first student...');
          const firstStudentId = studentIds[0];
          if (firstStudentId) {
            const singleRes = await supabase
              .from('jurnal_rumah' as any)
              .select('*')
              .eq('siswa_id', firstStudentId)
              .limit(5);
            console.log('Single student query result:', singleRes.data?.length, singleRes.error);
          }
        }
        
        if (jurnalRumahRes.data) {
          console.log('Setting jurnalRumah state with', jurnalRumahRes.data.length, 'items');
          setJurnalRumah(jurnalRumahRes.data as any);
        } else if (jurnalRumahRes.error) {
          console.error('Jurnal Rumah error:', jurnalRumahRes.error);
        }
      } catch (e) {
        console.error('Jurnal Rumah fetch error:', e);
      }
    }
    
    if (studentsRes.error) {
      console.error('Students error:', studentsRes.error);
      toast({ title: 'Error fetch students', description: studentsRes.error.message, variant: 'destructive' });
    }
  };

  const getTodaySetoranStatus = (studentId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = records.filter(r => r.siswa_id === studentId && r.tanggal === today);
    return todayRecords.length > 0;
  };

  const fetchJurnals = async () => {
    const { data, error } = await supabase
      .from('jurnal_kelas' as any)
      .select('*')
      .eq('kelas_id' as any, selectedKelas)
      .order('tanggal', { ascending: false });
    if (error) {
      console.error('Error fetching jurnal_kelas:', error);
    }
    setJurnals((data as unknown as JurnalRow[]) || []);
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
  const filteredStudents = students.filter(s => 
    s.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );
  // Use all students in class for ID list (not filtered by search)
  const kelasStudentIds = students.map(s => s.id);
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
            <div className="flex gap-2 mb-4 flex-wrap">
              <Button 
                size="sm" 
                variant={tab === 'students' ? 'default' : 'outline'} 
                onClick={() => setTab('students')}
                className={tab === 'students' 
                  ? 'gradient-hero text-primary-foreground shadow-md border-b-2 border-primary-foreground/30' 
                  : 'hover:bg-gray-100 transition-all'
                }>
                <Users className="w-4 h-4 mr-1" /> Murid
              </Button>
              <Button 
                size="sm" 
                variant={tab === 'recap' ? 'default' : 'outline'} 
                onClick={() => setTab('recap')}
                className={tab === 'recap' 
                  ? 'gradient-hero text-primary-foreground shadow-md border-b-2 border-primary-foreground/30' 
                  : 'hover:bg-gray-100 transition-all'
                }>
                <ClipboardList className="w-4 h-4 mr-1" /> Rekap
              </Button>
              <Button 
                size="sm" 
                variant={tab === 'log' ? 'default' : 'outline'} 
                onClick={() => setTab('log')}
                className={tab === 'log' 
                  ? 'gradient-hero text-primary-foreground shadow-md border-b-2 border-primary-foreground/30' 
                  : 'hover:bg-gray-100 transition-all'
                }>
                <ClipboardList className="w-4 h-4 mr-1" /> Log Murid
              </Button>
              <Button 
                size="sm" 
                variant={tab === 'jurnal' ? 'default' : 'outline'} 
                onClick={() => setTab('jurnal')}
                className={tab === 'jurnal' 
                  ? 'gradient-hero text-primary-foreground shadow-md border-b-2 border-primary-foreground/30' 
                  : 'hover:bg-gray-100 transition-all'
                }>
                <BookOpen className="w-4 h-4 mr-1" /> Jurnal
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => navigate('/absensi')}
                className="hover:bg-gray-100 transition-all"
              >
                <Check className="w-4 h-4 mr-1" /> Absensi
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
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Cari murid berdasarkan nama..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  {filteredStudents.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {searchQuery ? 'Tidak ada murid yang cocok dengan pencarian.' : 'Belum ada murid di kelas ini.'}
                    </p>
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

            {tab === 'log' && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-primary" />
                    Log Harian Murid — {currentKelas.nama_kelas}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {kelasRecords.length === 0 && jurnalRumah.filter(j => kelasStudentIds.includes(j.siswa_id)).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Belum ada log harian untuk kelas ini.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {/* Jurnal Sekolah - Collapsible dengan Preview */}
                      {kelasRecords.length > 0 && (
                        <Card className="border rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                          <CardHeader 
                            className="pb-2 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => setExpandJurnalSekolah(!expandJurnalSekolah)}
                          >
                            <CardTitle className="text-base flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <School className="w-4 h-4 text-primary" />
                                Jurnal Sekolah (Guru)
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                  {kelasRecords.length} data
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {expandJurnalSekolah ? 'Sembunyikan' : 'Lihat Detail'}
                                </span>
                                {expandJurnalSekolah ? (
                                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                )}
                              </div>
                            </CardTitle>
                          </CardHeader>
                          
                          {/* Preview 1 baris terakhir saat tertutup */}
                          {!expandJurnalSekolah && kelasRecords.length > 0 && (() => {
                            const latestRecord = kelasRecords[0];
                            const student = students.find(s => s.id === latestRecord.siswa_id);
                            return (
                              <CardContent className="pt-0 pb-3">
                                <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100">
                                  <p className="text-xs text-blue-600 font-medium mb-1">📝 Entri Terbaru:</p>
                                  <p className="text-sm text-gray-800">
                                    <span className="font-medium">{student?.nama || 'Unknown'}</span>
                                    <span className="text-gray-500"> • {new Date(latestRecord.tanggal).toLocaleDateString('id-ID')}</span>
                                    {latestRecord.hafalan_surah && (
                                      <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                        {latestRecord.hafalan_surah}
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </CardContent>
                            );
                          })()}
                          <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expandJurnalSekolah ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <CardContent className="pt-0">
                              <div className="overflow-x-auto rounded-lg border">
                                <Table className="border-0">
                                  <TableHeader className="sticky top-0 z-10">
                                    <TableRow className="bg-gray-100">
                                      <TableHead className="border-b border-gray-200 py-3 px-4 text-xs font-semibold text-gray-700">Tanggal</TableHead>
                                      <TableHead className="border-b border-gray-200 py-3 px-4 text-xs font-semibold text-gray-700">Nama Murid</TableHead>
                                      <TableHead className="border-b border-gray-200 py-3 px-4 text-xs font-semibold text-gray-700">Hafalan</TableHead>
                                      <TableHead className="border-b border-gray-200 py-3 px-4 text-xs font-semibold text-gray-700">Tilawah</TableHead>
                                      <TableHead className="border-b border-gray-200 py-3 px-4 text-xs font-semibold text-gray-700">Jilid</TableHead>
                                      <TableHead className="border-b border-gray-200 py-3 px-4 text-xs font-semibold text-gray-700">Catatan Guru</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {kelasRecords.map((record, index) => {
                                      const student = students.find(s => s.id === record.siswa_id);
                                      const getPredikatBadge = (predikat: string | null) => {
                                        if (!predikat) return null;
                                        const lowerPredikat = predikat.toLowerCase();
                                        if (lowerPredikat.includes('mumtaz') || lowerPredikat === 'a') {
                                          return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700 ml-1">{predikat}</span>;
                                        } else if (lowerPredikat.includes('maqbul') || lowerPredikat === 'b') {
                                          return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700 ml-1">{predikat}</span>;
                                        } else if (lowerPredikat.includes('jayyid') || lowerPredikat === 'c') {
                                          return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700 ml-1">{predikat}</span>;
                                        }
                                        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-700 ml-1">{predikat}</span>;
                                      };
                                      return (
                                        <TableRow key={record.id} className={`text-sm ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/50 transition-colors`}>
                                          <TableCell className="py-3 px-4 whitespace-nowrap text-xs">
                                            {new Date(record.tanggal).toLocaleDateString('id-ID')}
                                          </TableCell>
                                          <TableCell className="py-3 px-4 font-medium">
                                            {student?.nama || 'Unknown'}
                                          </TableCell>
                                          <TableCell className="py-3 px-4">
                                            {record.hafalan_surah ? (
                                              <div className="leading-relaxed">
                                                <span className="font-medium">{record.hafalan_surah}</span>
                                                {getPredikatBadge(record.hafalan_predikat)}
                                              </div>
                                            ) : <span className="text-gray-400">-</span>}
                                          </TableCell>
                                          <TableCell className="py-3 px-4">
                                            {(record.tilawah_surah || record.tilawah_ayat) ? (
                                              <div className="leading-relaxed">
                                                <div>
                                                  <span className="font-medium">{record.tilawah_surah || '-'}</span>
                                                  {record.tilawah_ayat && <span className="text-gray-600"> ayat {record.tilawah_ayat}</span>}
                                                  {getPredikatBadge(record.tilawah_predikat)}
                                                </div>
                                                {(record.tilawah_kesalahan_tajwid || record.tilawah_kesalahan_kelancaran || record.tilawah_kesalahan_fasohah) && (
                                                  <div className="text-xs text-gray-500 mt-1 space-x-2">
                                                    <span>Tajwid: {record.tilawah_kesalahan_tajwid || 0}</span>
                                                    <span>Kelancaran: {record.tilawah_kesalahan_kelancaran || 0}</span>
                                                    <span>Fasohah: {record.tilawah_kesalahan_fasohah || 0}</span>
                                                  </div>
                                                )}
                                              </div>
                                            ) : <span className="text-gray-400">-</span>}
                                          </TableCell>
                                          <TableCell className="py-3 px-4">
                                            {record.jilid_buku ? (
                                              <div className="leading-relaxed">
                                                <div>
                                                  <span className="font-medium">{record.jilid_buku}</span>
                                                  <span className="text-gray-600"> Hal.{record.jilid_halaman}</span>
                                                  {getPredikatBadge(record.jilid_predikat)}
                                                </div>
                                                {(record.jilid_kesalahan_tajwid || record.jilid_kesalahan_kelancaran || record.jilid_kesalahan_fasohah) && (
                                                  <div className="text-xs text-gray-500 mt-1 space-x-2">
                                                    <span>Tajwid: {record.jilid_kesalahan_tajwid || 0}</span>
                                                    <span>Kelancaran: {record.jilid_kesalahan_kelancaran || 0}</span>
                                                    <span>Fasohah: {record.jilid_kesalahan_fasohah || 0}</span>
                                                  </div>
                                                )}
                                              </div>
                                            ) : <span className="text-gray-400">-</span>}
                                          </TableCell>
                                          <TableCell className="py-3 px-4 max-w-[200px]">
                                            {record.catatan_guru ? (
                                              <p className="text-sm leading-relaxed text-gray-700">{record.catatan_guru}</p>
                                            ) : <span className="text-gray-400">-</span>}
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                </Table>
                              </div>
                              
                              {/* Tombol Tutup di bagian bawah tabel */}
                              <div className="mt-4 flex justify-center">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => setExpandJurnalSekolah(false)}
                                  className="text-muted-foreground hover:bg-gray-100"
                                >
                                  <ChevronUp className="w-4 h-4 mr-1" /> Tutup Tabel
                                </Button>
                              </div>
                            </CardContent>
                          </div>
                        </Card>
                      )}

                      {/* Jurnal Rumah - Collapsible dengan Preview */}
                      {(() => {
                        console.log('DEBUG Jurnal Rumah - jurnalRumah length:', jurnalRumah.length);
                        console.log('DEBUG Jurnal Rumah - kelasStudentIds length:', kelasStudentIds.length);
                        console.log('DEBUG Jurnal Rumah - first few jurnal siswa_ids:', jurnalRumah.slice(0, 3).map(j => j.siswa_id));
                        const filteredJurnalRumah = jurnalRumah.filter(j => {
                          const isIncluded = kelasStudentIds.includes(j.siswa_id);
                          console.log('DEBUG - checking siswa_id:', j.siswa_id, 'included:', isIncluded);
                          return isIncluded;
                        });
                        console.log('DEBUG Jurnal Rumah - filtered count:', filteredJurnalRumah.length);
                        return (
                          <Card className="border rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                            <CardHeader 
                              className="pb-2 cursor-pointer hover:bg-gray-50 transition-colors"
                              onClick={() => setExpandJurnalRumah(!expandJurnalRumah)}
                            >
                              <CardTitle className="text-base flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Home className="w-4 h-4 text-success" />
                                  Jurnal Rumah (Orang Tua)
                                  <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">
                                    {filteredJurnalRumah.length} data
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">
                                    {expandJurnalRumah ? 'Sembunyikan' : 'Lihat Detail'}
                                  </span>
                                  {expandJurnalRumah ? (
                                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                  )}
                                </div>
                              </CardTitle>
                            </CardHeader>
                            
                            {/* Preview 1 baris terakhir saat tertutup */}
                            {!expandJurnalRumah && filteredJurnalRumah.length > 0 && (() => {
                              const latestJurnal = filteredJurnalRumah[0];
                              const student = students.find(s => s.id === latestJurnal.siswa_id);
                              return (
                                <CardContent className="pt-0 pb-3">
                                  <div className="bg-green-50/50 rounded-lg p-3 border border-green-100">
                                    <p className="text-xs text-green-600 font-medium mb-1">🏠 Entri Terbaru:</p>
                                    <p className="text-sm text-gray-800">
                                      <span className="font-medium">{student?.nama || 'Unknown'}</span>
                                      <span className="text-gray-500"> • {new Date(latestJurnal.tanggal).toLocaleDateString('id-ID')}</span>
                                      {latestJurnal.hafalan_surah && (
                                        <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                          {latestJurnal.hafalan_surah}
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                </CardContent>
                              );
                            })()}
                            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expandJurnalRumah ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                              <CardContent className="pt-0">
                                {filteredJurnalRumah.length === 0 ? (
                                  <p className="text-sm text-muted-foreground text-center py-4">
                                    Belum ada jurnal rumah dari siswa kelas ini.
                                  </p>
                                ) : (
                                  <div className="overflow-x-auto rounded-lg border">
                                    <Table className="border-0">
                                      <TableHeader className="sticky top-0 z-10">
                                        <TableRow className="bg-gray-100">
                                          <TableHead className="border-b border-gray-200 py-3 px-4 text-xs font-semibold text-gray-700">Tanggal</TableHead>
                                          <TableHead className="border-b border-gray-200 py-3 px-4 text-xs font-semibold text-gray-700">Nama Murid</TableHead>
                                          <TableHead className="border-b border-gray-200 py-3 px-4 text-xs font-semibold text-gray-700">Hafalan</TableHead>
                                          <TableHead className="border-b border-gray-200 py-3 px-4 text-xs font-semibold text-gray-700">Tilawah</TableHead>
                                          <TableHead className="border-b border-gray-200 py-3 px-4 text-xs font-semibold text-gray-700">Jilid</TableHead>
                                          <TableHead className="border-b border-gray-200 py-3 px-4 text-xs font-semibold text-gray-700">Catatan</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {filteredJurnalRumah.map((jurnal, index) => {
                                          const student = students.find(s => s.id === jurnal.siswa_id);
                                          return (
                                            <TableRow key={jurnal.id} className={`text-sm ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-green-50/50 transition-colors`}>
                                              <TableCell className="py-3 px-4 whitespace-nowrap text-xs">
                                                {new Date(jurnal.tanggal).toLocaleDateString('id-ID')}
                                              </TableCell>
                                              <TableCell className="py-3 px-4 font-medium">
                                                {student?.nama || 'Unknown'}
                                              </TableCell>
                                              <TableCell className="py-3 px-4">
                                                {jurnal.hafalan_surah ? (
                                                  <div className="leading-relaxed">
                                                    <span className="font-medium">{jurnal.hafalan_surah}</span>
                                                    {jurnal.hafalan_ayat && <span className="text-gray-600"> {jurnal.hafalan_ayat}</span>}
                                                  </div>
                                                ) : <span className="text-gray-400">-</span>}
                                              </TableCell>
                                              <TableCell className="py-3 px-4">
                                                {jurnal.tilawah_surah ? (
                                                  <div className="leading-relaxed">
                                                    <span className="font-medium">{jurnal.tilawah_surah}</span>
                                                    {jurnal.tilawah_ayat && <span className="text-gray-600"> {jurnal.tilawah_ayat}</span>}
                                                  </div>
                                                ) : <span className="text-gray-400">-</span>}
                                              </TableCell>
                                              <TableCell className="py-3 px-4">
                                                {jurnal.jilid_buku ? (
                                                  <div className="leading-relaxed">
                                                    <div>
                                                      <span className="font-medium">{jurnal.jilid_buku}</span>
                                                      <span className="text-gray-600"> Hal.{jurnal.jilid_halaman}</span>
                                                    </div>
                                                    {(jurnal.jilid_kesalahan_tajwid || jurnal.jilid_kesalahan_kelancaran || jurnal.jilid_kesalahan_fasohah) && (
                                                      <div className="text-xs text-gray-500 mt-1 space-x-2">
                                                        <span>Tajwid: {jurnal.jilid_kesalahan_tajwid || 0}</span>
                                                        <span>Kelancaran: {jurnal.jilid_kesalahan_kelancaran || 0}</span>
                                                        <span>Fasohah: {jurnal.jilid_kesalahan_fasohah || 0}</span>
                                                      </div>
                                                    )}
                                                  </div>
                                                ) : <span className="text-gray-400">-</span>}
                                              </TableCell>
                                              <TableCell className="py-3 px-4 max-w-[200px]">
                                                {jurnal.catatan ? (
                                                  <p className="text-sm leading-relaxed text-gray-700">{jurnal.catatan}</p>
                                                ) : <span className="text-gray-400">-</span>}
                                              </TableCell>
                                            </TableRow>
                                          );
                                        })}
                                      </TableBody>
                                    </Table>
                                  </div>
                                )}
                                
                                {/* Tombol Tutup di bagian bawah tabel */}
                                {filteredJurnalRumah.length > 0 && (
                                  <div className="mt-4 flex justify-center">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => setExpandJurnalRumah(false)}
                                      className="text-muted-foreground hover:bg-gray-100"
                                    >
                                      <ChevronUp className="w-4 h-4 mr-1" /> Tutup Tabel
                                    </Button>
                                  </div>
                                )}
                              </CardContent>
                            </div>
                          </Card>
                        );
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {tab === 'jurnal' && (
              <>
                <div className="flex gap-2 mb-4">
                  <Button 
                    size="sm" 
                    className="gradient-hero text-primary-foreground flex-1" 
                    onClick={() => setShowJurnalKelasForm(true)}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Tambah Jurnal
                  </Button>
                </div>
                <JurnalRecap 
                  jurnals={jurnals} 
                  kelasNama={currentKelas.nama_kelas}
                  onDelete={async (id) => {
                    const { error } = await supabase
                      .from('jurnal_kelas' as any)
                      .delete()
                      .eq('id', id);
                    if (error) {
                      toast({ title: 'Gagal', description: error.message, variant: 'destructive' });
                    } else {
                      toast({ title: 'Berhasil', description: 'Jurnal telah dihapus.' });
                      fetchJurnals();
                    }
                  }}
                />

                {/* Rekap Jurnal Rumah - Dibuat oleh Orang Tua */}
                {jurnalRumah.filter(j => {
                  const student = students.find(s => s.id === j.siswa_id);
                  return student?.kelas_id === currentKelas?.id;
                }).length > 0 && (
                  <div className="mt-6">
                    <JurnalRumahRecap
                      jurnals={jurnalRumah.filter(j => {
                        const student = students.find(s => s.id === j.siswa_id);
                        return student?.kelas_id === currentKelas?.id;
                      })}
                      students={students}
                      kelasNama={currentKelas?.nama_kelas || ''}
                    />
                  </div>
                )}
              </>
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
          student={{ id: selectedStudent.id, name: selectedStudent.nama, kelas: selectedStudent.kelas, noHpOrtu: null }}
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

      {showJurnalKelasForm && currentKelas && guruData && (
        <JurnalKelasForm
          kelasId={currentKelas.id}
          kelasNama={currentKelas.nama_kelas}
          guruId={guruData.id}
          onClose={() => setShowJurnalKelasForm(false)}
          onSuccess={fetchJurnals}
        />
      )}
    </div>
  );
}

export default GuruDashboard;
