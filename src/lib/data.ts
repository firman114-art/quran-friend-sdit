export type UserRole = 'guru' | 'siswa' | 'admin';

export type Predikat = 'Mumtaz' | 'Jayyid Jiddan' | 'Jayyid' | 'Maqbul';
export type JenisSetoran = 'Ziyadah' | 'Murojaa' | 'Talaqqi';

export const PREDIKAT_OPTIONS: { value: Predikat; label: string }[] = [
  { value: 'Mumtaz', label: 'Mumtaz (Sangat Baik)' },
  { value: 'Jayyid Jiddan', label: 'Jayyid Jiddan (Baik Sekali)' },
  { value: 'Jayyid', label: 'Jayyid (Baik)' },
  { value: 'Maqbul', label: 'Maqbul (Cukup)' },
];

export const JENIS_SETORAN_OPTIONS: { value: JenisSetoran; label: string }[] = [
  { value: 'Ziyadah', label: 'Ziyadah (Hafalan Baru)' },
  { value: 'Murojaa', label: 'Murojaa (Ulang Hafalan Lama)' },
  { value: 'Talaqqi', label: 'Talaqqi (Simakan Guru)' },
];

export const JILID_OPTIONS = ['Jilid 1', 'Jilid 2', 'Jilid 3', 'Jilid 4', 'Jilid 5'];

export function getPredikatLabel(value: string): string {
  const found = PREDIKAT_OPTIONS.find(p => p.value === value);
  return found ? found.label : value;
}
