import { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Trash2 } from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

interface JurnalRow {
  id: string;
  tanggal: string;
  hafalan: string | null;
  tilawah: string | null;
  tulisan: string | null;
  materi_pendamping: string | null;
  jumlah_hadir: number | null;
  jumlah_sakit: number | null;
  jumlah_izin: number | null;
  jumlah_alpa: number | null;
  tugas_rumah: string | null;
  catatan_kelas: string | null;
}

interface JurnalRecapProps {
  jurnals: JurnalRow[];
  kelasNama: string;
  onDelete?: (id: string) => void;
}

const JurnalRecap = ({ jurnals, kelasNama, onDelete }: JurnalRecapProps) => {
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
    
    pdf.save(`rekap-jurnal-${kelasNama}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const formatTanggal = (tanggal: string) => {
    const date = new Date(tanggal);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Rekap Jurnal Kelas — {kelasNama}</CardTitle>
        <Button size="sm" variant="outline" onClick={handleDownloadPDF}>
          <Download className="w-4 h-4 mr-1" /> Download PDF
        </Button>
      </CardHeader>
      <CardContent>
        <div ref={tableRef} className="bg-white p-4">
          <div className="mb-4 text-center">
            <h2 className="text-lg font-bold">REKAP JURNAL KELAS</h2>
            <p className="text-sm text-gray-600">Kelas: {kelasNama}</p>
            <p className="text-xs text-gray-500">
              Periode: {jurnals.length > 0 ? formatTanggal(jurnals[jurnals.length - 1].tanggal) : '-'} s/d {jurnals.length > 0 ? formatTanggal(jurnals[0].tanggal) : '-'}
            </p>
          </div>
          
          {jurnals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Belum ada jurnal kelas untuk direkap.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table className="border">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="border text-xs font-semibold w-24">Tanggal</TableHead>
                    <TableHead className="border text-xs font-semibold">Hafalan</TableHead>
                    <TableHead className="border text-xs font-semibold">Tilawah</TableHead>
                    <TableHead className="border text-xs font-semibold">Tulisan</TableHead>
                    <TableHead className="border text-xs font-semibold">Materi Pendamping</TableHead>
                    <TableHead className="border text-xs font-semibold w-20 text-center">Hadir</TableHead>
                    <TableHead className="border text-xs font-semibold w-20 text-center">Sakit</TableHead>
                    <TableHead className="border text-xs font-semibold w-20 text-center">Izin</TableHead>
                    <TableHead className="border text-xs font-semibold w-20 text-center">Alpa</TableHead>
                    <TableHead className="border text-xs font-semibold">Tugas Rumah</TableHead>
                    <TableHead className="border text-xs font-semibold">Catatan Kelas</TableHead>
                    <TableHead className="border text-xs font-semibold w-16 text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jurnals.map((jurnal) => (
                    <TableRow key={jurnal.id} className="text-xs">
                      <TableCell className="border whitespace-nowrap">
                        {formatTanggal(jurnal.tanggal)}
                      </TableCell>
                      <TableCell className="border max-w-[120px] truncate">
                        {jurnal.hafalan || '-'}
                      </TableCell>
                      <TableCell className="border max-w-[120px] truncate">
                        {jurnal.tilawah || '-'}
                      </TableCell>
                      <TableCell className="border max-w-[120px] truncate">
                        {jurnal.tulisan || '-'}
                      </TableCell>
                      <TableCell className="border max-w-[120px] truncate">
                        {jurnal.materi_pendamping || '-'}
                      </TableCell>
                      <TableCell className="border text-center">
                        {jurnal.jumlah_hadir || 0}
                      </TableCell>
                      <TableCell className="border text-center">
                        {jurnal.jumlah_sakit || 0}
                      </TableCell>
                      <TableCell className="border text-center">
                        {jurnal.jumlah_izin || 0}
                      </TableCell>
                      <TableCell className="border text-center">
                        {jurnal.jumlah_alpa || 0}
                      </TableCell>
                      <TableCell className="border max-w-[100px] truncate">
                        {jurnal.tugas_rumah || '-'}
                      </TableCell>
                      <TableCell className="border max-w-[100px] truncate">
                        {jurnal.catatan_kelas || '-'}
                      </TableCell>
                      <TableCell className="border text-center">
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => onDelete(jurnal.id)}
                            title="Hapus jurnal"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default JurnalRecap;
