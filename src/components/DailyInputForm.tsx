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
import { X, Save, MessageCircle, CheckCircle2, Minus, Plus, BookOpen, Book } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [hafalanKesalahanFasohah, setHafalanKesalahanFasohah] = useState(0);
  // Tilawah
  const [tilawahTipe, setTilawahTipe] = useState<'quran' | 'jilid'>('quran');
  const [tilawahJuz, setTilawahJuz] = useState('');
  const [tilawahSurah, setTilawahSurah] = useState('');
  const [tilawahAyat, setTilawahAyat] = useState('');
  const [tilawahPredikat, setTilawahPredikat] = useState('');
  const [tilawahKesalahanTajwid, setTilawahKesalahanTajwid] = useState(0);
  const [tilawahKesalahanKelancaran, setTilawahKesalahanKelancaran] = useState(0);
  const [tilawahKesalahanFasohah, setTilawahKesalahanFasohah] = useState(0);
  // Jilid
  const [jilidBuku, setJilidBuku] = useState('');
  const [jilidHalaman, setJilidHalaman] = useState('');
  const [jilidPredikat, setJilidPredikat] = useState('');
  const [jilidKesalahanTajwid, setJilidKesalahanTajwid] = useState(0);
  const [jilidKesalahanKelancaran, setJilidKesalahanKelancaran] = useState(0);
  // Catatan
  const [catatanGuru, setCatatanGuru] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const hafalanSurahList = hafalanJuz ? getSurahByJuz(parseInt(hafalanJuz)) : [];
  const tilawahSurahList = tilawahJuz ? getSurahByJuz(parseInt(tilawahJuz)) : [];

  // Helper function to map surah name to surah number
  const getSurahNumber = (surahName: string): number | null => {
    const baseName = surahName.split('(')[0].trim();
    const surahMap: { [key: string]: number } = {
      'Al-Fatihah': 1,
      'Al-Baqarah': 2,
      'Ali Imran': 3,
      'An-Nisa': 4,
      'Al-Maidah': 5,
      "Al-An'am": 6,
      "Al-A'raf": 7,
      'Al-Anfal': 8,
      'At-Taubah': 9,
      'Yunus': 10,
      'Hud': 11,
      'Yusuf': 12,
      "Ar-Ra'd": 13,
      'Ibrahim': 14,
      'Al-Hijr': 15,
      'An-Nahl': 16,
      "Al-Isra'": 17,
      'Al-Kahf': 18,
      'Maryam': 19,
      'Taha': 20,
      'Al-Anbiya': 21,
      'Al-Hajj': 22,
      "Al-Mu'minun": 23,
      'An-Nur': 24,
      'Al-Furqan': 25,
      "Asy-Syu'ara": 26,
      'An-Naml': 27,
      'Al-Qasas': 28,
      'Al-Ankabut': 29,
      'Ar-Rum': 30,
      'Luqman': 31,
      'As-Sajdah': 32,
      'Al-Ahzab': 33,
      "Saba'": 34,
      'Fatir': 35,
      'Yasin': 36,
      'As-Saffat': 37,
      'Sad': 38,
      'Az-Zumar': 39,
      'Ghafir': 40,
      'Fussilat': 41,
      'Asy-Syura': 42,
      'Az-Zukhruf': 43,
      'Ad-Dukhan': 44,
      'Al-Jasiyah': 45,
      'Al-Ahqaf': 46,
      'Muhammad': 47,
      'Al-Fath': 48,
      'Al-Hujurat': 49,
      'Qaf': 50,
      'Az-Zariyat': 51,
      'At-Tur': 52,
      'An-Najm': 53,
      'Al-Qamar': 54,
      'Ar-Rahman': 55,
      "Al-Waqi'ah": 56,
      'Al-Hadid': 57,
      'Al-Mujadalah': 58,
      'Al-Hasyr': 59,
      'Al-Mumtahanah': 60,
      'As-Saff': 61,
      "Al-Jumu'ah": 62,
      'Al-Munafiqun': 63,
      'At-Tagabun': 64,
      'At-Talaq': 65,
      'At-Tahrim': 66,
      'Al-Mulk': 67,
      'Al-Qalam': 68,
      'Al-Haqqah': 69,
      "Al-Ma'arij": 70,
      'Nuh': 71,
      'Al-Jinn': 72,
      'Al-Muzzammil': 73,
      'Al-Muddassir': 74,
      'Al-Qiyamah': 75,
      'Al-Insan': 76,
      'Al-Mursalat': 77,
      "An-Naba'": 78,
      "An-Nazi'at": 79,
      "'Abasa": 80,
      'At-Takwir': 81,
      'Al-Infitar': 82,
      'Al-Mutaffifin': 83,
      'Al-Insyiqaq': 84,
      'Al-Buruj': 85,
      'At-Tariq': 86,
      "Al-A'la": 87,
      'Al-Ghasyiyah': 88,
      'Al-Fajr': 89,
      'Al-Balad': 90,
      'Asy-Syams': 91,
      'Al-Lail': 92,
      'Ad-Duha': 93,
      'Al-Insyirah': 94,
      'At-Tin': 95,
      "Al-'Alaq": 96,
      'Al-Qadr': 97,
      'Al-Bayyinah': 98,
      'Az-Zalzalah': 99,
      "Al-'Adiyat": 100,
      "Al-Qari'ah": 101,
      'At-Takasur': 102,
      "Al-'Asr": 103,
      'Al-Humazah': 104,
      'Al-Fil': 105,
      'Quraisy': 106,
      "Al-Ma'un": 107,
      'Al-Kausar': 108,
      'Al-Kafirun': 109,
      'An-Nasr': 110,
      'Al-Lahab': 111,
      'Al-Ikhlas': 112,
      'Al-Falaq': 113,
      'An-Nas': 114,
    };
    return surahMap[baseName] || null;
  };

  // Auto-generate catatan
  useEffect(() => {
    const parts: string[] = [];
    if (hafalanSurah) {
      parts.push(`Hafalan: ${hafalanSurah} Ay. ${hafalanAyat || '-'} (${hafalanPredikat || '-'}), Tajwid: ${hafalanKesalahanTajwid}, Kelancaran: ${hafalanKesalahanKelancaran}, Fasohah: ${hafalanKesalahanFasohah}`);
    }
    if (tilawahSurah) {
      parts.push(`Tilawah: ${tilawahSurah} Ay. ${tilawahAyat || '-'} (${tilawahPredikat || '-'}), Tajwid: ${tilawahKesalahanTajwid}, Kelancaran: ${tilawahKesalahanKelancaran}, Fasohah: ${tilawahKesalahanFasohah}`);
    }
    if (jilidBuku) {
      parts.push(`Jilid: ${jilidBuku} Hal. ${jilidHalaman || '-'} (${jilidPredikat || '-'}), Tajwid: ${jilidKesalahanTajwid}, Kelancaran: ${jilidKesalahanKelancaran}`);
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
  }, [hafalanSurah, hafalanAyat, hafalanPredikat, hafalanKesalahanTajwid, hafalanKesalahanKelancaran, hafalanKesalahanFasohah, tilawahSurah, tilawahAyat, tilawahPredikat, tilawahKesalahanTajwid, tilawahKesalahanKelancaran, tilawahKesalahanFasohah, jilidBuku, jilidHalaman, jilidPredikat, jilidKesalahanTajwid, jilidKesalahanKelancaran]);

  const handleSubmit = async () => {
    // At least one section must be filled
    const hasHafalan = hafalanSurah && hafalanAyat;
    const hasTilawahQuran = tilawahTipe === 'quran' && tilawahSurah && tilawahAyat;
    const hasTilawahJilid = tilawahTipe === 'jilid' && tilawahSurah && tilawahAyat;
    const hasTilawah = hasTilawahQuran || hasTilawahJilid;
    const hasJilid = jilidBuku && jilidHalaman;

    if (!hasHafalan && !hasTilawah && !hasJilid) {
      toast({ title: 'Isi minimal satu bagian (Hafalan, Tilawah, atau Jilid)!', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const insertData = {
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
      // tilawah data
      tilawah_surah: tilawahSurah || null,
      tilawah_ayat: tilawahAyat || null,
      tilawah_predikat: tilawahPredikat || null,
      // jilid data
      jilid_buku: jilidBuku || null,
      jilid_halaman: jilidHalaman ? parseInt(jilidHalaman) : null,
      jilid_predikat: jilidPredikat || null,
      catatan_guru: catatanGuru || null,
    };
    console.log('Insert data:', insertData);
    const { error } = await supabase.from('daily_records').insert(insertData as any);
    console.log('Insert error:', error);
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

          <Tabs defaultValue="hafalan" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="hafalan">🕌 Hafalan</TabsTrigger>
              <TabsTrigger value="tilawah">📖 Tilawah</TabsTrigger>
            </TabsList>
            
            {/* HAFALAN TAB */}
            <TabsContent value="hafalan" className="space-y-3 pt-3">
              <div className="p-3 rounded-lg bg-secondary space-y-3">
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
                {hafalanSurah && hafalanAyat && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      const surahNumber = getSurahNumber(hafalanSurah);
                      if (surahNumber) {
                        window.open(`https://quran.com/${surahNumber}:${hafalanAyat}`, '_blank');
                      }
                    }}
                    className="w-full text-xs"
                  >
                    📖 Lihat Ayat di Quran.com
                  </Button>
                )}
                <div>
                  <Label className="text-xs">Penilaian</Label>
                  <Select value={hafalanPredikat} onValueChange={setHafalanPredikat}>
                    <SelectTrigger><SelectValue placeholder="Pilih penilaian..." /></SelectTrigger>
                    <SelectContent>
                      {PREDIKAT_OPTIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-medium text-muted-foreground">Perhitungan Kesalahan</p>
                  <ErrorCounter label="Tajwid" value={hafalanKesalahanTajwid} onChange={setHafalanKesalahanTajwid} />
                  <ErrorCounter label="Kelancaran" value={hafalanKesalahanKelancaran} onChange={setHafalanKesalahanKelancaran} />
                  <ErrorCounter label="Fasohah" value={hafalanKesalahanFasohah} onChange={setHafalanKesalahanFasohah} />
                </div>
              </div>
            </TabsContent>

            {/* TILAWAH TAB */}
            <TabsContent value="tilawah" className="space-y-3 pt-3">
              <div className="p-3 rounded-lg bg-secondary space-y-3">
                <div>
                  <Label className="text-xs">Tipe Tilawah</Label>
                  <Select value={tilawahTipe} onValueChange={(v: 'quran' | 'jilid') => setTilawahTipe(v)}>
                    <SelectTrigger><SelectValue placeholder="Pilih tipe..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quran"><BookOpen className="w-4 h-4 mr-2" /> Al-Quran</SelectItem>
                      <SelectItem value="jilid"><Book className="w-4 h-4 mr-2" /> Buku Jilid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {tilawahTipe === 'quran' ? (
                  <>
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
                    {tilawahSurah && tilawahAyat && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          const surahNumber = getSurahNumber(tilawahSurah);
                          if (surahNumber) {
                            window.open(`https://quran.com/${surahNumber}:${tilawahAyat}`, '_blank');
                          }
                        }}
                        className="w-full text-xs"
                      >
                        📖 Lihat Ayat di Quran.com
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <div>
                      <Label className="text-xs">Buku Jilid</Label>
                      <Select value={tilawahSurah} onValueChange={setTilawahSurah}>
                        <SelectTrigger><SelectValue placeholder="Pilih jilid..." /></SelectTrigger>
                        <SelectContent>
                          {JILID_OPTIONS.map(j => <SelectItem key={j} value={j}>{j}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Halaman (angka saja)</Label>
                      <Input placeholder="1" value={tilawahAyat} onChange={e => setTilawahAyat(e.target.value.replace(/[^0-9]/g, ''))} />
                    </div>
                  </>
                )}

                <div>
                  <Label className="text-xs">Penilaian</Label>
                  <Select value={tilawahPredikat} onValueChange={setTilawahPredikat}>
                    <SelectTrigger><SelectValue placeholder="Pilih penilaian..." /></SelectTrigger>
                    <SelectContent>
                      {PREDIKAT_OPTIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-medium text-muted-foreground">Perhitungan Kesalahan</p>
                  <ErrorCounter label="Tajwid" value={tilawahKesalahanTajwid} onChange={setTilawahKesalahanTajwid} />
                  <ErrorCounter label="Kelancaran" value={tilawahKesalahanKelancaran} onChange={setTilawahKesalahanKelancaran} />
                  <ErrorCounter label="Fasohah" value={tilawahKesalahanFasohah} onChange={setTilawahKesalahanFasohah} />
                </div>
              </div>
            </TabsContent>
          </Tabs>

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
