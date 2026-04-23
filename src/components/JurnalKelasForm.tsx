import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Save, Calendar, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Props {
  kelasId: string;
  kelasNama: string;
  guruId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const JurnalKelasForm = ({ kelasId, kelasNama, guruId, onClose, onSuccess }: Props) => {
  const { toast } = useToast();
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [hafalan, setHafalan] = useState('');
  const [tilawah, setTilawah] = useState('');
  const [tulisan, setTulisan] = useState('');
  const [materiPendamping, setMateriPendamping] = useState('');
  const [tugasRumah, setTugasRumah] = useState('');
  const [catatanKelas, setCatatanKelas] = useState('');
  const [absensi, setAbsensi] = useState<string>('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch absensi data saat tanggal berubah
  useEffect(() => {
    const fetchAbsensi = async () => {
      if (!kelasId || !tanggal) return;
      
      // Fetch dari absensi_harian untuk tanggal dan kelas ini
      const { data: absensiData } = await (supabase as any)
        .from('absensi_harian')
        .select('status')
        .eq('kelas_id', kelasId)
        .eq('tanggal', tanggal);
      
      if (absensiData && absensiData.length > 0) {
        // Hitung ringkasan absensi
        const counts = { hadir: 0, sakit: 0, izin: 0, alpa: 0 };
        absensiData.forEach((a: any) => {
          if (a.status === 'hadir') counts.hadir++;
          else if (a.status === 'sakit') counts.sakit++;
          else if (a.status === 'izin') counts.izin++;
          else if (a.status === 'alpa') counts.alpa++;
        });
        setAbsensi(`H:${counts.hadir}, S:${counts.sakit}, I:${counts.izin}, A:${counts.alpa}`);
      } else {
        setAbsensi('');
      }
    };
    
    fetchAbsensi();
  }, [kelasId, tanggal]);

  const handleSubmit = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('jurnal_kelas' as any)
      .insert({
        guru_id: guruId,
        kelas_id: kelasId,
        tanggal,
        hafalan: hafalan || null,
        tilawah: tilawah || null,
        tulisan: tulisan || null,
        materi_pendamping: materiPendamping || null,
        tugas_rumah: tugasRumah || null,
        catatan_kelas: catatanKelas || null,
        absensi: absensi || null,
      } as any);

    setSaving(false);

    if (error) {
      toast({ title: 'Gagal menyimpan', description: error.message, variant: 'destructive' });
      return;
    }

    setSaved(true);
    toast({ title: 'Berhasil!', description: `Jurnal kelas ${kelasNama} telah disimpan.` });
  };

  if (saved) {
    return (
      <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md border-0 shadow-2xl animate-fade-in">
          <CardContent className="p-6 text-center space-y-5">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mx-auto">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Jurnal Tersimpan!</h3>
              <p className="text-sm text-muted-foreground mt-1">Jurnal kelas {kelasNama} berhasil disimpan.</p>
            </div>
            <Button className="w-full gradient-hero text-primary-foreground" onClick={() => { onSuccess(); onClose(); }}>
              Tutup
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">Jurnal Kelas — {kelasNama}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Tanggal
              </Label>
              <Input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs flex items-center gap-2">
                📋 Absensi (Otomatis)
              </Label>
              <Input 
                type="text" 
                value={absensi || 'Belum ada data absensi'} 
                readOnly
                className="bg-secondary font-mono text-xs"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Diisi otomatis dari form absensi yang sudah diisi sebelumnya
              </p>
            </div>
          </div>

          {/* Aktivitas Pembelajaran */}
          <div className="p-3 rounded-lg bg-secondary space-y-3">
            <p className="font-semibold text-sm text-secondary-foreground">📚 Aktivitas Pembelajaran</p>
            <div>
              <Label className="text-xs">Hafalan</Label>
              <Input placeholder="Contoh: Ziyadah An-Naba ayat 1-10" value={hafalan} onChange={e => setHafalan(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Tilawah</Label>
              <Input placeholder="Contoh: Membaca Buku Jilid 2" value={tilawah} onChange={e => setTilawah(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Tulisan</Label>
              <Input placeholder="Contoh: Menulis huruf Hijaiyah bersambung" value={tulisan} onChange={e => setTulisan(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Materi Pendamping</Label>
              <Input placeholder="Contoh: Materi Tajwid Bab Idgham" value={materiPendamping} onChange={e => setMateriPendamping(e.target.value)} />
            </div>
          </div>

          {/* Tugas Rumah */}
          <div className="p-3 rounded-lg bg-secondary space-y-3">
            <p className="font-semibold text-sm text-secondary-foreground">📝 Tugas Rumah (PR)</p>
            <Textarea
              value={tugasRumah}
              onChange={e => setTugasRumah(e.target.value)}
              rows={2}
              placeholder="Contoh: Muraja'ah Surah Al-Mulk ayat 1-10 atau Latihan menulis huruf Hijaiyah di Buku Jilid halaman 12"
            />
          </div>

          {/* Catatan Kelas */}
          <div>
            <Label className="text-xs">Catatan Kondisi Kelas (opsional)</Label>
            <Textarea
              value={catatanKelas}
              onChange={e => setCatatanKelas(e.target.value)}
              rows={2}
              placeholder="Catatan umum suasana kelas atau target kelas..."
            />
          </div>

          <Button className="w-full gradient-hero text-primary-foreground" onClick={handleSubmit} disabled={saving}>
            <Save className="w-4 h-4 mr-2" /> {saving ? 'Menyimpan...' : 'Simpan Jurnal Kelas'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default JurnalKelasForm;
