import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, BookOpen, Star, MessageCircle, Download, Bell, Calendar, ClipboardList, Home, Send } from 'lucide-react';
import { getPredikatLabel } from '@/lib/data';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SiswaInfo {
  id: string;
  nama: string;
  kelas: string;
  kelas_id: string | null;
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

interface JurnalKelas {
  id: string;
  kelas_id: string;
  tanggal: string;
  tugas_rumah: string | null;
}

interface TugasRumahTerbaru {
  id: string;
  tugas_rumah: string;
  tanggal: string;
  kelas_id: string;
}

interface AbsensiHarian {
  id: string;
  siswa_id: string;
  kelas_id: string;
  guru_id: string;
  tanggal: string;
  status: 'hadir' | 'sakit' | 'izin' | 'alpa';
  keterangan: string | null;
  created_at: string;
}

const MuridDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [siswa, setSiswa] = useState<SiswaInfo | null>(null);
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [absensiHarian, setAbsensiHarian] = useState<AbsensiHarian[]>([]);
  const [loading, setLoading] = useState(true);
  const [classStudents, setClassStudents] = useState<ClassStudent[]>([]);
  const [jurnalKelas, setJurnalKelas] = useState<JurnalKelas[]>([]);
  const [tugasRumahTerbaru, setTugasRumahTerbaru] = useState<TugasRumahTerbaru | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  
  // State untuk form jurnal rumah
  const [showJurnalForm, setShowJurnalForm] = useState(false);
  const [isSubmittingJurnal, setIsSubmittingJurnal] = useState(false);
  const [tanggalJurnal, setTanggalJurnal] = useState(new Date().toISOString().split('T')[0]);
  const [sholatSubuh, setSholatSubuh] = useState(false);
  const [sholatDzuhur, setSholatDzuhur] = useState(false);
  const [sholatAshar, setSholatAshar] = useState(false);
  const [sholatMaghrib, setSholatMaghrib] = useState(false);
  const [sholatIsya, setSholatIsya] = useState(false);
  const [murojaahHafalan, setMurojaahHafalan] = useState('');
  const [murojaahTilawah, setMurojaahTilawah] = useState('');
  const [catatan, setCatatan] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      const { data: siswaData } = await supabase.from('siswa').select('id, nama, kelas, kelas_id').eq('id', id).maybeSingle();
      const { data: recordsData } = await supabase.from('daily_records').select('*').eq('siswa_id', id).order('tanggal', { ascending: false });
      
      // Fetch data absensi dari absensi_harian (prioritas baru)
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const { data: absensiData } = await (supabase as any)
        .from('absensi_harian')
        .select('*')
        .eq('siswa_id', id)
        .gte('tanggal', oneMonthAgo.toISOString().split('T')[0])
        .order('tanggal', { ascending: false });
      
      if (absensiData) {
        setAbsensiHarian(absensiData as AbsensiHarian[]);
      }
      
      if (siswaData) {
        setSiswa(siswaData);
        // Fetch jurnal_kelas for this class to get tugas_rumah (gunakan kelas_id UUID)
        const siswaKelasId = siswaData.kelas_id || siswaData.kelas; // fallback ke nama kelas jika kelas_id null
        const { data: jurnalData } = await supabase.from('jurnal_kelas' as any).select('id, kelas_id, tanggal, tugas_rumah').eq('kelas_id', siswaKelasId);
        if (jurnalData) setJurnalKelas(jurnalData as any);
        
        // Fetch tugas rumah terbaru untuk kelas ini (gunakan kelas_id UUID)
        const { data: tugasData } = await supabase
          .from('jurnal_kelas' as any)
          .select('id, tugas_rumah, tanggal, kelas_id')
          .eq('kelas_id', siswaKelasId)
          .not('tugas_rumah', 'is', null)
          .not('tugas_rumah', 'eq', '')
          .order('tanggal', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (tugasData) {
          setTugasRumahTerbaru(tugasData as any);
        }
        
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
          }).sort((a, b) => b.mumtazCount - a.mumtazCount).slice(0, 3); // Top 3
          
          setClassStudents(studentsWithStats);
        }
      }
      if (recordsData) setRecords(recordsData);
      setLoading(false);
    };
    fetchData();
    
    // Polling untuk auto-update setiap 30 detik
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
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

  // Handler submit jurnal rumah
  const handleSubmitJurnalRumah = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siswa) return;

    setIsSubmittingJurnal(true);

    const payload = {
      siswa_id: siswa.id,
      tanggal: tanggalJurnal,
      sholat_subuh: sholatSubuh,
      sholat_dzuhur: sholatDzuhur,
      sholat_ashar: sholatAshar,
      sholat_maghrib: sholatMaghrib,
      sholat_isya: sholatIsya,
      murojaah_hafalan: murojaahHafalan || null,
      murojaah_tilawah: murojaahTilawah || null,
      catatan: catatan || null,
    };

    const { error } = await supabase.from('jurnal_rumah').insert(payload);

    setIsSubmittingJurnal(false);

    if (error) {
      alert('Gagal menyimpan jurnal rumah: ' + error.message);
    } else {
      alert('Jurnal rumah berhasil disimpan!');
      // Reset form
      setSholatSubuh(false);
      setSholatDzuhur(false);
      setSholatAshar(false);
      setSholatMaghrib(false);
      setSholatIsya(false);
      setMurojaahHafalan('');
      setMurojaahTilawah('');
      setCatatan('');
      setShowJurnalForm(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Memuat...</p></div>;
  if (!siswa) return <div className="min-h-screen flex items-center justify-center"><p>Murid tidak ditemukan.</p></div>;

  const lastTwo = records.slice(0, 2);
  const lastTilawah = records.find(r => r.tilawah_surah || r.tilawah_ayat);
  const lastTilawahForCard = records.find(r => r.tilawah_surah || r.tilawah_ayat);

  // Calculate monthly attendance data from daily_records (legacy)
  // Hitung kehadiran dari absensi_harian (prioritas) atau daily_records (fallback)
  const getKehadiranCount = () => {
    if (absensiHarian.length > 0) {
      // Hitung dari absensi_harian - hanya yang statusnya 'hadir'
      return absensiHarian.filter(a => a.status === 'hadir').length;
    }
    // Fallback ke daily_records
    return records.length;
  };

  const monthlyData = (() => {
    // Prioritaskan data dari absensi_harian
    if (absensiHarian.length > 0) {
      const monthly: { [key: string]: number } = {};
      absensiHarian
        .filter(a => a.status === 'hadir')
        .forEach(a => {
          const month = a.tanggal.substring(0, 7); // YYYY-MM
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
    }
    
    // Fallback ke daily_records
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
        {/* Tugas Rumah Terbaru - Khusus untuk Kelas Murid Ini */}
        {tugasRumahTerbaru ? (
          <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs px-3 py-1 rounded-bl-lg font-medium animate-pulse">
              Terbaru
            </div>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="bg-amber-100 p-2 rounded-full flex-shrink-0">
                  <ClipboardList className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-amber-800 text-sm mb-1 flex items-center gap-1">
                    <Bell className="w-3 h-3" />
                    Tugas Rumah Terbaru
                  </h3>
                  <p className="text-amber-900 font-medium text-sm leading-relaxed mb-2">
                    {tugasRumahTerbaru.tugas_rumah}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-amber-700 bg-white/50 rounded-full px-2 py-1 w-fit">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(tugasRumahTerbaru.tanggal).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-dashed border-gray-300 bg-gray-50/50">
            <CardContent className="p-4 text-center">
              <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 italic">
                Belum ada tugas rumah untuk hari ini. Tetap semangat!
              </p>
            </CardContent>
          </Card>
        )}

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
                <p className="text-2xl font-bold">{getKehadiranCount()}</p>
                <p className="text-xs text-muted-foreground">
                  Kehadiran
                  {absensiHarian.length > 0 && (
                    <span className="block text-[10px] text-green-600">(dari absensi)</span>
                  )}
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <Star className="w-6 h-6 mx-auto text-accent mb-1" />
                <p className="text-2xl font-bold">{
                  records.reduce((count, r) => {
                    const hafalanMumtaz = r.hafalan_predikat === 'A' || r.hafalan_predikat === 'Mumtaz' ? 1 : 0;
                    const tilawahMumtaz = r.tilawah_predikat === 'A' || r.tilawah_predikat === 'Mumtaz' ? 1 : 0;
                    const jilidMumtaz = r.jilid_predikat === 'A' || r.jilid_predikat === 'Mumtaz' ? 1 : 0;
                    return count + hafalanMumtaz + tilawahMumtaz + jilidMumtaz;
                  }, 0)
                }</p>
                <p className="text-xs text-muted-foreground">Mumtaz</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {/* Jilid Terakhir */}
            {records.find(r => r.jilid_buku) && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">📕 Jilid Terakhir</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const r = records.find(rec => rec.jilid_buku);
                    const jurnalHariIni = r ? jurnalKelas.find(j => j.tanggal === r.tanggal) : null;
                    return r ? (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">{r.tanggal}</p>
                        <p className="text-sm font-semibold">{r.jilid_buku} Hal. {r.jilid_halaman}</p>
                        {r.jilid_predikat && <Badge className="text-xs bg-primary/10 text-primary">{r.jilid_predikat}</Badge>}
                        {jurnalHariIni?.tugas_rumah && (
                          <p className="text-xs text-amber-600 font-medium mt-1">� Tugas: {jurnalHariIni.tugas_rumah}</p>
                        )}
                      </div>
                    ) : null;
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Tilawah Terakhir */}
            {records.find(r => r.tilawah_surah || r.tilawah_ayat) && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">📖 Tilawah Terakhir</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const r = records.find(rec => rec.tilawah_surah || rec.tilawah_ayat);
                    const jurnalHariIni = r ? jurnalKelas.find(j => j.tanggal === r.tanggal) : null;
                    return r ? (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">{r.tanggal}</p>
                        <p className="text-sm font-semibold">{r.tilawah_surah || '-'} Ayat {r.tilawah_ayat || '-'}</p>
                        {r.tilawah_predikat && <Badge className="text-xs bg-primary/10 text-primary">{r.tilawah_predikat}</Badge>}
                        {jurnalHariIni?.tugas_rumah && (
                          <p className="text-xs text-amber-600 font-medium mt-1">📋 Tugas: {jurnalHariIni.tugas_rumah}</p>
                        )}
                      </div>
                    ) : null;
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Hafalan Terakhir */}
            {records.find(r => r.hafalan_surah) && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">🕌 Hafalan Terakhir</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const r = records.find(rec => rec.hafalan_surah);
                    const jurnalHariIni = r ? jurnalKelas.find(j => j.tanggal === r.tanggal) : null;
                    return r ? (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">{r.tanggal}</p>
                        <p className="text-sm font-semibold">{r.hafalan_surah} Ayat {r.hafalan_ayat}</p>
                        {r.hafalan_predikat && <Badge className="text-xs bg-primary/10 text-primary">{r.hafalan_predikat}</Badge>}
                        {jurnalHariIni?.tugas_rumah && (
                          <p className="text-xs text-amber-600 font-medium mt-1">📋 Tugas: {jurnalHariIni.tugas_rumah}</p>
                        )}
                      </div>
                    ) : null;
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Catatan Guru Terakhir */}
            {records.find(r => r.catatan_guru) && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">📝 Catatan Guru Terakhir</CardTitle>
                </CardHeader>
              </Card>
            )}

            {/* Tugas Rumah dari Guru */}
            {jurnalKelas.filter(j => j.tugas_rumah).length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">📋 Tugas Rumah dari Guru</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {jurnalKelas
                      .filter(j => j.tugas_rumah)
                      .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
                      .map((j) => (
                        <div key={j.id} className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-amber-700">{j.tugas_rumah}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(j.tanggal).toLocaleDateString('id-ID', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full whitespace-nowrap">
                              {new Date(j.tanggal).toLocaleDateString('id-ID')}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {records.length === 0 && jurnalKelas.length === 0 && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">Belum ada catatan.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Tombol Jurnal Rumah */}
          <Button 
            className="w-full bg-green-600 hover:bg-green-700 text-white" 
            onClick={() => setShowJurnalForm(!showJurnalForm)}
          >
            <Home className="w-4 h-4 mr-2" />
            {showJurnalForm ? 'Tutup Form Jurnal Rumah' : 'Isi Jurnal Rumah'}
          </Button>

          {/* Form Jurnal Rumah */}
          {showJurnalForm && (
            <Card className="border-2 border-green-200 bg-green-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Home className="w-5 h-5 text-green-600" />
                  Form Jurnal Rumah
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitJurnalRumah} className="space-y-4">
                  {/* Tanggal */}
                  <div>
                    <Label htmlFor="tanggal" className="text-sm">Tanggal</Label>
                    <Input
                      id="tanggal"
                      type="date"
                      value={tanggalJurnal}
                      onChange={(e) => setTanggalJurnal(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  {/* Sholat 5 Waktu */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Sholat 5 Waktu</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Subuh', state: sholatSubuh, setState: setSholatSubuh },
                        { label: 'Dzuhur', state: sholatDzuhur, setState: setSholatDzuhur },
                        { label: 'Ashar', state: sholatAshar, setState: setSholatAshar },
                        { label: 'Maghrib', state: sholatMaghrib, setState: setSholatMaghrib },
                        { label: 'Isya', state: sholatIsya, setState: setSholatIsya },
                      ].map((item) => (
                        <label key={item.label} className="flex items-center gap-2 p-2 bg-white rounded border cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={item.state}
                            onChange={(e) => item.setState(e.target.checked)}
                            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                          />
                          <span className="text-sm">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Murojaah Hafalan */}
                  <div>
                    <Label htmlFor="murojaahHafalan" className="text-sm">Murojaah Hafalan</Label>
                    <Textarea
                      id="murojaahHafalan"
                      placeholder="Contoh: Juz 30, Surat Al-Mulk Ayat 1-10"
                      value={murojaahHafalan}
                      onChange={(e) => setMurojaahHafalan(e.target.value)}
                      className="mt-1"
                      rows={2}
                    />
                  </div>

                  {/* Murojaah Tilawah */}
                  <div>
                    <Label htmlFor="murojaahTilawah" className="text-sm">Murojaah Tilawah</Label>
                    <Textarea
                      id="murojaahTilawah"
                      placeholder="Contoh: Halaman 25-30, Buku Jilid 3"
                      value={murojaahTilawah}
                      onChange={(e) => setMurojaahTilawah(e.target.value)}
                      className="mt-1"
                      rows={2}
                    />
                  </div>

                  {/* Catatan */}
                  <div>
                    <Label htmlFor="catatan" className="text-sm">Catatan Orang Tua</Label>
                    <Textarea
                      id="catatan"
                      placeholder="Tambahkan catatan jika ada..."
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      className="mt-1"
                      rows={2}
                    />
                  </div>

                  {/* Tombol Submit */}
                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    disabled={isSubmittingJurnal}
                  >
                    {isSubmittingJurnal ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Simpan Jurnal Rumah
                      </>
                    )}
                  </Button>
                </form>
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
