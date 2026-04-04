export interface SurahInfo {
  nama: string;
  jumlahAyat: number;
}

export interface JuzInfo {
  nomor: number;
  surah: SurahInfo[];
}

export const JUZ_DATA: JuzInfo[] = [
  {
    nomor: 1,
    surah: [
      { nama: 'Al-Fatihah', jumlahAyat: 7 },
      { nama: 'Al-Baqarah (1-141)', jumlahAyat: 141 },
    ],
  },
  {
    nomor: 2,
    surah: [
      { nama: 'Al-Baqarah (142-252)', jumlahAyat: 252 },
    ],
  },
  {
    nomor: 3,
    surah: [
      { nama: 'Al-Baqarah (253-286)', jumlahAyat: 286 },
      { nama: 'Ali Imran (1-92)', jumlahAyat: 92 },
    ],
  },
  {
    nomor: 4,
    surah: [
      { nama: 'Ali Imran (93-200)', jumlahAyat: 200 },
      { nama: 'An-Nisa (1-23)', jumlahAyat: 23 },
    ],
  },
  {
    nomor: 5,
    surah: [
      { nama: 'An-Nisa (24-147)', jumlahAyat: 147 },
    ],
  },
  {
    nomor: 6,
    surah: [
      { nama: 'An-Nisa (148-176)', jumlahAyat: 176 },
      { nama: 'Al-Maidah (1-81)', jumlahAyat: 81 },
    ],
  },
  {
    nomor: 7,
    surah: [
      { nama: 'Al-Maidah (82-120)', jumlahAyat: 120 },
      { nama: "Al-An'am (1-110)", jumlahAyat: 110 },
    ],
  },
  {
    nomor: 8,
    surah: [
      { nama: "Al-An'am (111-165)", jumlahAyat: 165 },
      { nama: "Al-A'raf (1-87)", jumlahAyat: 87 },
    ],
  },
  {
    nomor: 9,
    surah: [
      { nama: "Al-A'raf (88-206)", jumlahAyat: 206 },
      { nama: 'Al-Anfal (1-40)', jumlahAyat: 40 },
    ],
  },
  {
    nomor: 10,
    surah: [
      { nama: 'Al-Anfal (41-75)', jumlahAyat: 75 },
      { nama: 'At-Taubah (1-92)', jumlahAyat: 92 },
    ],
  },
  {
    nomor: 11,
    surah: [
      { nama: 'At-Taubah (93-129)', jumlahAyat: 129 },
      { nama: 'Yunus (1-109)', jumlahAyat: 109 },
      { nama: 'Hud (1-5)', jumlahAyat: 5 },
    ],
  },
  {
    nomor: 12,
    surah: [
      { nama: 'Hud (6-123)', jumlahAyat: 123 },
      { nama: 'Yusuf (1-52)', jumlahAyat: 52 },
    ],
  },
  {
    nomor: 13,
    surah: [
      { nama: 'Yusuf (53-111)', jumlahAyat: 111 },
      { nama: "Ar-Ra'd (1-43)", jumlahAyat: 43 },
      { nama: 'Ibrahim (1-52)', jumlahAyat: 52 },
    ],
  },
  {
    nomor: 14,
    surah: [
      { nama: 'Al-Hijr (1-99)', jumlahAyat: 99 },
      { nama: 'An-Nahl (1-128)', jumlahAyat: 128 },
    ],
  },
  {
    nomor: 15,
    surah: [
      { nama: "Al-Isra' (1-111)", jumlahAyat: 111 },
      { nama: 'Al-Kahf (1-74)', jumlahAyat: 74 },
    ],
  },
  {
    nomor: 16,
    surah: [
      { nama: 'Al-Kahf (75-110)', jumlahAyat: 110 },
      { nama: 'Maryam (1-98)', jumlahAyat: 98 },
      { nama: 'Taha (1-135)', jumlahAyat: 135 },
    ],
  },
  {
    nomor: 17,
    surah: [
      { nama: 'Al-Anbiya (1-112)', jumlahAyat: 112 },
      { nama: 'Al-Hajj (1-78)', jumlahAyat: 78 },
    ],
  },
  {
    nomor: 18,
    surah: [
      { nama: "Al-Mu'minun (1-118)", jumlahAyat: 118 },
      { nama: 'An-Nur (1-64)', jumlahAyat: 64 },
      { nama: 'Al-Furqan (1-20)', jumlahAyat: 20 },
    ],
  },
  {
    nomor: 19,
    surah: [
      { nama: 'Al-Furqan (21-77)', jumlahAyat: 77 },
      { nama: "Asy-Syu'ara (1-227)", jumlahAyat: 227 },
      { nama: 'An-Naml (1-55)', jumlahAyat: 55 },
    ],
  },
  {
    nomor: 20,
    surah: [
      { nama: 'An-Naml (56-93)', jumlahAyat: 93 },
      { nama: 'Al-Qasas (1-88)', jumlahAyat: 88 },
      { nama: 'Al-Ankabut (1-45)', jumlahAyat: 45 },
    ],
  },
  {
    nomor: 21,
    surah: [
      { nama: 'Al-Ankabut (46-69)', jumlahAyat: 69 },
      { nama: 'Ar-Rum (1-60)', jumlahAyat: 60 },
      { nama: 'Luqman (1-34)', jumlahAyat: 34 },
      { nama: 'As-Sajdah (1-30)', jumlahAyat: 30 },
      { nama: 'Al-Ahzab (1-30)', jumlahAyat: 30 },
    ],
  },
  {
    nomor: 22,
    surah: [
      { nama: 'Al-Ahzab (31-73)', jumlahAyat: 73 },
      { nama: "Saba' (1-54)", jumlahAyat: 54 },
      { nama: 'Fatir (1-45)', jumlahAyat: 45 },
      { nama: 'Yasin (1-27)', jumlahAyat: 27 },
    ],
  },
  {
    nomor: 23,
    surah: [
      { nama: 'Yasin (28-83)', jumlahAyat: 83 },
      { nama: 'As-Saffat (1-182)', jumlahAyat: 182 },
      { nama: 'Sad (1-88)', jumlahAyat: 88 },
      { nama: 'Az-Zumar (1-31)', jumlahAyat: 31 },
    ],
  },
  {
    nomor: 24,
    surah: [
      { nama: 'Az-Zumar (32-75)', jumlahAyat: 75 },
      { nama: 'Ghafir (1-85)', jumlahAyat: 85 },
      { nama: 'Fussilat (1-46)', jumlahAyat: 46 },
    ],
  },
  {
    nomor: 25,
    surah: [
      { nama: 'Fussilat (47-54)', jumlahAyat: 54 },
      { nama: 'Asy-Syura (1-53)', jumlahAyat: 53 },
      { nama: 'Az-Zukhruf (1-89)', jumlahAyat: 89 },
      { nama: 'Ad-Dukhan (1-59)', jumlahAyat: 59 },
      { nama: 'Al-Jasiyah (1-37)', jumlahAyat: 37 },
    ],
  },
  {
    nomor: 26,
    surah: [
      { nama: 'Al-Ahqaf (1-35)', jumlahAyat: 35 },
      { nama: 'Muhammad (1-38)', jumlahAyat: 38 },
      { nama: 'Al-Fath (1-29)', jumlahAyat: 29 },
      { nama: 'Al-Hujurat (1-18)', jumlahAyat: 18 },
      { nama: 'Qaf (1-45)', jumlahAyat: 45 },
      { nama: 'Az-Zariyat (1-30)', jumlahAyat: 30 },
    ],
  },
  {
    nomor: 27,
    surah: [
      { nama: 'Az-Zariyat (31-60)', jumlahAyat: 60 },
      { nama: 'At-Tur (1-49)', jumlahAyat: 49 },
      { nama: 'An-Najm (1-62)', jumlahAyat: 62 },
      { nama: 'Al-Qamar (1-55)', jumlahAyat: 55 },
      { nama: 'Ar-Rahman (1-78)', jumlahAyat: 78 },
      { nama: "Al-Waqi'ah (1-96)", jumlahAyat: 96 },
      { nama: 'Al-Hadid (1-29)', jumlahAyat: 29 },
    ],
  },
  {
    nomor: 28,
    surah: [
      { nama: 'Al-Mujadalah (1-22)', jumlahAyat: 22 },
      { nama: 'Al-Hasyr (1-24)', jumlahAyat: 24 },
      { nama: 'Al-Mumtahanah (1-13)', jumlahAyat: 13 },
      { nama: 'As-Saff (1-14)', jumlahAyat: 14 },
      { nama: "Al-Jumu'ah (1-11)", jumlahAyat: 11 },
      { nama: 'Al-Munafiqun (1-11)', jumlahAyat: 11 },
      { nama: 'At-Tagabun (1-18)', jumlahAyat: 18 },
      { nama: 'At-Talaq (1-12)', jumlahAyat: 12 },
      { nama: 'At-Tahrim (1-12)', jumlahAyat: 12 },
    ],
  },
  {
    nomor: 29,
    surah: [
      { nama: 'Al-Mulk (1-30)', jumlahAyat: 30 },
      { nama: 'Al-Qalam (1-52)', jumlahAyat: 52 },
      { nama: 'Al-Haqqah (1-52)', jumlahAyat: 52 },
      { nama: "Al-Ma'arij (1-44)", jumlahAyat: 44 },
      { nama: 'Nuh (1-28)', jumlahAyat: 28 },
      { nama: 'Al-Jinn (1-28)', jumlahAyat: 28 },
      { nama: 'Al-Muzzammil (1-20)', jumlahAyat: 20 },
      { nama: 'Al-Muddassir (1-56)', jumlahAyat: 56 },
      { nama: 'Al-Qiyamah (1-40)', jumlahAyat: 40 },
      { nama: 'Al-Insan (1-31)', jumlahAyat: 31 },
      { nama: 'Al-Mursalat (1-50)', jumlahAyat: 50 },
    ],
  },
  {
    nomor: 30,
    surah: [
      { nama: "An-Naba' (1-40)", jumlahAyat: 40 },
      { nama: "An-Nazi'at (1-46)", jumlahAyat: 46 },
      { nama: "'Abasa (1-42)", jumlahAyat: 42 },
      { nama: 'At-Takwir (1-29)', jumlahAyat: 29 },
      { nama: 'Al-Infitar (1-19)', jumlahAyat: 19 },
      { nama: 'Al-Mutaffifin (1-36)', jumlahAyat: 36 },
      { nama: 'Al-Insyiqaq (1-25)', jumlahAyat: 25 },
      { nama: 'Al-Buruj (1-22)', jumlahAyat: 22 },
      { nama: 'At-Tariq (1-17)', jumlahAyat: 17 },
      { nama: "Al-A'la (1-19)", jumlahAyat: 19 },
      { nama: 'Al-Ghasyiyah (1-26)', jumlahAyat: 26 },
      { nama: 'Al-Fajr (1-30)', jumlahAyat: 30 },
      { nama: 'Al-Balad (1-20)', jumlahAyat: 20 },
      { nama: 'Asy-Syams (1-15)', jumlahAyat: 15 },
      { nama: 'Al-Lail (1-21)', jumlahAyat: 21 },
      { nama: 'Ad-Duha (1-11)', jumlahAyat: 11 },
      { nama: 'Al-Insyirah (1-8)', jumlahAyat: 8 },
      { nama: 'At-Tin (1-8)', jumlahAyat: 8 },
      { nama: "Al-'Alaq (1-19)", jumlahAyat: 19 },
      { nama: 'Al-Qadr (1-5)', jumlahAyat: 5 },
      { nama: 'Al-Bayyinah (1-8)', jumlahAyat: 8 },
      { nama: 'Az-Zalzalah (1-8)', jumlahAyat: 8 },
      { nama: "Al-'Adiyat (1-11)", jumlahAyat: 11 },
      { nama: "Al-Qari'ah (1-11)", jumlahAyat: 11 },
      { nama: 'At-Takasur (1-8)', jumlahAyat: 8 },
      { nama: "Al-'Asr (1-3)", jumlahAyat: 3 },
      { nama: 'Al-Humazah (1-9)', jumlahAyat: 9 },
      { nama: 'Al-Fil (1-5)', jumlahAyat: 5 },
      { nama: 'Quraisy (1-4)', jumlahAyat: 4 },
      { nama: "Al-Ma'un (1-7)", jumlahAyat: 7 },
      { nama: 'Al-Kausar (1-3)', jumlahAyat: 3 },
      { nama: 'Al-Kafirun (1-6)', jumlahAyat: 6 },
      { nama: 'An-Nasr (1-3)', jumlahAyat: 3 },
      { nama: 'Al-Lahab (1-5)', jumlahAyat: 5 },
      { nama: 'Al-Ikhlas (1-4)', jumlahAyat: 4 },
      { nama: 'Al-Falaq (1-5)', jumlahAyat: 5 },
      { nama: 'An-Nas (1-6)', jumlahAyat: 6 },
    ],
  },
];

export function getSurahByJuz(juzNomor: number): SurahInfo[] {
  const juz = JUZ_DATA.find(j => j.nomor === juzNomor);
  return juz ? juz.surah : [];
}
