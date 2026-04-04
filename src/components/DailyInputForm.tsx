import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { saveRecord, TILAWAH_KATEGORI, STATUS_OPTIONS, type User, type TilawahKategori, type Status, type DailyRecord } from '@/lib/data';
import { JUZ_DATA, getSurahByJuz } from '@/lib/quran-data';
import { X, Save, MessageCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  student: User;
  onClose: () => void;
}

function buildWhatsAppMessage(student: User, record: DailyRecord): string {
  const lines = [
    `بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ`,
    ``,
    `📋 *Laporan Harian Al-Qur'an*`,
    `🏫 SDIT Al-Insan Pinrang`,
    `📅 ${record.tanggal}`,
    ``,
    `👤 *Nama:* ${student.name}`,
    `🎓 *Kelas:* ${student.kelas}`,
    ``,
    `📖 *Tilawah:*`,
    `   Kategori: ${record.tilpiKategori}`,
    `   Halaman: ${record.tilpiHalaman}`,
    ``,
    `🕌 *Tahfidz:*`,
    `   Juz: ${record.tahfidzJuz || '-'}`,
    `   Surah: ${record.tahfidzSurah}`,
    `   Ayat: ${record.tahfidzAyat}`,
    ``,
    `📊 *Status:* ${record.status}`,
  ];

  if (record.catatan) {
    lines.push(``, `📝 *Catatan Guru:*`, `${record.catatan}`);
  }

  lines.push(``, `_Semoga Allah memudahkan hafalan ananda. Jazakumullahu khairan._`);
  return lines.join('\n');
}

function openWhatsApp(phone: string, message: string) {
  const encoded = encodeURIComponent(message);
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
}

const DailyInputForm = ({ student, onClose }: Props) => {
  const { toast } = useToast();
  const [tilpiKategori, setTilpiKategori] = useState<TilawahKategori>('Jilid 1');
  const [tilpiHalaman, setTilpiHalaman] = useState('');
  const [selectedJuz, setSelectedJuz] = useState('');
  const [tahfidzSurah, setTahfidzSurah] = useState('');
  const [tahfidzAyat, setTahfidzAyat] = useState('');
  const [status, setStatus] = useState<Status>('Lancar');
  const [catatan, setCatatan] = useState('');
  const [savedRecord, setSavedRecord] = useState<DailyRecord | null>(null);

  const availableSurah = selectedJuz ? getSurahByJuz(parseInt(selectedJuz)) : [];

  const handleJuzChange = (juz: string) => {
    setSelectedJuz(juz);
    setTahfidzSurah('');
    setTahfidzAyat('');
  };

  const handleSurahChange = (surah: string) => {
    setTahfidzSurah(surah);
    setTahfidzAyat('');
  };

  const handleSubmit = () => {
    if (!tilpiHalaman || !selectedJuz || !tahfidzSurah || !tahfidzAyat) {
      toast({ title: 'Lengkapi semua field!', variant: 'destructive' });
      return;
    }

    const record: DailyRecord = {
      id: `r${Date.now()}`,
      siswaId: student.id,
      tanggal: new Date().toISOString().split('T')[0],
      tilpiKategori,
      tilpiHalaman: parseInt(tilpiHalaman),
      tahfidzJuz: parseInt(selectedJuz),
      tahfidzSurah,
      tahfidzAyat,
      status,
      catatan,
    };

    saveRecord(record);
    setSavedRecord(record);
    toast({ title: 'Berhasil!', description: `Data ${student.name} telah disimpan.` });
  };

  const handleSendWhatsApp = () => {
    if (!savedRecord || !student.noHpOrtu) return;
    const message = buildWhatsAppMessage(student, savedRecord);
    openWhatsApp(student.noHpOrtu, message);
  };

  // Success state
  if (savedRecord) {
    return (
      <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md border-0 shadow-2xl animate-fade-in">
          <CardContent className="p-6 text-center space-y-5">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mx-auto">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">Data Tersimpan!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Catatan harian {student.name} berhasil disimpan.
              </p>
            </div>

            {student.noHpOrtu && (
              <Button
                className="w-full bg-success hover:bg-success/90 text-success-foreground"
                size="lg"
                onClick={handleSendWhatsApp}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Kirim ke Orang Tua via WhatsApp
              </Button>
            )}

            <Button variant="outline" className="w-full" onClick={onClose}>
              Tutup
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto border-0 shadow-2xl animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg text-foreground">
            Input Harian — {student.name}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tilawah Section */}
          <div className="p-3 rounded-lg bg-secondary">
            <p className="font-semibold text-sm text-secondary-foreground mb-3">📖 Tilawah</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Kategori</Label>
                <Select value={tilpiKategori} onValueChange={(v) => setTilpiKategori(v as TilawahKategori)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TILAWAH_KATEGORI.map(k => (
                      <SelectItem key={k} value={k}>{k}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Halaman</Label>
                <Input
                  type="number"
                  placeholder="1"
                  value={tilpiHalaman}
                  onChange={e => setTilpiHalaman(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Tahfidz Section - 3 cascading selects */}
          <div className="p-3 rounded-lg bg-secondary">
            <p className="font-semibold text-sm text-secondary-foreground mb-3">🕌 Tahfidz</p>
            <div className="space-y-3">
              {/* Juz */}
              <div>
                <Label className="text-xs">Juz</Label>
                <Select value={selectedJuz} onValueChange={handleJuzChange}>
                  <SelectTrigger><SelectValue placeholder="Pilih Juz..." /></SelectTrigger>
                  <SelectContent>
                    {JUZ_DATA.map(j => (
                      <SelectItem key={j.nomor} value={String(j.nomor)}>
                        Juz {j.nomor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Surah - filtered by Juz */}
              <div>
                <Label className="text-xs">Surah</Label>
                <Select
                  value={tahfidzSurah}
                  onValueChange={handleSurahChange}
                  disabled={!selectedJuz}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedJuz ? 'Pilih Surah...' : 'Pilih Juz dulu'} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSurah.map(s => (
                      <SelectItem key={s.nama} value={s.nama}>{s.nama}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ayat */}
              <div>
                <Label className="text-xs">Ayat</Label>
                <Input
                  placeholder="Contoh: 1-7"
                  value={tahfidzAyat}
                  onChange={e => setTahfidzAyat(e.target.value)}
                  disabled={!tahfidzSurah}
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <Label className="text-xs">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Catatan */}
          <div>
            <Label className="text-xs">Catatan Guru</Label>
            <Textarea
              placeholder="Tuliskan catatan untuk siswa..."
              value={catatan}
              onChange={e => setCatatan(e.target.value)}
              rows={2}
            />
          </div>

          <Button className="w-full gradient-hero text-primary-foreground" onClick={handleSubmit}>
            <Save className="w-4 h-4 mr-2" /> Simpan
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyInputForm;
