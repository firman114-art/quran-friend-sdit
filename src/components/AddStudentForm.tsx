import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { X, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const AddStudentForm = ({ onClose, onSuccess }: Props) => {
  const { toast } = useToast();
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [kelas, setKelas] = useState('');
  const [noHpOrtu, setNoHpOrtu] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!nama || !email || !password || !kelas) {
      toast({ title: 'Lengkapi semua field wajib!', variant: 'destructive' });
      return;
    }
    if (password.length < 6) {
      toast({ title: 'Password minimal 6 karakter!', variant: 'destructive' });
      return;
    }

    setSubmitting(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    const res = await supabase.functions.invoke('create-student', {
      body: { email, password, nama, kelas, no_hp_ortu: noHpOrtu },
    });

    setSubmitting(false);

    if (res.error || res.data?.error) {
      toast({
        title: 'Gagal menambahkan siswa',
        description: res.data?.error || res.error?.message || 'Terjadi kesalahan',
        variant: 'destructive',
      });
      return;
    }

    toast({ title: 'Berhasil!', description: `Akun siswa ${nama} telah dibuat.` });
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md border-0 shadow-2xl animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Tambah Siswa Baru
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs">Nama Lengkap *</Label>
            <Input value={nama} onChange={e => setNama(e.target.value)} placeholder="Masukkan nama siswa" />
          </div>
          <div>
            <Label className="text-xs">Email *</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@contoh.com" />
          </div>
          <div>
            <Label className="text-xs">Password *</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimal 6 karakter" />
          </div>
          <div>
            <Label className="text-xs">Kelas *</Label>
            <Input value={kelas} onChange={e => setKelas(e.target.value)} placeholder="Contoh: 5A" />
          </div>
          <div>
            <Label className="text-xs">No. HP Orang Tua (opsional)</Label>
            <Input value={noHpOrtu} onChange={e => setNoHpOrtu(e.target.value)} placeholder="6281234567890" />
          </div>

          <Button
            className="w-full gradient-hero text-primary-foreground"
            onClick={handleSubmit}
            disabled={submitting}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {submitting ? 'Membuat akun...' : 'Tambah Siswa'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddStudentForm;
