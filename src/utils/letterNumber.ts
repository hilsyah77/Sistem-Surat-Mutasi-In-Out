/**
 * Utility untuk penomoran surat resmi madrasah
 * Mengambil format dari Pengaturan Lembaga (letterFormatIn & letterFormatOut)
 */

const ROMAN_MONTHS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

/**
 * Menghasilkan nomor urut berikutnya dari daftar mutasi yang ada
 */
export function getNextSequenceNumber(transfers?: Array<{ letterNumber?: string }>): number {
  if (!transfers || transfers.length === 0) return 1;

  let maxNum = 0;
  for (const t of transfers) {
    if (!t.letterNumber) continue;
    // Mencari angka nomor urut di dalam nomor surat (contoh: 042, 142, 168)
    const matches = t.letterNumber.match(/\b\d+\b/g);
    if (matches) {
      for (const m of matches) {
        const num = parseInt(m, 10);
        // Abaikan tahun seperti 2024, 2025, 2026 dan kode klasifikasi > 999
        if (num > 0 && num < 1000 && num !== 2024 && num !== 2025 && num !== 2026) {
          if (num > maxNum) maxNum = num;
        }
      }
    }
  }

  return maxNum > 0 ? maxNum + 1 : transfers.length + 1;
}

/**
 * Memformat nomor surat resmi madrasah berdasarkan pola format dari Pengaturan Lembaga.
 * Mendukung variabel:
 * - {NO} atau {NOMOR} atau {NO_URUT} : Nomor urut (3 digit, contoh: 001, 042, 145)
 * - {BULAN} : Bulan 2 digit (contoh: 01 s.d. 12)
 * - {ROMAN_BULAN} : Bulan angka romawi (contoh: I s.d. XII)
 * - {TAHUN} atau {THN} : Tahun 4 digit (contoh: 2026)
 */
export function generateLetterNumber(
  pattern: string | undefined,
  seqNumber: number = 1,
  date: Date = new Date()
): string {
  const defaultPattern = 'MTs.01.05/PP.00.5/{NO}/2026';
  const rawPattern = pattern && pattern.trim() ? pattern.trim() : defaultPattern;

  const monthIndex = date.getMonth();
  const monthNum = String(monthIndex + 1).padStart(2, '0');
  const monthRoman = ROMAN_MONTHS[monthIndex];
  const year = String(date.getFullYear());
  const seqPadded = String(seqNumber).padStart(3, '0');

  let result = rawPattern
    .replace(/\{NO\}/gi, seqPadded)
    .replace(/\{NOMOR\}/gi, seqPadded)
    .replace(/\{NO_URUT\}/gi, seqPadded)
    .replace(/\{BULAN\}/gi, monthNum)
    .replace(/\{ROMAN_BULAN\}/gi, monthRoman)
    .replace(/\{TAHUN\}/gi, year)
    .replace(/\{THN\}/gi, year);

  // Jika pattern belum mengandung nomor urut sama sekali dan berakhiran tanda garis miring
  if (!rawPattern.includes('{NO}') && !rawPattern.includes('{NOMOR}') && !rawPattern.includes('{NO_URUT}')) {
    if (result.endsWith('/')) {
      result = `${result}${seqPadded}/${year}`;
    }
  }

  return result;
}
