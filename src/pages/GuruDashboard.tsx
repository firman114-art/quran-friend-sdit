import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, LogOut, Users, ClipboardList, Plus, UserPlus } from 'lucide-react';
import DailyInputForm from '@/components/DailyInputForm';
import AddStudentForm from '@/components/AddStudentForm';

interface SiswaRow {
  id: string;
  user_id: string;
  nama: string;
  kelas: string;
  no_hp_ortu: string | null;
}

interface RecordRow {
  id: string;
  siswa_id: string;
  tanggal: string;
  tilpi_kategori: string;
  tilpi_halaman: number;
  tahfidz_juz: number | null;
  tahfidz_surah: string;
  tahfidz_ayat: string;
  status: string;
  catatan: string | null;
}

const GuruDashboard = () => {
  const navigate = useNavigate();
  const { profile, guruData, signOut, loading } = useAuth();
  const [students, setStudents] = useState<SiswaRow[]>([]);
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<SiswaRow | null>(null);
  const [showAddStudent, setShowAddStudent] = useState(false);

  useEffect(() => {
    if (!loading && (!profile || profile.role !== 'guru')) {
      navigate('/');
    }
  }, [loading, profile, navigate]);

  useEffect(() => {
    if (profile?.role === 'guru') {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    const [studentsRes, recordsRes] = await Promise.all([
      supabase.from('siswa').select('*').order('nama'),
      supabase.from('daily_records').select('*').order('tanggal', { ascending: false }),
    ]);
    if (studentsRes.data) setStudents(studentsRes.data);
    if (recordsRes.data) setRecords(recordsRes.data);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (loading || !profile || !guruData) return null;

  const getStudentLatestRecord = (studentId: string) => {
    return records.find(r => r.siswa_id === studentId) || null;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Lancar': return 'bg-success text-success-foreground';
      case 'Perlu Mengulang': return 'bg-warning text-warning-foreground';
      case 'Murajaah': return 'bg-info text-info-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const totalRecords = records.length;
  const lancarCount = records.filter(r => r.status === 'Lancar').length;

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

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto text-primary mb-1" />
              <p className="text-2xl font-bold text-foreground">{students.length}</p>
              <p className="text-xs text-muted-foreground">Siswa</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <ClipboardList className="w-6 h-6 mx-auto text-primary mb-1" />
              <p className="text-2xl font-bold text-foreground">{totalRecords}</p>
              <p className="text-xs text-muted-foreground">Catatan</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <BookOpen className="w-6 h-6 mx-auto text-success mb-1" />
              <p className="text-2xl font-bold text-foreground">{lancarCount}</p>
              <p className="text-xs text-muted-foreground">Lancar</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Daftar Siswa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {students.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Belum ada siswa terdaftar.</p>
            ) : (
              students.map(student => {
                const latest = getStudentLatestRecord(student.id);
                return (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground">{student.nama}</p>
                      <p className="text-xs text-muted-foreground">
                        Kelas {student.kelas}
                        {latest && ` • ${latest.tilpi_kategori} Hal. ${latest.tilpi_halaman}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {latest && (
                        <Badge className={`text-xs ${getStatusColor(latest.status)}`}>
                          {latest.status}
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-primary text-primary hover:bg-secondary"
                        onClick={() => { setSelectedStudent(student); setShowForm(true); }}
                      >
                        <Plus className="w-3 h-3 mr-1" /> Input
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </main>

      {showForm && selectedStudent && guruData && (
        <DailyInputForm
          student={{ id: selectedStudent.id, name: selectedStudent.nama, kelas: selectedStudent.kelas, noHpOrtu: selectedStudent.no_hp_ortu }}
          guruId={guruData.id}
          onClose={() => { setShowForm(false); setSelectedStudent(null); fetchData(); }}
        />
      )}
    </div>
  );
};

export default GuruDashboard;
