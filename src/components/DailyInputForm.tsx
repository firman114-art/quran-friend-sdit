import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PREDIKAT_OPTIONS, JENIS_SETORAN_OPTIONS, JILID_OPTIONS } from '@/lib/data';
import { JUZ_DATA, getSurahByJuz } from '@/lib/quran-data';
import { supabase } from '@/integrations/supabase/client';
import { X, Save, MessageCircle, CheckCircle2, Minus, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StudentInfo {
  id: string;
  name: string;
  kelas?: string;
  noHpOrtu?: string | null;
}

interface Props {
  student: StudentInfo;
  guruId: string;
  onClose: () => void;
}

function ErrorCounter({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => onChange(Math.max(0, value - 1))}>
          <Minus className="w-3 h-3" />
        </Button>
        <span className="w-8 text-center text-sm font-medium">{value}</span>
        <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => onChange(value + 1)}>
          <Plus className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

const DailyInputForm = ({ student, guruId, onClose }: Props) => {
  const { toast } = useToast();
  // Hafalan
  const [hafalanJuz, setHafalanJuz] = useState('');
  const [hafalanSurah, setHafalanSurah] = useState('');
  const [hafalanAyat, setHafalanAyat] = useState('');
  const [hafalanPredikat, setHafalanPredikat] = useState('');
  const [hafalanJenisSetoran, setHafalanJenisSetoran] = useState('');
  const [hafalanKesalahanTajwid, setHafalanKesalahanTajwid] = useState(0);
  const [hafalanKesalahanKelancaran, setHafalanKesalahanKelancaran] = useState(0);
  // Tilawah
  const [tilawahJuz, setTilawahJuz] = useState('');
  const [tilawahSurah, setTilawahSurah] = useState('');
  const [tilawahAyat, setTilawahAyat] = useState('');
  const [tilawahPredikat, setTilawahPredikat] = useState('');
  const [tilawahKesalahanTajwid, setTilawahKesalahanTajwid] = useState(0);
  const [tilawahKesalahanKelancaran, setTilawahKesalahanKelancaran] = useState(0);
  // Jilid
  const [jilidBuku, setJilidBuku] = useState('');
  const [jilidHalaman, setJilidHalaman] = useState('');
  const [jilidPredikat, setJilidPredikat] = useState('');
  // Catatan
  const [catatanGuru, setCatatanGuru] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const hafalanSurahList = hafalanJuz ? getSurahByJuz(parseInt(hafalanJuz)) : [];
  const tilawahSurahList = tilawahJuz ? getSurahByJuz(parseInt(tilawahJuz)) : [];

  // Auto-generate catatan
  useEffect(() => {
    const parts: string[] = [];
    if (hafalanSurah) {
      parts.push(`Hafalan: ${hafalanSurah} Ay. ${hafalanAyat || '-'} (${hafalanPredikat || '-'}), Tajwid: ${hafalanKesalahanTajwid}, Kelancaran: ${hafalanKesalahanKelancaran}`);
    }
    if (tilawahSurah) {
      parts.push(`Tilawah: ${tilawahSurah} Ay. ${tilawahAyat || '-'} (${tilawahPredikat || '-'}), Tajwid: ${tilawahKesalahanTajwid}, Kelancaran: ${tilawahKesalahanKelancaran}`);
    }
    if (jilidBuku) {
      parts.push(`Jilid: ${jilidBuku} Hal. ${jilidHalaman || '-'} (${jilidPredikat || '-'})`);
    }
    if (parts.length > 0) {
      setCatatanGuru(prev => {
        // Only auto-set if user hasn't manually typed
        if (!prev || prev.startsWith('Hafalan:') || prev.startsWith('Tilawah:') || prev.startsWith('Jilid:')) {
          return parts.join('. ');
        }
        return prev;
      });
    }
  }, [hafalanSurah, hafalanAyat, hafalanPredikat, hafalanKesalahanTajwid, hafalanKesalahanKelancaran, tilawahSurah, tilawahAyat, tilawahPredikat, tilawahKesalahanTajwid, tilawahKesalahanKelancaran, jilidBuku, jilidHalaman, jilidPredikat]);

  const handleSubmit = async () => {
    // At least one section must be filled
    const hasHafalan = hafalanSurah && hafalanAyat;
    const hasTilawah = tilawahSurah && tilawahAyat;
    const hasJilid = jilidBuku && jilidHalaman;

    if (!hasHafalan && !hasTilawah && !hasJilid) {
      toast({ title: 'Isi minimal satu bagian (Hafalan, Tilawah, atau Jilid)!', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const { error } = await supabase.from('daily_records').insert({
      siswa_id: student.id,
      guru_id: guruId,
      tanggal,
      hafalan_juz: hafalanJuz ? parseInt(hafalanJuz) : null,
      hafalan_surah: hafalanSurah || null,
      hafalan_ayat: hafalanAyat || null,
      hafalan_predikat: hafalanPredikat || null,
      hafalan_jenis_setoran: hafalanJenisSetoran || null,
      hafalan_kesalahan_tajwid: hafalanKesalahanTajwid,
      hafalan_kesalahan_kelancaran: hafalanKesalahanKelancaran,
      tilawah_surah: tilawahSurah || null,
      tilawah_ayat: tilawahAyat || null,
      tilawah_predikat: tilawahPredikat || null,
      tilawah_kesalahan_tajwid: tilawahKesalahanTajwid,
      tilawah_kesalahan_kelancaran: tilawahKesalahanKelancaran,
      jilid_buku: jilidBuku || null,
      jilid_halaman: jilidHalaman ? parseInt(jilidHalaman) : null,
      jilid_predikat: jilidPredikat || null,
      catatan_guru: catatanGuru || null,
    } as any);
    setSaving(false);

    if (error) {
      toast({ title: 'Gagal menyimpan', description: error.message, variant: 'destructive' });
      return;
    }

    setSaved(true);
    toast({ title: 'Berhasil!', description: `Data ${student.name} telah disimpan.` });
  };

  const handleWhatsApp = () => {
    if (!student.noHpOrtu) return;
    const parts = [`📋 Laporan Harian - ${tanggal}`, `👤 ${student.name} (Kelas ${student.kelas})`];
    if (hafalanSurah) parts.push(`🕌 Hafalan: ${hafalanSurah} Ay. ${hafalanAyat} - ${hafalanPredikat}`);
    if (tilawahSurah) parts.push(`📖 Tilawah: ${tilawahSurah} Ay. ${tilawahAyat} - ${tilawahPredikat}`);
    if (jilidBuku) parts.push(`📕 Jilid: ${jilidBuku} Hal. ${jilidHalaman} - ${jilidPredikat}`);
    if (catatanGuru) parts.push(`📝 ${catatanGuru}`);
    const phone = student.noHpOrtu.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(parts.join('\n'))}`, '_blank');
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
              <h3 className="font-bold text-lg">Data Tersimpan!</h3>
              <p className="text-sm text-muted-foreground mt-1">Catatan harian {student.name} berhasil disimpan.</p>
            </div>
            {student.noHpOrtu && (
              <Button className="w-full bg-success hover:bg-success/90 text-success-foreground" onClick={handleWhatsApp}>
                <MessageCircle className="w-5 h-5 mr-2" /> Kirim ke Orang Tua via WhatsApp
              </Button>
            )}
            <Button variant="outline" className="w-full" onClick={onClose}>Tutup</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto border-0 shadow-2xl animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">Log Harian — {student.name}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs">Tanggal</Label>
            <Input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} />
          </div>

          {/* HAFALAN */}
          <div className="p-3 rounded-lg bg-secondary space-y-3">
            <p className="font-semibold text-sm text-secondary-foreground">🕌 Hafalan</p>
            <div>
              <Label className="text-xs">Jenis Setoran</Label>
              <Select value={hafalanJenisSetoran} onValueChange={setHafalanJenisSetoran}>
                <SelectTrigger><SelectValue placeholder="Pilih jenis..." /></SelectTrigger>
                <SelectContent>
                  {JENIS_SETORAN_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Juz</Label>
              <Select value={hafalanJuz} onValueChange={v => { setHafalanJuz(v); setHafalanSurah(''); }}>
                <SelectTrigger><SelectValue placeholder="Pilih Juz..." /></SelectTrigger>
                <SelectContent>
                  {JUZ_DATA.map(j => <SelectItem key={j.nomor} value={String(j.nomor)}>Juz {j.nomor}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Surah</Label>
              <Select value={hafalanSurah} onValueChange={setHafalanSurah} disabled={!hafalanJuz}>
                <SelectTrigger><SelectValue placeholder={hafalanJuz ? 'Pilih Surah...' : 'Pilih Juz dulu'} /></SelectTrigger>
                <SelectContent>
                  {hafalanSurahList.map(s => <SelectItem key={s.nama} value={s.nama}>{s.nama}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Ayat (angka saja)</Label>
              <Input placeholder="Contoh: 1-7" value={hafalanAyat} onChange={e => setHafalanAyat(e.target.value.replace(/[^0-9\-,]/g, ''))} disabled={!hafalanSurah} />
            </div>
            <div>
              <Label className="text-xs">Predikat</Label>
              <Select value={hafalanPredikat} onValueChange={setHafalanPredikat}>
                <SelectTrigger><SelectValue placeholder="Pilih predikat..." /></SelectTrigger>
                <SelectContent>
                  {PREDIKAT_OPTIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <ErrorCounter label="Kesalahan Tajwid" value={hafalanKesalahanTajwid} onChange={setHafalanKesalahanTajwid} />
            <ErrorCounter label="Kesalahan Kelancaran" value={hafalanKesalahanKelancaran} onChange={setHafalanKesalahanKelancaran} />
          </div>

          {/* TILAWAH */}
          <div className="p-3 rounded-lg bg-secondary space-y-3">
            <p className="font-semibold text-sm text-secondary-foreground">📖 Tilawah</p>
            <div>
              <Label className="text-xs">Juz</Label>
              <Select value={tilawahJuz} onValueChange={v => { setTilawahJuz(v); setTilawahSurah(''); }}>
                <SelectTrigger><SelectValue placeholder="Pilih Juz..." /></SelectTrigger>
                <SelectContent>
                  {JUZ_DATA.map(j => <SelectItem key={j.nomor} value={String(j.nomor)}>Juz {j.nomor}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Surah</Label>
              <Select value={tilawahSurah} onValueChange={setTilawahSurah} disabled={!tilawahJuz}>
                <SelectTrigger><SelectValue placeholder={tilawahJuz ? 'Pilih Surah...' : 'Pilih Juz dulu'} /></SelectTrigger>
                <SelectContent>
                  {tilawahSurahList.map(s => <SelectItem key={s.nama} value={s.nama}>{s.nama}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Ayat (angka saja)</Label>
              <Input placeholder="Contoh: 1-10" value={tilawahAyat} onChange={e => setTilawahAyat(e.target.value.replace(/[^0-9\-,]/g, ''))} disabled={!tilawahSurah} />
            </div>
            <div>
              <Label className="text-xs">Predikat</Label>
              <Select value={tilawahPredikat} onValueChange={setTilawahPredikat}>
                <SelectTrigger><SelectValue placeholder="Pilih predikat..." /></SelectTrigger>
                <SelectContent>
                  {PREDIKAT_OPTIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <ErrorCounter label="Kesalahan Tajwid" value={tilawahKesalahanTajwid} onChange={setTilawahKesalahanTajwid} />
            <ErrorCounter label="Kesalahan Kelancaran" value={tilawahKesalahanKelancaran} onChange={setTilawahKesalahanKelancaran} />
          </div>

          {/* JILID */}
          <div className="p-3 rounded-lg bg-secondary space-y-3">
            <p className="font-semibold text-sm text-secondary-foreground">📕 Tilawah Buku Jilid</p>
            <div>
              <Label className="text-xs">Buku Jilid</Label>
              <Select value={jilidBuku} onValueChange={setJilidBuku}>
                <SelectTrigger><SelectValue placeholder="Pilih jilid..." /></SelectTrigger>
                <SelectContent>
                  {JILID_OPTIONS.map(j => <SelectItem key={j} value={j}>{j}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Halaman (angka saja)</Label>
              <Input placeholder="1" value={jilidHalaman} onChange={e => setJilidHalaman(e.target.value.replace(/[^0-9]/g, ''))} />
            </div>
            <div>
              <Label className="text-xs">Predikat</Label>
              <Select value={jilidPredikat} onValueChange={setJilidPredikat}>
                <SelectTrigger><SelectValue placeholder="Pilih predikat..." /></SelectTrigger>
                <SelectContent>
                  {PREDIKAT_OPTIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* CATATAN */}
          <div>
            <Label className="text-xs">Catatan Guru (opsional, terisi otomatis)</Label>
            <Textarea value={catatanGuru} onChange={e => setCatatanGuru(e.target.value)} rows={3} placeholder="Catatan akan terisi otomatis..." />
          </div>

          <Button className="w-full gradient-hero text-primary-foreground" onClick={handleSubmit} disabled={saving}>
            <Save className="w-4 h-4 mr-2" /> {saving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyInputForm;
