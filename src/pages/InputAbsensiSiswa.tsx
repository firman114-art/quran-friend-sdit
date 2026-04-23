import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, CheckCircle2, ArrowLeft, Users, CalendarDays } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface KelasRow {
  id: string;
  nama_kelas: string;
  guru_id: string;
}

interface SiswaRow {
  id: string;
  nama: string;
  kelas_id: string | null;
  nis: string | null;
}

interface AbsensiRecord {
  siswa_id: string;
  hadir: boolean;
  status: 'hadir' | 'sakit' | 'izin' | 'alpa';
  keterangan: string;
}

const InputAbsensiSiswa = () => {
  const navigate = useNavigate();
  const { profile, guruData, loading } = useAuth();
  const { toast } = useToast();

  const [kelasList, setKelasList] = useState<KelasRow[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<string>('');
  const [students, setStudents] = useState<SiswaRow[]>([]);
  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [absensiData, setAbsensiData] = useState<Record<string, AbsensiRecord>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!profile || profile.role !== 'guru')) {
      navigate('/');
    }
  }, [loading, profile, navigate]);

  useEffect(() => {
    if (guruData) fetchKelas();
  }, [guruData]);

  useEffect(() => {
    if (selectedKelas) {
      fetchStudents();
    }
  }, [selectedKelas]);

  const fetchKelas = async () => {
    if (!guruData) return;
    const { data } = await supabase
      .from('kelas')
      .select('*')
      .eq('guru_id', guruData.id)
      .order('nama_kelas');
    if (data) {
      setKelasList(data as any);
      if (data.length > 0 && !selectedKelas) {
        setSelectedKelas(data[0].id);
      }
    }
    setIsLoading(false);
  };

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('siswa')
      .select('id, nama, kelas_id, nis')
      .eq('kelas_id', selectedKelas)
      .order('nama');

    if (error) {
      toast({
        title: 'Error',
        description: 'Gagal memuat data siswa',
        variant: 'destructive',
      });
      return;
    }

    if (data) {
      setStudents(data as any);
      // Initialize absensi data with all students marked as hadir
      const initialAbsensi: Record<string, AbsensiRecord> = {};
      data.forEach((siswa) => {
        initialAbsensi[siswa.id] = {
          siswa_id: siswa.id,
          hadir: true,
          status: 'hadir',
          keterangan: '',
        };
      });
      setAbsensiData(initialAbsensi);
    }
  };

  const handleToggleHadir = (siswaId: string) => {
    setAbsensiData((prev) => {
      const current = prev[siswaId];
      const newHadir = !current.hadir;
      return {
        ...prev,
        [siswaId]: {
          ...current,
          hadir: newHadir,
          status: newHadir ? 'hadir' : 'sakit', // default to sakit when unchecked
        },
      };
    });
  };

  const handleStatusChange = (siswaId: string, status: 'sakit' | 'izin' | 'alpa') => {
    setAbsensiData((prev) => ({
      ...prev,
      [siswaId]: {
        ...prev[siswaId],
        status,
      },
    }));
  };

  const handleKeteranganChange = (siswaId: string, keterangan: string) => {
    setAbsensiData((prev) => ({
      ...prev,
      [siswaId]: {
        ...prev[siswaId],
        keterangan,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!guruData || !selectedKelas) {
      toast({
        title: 'Error',
        description: 'Pilih kelas terlebih dahulu',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    const absensiRecords = Object.values(absensiData).map((record) => ({
      siswa_id: record.siswa_id,
      kelas_id: selectedKelas,
      guru_id: guruData.id,
      tanggal: tanggal,
      status: record.status,
      keterangan: record.keterangan || null,
    }));

    // Check if absensi already exists for this date and class
    const { data: existingData, error: checkError } = await supabase
      .from('absensi_harian' as any)
      .select('siswa_id')
      .eq('kelas_id', selectedKelas)
      .eq('tanggal', tanggal);

    // If table doesn't exist or RLS policy blocks read, show helpful message
    if (checkError && (checkError.code === '42P01' || checkError.code === '403' || checkError.message?.includes('permission denied'))) {
      toast({
        title: 'Database Belum Siap',
        description: 'Tabel absensi_harian belum dibuat atau RLS policy belum diatur. Silakan buat tabel di Supabase terlebih dahulu.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    if (existingData && existingData.length > 0) {
      // Delete existing records for this date and class
      const { error: deleteError } = await supabase
        .from('absensi_harian' as any)
        .delete()
        .eq('kelas_id', selectedKelas)
        .eq('tanggal', tanggal);
      
      if (deleteError) {
        toast({
          title: 'Error',
          description: 'Gagal mengupdate data lama: ' + deleteError.message,
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
    }

    // Insert new records
    const { error } = await supabase
      .from('absensi_harian' as any)
      .insert(absensiRecords as any);

    if (error) {
      if (error.code === '403' || error.message?.includes('permission denied') || error.message?.includes('violates row-level security')) {
        toast({
          title: 'Akses Ditolak',
          description: 'Anda tidak memiliki izin untuk menyimpan absensi. Pastikan tabel absensi_harian sudah dibuat dan RLS policy diatur dengan benar di Supabase.',
          variant: 'destructive',
        });
      } else if (error.code === '42P01' || error.message?.includes('does not exist')) {
        toast({
          title: 'Tabel Belum Ada',
          description: 'Tabel absensi_harian belum dibuat. Silakan jalankan SQL setup di Supabase terlebih dahulu.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Gagal menyimpan absensi: ' + error.message,
          variant: 'destructive',
        });
      }
      setIsSubmitting(false);
      return;
    }

    toast({
      title: 'Berhasil',
      description: `Absensi untuk ${students.length} siswa telah disimpan`,
    });

    // Update rekap_jurnal_kelas dengan ringkasan absensi
    await updateRekapJurnalAbsensi();

    // Sinkronisasi ke daily_records untuk kompatibilitas dengan sistem lama
    await syncToDailyRecords();

    setIsSubmitting(false);
  };

  const handleMarkAllHadir = () => {
    const newAbsensiData: Record<string, AbsensiRecord> = {};
    students.forEach((siswa) => {
      newAbsensiData[siswa.id] = {
        siswa_id: siswa.id,
        hadir: true,
        status: 'hadir',
        keterangan: absensiData[siswa.id]?.keterangan || '',
      };
    });
    setAbsensiData(newAbsensiData);
  };

  // Fungsi untuk update ringkasan absensi di rekap_jurnal_kelas
  const updateRekapJurnalAbsensi = async () => {
    if (!selectedKelas || !tanggal) return;
    
    // Hitung ringkasan absensi
    const counts = { hadir: 0, sakit: 0, izin: 0, alpa: 0 };
    Object.values(absensiData).forEach((a) => {
      if (a.status === 'hadir') counts.hadir++;
      else if (a.status === 'sakit') counts.sakit++;
      else if (a.status === 'izin') counts.izin++;
      else if (a.status === 'alpa') counts.alpa++;
    });
    
    const absensiSummary = `H:${counts.hadir}, S:${counts.sakit}, I:${counts.izin}, A:${counts.alpa}`;
    
    // Cek apakah sudah ada rekap untuk tanggal dan kelas ini
    const { data: existingRekap } = await (supabase as any)
      .from('rekap_jurnal_kelas')
      .select('id')
      .eq('kelas_id', selectedKelas)
      .eq('tanggal', tanggal)
      .maybeSingle();
    
    if (existingRekap) {
      // Update absensi yang sudah ada
      const { error } = await (supabase as any)
        .from('rekap_jurnal_kelas')
        .update({ absensi: absensiSummary })
        .eq('id', existingRekap.id);
      
      if (error) {
        console.error('Error updating rekap absensi:', error);
      }
    }
    // Jika belum ada rekap, tidak perlu buat baru - absensi sudah tersimpan di tabel absensi_harian
    // dan akan muncul saat guru membuat jurnal kelas
  };

  // Fungsi untuk sinkronisasi kehadiran ke daily_records (sistem lama)
  const syncToDailyRecords = async () => {
    if (!selectedKelas || !tanggal || !guruData) return;
    
    // Ambil semua siswa yang hadir (status = 'hadir')
    const hadirRecords = Object.values(absensiData).filter((a) => a.status === 'hadir');
    
    if (hadirRecords.length === 0) return;
    
    // Hapus data lama di daily_records untuk tanggal ini (untuk siswa di kelas ini)
    // Kita perlu cari siswa_id yang termasuk kelas ini
    const siswaIds = hadirRecords.map((r) => r.siswa_id);
    
    // Hapus existing records untuk tanggal ini
    await (supabase as any)
      .from('daily_records')
      .delete()
      .in('siswa_id', siswaIds)
      .eq('tanggal', tanggal);
    
    // Insert baru untuk siswa yang hadir
    const dailyRecords = hadirRecords.map((record) => ({
      siswa_id: record.siswa_id,
      tanggal: tanggal,
      guru_id: guruData.id,
      hafalan_surah: null,
      hafalan_ayat: null,
      hafalan_predikat: null,
      tilawah_surah: null,
      tilawah_ayat: null,
      tilawah_predikat: null,
      jilid_buku: null,
      jilid_halaman: null,
      jilid_predikat: null,
      catatan_guru: `Hadir - absensi dari form ceklis`,
    }));
    
    const { error } = await (supabase as any)
      .from('daily_records')
      .insert(dailyRecords);
    
    if (error) {
      console.error('Error syncing to daily_records:', error);
    } else {
      console.log(`Synced ${dailyRecords.length} records to daily_records`);
    }
  };

  const countHadir = Object.values(absensiData).filter((a) => a.hadir).length;
  const countTidakHadir = Object.values(absensiData).filter((a) => !a.hadir).length;

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/guru')}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Kembali
            </Button>
            <h1 className="text-lg font-semibold">Input Absensi Siswa</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Filter Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Pilih Kelas dan Tanggal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kelas</Label>
                <Select value={selectedKelas} onValueChange={setSelectedKelas}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    {kelasList.map((kelas) => (
                      <SelectItem key={kelas.id} value={kelas.id}>
                        {kelas.nama_kelas}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tanggal</Label>
                <Input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {students.length > 0 && (
          <>
            {/* Summary Card */}
            <Card className="mb-4">
              <CardContent className="py-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Total Siswa:</span>
                      <span className="font-semibold ml-1">{students.length}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-green-600">Hadir:</span>
                      <span className="font-semibold ml-1 text-green-600">{countHadir}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-red-600">Tidak Hadir:</span>
                      <span className="font-semibold ml-1 text-red-600">{countTidakHadir}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleMarkAllHadir}>
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Tandai Semua Hadir
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Absensi Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Daftar Siswa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-12 text-center">No</TableHead>
                        <TableHead className="border">NIS</TableHead>
                        <TableHead className="border">Nama Siswa</TableHead>
                        <TableHead className="border text-center w-24">Hadir</TableHead>
                        <TableHead className="border">Status</TableHead>
                        <TableHead className="border">Keterangan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((siswa, index) => {
                        const absensi = absensiData[siswa.id];
                        return (
                          <TableRow key={siswa.id} className={!absensi?.hadir ? 'bg-red-50' : ''}>
                            <TableCell className="text-center">{index + 1}</TableCell>
                            <TableCell className="border">{siswa.nis || '-'}</TableCell>
                            <TableCell className="border font-medium">{siswa.nama}</TableCell>
                            <TableCell className="border text-center">
                              <Checkbox
                                checked={absensi?.hadir}
                                onCheckedChange={() => handleToggleHadir(siswa.id)}
                                className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                              />
                            </TableCell>
                            <TableCell className="border">
                              {!absensi?.hadir ? (
                                <Select
                                  value={absensi?.status}
                                  onValueChange={(value: 'sakit' | 'izin' | 'alpa') =>
                                    handleStatusChange(siswa.id, value)
                                  }
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="sakit">Sakit</SelectItem>
                                    <SelectItem value="izin">Izin</SelectItem>
                                    <SelectItem value="alpa">Alpa</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <span className="text-green-600 font-medium">Hadir</span>
                              )}
                            </TableCell>
                            <TableCell className="border">
                              {!absensi?.hadir && (
                                <Input
                                  placeholder="Keterangan (opsional)"
                                  value={absensi?.keterangan || ''}
                                  onChange={(e) =>
                                    handleKeteranganChange(siswa.id, e.target.value)
                                  }
                                  className="text-sm"
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Submit Button */}
                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || students.length === 0}
                    size="lg"
                    className="min-w-[200px]"
                  >
                    {isSubmitting ? (
                      'Menyimpan...'
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Simpan Absensi
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {students.length === 0 && selectedKelas && !isLoading && (
          <Card>
            <CardContent className="py-8 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Tidak ada siswa di kelas ini</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default InputAbsensiSiswa;
