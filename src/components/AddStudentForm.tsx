import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { X, UserPlus, Upload, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface Props {
  kelasId: string;
  kelasNama: string;
  onClose: () => void;
  onSuccess: () => void;
}

const AddStudentForm = ({ kelasId, kelasNama, onClose, onSuccess }: Props) => {
  const { toast } = useToast();
  const [mode, setMode] = useState<'manual' | 'excel'>('manual');
  const [nis, setNis] = useState('');
  const [nama, setNama] = useState('');
  const [noHpOrtu, setNoHpOrtu] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleDownloadTemplate = () => {
    const template = [
      { NIS: '12345', Nama: 'Contoh Nama Murid', 'No HP Ortu': '6281234567890' },
      { NIS: '12346', Nama: 'Contoh Nama Murid 2', 'No HP Ortu': '' },
    ];
    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Murid');
    XLSX.writeFile(workbook, 'template_murid.xlsx');
  };

  const handleManualSubmit = async () => {
    if (!nama.trim()) {
      toast({ title: 'Masukkan nama murid!', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('siswa').insert({
      nis: nis.trim() || null,
      nama: nama.trim(),
      kelas: kelasNama,
      kelas_id: kelasId,
      no_hp_ortu: noHpOrtu || null,
      user_id: null,
    } as any);
    setSubmitting(false);
    if (error) {
      toast({ title: 'Gagal', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Berhasil!', description: `Murid ${nama} ditambahkan.` });
    setNis('');
    setNama('');
    setNoHpOrtu('');
    onSuccess();
    onClose();
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubmitting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { cellDates: true });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      
      // Debug: log sheet info
      console.log('Sheet names:', workbook.SheetNames);
      console.log('Sheet range:', sheet['!ref']);
      
      // Convert with header option to get object with column names as keys
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
      
      console.log('Raw rows:', rows);
      
      if (rows.length < 2) {
        toast({ title: 'File kosong atau tidak ada header!', variant: 'destructive' });
        setSubmitting(false);
        return;
      }

      // Get header row (first row)
      const headers = rows[0].map((h: any) => String(h).toLowerCase().trim());
      console.log('Headers found:', headers);
      
      // Find column indices (case-insensitive matching)
      const nisIndex = headers.findIndex(h => h === 'nis' || h === 'nomor induk' || h === 'nomor induk siswa');
      const namaIndex = headers.findIndex(h => h === 'nama' || h === 'name' || h === 'nama lengkap');
      const noHpIndex = headers.findIndex(h => h === 'no hp ortu' || h === 'no hp' || h === 'nohp' || h === 'hp ortu' || h === 'telepon');
      
      if (namaIndex === -1) {
        toast({ 
          title: 'Format Excel salah!', 
          description: `Kolom "Nama" tidak ditemukan. Kolom tersedia: ${headers.join(', ')}`,
          variant: 'destructive' 
        });
        setSubmitting(false);
        return;
      }

      // Extract data rows (skip header)
      const dataRows = rows.slice(1);
      const inserts = dataRows
        .filter(row => {
          const nama = row[namaIndex];
          return nama && String(nama).trim();
        })
        .map(row => ({
          nis: nisIndex >= 0 && row[nisIndex] ? String(row[nisIndex]).trim() : null,
          nama: String(row[namaIndex]).trim(),
          kelas: kelasNama,
          kelas_id: kelasId,
          no_hp_ortu: noHpIndex >= 0 && row[noHpIndex] ? String(row[noHpIndex]).trim() : null,
          user_id: null,
        }));

      console.log('Insert data:', inserts);

      if (inserts.length === 0) {
        toast({ title: 'Tidak ada data murid yang valid!', variant: 'destructive' });
        setSubmitting(false);
        return;
      }

      const { error } = await supabase.from('siswa').insert(inserts as any);
      if (error) throw error;

      toast({ title: 'Berhasil!', description: `${inserts.length} murid ditambahkan dari Excel.` });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Excel upload error:', err);
      toast({ title: 'Gagal upload', description: err.message, variant: 'destructive' });
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md border-0 shadow-2xl animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Tambah Murid — {kelasNama}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button variant={mode === 'manual' ? 'default' : 'outline'} size="sm" onClick={() => setMode('manual')} className={mode === 'manual' ? 'gradient-hero text-primary-foreground' : ''}>
              Manual
            </Button>
            <Button variant={mode === 'excel' ? 'default' : 'outline'} size="sm" onClick={() => setMode('excel')} className={mode === 'excel' ? 'gradient-hero text-primary-foreground' : ''}>
              <Upload className="w-3 h-3 mr-1" /> Upload Excel
            </Button>
          </div>

          {mode === 'manual' ? (
            <>
              <div>
                <Label className="text-xs">NIS (Nomor Induk Siswa) - opsional</Label>
                <Input value={nis} onChange={e => setNis(e.target.value)} placeholder="Contoh: 12345" />
              </div>
              <div>
                <Label className="text-xs">Nama Lengkap *</Label>
                <Input value={nama} onChange={e => setNama(e.target.value)} placeholder="Masukkan nama murid" />
              </div>
              <div>
                <Label className="text-xs">No. HP Orang Tua (opsional)</Label>
                <Input value={noHpOrtu} onChange={e => setNoHpOrtu(e.target.value)} placeholder="6281234567890" />
              </div>
              <Button className="w-full gradient-hero text-primary-foreground" onClick={handleManualSubmit} disabled={submitting}>
                <UserPlus className="w-4 h-4 mr-2" />
                {submitting ? 'Menambahkan...' : 'Tambah Murid'}
              </Button>
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Upload file Excel (.xlsx) dengan kolom: <strong>NIS</strong> (opsional), <strong>Nama</strong> (wajib), <strong>No HP Ortu</strong> (opsional).
              </p>
              <Button size="sm" variant="outline" onClick={handleDownloadTemplate} className="w-full">
                <Download className="w-3 h-3 mr-1" /> Download Template Excel
              </Button>
              <Input type="file" accept=".xlsx,.xls" onChange={handleExcelUpload} disabled={submitting} />
              {submitting && <p className="text-sm text-muted-foreground text-center">Memproses...</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AddStudentForm;
