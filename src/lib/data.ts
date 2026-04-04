export type UserRole = 'guru' | 'siswa';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  kelas?: string;
  noHpOrtu?: string;
}

export type TilawahKategori = 'Jilid 1' | 'Jilid 2' | 'Jilid 3' | 'Jilid 4' | 'Jilid 5' | 'Tajwid' | 'Ghorib';
export type Status = 'Lancar' | 'Perlu Mengulang' | 'Murajaah';

export interface DailyRecord {
  id: string;
  siswaId: string;
  tanggal: string;
  tilpiKategori: TilawahKategori;
  tilpiHalaman: number;
  tahfidzJuz?: number;
  tahfidzSurah: string;
  tahfidzAyat: string;
  status: Status;
  catatan: string;
}


export const TILAWAH_KATEGORI: TilawahKategori[] = [
  'Jilid 1', 'Jilid 2', 'Jilid 3', 'Jilid 4', 'Jilid 5', 'Tajwid', 'Ghorib'
];

export const STATUS_OPTIONS: Status[] = ['Lancar', 'Perlu Mengulang', 'Murajaah'];

const DEMO_STUDENTS: User[] = [
  { id: 's1', name: 'Ahmad Fauzan', role: 'siswa', kelas: '5A', noHpOrtu: '6281234567001' },
  { id: 's2', name: 'Aisyah Putri', role: 'siswa', kelas: '5A', noHpOrtu: '6281234567002' },
  { id: 's3', name: 'Muhammad Rizki', role: 'siswa', kelas: '5A', noHpOrtu: '6281234567003' },
  { id: 's4', name: 'Fatimah Zahra', role: 'siswa', kelas: '5B', noHpOrtu: '6281234567004' },
  { id: 's5', name: 'Umar Hadi', role: 'siswa', kelas: '5B', noHpOrtu: '6281234567005' },
  { id: 's6', name: 'Khadijah Nur', role: 'siswa', kelas: '5B', noHpOrtu: '6281234567006' },
];

const DEMO_RECORDS: DailyRecord[] = [
  { id: 'r1', siswaId: 's1', tanggal: '2026-04-01', tilpiKategori: 'Jilid 3', tilpiHalaman: 15, tahfidzSurah: 'Al-Fatihah', tahfidzAyat: '1-7', status: 'Lancar', catatan: 'Bacaan sangat baik, tajwid benar.' },
  { id: 'r2', siswaId: 's1', tanggal: '2026-04-02', tilpiKategori: 'Jilid 3', tilpiHalaman: 16, tahfidzSurah: 'An-Nas', tahfidzAyat: '1-6', status: 'Lancar', catatan: '' },
  { id: 'r3', siswaId: 's1', tanggal: '2026-04-03', tilpiKategori: 'Jilid 3', tilpiHalaman: 17, tahfidzSurah: 'Al-Falaq', tahfidzAyat: '1-5', status: 'Murajaah', catatan: 'Perlu murajaah surah sebelumnya.' },
  { id: 'r4', siswaId: 's2', tanggal: '2026-04-01', tilpiKategori: 'Jilid 4', tilpiHalaman: 5, tahfidzSurah: 'Al-Ikhlas', tahfidzAyat: '1-4', status: 'Lancar', catatan: '' },
  { id: 'r5', siswaId: 's2', tanggal: '2026-04-02', tilpiKategori: 'Jilid 4', tilpiHalaman: 6, tahfidzSurah: 'Al-Lahab', tahfidzAyat: '1-5', status: 'Perlu Mengulang', catatan: 'Kesalahan pada ayat 3.' },
  { id: 'r6', siswaId: 's3', tanggal: '2026-04-01', tilpiKategori: 'Tajwid', tilpiHalaman: 2, tahfidzSurah: 'Al-Kautsar', tahfidzAyat: '1-3', status: 'Lancar', catatan: 'Tajwid sudah baik.' },
  { id: 'r7', siswaId: 's4', tanggal: '2026-04-01', tilpiKategori: 'Jilid 2', tilpiHalaman: 10, tahfidzSurah: 'Al-Fatihah', tahfidzAyat: '1-7', status: 'Lancar', catatan: '' },
  { id: 'r8', siswaId: 's5', tanggal: '2026-04-01', tilpiKategori: 'Jilid 1', tilpiHalaman: 20, tahfidzSurah: 'An-Nas', tahfidzAyat: '1-6', status: 'Murajaah', catatan: 'Terus semangat!' },
];

export function getStudents(): User[] {
  const stored = localStorage.getItem('quran_students');
  return stored ? JSON.parse(stored) : DEMO_STUDENTS;
}

export function getRecords(): DailyRecord[] {
  const stored = localStorage.getItem('quran_records');
  return stored ? JSON.parse(stored) : DEMO_RECORDS;
}

export function saveRecord(record: DailyRecord) {
  const records = getRecords();
  records.push(record);
  localStorage.setItem('quran_records', JSON.stringify(records));
}

export function getStudentRecords(siswaId: string): DailyRecord[] {
  return getRecords().filter(r => r.siswaId === siswaId);
}

export function getCurrentUser(): User | null {
  const stored = localStorage.getItem('quran_current_user');
  return stored ? JSON.parse(stored) : null;
}

export function setCurrentUser(user: User | null) {
  if (user) {
    localStorage.setItem('quran_current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('quran_current_user');
  }
}
