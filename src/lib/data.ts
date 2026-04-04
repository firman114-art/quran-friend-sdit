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
  tahfidzSurah: string;
  tahfidzAyat: string;
  status: Status;
  catatan: string;
}

export const SURAH_LIST = [
  'Al-Fatihah', 'Al-Baqarah', 'Ali Imran', 'An-Nisa', 'Al-Maidah',
  'Al-An\'am', 'Al-A\'raf', 'Al-Anfal', 'At-Taubah', 'Yunus',
  'Hud', 'Yusuf', 'Ar-Ra\'d', 'Ibrahim', 'Al-Hijr',
  'An-Nahl', 'Al-Isra', 'Al-Kahf', 'Maryam', 'Taha',
  'Al-Anbiya', 'Al-Hajj', 'Al-Mu\'minun', 'An-Nur', 'Al-Furqan',
  'Asy-Syu\'ara', 'An-Naml', 'Al-Qasas', 'Al-Ankabut', 'Ar-Rum',
  'Luqman', 'As-Sajdah', 'Al-Ahzab', 'Saba', 'Fatir',
  'Yasin', 'As-Saffat', 'Sad', 'Az-Zumar', 'Ghafir',
  'Fussilat', 'Asy-Syura', 'Az-Zukhruf', 'Ad-Dukhan', 'Al-Jasiyah',
  'Al-Ahqaf', 'Muhammad', 'Al-Fath', 'Al-Hujurat', 'Qaf',
  'Az-Zariyat', 'At-Tur', 'An-Najm', 'Al-Qamar', 'Ar-Rahman',
  'Al-Waqi\'ah', 'Al-Hadid', 'Al-Mujadalah', 'Al-Hasyr', 'Al-Mumtahanah',
  'As-Saff', 'Al-Jumu\'ah', 'Al-Munafiqun', 'At-Tagabun', 'At-Talaq',
  'At-Tahrim', 'Al-Mulk', 'Al-Qalam', 'Al-Haqqah', 'Al-Ma\'arij',
  'Nuh', 'Al-Jinn', 'Al-Muzzammil', 'Al-Muddassir', 'Al-Qiyamah',
  'Al-Insan', 'Al-Mursalat', 'An-Naba', 'An-Nazi\'at', 'Abasa',
  'At-Takwir', 'Al-Infitar', 'Al-Mutaffifin', 'Al-Insyiqaq', 'Al-Buruj',
  'At-Tariq', 'Al-A\'la', 'Al-Ghasyiyah', 'Al-Fajr', 'Al-Balad',
  'Asy-Syams', 'Al-Lail', 'Ad-Duha', 'Al-Insyirah', 'At-Tin',
  'Al-Alaq', 'Al-Qadr', 'Al-Bayyinah', 'Az-Zalzalah', 'Al-Adiyat',
  'Al-Qari\'ah', 'At-Takasur', 'Al-Asr', 'Al-Humazah', 'Al-Fil',
  'Quraisy', 'Al-Ma\'un', 'Al-Kausar', 'Al-Kafirun', 'An-Nasr',
  'Al-Lahab', 'Al-Ikhlas', 'Al-Falaq', 'An-Nas',
];

export const TILAWAH_KATEGORI: TilawahKategori[] = [
  'Jilid 1', 'Jilid 2', 'Jilid 3', 'Jilid 4', 'Jilid 5', 'Tajwid', 'Ghorib'
];

export const STATUS_OPTIONS: Status[] = ['Lancar', 'Perlu Mengulang', 'Murajaah'];

const DEMO_STUDENTS: User[] = [
  { id: 's1', name: 'Ahmad Fauzan', role: 'siswa', kelas: '5A' },
  { id: 's2', name: 'Aisyah Putri', role: 'siswa', kelas: '5A' },
  { id: 's3', name: 'Muhammad Rizki', role: 'siswa', kelas: '5A' },
  { id: 's4', name: 'Fatimah Zahra', role: 'siswa', kelas: '5B' },
  { id: 's5', name: 'Umar Hadi', role: 'siswa', kelas: '5B' },
  { id: 's6', name: 'Khadijah Nur', role: 'siswa', kelas: '5B' },
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
