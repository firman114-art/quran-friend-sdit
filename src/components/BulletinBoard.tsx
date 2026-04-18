import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Megaphone, Calendar, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PengumumanRow {
  id: string;
  judul: string;
  isi: string;
  tanggal: string;
  prioritas: 'rendah' | 'sedang' | 'tinggi';
}

interface Props {
  isAdmin?: boolean;
  isGuru?: boolean;
}

const BulletinBoard = ({ isAdmin = false, isGuru = false }: Props) => {
  const { toast } = useToast();
  const [pengumumanList, setPengumumanList] = useState<PengumumanRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [prioritas, setPrioritas] = useState<'rendah' | 'sedang' | 'tinggi'>('sedang');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPengumuman();
  }, []);

  const fetchPengumuman = async () => {
    const { data } = await supabase
      .from('pengumuman' as any)
      .select('*')
      .order('tanggal', { ascending: false });
    if (data) setPengumumanList(data as any);
  };

  const handleSubmit = async () => {
    if (!judul.trim() || !isi.trim()) {
      toast({ title: 'Lengkapi judul dan isi', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('pengumuman' as any)
      .insert({
        judul: judul.trim(),
        isi: isi.trim(),
        tanggal: new Date().toISOString().split('T')[0],
        prioritas,
      } as any);

    setSaving(false);

    if (error) {
      toast({ title: 'Gagal menyimpan', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Berhasil!', description: 'Pengumuman telah ditambahkan.' });
    setJudul('');
    setIsi('');
    setPrioritas('sedang');
    setShowForm(false);
    fetchPengumuman();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus pengumuman ini?')) return;
    const { error } = await supabase.from('pengumuman' as any).delete().eq('id', id);
    if (!error) {
      toast({ title: 'Berhasil', description: 'Pengumuman telah dihapus.' });
      fetchPengumuman();
    } else {
      toast({ title: 'Gagal', description: error.message, variant: 'destructive' });
    }
  };

  const getPriorityIcon = (p: string) => {
    switch (p) {
      case 'tinggi': return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'sedang': return <Info className="w-4 h-4 text-primary" />;
      default: return <CheckCircle className="w-4 h-4 text-success" />;
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'tinggi': return <Badge variant="destructive" className="text-xs">Penting</Badge>;
      case 'sedang': return <Badge variant="outline" className="text-xs">Info</Badge>;
      default: return <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">Umum</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {(isAdmin || isGuru) && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-primary" />
              Papan Pengumuman
            </CardTitle>
            <Button size="sm" className="gradient-hero text-primary-foreground" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-1" /> Tambah
            </Button>
          </CardHeader>
        </Card>
      )}

      {showForm && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div>
              <Label className="text-xs">Judul *</Label>
              <Input value={judul} onChange={e => setJudul(e.target.value)} placeholder="Judul pengumuman..." />
            </div>
            <div>
              <Label className="text-xs">Isi Pengumuman *</Label>
              <Textarea
                value={isi}
                onChange={e => setIsi(e.target.value)}
                rows={3}
                placeholder="Tulis isi pengumuman..."
              />
            </div>
            <div>
              <Label className="text-xs">Prioritas</Label>
              <Select value={prioritas} onValueChange={(v: 'rendah' | 'sedang' | 'tinggi') => setPrioritas(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rendah">Rendah (Umum)</SelectItem>
                  <SelectItem value="sedang">Sedang (Info)</SelectItem>
                  <SelectItem value="tinggi">Tinggi (Penting)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 gradient-hero text-primary-foreground" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {pengumumanList.length === 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <Megaphone className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Belum ada pengumuman.</p>
            </CardContent>
          </Card>
        )}

        {pengumumanList.map(p => (
          <Card key={p.id} className="border-0 shadow-sm">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getPriorityIcon(p.prioritas)}
                    <h4 className="font-semibold text-sm">{p.judul}</h4>
                    {getPriorityBadge(p.prioritas)}
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{p.isi}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {p.tanggal}
                  </div>
                </div>
                {(isAdmin || isGuru) && (
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive p-1 h-8 w-8"
                    onClick={() => handleDelete(p.id)}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BulletinBoard;
