import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Home, Send, Calendar, Search } from 'lucide-react';

interface Siswa {
  id: string;
  nama: string;
  kelas: string;
}

interface Kelas {
  id: string;
  nama_kelas: string;
}

const JurnalRumahForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  // URL params for pre-selected student
  const preselectedSiswaId = searchParams.get('siswa');
  
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [selectedKelas, setSelectedKelas] = useState('');
  const [searchName, setSearchName] = useState('');
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
  
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [hafalanSurah, setHafalanSurah] = useState('');
  const [hafalanAyat, setHafalanAyat] = useState('');
  const [tilawahSurah, setTilawahSurah] = useState('');
  const [tilawahAyat, setTilawahAyat] = useState('');
  const [jilidBuku, setJilidBuku] = useState('');
  const [jilidHalaman, setJilidHalaman] = useState('');
  const [catatan, setCatatan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchKelas();
  }, []);

  useEffect(() => {
    if (selectedKelas) {
      fetchSiswa();
    }
  }, [selectedKelas]);

  useEffect(() => {
    if (preselectedSiswaId && siswaList.length > 0) {
      const siswa = siswaList.find(s => s.id === preselectedSiswaId);
      if (siswa) {
        setSelectedSiswa(siswa);
        setSearchName(siswa.nama);
      }
    }
  }, [preselectedSiswaId, siswaList]);

  const fetchKelas = async () => {
    const { data } = await supabase.from('kelas').select('id, nama_kelas').order('nama_kelas');
    if (data) setKelasList(data as any);
  };

  const fetchSiswa = async () => {
    const { data } = await supabase
      .from('siswa')
      .select('id, nama, kelas')
      .eq('kelas_id', selectedKelas)
      .order('nama');
    if (data) setSiswaList(data as any);
  };

  const filteredSiswa = siswaList.filter(s => 
    s.nama.toLowerCase().includes(searchName.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSiswa) {
      toast({ title: 'Error', description: 'Pilih murid terlebih dahulu', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from('jurnal_rumah').insert({
      siswa_id: selectedSiswa.id,
      tanggal,
      hafalan_surah: hafalanSurah || null,
      hafalan_ayat: hafalanAyat || null,
      tilawah_surah: tilawahSurah || null,
      tilawah_ayat: tilawahAyat || null,
      jilid_buku: jilidBuku || null,
      jilid_halaman: jilidHalaman ? parseInt(jilidHalaman) : null,
      catatan: catatan || null,
    });

    setIsSubmitting(false);

    if (error) {
      toast({ title: 'Gagal', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Berhasil', description: 'Jurnal rumah telah disimpan!' });
      // Reset form
      setHafalanSurah('');
      setHafalanAyat('');
      setTilawahSurah('');
      setTilawahAyat('');
      setJilidBuku('');
      setJilidHalaman('');
      setCatatan('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/20 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center gradient-hero text-primary-foreground rounded-t-lg">
            <div className="flex justify-center mb-2">
              <Home className="w-10 h-10" />
            </div>
            <CardTitle className="text-2xl">Jurnal Rumah Murid</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Catat hafalan, tilawah, dan jilid yang dikerjakan di rumah
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {/* Student Selection */}
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <h3 className="font-medium flex items-center gap-2">
                <Search className="w-4 h-4" /> Pilih Murid
              </h3>
              
              <div>
                <Label>Kelas</Label>
                <Select value={selectedKelas} onValueChange={setSelectedKelas}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kelas..." />
                  </SelectTrigger>
                  <SelectContent>
                    {kelasList.map(k => (
                      <SelectItem key={k.id} value={k.id}>{k.nama_kelas}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedKelas && (
                <div>
                  <Label>Cari Nama Murid</Label>
                  <Input 
                    placeholder="Ketik nama murid..."
                    value={searchName}
                    onChange={(e) => {
                      setSearchName(e.target.value);
                      setSelectedSiswa(null);
                    }}
                  />
                  {searchName && !selectedSiswa && filteredSiswa.length > 0 && (
                    <div className="mt-2 border rounded-md max-h-40 overflow-y-auto">
                      {filteredSiswa.map(s => (
                        <button
                          key={s.id}
                          className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                          onClick={() => {
                            setSelectedSiswa(s);
                            setSearchName(s.nama);
                          }}
                        >
                          {s.nama}
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedSiswa && (
                    <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                      ✓ {selectedSiswa.nama}
                    </p>
                  )}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Tanggal
                </Label>
                <Input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} required />
              </div>

              {/* Hafalan */}
              <div className="p-4 border rounded-lg space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" /> Hafalan
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Surah</Label>
                    <Input 
                      placeholder="Contoh: Al-Baqarah"
                      value={hafalanSurah}
                      onChange={e => setHafalanSurah(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Ayat</Label>
                    <Input 
                      placeholder="Contoh: 1-5"
                      value={hafalanAyat}
                      onChange={e => setHafalanAyat(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Tilawah */}
              <div className="p-4 border rounded-lg space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" /> Tilawah
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Surah</Label>
                    <Input 
                      placeholder="Contoh: Ali Imran"
                      value={tilawahSurah}
                      onChange={e => setTilawahSurah(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Ayat</Label>
                    <Input 
                      placeholder="Contoh: 10-20"
                      value={tilawahAyat}
                      onChange={e => setTilawahAyat(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Jilid */}
              <div className="p-4 border rounded-lg space-y-3">
                <h4 className="font-medium">Jilid</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Buku</Label>
                    <Input 
                      placeholder="Contoh: Jilid 1"
                      value={jilidBuku}
                      onChange={e => setJilidBuku(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Halaman</Label>
                    <Input 
                      type="number"
                      placeholder="Contoh: 15"
                      value={jilidHalaman}
                      onChange={e => setJilidHalaman(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Catatan */}
              <div>
                <Label>Catatan (Opsional)</Label>
                <Textarea 
                  placeholder="Catatan tambahan..."
                  value={catatan}
                  onChange={e => setCatatan(e.target.value)}
                  rows={3}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full gradient-hero text-primary-foreground"
                disabled={isSubmitting || !selectedSiswa}
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Menyimpan...' : 'Kirim Jurnal'}
              </Button>
            </form>

            <div className="text-center text-xs text-muted-foreground pt-4 border-t">
              <p>Guru dapat melihat jurnal ini di dashboard kelas</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JurnalRumahForm;
