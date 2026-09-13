import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Trash2, 
  Sparkles, 
  FileCheck,
  Info,
  Mars,
  Venus
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Student, Gender, StudentStatus } from '../types';

interface StudentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedStudents: Student[]) => void;
  existingStudents: Student[];
}

interface ParsedRow {
  id: string;
  nis: string;
  nisn: string;
  name: string;
  gender: Gender;
  classId: string;
  birthPlace: string;
  birthDate: string;
  parentName: string;
  parentPhone: string;
  address: string;
  status: StudentStatus;
  notes: string;
  isValid: boolean;
  validationMessage: string;
}

const SAMPLE_DEMO_ROWS: Omit<ParsedRow, 'id' | 'isValid' | 'validationMessage'>[] = [
  {
    nis: '1021',
    nisn: '0089234101',
    name: 'Ahmad Faiz Al-Habsyi',
    gender: 'L',
    classId: 'Kelas 7A',
    birthPlace: 'Padang',
    birthDate: '2012-04-15',
    parentName: 'H. Syukri Al-Habsyi',
    parentPhone: '081267891234',
    address: 'Jl. Khatib Sulaiman No. 45, Padang',
    status: 'Aktif',
    notes: '',
  },
  {
    nis: '1022',
    nisn: '0089234102',
    name: 'Nabila Khairunnisa',
    gender: 'P',
    classId: 'Kelas 7B',
    birthPlace: 'Bukittinggi',
    birthDate: '2012-08-20',
    parentName: 'Drs. Ridwan Hakim',
    parentPhone: '081378904321',
    address: 'Jl. Hamka No. 18, Bukittinggi',
    status: 'Aktif',
    notes: '',
  },
  {
    nis: '1023',
    nisn: '0089234103',
    name: 'Muhammad Rayhan Pratama',
    gender: 'L',
    classId: 'Kelas 8A',
    birthPlace: 'Solok',
    birthDate: '2011-02-10',
    parentName: 'Bambang Irawan',
    parentPhone: '082189012345',
    address: 'Jl. Sudirman No. 89, Solok',
    status: 'Aktif',
    notes: '',
  },
  {
    nis: '1024',
    nisn: '0089234104',
    name: 'Zahra Aulia Rahmah',
    gender: 'P',
    classId: 'Kelas 8B',
    birthPlace: 'Padang Panjang',
    birthDate: '2011-11-28',
    parentName: 'M. Yusuf Rahmah',
    parentPhone: '085290123456',
    address: 'Jl. Sutan Syahrir No. 12',
    status: 'Aktif',
    notes: '',
  },
  {
    nis: '1025',
    nisn: '0089234105',
    name: 'Fikri Haikal Ramadhan',
    gender: 'L',
    classId: 'Kelas 9A',
    birthPlace: 'Pariaman',
    birthDate: '2010-09-05',
    parentName: 'H. Herman Syah',
    parentPhone: '081299887766',
    address: 'Jl. Imam Bonjol No. 34, Pariaman',
    status: 'Aktif',
    notes: '',
  }
];

