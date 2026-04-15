export type UserRole = 'guru' | 'siswa' | 'admin';

export type Predikat = 'A' | 'B' | 'C' | 'D';
export type JenisSetoran = 'Ziyadah' | 'Murajaah' | 'Talaqqi/Aradh';

export const PREDIKAT_OPTIONS: { value: Predikat; label: string }[] = [
  { value: 'A', label: 'A - Mumtaz (Sangat Baik)' },
  { value: 'B', label: 'B - Jayyid Jiddan (Baik Sekali)' },
  { value: 'C', label: 'C - Jayyid (Baik)' },
  { value: 'D', label: 'D - Maqbul (Cukup)' },
];

export const JENIS_SETORAN_OPTIONS: { value: JenisSetoran; label: string }[] = [
  { value: 'Ziyadah', label: 'Ziyadah (Hafalan Baru)' },
  { value: 'Murajaah', label: 'Murajaah (Ulang Hafalan Lama)' },
  { value: 'Talaqqi/Aradh', label: 'Talaqqi/Aradh (Simakan Guru)' },
];

export const JILID_OPTIONS = ['Jilid 1', 'Jilid 2', 'Jilid 3', 'Jilid 4', 'Jilid 5'];

export function getPredikatLabel(value: string): string {
  const found = PREDIKAT_OPTIONS.find(p => p.value === value);
  return found ? found.label : value;
}
