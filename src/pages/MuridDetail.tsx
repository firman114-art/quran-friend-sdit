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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SiswaInfo {
  id: string;
  nama: string;
  kelas: string;
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

interface ClassStudent {
  id: string;
  nama: string;
  mumtazCount: number;
  totalRecords: number;
}

const MuridDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [siswa, setSiswa] = useState<SiswaInfo | null>(null);
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [classStudents, setClassStudents] = useState<ClassStudent[]>([]);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      const { data: siswaData } = await supabase.from('siswa').select('id, nama, kelas').eq('id', id).maybeSingle();
      const { data: recordsData } = await supabase.from('daily_records').select('*').eq('siswa_id', id).order('tanggal', { ascending: false });
      
      if (siswaData) {
        setSiswa(siswaData);
        // Fetch other students from same class for ranking
        const { data: classStudentsData } = await supabase.from('siswa').select('id, nama').eq('kelas', siswaData.kelas);
        if (classStudentsData && classStudentsData.length > 0) {
          const studentIds = classStudentsData.map(s => s.id);
          const { data: allRecords } = await supabase.from('daily_records').select('*').in('siswa_id', studentIds);
          
          // Calculate performance for each student
          const studentsWithStats = classStudentsData.map(s => {
            const studentRecords = allRecords?.filter(r => r.siswa_id === s.id) || [];
            const mumtazCount = studentRecords.filter(r => r.hafalan_predikat === 'A' || r.hafalan_predikat === 'Mumtaz').length;
            return {
              id: s.id,
              nama: s.nama,
              mumtazCount,
              totalRecords: studentRecords.length
            };
          }).sort((a, b) => b.mumtazCount - a.mumtazCount).slice(0, 5); // Top 5
          
          setClassStudents(studentsWithStats);
        }
      }
      if (recordsData) setRecords(recordsData);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  // Fitur WhatsApp dinonaktifkan sementara - no_hp_ortu belum ada di database
  // const handleWhatsApp = () => {
  //   if (!siswa?.no_hp_ortu || records.length === 0) return;
  //   const msg = buildWhatsAppMessage(siswa, records);
  //   const phone = siswa.no_hp_ortu.replace(/[^0-9]/g, '');
  //   window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  // };

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
  const lastTilawah = records.find(r => r.tilawah_surah || r.tilawah_ayat);
  const lastTilawahForCard = records.find(r => r.tilawah_surah || r.tilawah_ayat);

  // Calculate monthly attendance data
  const monthlyData = (() => {
    const monthly: { [key: string]: number } = {};
    records.forEach(r => {
      const month = r.tanggal.substring(0, 7); // YYYY-MM
      monthly[month] = (monthly[month] || 0) + 1;
    });
    const sortedMonths = Object.entries(monthly).sort((a, b) => a[0].localeCompare(b[0]));
    const monthNames: { [key: string]: string } = {
      '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'Mei', '06': 'Jun',
      '07': 'Jul', '08': 'Agu', '09': 'Sep', '10': 'Okt', '11': 'Nov', '12': 'Des'
    };
    return sortedMonths.slice(-6).map(([month, count]) => ({
      name: monthNames[month.substring(5)] || month.substring(5),
      kehadiran: count
    }));
  })();

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
          {lastTilawahForCard && (
            <Card className="border-0 shadow-sm bg-primary/5">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-primary mb-1">📖 Tilawah Terakhir</p>
                <p className="text-sm font-semibold">{lastTilawahForCard.tilawah_surah || '-'} Ayat {lastTilawahForCard.tilawah_ayat || '-'}</p>
                {lastTilawahForCard.tilawah_predikat && (
                  <Badge className="mt-2 text-xs bg-primary/10 text-primary">{lastTilawahForCard.tilawah_predikat}</Badge>
                )}
                <p className="text-xs text-muted-foreground mt-1">{lastTilawahForCard.tanggal}</p>
              </CardContent>
            </Card>
          )}
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

          {monthlyData.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Grafik Kehadiran (6 Bulan Terakhir)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="kehadiran" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {classStudents.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">🏆 Siswa Terbaik di Kelas {siswa?.kelas}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {classStudents.map((s, index) => (
                  <div key={s.id} className={`flex items-center justify-between p-2 rounded-lg ${s.id === id ? 'bg-primary/10' : 'bg-secondary/50'}`}>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium">{s.nama} {s.id === id && '(Anda)'}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-primary">{s.mumtazCount} Mumtaz</span>
                      <span className="text-xs text-muted-foreground block">{s.totalRecords} pertemuan</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

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
                    <p className="text-sm">🕌 Hafalan: {r.hafalan_surah}
                      {r.hafalan_predikat && <Badge className="ml-2 text-xs bg-primary/10 text-primary">{r.hafalan_predikat}</Badge>}
                    </p>
                  )}
                  {(r.tilawah_surah || r.tilawah_ayat) && (
                    <p className="text-sm font-semibold">📖 Tilawah: {r.tilawah_surah || '-'} Ayat {r.tilawah_ayat || '-'}
                      {r.tilawah_predikat && <Badge className="ml-2 text-xs bg-primary/10 text-primary">{r.tilawah_predikat}</Badge>}
                    </p>
                  )}
                  {r.jilid_buku && (
                    <p className="text-sm font-semibold">📕 Jilid: {r.jilid_buku} Hal. {r.jilid_halaman}
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

        {/* Fitur WhatsApp dinonaktifkan sementara
        {siswa.no_hp_ortu && (
          <Button className="w-full bg-success hover:bg-success/90 text-success-foreground" onClick={handleWhatsApp}>
            <MessageCircle className="w-4 h-4 mr-2" /> Kirim Laporan ke Orang Tua
          </Button>
        )} */}
      </main>

      <footer className="text-center py-6 text-xs text-muted-foreground italic">
        "Mencetak Generasi Qurani yang Cerdas dan Berakhlak Mulia."
      </footer>
    </div>
  );
};

export default MuridDetail;