export const StudentUploadModal: React.FC<StudentUploadModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  existingStudents,
}) => {
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const validateStudentRow = (
    row: Partial<ParsedRow>, 
    existingNISList: Set<string>
  ): { isValid: boolean; message: string } => {
    if (!row.name || row.name.trim() === '') {
      return { isValid: false, message: 'Nama siswa wajib diisi' };
    }
    if (!row.nis || row.nis.trim() === '') {
      return { isValid: false, message: 'NIS wajib diisi' };
    }
    if (existingNISList.has(row.nis.trim())) {
      return { isValid: false, message: `NIS ${row.nis} sudah terdaftar di sistem` };
    }
    if (row.gender !== 'L' && row.gender !== 'P') {
      return { isValid: false, message: 'Jenis kelamin harus L atau P' };
    }
    return { isValid: true, message: 'Siap diimpor' };
  };

  const processFile = (file: File) => {
    setIsProcessing(true);
    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(1) + ' KB');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!json || json.length < 2) {
          alert('Berkas kosong atau tidak memiliki baris data!');
          setIsProcessing(false);
          return;
        }

        // Header mapping
        const headers = json[0].map(h => String(h || '').trim().toLowerCase());
        const getColIndex = (keywords: string[]) => {
          return headers.findIndex(h => keywords.some(k => h.includes(k)));
        };

        const idxNis = getColIndex(['nis', 'nomor induk siswa']);
        const idxNisn = getColIndex(['nisn']);
        const idxName = getColIndex(['nama', 'nama lengkap', 'siswa']);
        const idxGender = getColIndex(['gender', 'jk', 'jenis kelamin', 'l/p']);
        const idxClass = getColIndex(['kelas', 'rombel']);
        const idxBirthPlace = getColIndex(['tempat lahir', 'tmp_lahir', 'tempat']);
        const idxBirthDate = getColIndex(['tanggal lahir', 'tgl_lahir', 'tgl lahir']);
        const idxParent = getColIndex(['orang tua', 'wali', 'nama ortu', 'ayah']);
        const idxPhone = getColIndex(['telepon', 'hp', 'whatsapp', 'no hp', 'wa']);
        const idxAddress = getColIndex(['alamat', 'domisili']);
        const idxStatus = getColIndex(['status']);
        const idxNotes = getColIndex(['catatan', 'keterangan']);

        const existingNIS = new Set<string>(existingStudents.map(s => s.nis));
        const results: ParsedRow[] = [];

        for (let i = 1; i < json.length; i++) {
          const row = json[i];
          if (!row || row.length === 0 || row.every(cell => cell === undefined || cell === '')) continue;

          const rawNis = String(row[idxNis >= 0 ? idxNis : 0] || '').trim();
          const rawNisn = String(row[idxNisn >= 0 ? idxNisn : 1] || '').trim();
          const rawName = String(row[idxName >= 0 ? idxName : 2] || '').trim();
          let rawGender: Gender = 'L';
          const genderStr = String(row[idxGender >= 0 ? idxGender : 3] || '').trim().toUpperCase();
          if (genderStr.startsWith('P') || genderStr.includes('PEREMPUAN')) rawGender = 'P';

          const rawClass = String(row[idxClass >= 0 ? idxClass : 4] || 'Kelas 7A').trim();
          const birthPlace = String(row[idxBirthPlace >= 0 ? idxBirthPlace : 5] || 'Padang').trim();
          const birthDate = String(row[idxBirthDate >= 0 ? idxBirthDate : 6] || '2012-01-01').trim();
          const parentName = String(row[idxParent >= 0 ? idxParent : 7] || '').trim();
          const parentPhone = String(row[idxPhone >= 0 ? idxPhone : 8] || '').trim();
          const address = String(row[idxAddress >= 0 ? idxAddress : 9] || '').trim();

          let rawStatus: StudentStatus = 'Aktif';
          const statusStr = String(row[idxStatus >= 0 ? idxStatus : 10] || '').trim();
          if (statusStr.includes('Mutasi Keluar')) rawStatus = 'Mutasi Keluar';
          else if (statusStr.includes('Mutasi Masuk')) rawStatus = 'Mutasi Masuk';
          else if (statusStr.includes('Lulus')) rawStatus = 'Lulus';

          const notes = idxNotes >= 0 ? String(row[idxNotes] || '').trim() : '';

          const validation = validateStudentRow(
            { name: rawName, nis: rawNis, gender: rawGender },
            existingNIS
          );

          results.push({
            id: `st-import-${Date.now()}-${i}`,
            nis: rawNis,
            nisn: rawNisn,
            name: rawName,
            gender: rawGender,
            classId: rawClass.startsWith('Kelas') ? rawClass : `Kelas ${rawClass}`,
            birthPlace,
            birthDate,
            parentName: parentName || 'Orang Tua Siswa',
            parentPhone: parentPhone || '-',
            address: address || '-',
            status: rawStatus,
            notes,
            isValid: validation.isValid,
            validationMessage: validation.message,
          });

          if (rawNis) existingNIS.add(rawNis);
        }

        setParsedRows(results);
      } catch (err: any) {
        alert('Gagal memproses berkas: ' + (err.message || 'Format tidak dikenali'));
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleLoadDemoData = () => {
    const existingNIS = new Set<string>(existingStudents.map(s => s.nis));
    const demoItems: ParsedRow[] = SAMPLE_DEMO_ROWS.map((demo, idx) => {
      const validation = validateStudentRow(
        { name: demo.name, nis: demo.nis, gender: demo.gender },
        existingNIS
      );
      if (demo.nis) existingNIS.add(demo.nis);

      return {
        ...demo,
        id: `st-demo-${Date.now()}-${idx}`,
        isValid: validation.isValid,
        validationMessage: validation.message,
      };
    });

    setFileName('Data_Contoh_Siswa_Baru_2026.xlsx');
    setFileSize('14.2 KB');
    setParsedRows(demoItems);
  };

  const handleDownloadTemplate = () => {
    const templateHeaders = [
      'NIS',
      'NISN',
      'Nama Lengkap',
      'Jenis Kelamin (L/P)',
      'Kelas',
      'Tempat Lahir',
      'Tanggal Lahir (YYYY-MM-DD)',
      'Nama Orang Tua',
      'No WhatsApp',
      'Alamat',
      'Status'
    ];

    const sampleRow1 = [
      '1031',
      '0089211001',
      'Aisyah Rahmadani',
      'P',
      'Kelas 7A',
      'Padang',
      '2012-06-12',
      'H. Hendra Saputra',
      '081267890001',
      'Jl. Melati No. 15, Padang',
      'Aktif'
    ];

    const sampleRow2 = [
      '1032',
      '0089211002',
      'Muhammad Al-Ghifari',
      'L',
      'Kelas 7B',
      'Solok',
      '2012-03-25',
      'Drs. M. Ilham',
      '081378901112',
      'Jl. Ahmad Yani No. 8, Solok',
      'Aktif'
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([templateHeaders, sampleRow1, sampleRow2]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Format Import Siswa');
    XLSX.writeFile(workbook, 'Format_Import_Siswa_SIM_Madrasah.xlsx');
  };

  const handleRemoveRow = (id: string) => {
    setParsedRows(prev => prev.filter(r => r.id !== id));
  };

  const handleConfirmImport = () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      alert('Tidak ada data siswa yang valid untuk diimpor.');
      return;
    }

    const studentsToSave: Student[] = validRows.map(r => ({
      id: r.id,
      nis: r.nis,
      nisn: r.nisn,
      name: r.name,
      gender: r.gender,
      classId: r.classId,
      birthPlace: r.birthPlace,
      birthDate: r.birthDate,
      parentName: r.parentName,
      parentPhone: r.parentPhone,
      address: r.address,
      status: r.status,
      notes: r.notes,
    }));

    onImportSuccess(studentsToSave);
    onClose();
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const invalidCount = parsedRows.filter(r => !r.isValid).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-[28px] shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 font-bold shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-serif font-bold tracking-tight text-white">
                  Unggah & Impor Data Siswa
                </h3>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded-full border border-amber-400/30 font-mono">
                  EXCEL / CSV
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Impor banyak data siswa sekaligus ke Buku Induk Siswa standar EMIS madrasah
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Action Row: Download Template & Load Demo */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Gunakan format resmi madrasah atau coba contoh data instan:</span>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-amber-600" />
                <span>Unduh Format Excel (.xlsx)</span>
              </button>
              <button
                type="button"
                onClick={handleLoadDemoData}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Muat Contoh Data Uji (5 Siswa)</span>
              </button>
            </div>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition flex flex-col items-center justify-center ${
              isDragging
                ? 'border-amber-500 bg-amber-50/50'
                : 'border-slate-300 hover:border-slate-500 bg-white'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3 shadow-xs">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-slate-800 mb-1">
              Tarik & Lepas Berkas Excel (.xlsx, .xls, .csv) ke Sini
            </p>
            <p className="text-xs text-slate-500 mb-3">
              atau klik untuk memilih berkas dari komputer Anda
            </p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg">
              Kolom wajib: NIS, Nama Lengkap, Jenis Kelamin (L/P), Kelas
            </span>
          </div>

          {/* Preview Table & Validation Summary */}
          {parsedRows.length > 0 && (
            <div className="space-y-3 pt-2">
              {/* Summary Stats Pill */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 bg-slate-100 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>Berkas: <span className="font-mono">{fileName}</span> ({fileSize})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {validCount} Siap Impor
                  </span>
                  {invalidCount > 0 && (
                    <span className="px-2.5 py-1 bg-rose-100 text-rose-800 font-bold rounded-lg border border-rose-200 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {invalidCount} Perlu Ditinjau
                    </span>
                  )}
                  <span className="px-2.5 py-1 bg-white text-slate-700 font-bold rounded-lg border border-slate-200">
                    Total: {parsedRows.length} Data
                  </span>
                </div>
              </div>

              {/* Data Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto max-h-[300px]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-white font-serif sticky top-0 z-10">
                      <tr>
                        <th className="px-3.5 py-3 font-semibold">No</th>
                        <th className="px-3.5 py-3 font-semibold">Status</th>
                        <th className="px-3.5 py-3 font-semibold">NIS / NISN</th>
                        <th className="px-3.5 py-3 font-semibold">Nama Siswa</th>
                        <th className="px-3.5 py-3 font-semibold">L/P</th>
                        <th className="px-3.5 py-3 font-semibold">Kelas</th>
                        <th className="px-3.5 py-3 font-semibold">Wali Siswa</th>
                        <th className="px-3.5 py-3 font-semibold text-center">Status Siswa</th>
                        <th className="px-3.5 py-3 font-semibold text-center">Hapus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {parsedRows.map((row, idx) => (
                        <tr 
                          key={row.id} 
                          className={`hover:bg-slate-50 transition ${
                            !row.isValid ? 'bg-rose-50/50' : ''
                          }`}
                        >
                          <td className="px-3.5 py-2.5 font-mono text-slate-500">{idx + 1}</td>
                          <td className="px-3.5 py-2.5">
                            {row.isValid ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Valid
                              </span>
                            ) : (
                              <span 
                                title={row.validationMessage}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200"
                              >
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                {row.validationMessage}
                              </span>
                            )}
                          </td>
                          <td className="px-3.5 py-2.5 font-mono">
                            <span className="font-bold text-slate-900">{row.nis}</span>
                            {row.nisn && <span className="text-[10px] text-slate-400 block">{row.nisn}</span>}
                          </td>
                          <td className="px-3.5 py-2.5 font-bold text-slate-900">
                            {row.name}
                          </td>
                          <td className="px-3.5 py-2.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              row.gender === 'L' 
                                ? 'bg-blue-50 text-blue-800 border border-blue-200' 
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}>
                              {row.gender === 'L' ? (
                                <Mars className="w-3 h-3 text-blue-600 shrink-0" />
                              ) : (
                                <Venus className="w-3 h-3 text-rose-600 shrink-0" />
                              )}
                              <span>{row.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5 font-bold text-amber-700">
                            {row.classId}
                          </td>
                          <td className="px-3.5 py-2.5 text-slate-600">
                            <span>{row.parentName}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">{row.parentPhone}</span>
                          </td>
                          <td className="px-3.5 py-2.5 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                              {row.status}
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(row.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Hapus baris ini"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <p className="text-xs text-slate-500">
            {parsedRows.length > 0 
              ? `${validCount} dari ${parsedRows.length} data siswa siap didaftarkan ke buku induk.`
              : 'Silakan pilih berkas Excel atau klik "Muat Contoh Data Uji".'
            }
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={validCount === 0 || isProcessing}
              onClick={handleConfirmImport}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition disabled:opacity-50 shadow-sm"
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span>Simpan & Impor {validCount > 0 ? `(${validCount}) Siswa` : ''}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
