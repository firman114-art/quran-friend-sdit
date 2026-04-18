import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Save, CheckCircle2, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SiswaRow {
  id: string;
  nama: string;
  kelas: string;
  kelas_id: string | null;
}

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const JurnalMuridForm = ({ onClose, onSuccess }: Props) => {
  const { toast } = useToast();
  const [siswaList, setSiswaList] = useState<SiswaRow[]>([]);
  const [selectedSiswa, setSelectedSiswa] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [shalatSubuh, setShalatSubuh] = useState(false);
  const [shalatDzuhur, setShalatDzuhur] = useState(false);
  const [shalatAshar, setShalatAshar] = useState(false);
  const [shalatMaghrib, setShalatMaghrib] = useState(false);
  const [shalatIsya, setShalatIsya] = useState(false);
  const [murojaahHafalan, setMurojaahHafalan] = useState('');
  const [murojaahTilawah, setMurojaahTilawah] = useState('');
  const [catatanOrtu, setCatatanOrtu] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSiswaList();
  }, []);

  const fetchSiswaList = async () => {
    const { data } = await supabase.from('siswa').select('*').order('nama');
    if (data) setSiswaList(data as any);
  };

  const handleSubmit = async () => {
    if (!selectedSiswa) {
      toast({ title: 'Pilih nama murid', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('jurnal_murid' as any)
      .insert({
        siswa_id: selectedSiswa,
        tanggal,
        shalat_subuh: shalatSubuh,
        shalat_dzuhur: shalatDzuhur,
        shalat_ashar: shalatAshar,
        shalat_maghrib: shalatMaghrib,
        shalat_isya: shalatIsya,
        murojaah_hafalan: murojaahHafalan || null,
        murojaah_tilawah: murojaahTilawah || null,
        catatan_ortu: catatanOrtu || null,
      } as any);

    setSaving(false);

    if (error) {
      toast({ title: 'Gagal menyimpan', description: error.message, variant: 'destructive' });
      return;
    }

    setSaved(true);
    toast({ title: 'Berhasil!', description: 'Jurnal harian murid telah disimpan.' });
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
              <p className="text-sm text-muted-foreground mt-1">Terima kasih telah mengisi jurnal harian.</p>
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
          <CardTitle className="text-lg">📝 Jurnal Rumah Murid</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs">Pilih Nama & Kelas</Label>
            <Select value={selectedSiswa} onValueChange={setSelectedSiswa}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih murid..." />
              </SelectTrigger>
              <SelectContent>
                {siswaList.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.nama} - {s.kelas}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs flex items-center gap-2">
              <Calendar className="w-3 h-3" /> Tanggal
            </Label>
            <Input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} />
          </div>

          {/* Aktivitas Ibadah */}
          <div className="p-3 rounded-lg bg-secondary space-y-3">
            <p className="font-semibold text-sm text-secondary-foreground">🕌 Aktivitas Ibadah Harian</p>
            <div className="grid grid-cols-5 gap-2">
              <div className="text-center">
                <input
                  type="checkbox"
                  id="shalat-subuh"
                  checked={shalatSubuh}
                  onChange={(e) => setShalatSubuh(e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
                <Label htmlFor="shalat-subuh" className="text-xs block mt-1">Subuh</Label>
              </div>
              <div className="text-center">
                <input
                  type="checkbox"
                  id="shalat-dzuhur"
                  checked={shalatDzuhur}
                  onChange={(e) => setShalatDzuhur(e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
                <Label htmlFor="shalat-dzuhur" className="text-xs block mt-1">Dzuhur</Label>
              </div>
              <div className="text-center">
                <input
                  type="checkbox"
                  id="shalat-ashar"
                  checked={shalatAshar}
                  onChange={(e) => setShalatAshar(e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
                <Label htmlFor="shalat-ashar" className="text-xs block mt-1">Ashar</Label>
              </div>
              <div className="text-center">
                <input
                  type="checkbox"
                  id="shalat-maghrib"
                  checked={shalatMaghrib}
                  onChange={(e) => setShalatMaghrib(e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
                <Label htmlFor="shalat-maghrib" className="text-xs block mt-1">Maghrib</Label>
              </div>
              <div className="text-center">
                <input
                  type="checkbox"
                  id="shalat-isya"
                  checked={shalatIsya}
                  onChange={(e) => setShalatIsya(e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
                <Label htmlFor="shalat-isya" className="text-xs block mt-1">Isya</Label>
              </div>
            </div>
          </div>

          {/* Murojaah */}
          <div className="p-3 rounded-lg bg-secondary space-y-3">
            <p className="font-semibold text-sm text-secondary-foreground">📖 Murojaah Al-Quran</p>
            <div>
              <Label className="text-xs">Murojaah Hafalan</Label>
              <Input
                placeholder="Contoh: Surah Al-Mulk ayat 1-10"
                value={murojaahHafalan}
                onChange={e => setMurojaahHafalan(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">Murojaah Tilawah</Label>
              <Input
                placeholder="Contoh: Buku Jilid 2 halaman 5-10"
                value={murojaahTilawah}
                onChange={e => setMurojaahTilawah(e.target.value)}
              />
            </div>
          </div>

          {/* Catatan Orang Tua */}
          <div>
            <Label className="text-xs">Catatan Orang Tua (Opsional)</Label>
            <Textarea
              value={catatanOrtu}
              onChange={e => setCatatanOrtu(e.target.value)}
              rows={2}
              placeholder="Pesan untuk guru (opsional)..."
            />
          </div>

          <Button className="w-full gradient-hero text-primary-foreground" onClick={handleSubmit} disabled={saving}>
            <Save className="w-4 h-4 mr-2" /> {saving ? 'Menyimpan...' : 'Simpan Jurnal'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default JurnalMuridForm;
