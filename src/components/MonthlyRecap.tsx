import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Download, Calendar } from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

interface SiswaRow {
  id: string;
  nama: string;
  kelas: string;
}

interface RecordRow {
  id: string;
  siswa_id: string;
  tanggal: string;
  hafalan_surah: string | null;
  hafalan_ayat: string | null;
  hafalan_predikat: string | null;
  tilawah_surah: string | null;
  tilawah_ayat: string | null;
  tilawah_predikat: string | null;
  jilid_buku: string | null;
  jilid_halaman: number | null;
  jilid_predikat: string | null;
  catatan_guru: string | null;
}

interface Props {
  students: SiswaRow[];
  records: RecordRow[];
  kelasNama: string;
}

const MonthlyRecap = ({ students, records, kelasNama }: Props) => {
  const [bulan, setBulan] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [jumlahPertemuan, setJumlahPertemuan] = useState('');
  const recapRef = useRef<HTMLDivElement>(null);

  const totalPertemuan = jumlahPertemuan ? parseInt(jumlahPertemuan) : 0;
  const monthRecords = records.filter(r => r.tanggal.startsWith(bulan));

  const studentRecaps = students.map(s => {
    const sRecords = monthRecords.filter(r => r.siswa_id === s.id);
    const kehadiran = new Set(sRecords.map(r => r.tanggal)).size;
    const persentase = totalPertemuan > 0 ? Math.round((kehadiran / totalPertemuan) * 100) : 0;
    const lastHafalan = sRecords.find(r => r.hafalan_surah);
    const lastTilawah = sRecords.find(r => r.tilawah_surah);
    const lastJilid = sRecords.find(r => r.jilid_buku);
    return { ...s, kehadiran, persentase, lastHafalan, lastTilawah, lastJilid, totalRecords: sRecords.length };
  });

  const handleDownloadPDF = async () => {
    if (!recapRef.current) return;
    const canvas = await html2canvas(recapRef.current, { scale: 2, useCORS: true });
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let y = 10;
    if (imgHeight <= 270) {
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, y, imgWidth, imgHeight);
    } else {
      // Multi-page
      const pageHeight = 270;
      let remaining = imgHeight;
      let srcY = 0;
      while (remaining > 0) {
        const sliceH = Math.min(pageHeight, remaining);
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = (sliceH / imgHeight) * canvas.height;
        const ctx = sliceCanvas.getContext('2d')!;
        ctx.drawImage(canvas, 0, srcY, canvas.width, sliceCanvas.height, 0, 0, canvas.width, sliceCanvas.height);
        pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', 10, 10, imgWidth, sliceH);
        remaining -= sliceH;
        srcY += sliceCanvas.height;
        if (remaining > 0) pdf.addPage();
      }
    }
    pdf.save(`Rekap_${kelasNama}_${bulan}.pdf`);
  };

  const handleDownloadJPEG = async () => {
    if (!recapRef.current) return;
    const canvas = await html2canvas(recapRef.current, { scale: 2, useCORS: true });
    const link = document.createElement('a');
    link.download = `Rekap_${kelasNama}_${bulan}.jpeg`;
    link.href = canvas.toDataURL('image/jpeg', 0.9);
    link.click();
  };

  const monthLabel = new Date(bulan + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Bulan</Label>
              <Input type="month" value={bulan} onChange={e => setBulan(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Jumlah Pertemuan</Label>
              <Input type="number" placeholder="0" value={jumlahPertemuan} onChange={e => setJumlahPertemuan(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleDownloadPDF} className="flex-1">
              <Download className="w-3 h-3 mr-1" /> PDF
            </Button>
            <Button size="sm" variant="outline" onClick={handleDownloadJPEG} className="flex-1">
              <Download className="w-3 h-3 mr-1" /> JPEG
            </Button>
          </div>
        </CardContent>
      </Card>

      <div ref={recapRef} className="space-y-3 bg-background p-3">
        <div className="text-center mb-4">
          <h3 className="font-bold text-lg">Rekap Bulanan — {kelasNama}</h3>
          <p className="text-sm text-muted-foreground">{monthLabel}</p>
          {totalPertemuan > 0 && <p className="text-xs text-muted-foreground">Total Pertemuan: {totalPertemuan}</p>}
        </div>

        {studentRecaps.map(s => (
          <Card key={s.id} className="border shadow-sm">
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">{s.nama}</p>
                <Badge variant="outline" className="text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  {s.kehadiran}{totalPertemuan > 0 ? `/${totalPertemuan} (${s.persentase}%)` : ' hadir'}
                </Badge>
              </div>
              <div className="grid grid-cols-1 gap-1 text-xs">
                {s.lastHafalan && (
                  <p>🕌 Hafalan terakhir: {s.lastHafalan.hafalan_surah} Ay. {s.lastHafalan.hafalan_ayat}
                    {s.lastHafalan.hafalan_predikat && <Badge className="ml-1 text-[10px] bg-primary/10 text-primary">{s.lastHafalan.hafalan_predikat}</Badge>}
                  </p>
                )}
                {s.lastTilawah && (
                  <p>📖 Tilawah terakhir: {s.lastTilawah.tilawah_surah} Ay. {s.lastTilawah.tilawah_ayat}
                    {s.lastTilawah.tilawah_predikat && <Badge className="ml-1 text-[10px] bg-primary/10 text-primary">{s.lastTilawah.tilawah_predikat}</Badge>}
                  </p>
                )}
                {s.lastJilid && (
                  <p>📕 Jilid terakhir: {s.lastJilid.jilid_buku} Hal. {s.lastJilid.jilid_halaman}
                    {s.lastJilid.jilid_predikat && <Badge className="ml-1 text-[10px] bg-primary/10 text-primary">{s.lastJilid.jilid_predikat}</Badge>}
                  </p>
                )}
                {!s.lastHafalan && !s.lastTilawah && !s.lastJilid && (
                  <p className="text-muted-foreground">Belum ada catatan bulan ini.</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MonthlyRecap;
