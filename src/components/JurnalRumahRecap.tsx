import { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Trash2, Check, X } from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

interface JurnalRumahRow {
  id: string;
  tanggal: string;
  siswa_id: string;
  sholat_subuh: boolean | null;
  sholat_dzuhur: boolean | null;
  sholat_ashar: boolean | null;
  sholat_maghrib: boolean | null;
  sholat_isya: boolean | null;
  murojaah_hafalan: string | null;
  murojaah_tilawah: string | null;
  hafalan_surah: string | null;
  hafalan_ayat: string | null;
  tilawah_surah: string | null;
  tilawah_ayat: string | null;
  jilid_buku: string | null;
  jilid_halaman: number | null;
  catatan: string | null;
}

interface Siswa {
  id: string;
  nama: string;
}

interface JurnalRumahRecapProps {
  jurnals: JurnalRumahRow[];
  students: Siswa[];
  kelasNama: string;
  onDelete?: (id: string) => void;
}

const JurnalRumahRecap = ({ jurnals, students, kelasNama, onDelete }: JurnalRumahRecapProps) => {
  const tableRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!tableRef.current) return;
    
    const canvas = await html2canvas(tableRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', 'a4');
    
    const imgWidth = 297;
    const pageHeight = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    pdf.save(`rekap-jurnal-rumah-${kelasNama}.pdf`);
  };

  const getStudentName = (siswaId: string) => {
    const student = students.find(s => s.id === siswaId);
    return student?.nama || 'Unknown';
  };

  const PrayerStatus = ({ checked }: { checked: boolean | null }) => (
    checked ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-gray-300" />
  );

  if (jurnals.length === 0) return null;

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Rekap Jurnal Rumah — {kelasNama}</CardTitle>
        <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
          <Download className="w-4 h-4 mr-1" /> PDF
        </Button>
      </CardHeader>
      <CardContent>
        <div ref={tableRef} className="overflow-x-auto">
          <Table className="border text-xs">
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="border">Tanggal</TableHead>
                <TableHead className="border">Nama Murid</TableHead>
                <TableHead className="border text-center">Subuh</TableHead>
                <TableHead className="border text-center">Dzuhur</TableHead>
                <TableHead className="border text-center">Ashar</TableHead>
                <TableHead className="border text-center">Maghrib</TableHead>
                <TableHead className="border text-center">Isya</TableHead>
                <TableHead className="border">Murojaah Hafalan</TableHead>
                <TableHead className="border">Murojaah Tilawah</TableHead>
                <TableHead className="border">Hafalan</TableHead>
                <TableHead className="border">Tilawah</TableHead>
                <TableHead className="border">Jilid</TableHead>
                <TableHead className="border">Catatan</TableHead>
                {onDelete && <TableHead className="border">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {jurnals.map((jurnal) => (
                <TableRow key={jurnal.id}>
                  <TableCell className="border whitespace-nowrap">
                    {new Date(jurnal.tanggal).toLocaleDateString('id-ID')}
                  </TableCell>
                  <TableCell className="border font-medium">
                    {getStudentName(jurnal.siswa_id)}
                  </TableCell>
                  <TableCell className="border text-center">
                    <PrayerStatus checked={jurnal.sholat_subuh} />
                  </TableCell>
                  <TableCell className="border text-center">
                    <PrayerStatus checked={jurnal.sholat_dzuhur} />
                  </TableCell>
                  <TableCell className="border text-center">
                    <PrayerStatus checked={jurnal.sholat_ashar} />
                  </TableCell>
                  <TableCell className="border text-center">
                    <PrayerStatus checked={jurnal.sholat_maghrib} />
                  </TableCell>
                  <TableCell className="border text-center">
                    <PrayerStatus checked={jurnal.sholat_isya} />
                  </TableCell>
                  <TableCell className="border max-w-[120px] truncate">
                    {jurnal.murojaah_hafalan || '-'}
                  </TableCell>
                  <TableCell className="border max-w-[120px] truncate">
                    {jurnal.murojaah_tilawah || '-'}
                  </TableCell>
                  <TableCell className="border">
                    {jurnal.hafalan_surah ? (
                      <span>{jurnal.hafalan_surah} {jurnal.hafalan_ayat}</span>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="border">
                    {jurnal.tilawah_surah ? (
                      <span>{jurnal.tilawah_surah} {jurnal.tilawah_ayat}</span>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="border">
                    {jurnal.jilid_buku ? (
                      <span>{jurnal.jilid_buku} Hal.{jurnal.jilid_halaman}</span>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="border max-w-[150px] truncate">
                    {jurnal.catatan || '-'}
                  </TableCell>
                  {onDelete && (
                    <TableCell className="border">
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => onDelete(jurnal.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default JurnalRumahRecap;
