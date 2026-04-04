import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { setCurrentUser, getStudents, type UserRole } from '@/lib/data';
import { BookOpen, GraduationCap, Users } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole | ''>('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const students = getStudents();

  const handleLogin = () => {
    if (role === 'guru') {
      setCurrentUser({ id: 'guru1', name: 'Ustadz Abdullah', role: 'guru' });
      navigate('/guru');
    } else if (role === 'siswa' && selectedStudent) {
      const student = students.find(s => s.id === selectedStudent);
      if (student) {
        setCurrentUser(student);
        navigate('/siswa');
      }
    }
  };

  return (
    <div className="min-h-screen islamic-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-hero mb-4 shadow-lg">
            <BookOpen className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Manajemen Al-Qur'an</h1>
          <p className="text-muted-foreground mt-1">SDIT Al-Insan Pinrang</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardContent className="p-6 space-y-5">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Silakan masuk untuk melanjutkan</p>
            </div>

            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setRole('guru'); setSelectedStudent(''); }}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  role === 'guru'
                    ? 'border-primary bg-secondary text-secondary-foreground'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <GraduationCap className="w-8 h-8" />
                <span className="font-medium text-sm">Guru</span>
              </button>
              <button
                onClick={() => setRole('siswa')}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  role === 'siswa'
                    ? 'border-primary bg-secondary text-secondary-foreground'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Users className="w-8 h-8" />
                <span className="font-medium text-sm">Siswa</span>
              </button>
            </div>

            {/* Student selector */}
            {role === 'siswa' && (
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih nama siswa..." />
                </SelectTrigger>
                <SelectContent>
                  {students.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.kelas})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Button
              className="w-full gradient-hero text-primary-foreground"
              size="lg"
              disabled={!role || (role === 'siswa' && !selectedStudent)}
              onClick={handleLogin}
            >
              Masuk
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
