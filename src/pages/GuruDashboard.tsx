import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getStudents, getRecords, getCurrentUser, setCurrentUser, type User } from '@/lib/data';
import { BookOpen, LogOut, Users, ClipboardList, Plus } from 'lucide-react';
import DailyInputForm from '@/components/DailyInputForm';

const GuruDashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const students = getStudents();
  const records = getRecords();
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);

  if (!user || user.role !== 'guru') {
    navigate('/');
    return null;
  }

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };

  const getStudentLatestRecord = (studentId: string) => {
    const studentRecords = records.filter(r => r.siswaId === studentId);
    return studentRecords.length > 0 ? studentRecords[studentRecords.length - 1] : null;
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
      {/* Header */}
      <header className="gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6" />
            <div>
              <h1 className="font-bold text-lg">Dashboard Guru</h1>
              <p className="text-xs opacity-80">Assalamu'alaikum, {user.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-primary-foreground hover:bg-primary-foreground/20">
            <LogOut className="w-4 h-4 mr-1" /> Keluar
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
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

        {/* Student List */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Daftar Siswa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {students.map(student => {
              const latest = getStudentLatestRecord(student.id);
              return (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground">{student.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Kelas {student.kelas}
                      {latest && ` • ${latest.tilpiKategori} Hal. ${latest.tilpiHalaman}`}
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
            })}
          </CardContent>
        </Card>
      </main>

      {/* Daily Input Modal */}
      {showForm && selectedStudent && (
        <DailyInputForm
          student={selectedStudent}
          onClose={() => { setShowForm(false); setSelectedStudent(null); }}
        />
      )}
    </div>
  );
};

export default GuruDashboard;
