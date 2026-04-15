import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, BookOpen, Star, MessageCircle, Download } from 'lucide-react';
import { getPredikatLabel } from '@/lib/data';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

interface SiswaInfo {
  id: string;
  nama: string;
  kelas: string;
  no_hp_ortu: string | null;
  photo_url: string | null;
}

interface RecordRow {
  id: string;
  tanggal: string;
  hafalan_juz: number | null;
  hafalan_surah: string | null;
  hafalan_ayat: string | null;
  hafalan_predikat: string | null;
  hafalan_jenis_setoran: string | null;
  tilawah_surah: string | null;
  tilawah_ayat: string | null;
  tilawah_predikat: string | null;
  jilid_buku: string | null;
  jilid_halaman: number | null;
  jilid_predikat: string | null;
  catatan_guru: string | null;
}

function buildWhatsAppMessage(siswa: SiswaInfo, records: RecordRow[]): string {
  const latest = records.slice(0, 2);
  const lines = [
    `بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ`,
    ``,
    `📋 *Laporan Al-Qur'an*`,
    `🏫 SDIT Al-Insan Pinrang`,
    ``,
    `👤 *Nama:* ${siswa.nama}`,
    `🎓 *Kelas:* ${siswa.kelas}`,
    `📊 *Kehadiran:* ${records.length} pertemuan`,
  ];

  latest.forEach((r, i) => {
    lines.push(``, `📅 *${r.tanggal}*`);
    if (r.hafalan_surah) {
      lines.push(`  🕌 Hafalan: ${r.hafalan_surah} Ayat ${r.hafalan_ayat} (${r.hafalan_predikat || '-'})`);
    }
    if (r.tilawah_surah) {
      lines.push(`  📖 Tilawah: ${r.tilawah_surah} Ayat ${r.tilawah_ayat} (${r.tilawah_predikat || '-'})`);
    }
    if (r.jilid_buku) {
      lines.push(`  📕 Jilid: ${r.jilid_buku} Hal. ${r.jilid_halaman} (${r.jilid_predikat || '-'})`);
    }
    if (r.catatan_guru) {
      lines.push(`  📝 Catatan: ${r.catatan_guru}`);
    }
  });

  lines.push(``, `_Semoga Allah memudahkan hafalan ananda. Jazakumullahu khairan._`);
  return lines.join('\n');
}

const MuridDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [siswa, setSiswa] = useState<SiswaInfo | null>(null);
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from('siswa').select('id, nama, kelas, no_hp_ortu, photo_url').eq('id', id).maybeSingle(),
      supabase.from('daily_records').select('*').eq('siswa_id', id).order('tanggal', { ascending: false }),
    ]).then(([siswaRes, recordsRes]) => {
      if (siswaRes.data) setSiswa(siswaRes.data);
      if (recordsRes.data) setRecords(recordsRes.data);
      setLoading(false);
    });
  }, [id]);

  const handleWhatsApp = () => {
    if (!siswa?.no_hp_ortu || records.length === 0) return;
    const msg = buildWhatsAppMessage(siswa, records);
    const phone = siswa.no_hp_ortu.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, imgWidth, imgHeight);
    pdf.save(`Laporan_${siswa?.nama || 'Murid'}.pdf`);
  };

  const handleDownloadJPEG = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
    const link = document.createElement('a');
    link.download = `Laporan_${siswa?.nama || 'Murid'}.jpeg`;
    link.href = canvas.toDataURL('image/jpeg', 0.9);
    link.click();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Memuat...</p></div>;
  if (!siswa) return <div className="min-h-screen flex items-center justify-center"><p>Murid tidak ditemukan.</p></div>;

  const lastTwo = records.slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-hero text-primary-foreground py-4">
        <div className="container mx-auto px-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="text-primary-foreground hover:bg-primary-foreground/20">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-bold text-lg">Progres Murid</h1>
            <p className="text-xs opacity-80">{siswa.nama} — Kelas {siswa.kelas}</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg space-y-4">
        <div ref={reportRef} className="space-y-4 bg-background p-2">
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <BookOpen className="w-6 h-6 mx-auto text-primary mb-1" />
                <p className="text-2xl font-bold">{records.length}</p>
                <p className="text-xs text-muted-foreground">Kehadiran</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <Star className="w-6 h-6 mx-auto text-accent mb-1" />
                <p className="text-2xl font-bold">{records.filter(r => r.hafalan_predikat === 'A').length}</p>
                <p className="text-xs text-muted-foreground">Mumtaz</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">2 Catatan Terakhir</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lastTwo.length === 0 && <p className="text-sm text-muted-foreground">Belum ada catatan.</p>}
              {lastTwo.map(r => (
                <div key={r.id} className="p-3 rounded-lg bg-secondary/50 space-y-1">
                  <p className="text-xs font-medium text-primary">{r.tanggal}</p>
                  {r.hafalan_surah && (
                    <p className="text-sm">🕌 Hafalan: {r.hafalan_surah} Ayat {r.hafalan_ayat}
                      {r.hafalan_predikat && <Badge className="ml-2 text-xs bg-primary/10 text-primary">{r.hafalan_predikat}</Badge>}
                    </p>
                  )}
                  {r.tilawah_surah && (
                    <p className="text-sm">📖 Tilawah: {r.tilawah_surah} Ayat {r.tilawah_ayat}
                      {r.tilawah_predikat && <Badge className="ml-2 text-xs bg-primary/10 text-primary">{r.tilawah_predikat}</Badge>}
                    </p>
                  )}
                  {r.jilid_buku && (
                    <p className="text-sm">📕 {r.jilid_buku} Hal. {r.jilid_halaman}
                      {r.jilid_predikat && <Badge className="ml-2 text-xs bg-primary/10 text-primary">{r.jilid_predikat}</Badge>}
                    </p>
                  )}
                  {r.catatan_guru && <p className="text-xs text-muted-foreground italic">📝 {r.catatan_guru}</p>}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1" variant="outline" onClick={handleDownloadPDF}>
            <Download className="w-4 h-4 mr-1" /> PDF
          </Button>
          <Button className="flex-1" variant="outline" onClick={handleDownloadJPEG}>
            <Download className="w-4 h-4 mr-1" /> JPEG
          </Button>
        </div>

        {siswa.no_hp_ortu && (
          <Button className="w-full bg-success hover:bg-success/90 text-success-foreground" onClick={handleWhatsApp}>
            <MessageCircle className="w-4 h-4 mr-2" /> Kirim Laporan ke Orang Tua
          </Button>
        )}
      </main>

      <footer className="text-center py-6 text-xs text-muted-foreground italic">
        "Mencetak Generasi Qurani yang Cerdas dan Berakhlak Mulia."
      </footer>
    </div>
  );
};

export default MuridDetail;
