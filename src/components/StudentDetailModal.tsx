import React from 'react';
import { X, User, Phone, MapPin, Calendar, BookOpen, FileText, CheckCircle2, ShieldCheck, FileCheck2, Mars, Venus } from 'lucide-react';
import { Student } from '../types';

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onPrintActiveLetter: (student: Student) => void;
  onEdit: (student: Student) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  isOpen,
  onClose,
  student,
  onPrintActiveLetter,
  onEdit
}) => {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-[32px] shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-slate-300">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-200 bg-slate-50 rounded-t-[32px]">
          <div className="flex items-center gap-3.5">
            <div className={`w-13 h-13 rounded-2xl flex items-center justify-center font-bold text-2xl border shadow-2xs shrink-0 ${
              student.gender === 'L'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              {student.gender === 'L' ? (
                <Mars className="w-7 h-7 text-blue-600" />
              ) : (
                <Venus className="w-7 h-7 text-rose-600" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-2xl font-serif font-bold text-black">{student.name}</h3>
                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                  student.status === 'Aktif' ? 'bg-green-100 text-green-950 border-green-300' :
                  student.status === 'Mutasi Masuk' ? 'bg-slate-100 text-black border-slate-300' :
                  student.status === 'Mutasi Keluar' ? 'bg-amber-100 text-amber-950 border-amber-300' :
                  'bg-slate-100 text-black border-slate-300'
                }`}>
                  {student.status}
                </span>
              </div>
              <p className="text-sm text-black font-semibold font-mono mt-1">
                NIS: {student.nis} | NISN: {student.nisn} | Kelas: {student.classId}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-black hover:bg-slate-200 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-7 space-y-6 text-sm">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-xs text-black font-bold uppercase tracking-wider block">Status Kesiswaan</span>
              <div className="text-2xl font-bold text-black mt-1">
                {student.status}
              </div>
              <span className="text-xs text-black font-medium">Terdaftar di EMIS</span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-xs text-black font-bold uppercase tracking-wider block">Rombongan Belajar</span>
              <div className="text-2xl font-bold font-mono text-black mt-1">
                Kelas {student.classId}
              </div>
              <span className="text-xs text-black font-medium">Tingkat Pendidikan MTs</span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-xs text-black font-bold uppercase tracking-wider block">Tahun Pelajaran</span>
              <div className="text-2xl font-bold text-black mt-1">
                {student.academicYear || '2025/2026'}
              </div>
              <span className="text-xs text-black font-medium">Semester Aktif</span>
            </div>
          </div>

          {/* Biodata Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3.5">
            <h4 className="font-bold text-black flex items-center gap-2 text-sm uppercase tracking-wider">
              <User className="w-4.5 h-4.5 text-black" />
              <span>Biodata Pribadi & Orang Tua</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4 text-sm text-black">
              <div>
                <span className="text-xs text-black font-bold uppercase block">Tempat, Tanggal Lahir:</span>
                <span className="font-semibold text-black">{student.birthPlace || '-'}, {student.birthDate}</span>
              </div>
              <div>
                <span className="text-xs text-black font-bold uppercase block">Jenis Kelamin:</span>
                <span className="font-semibold text-black flex items-center gap-1.5 mt-0.5">
                  {student.gender === 'L' ? (
                    <span className="inline-flex items-center gap-1 text-blue-800 font-bold bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                      <Mars className="w-3.5 h-3.5 text-blue-600" />
                      <span>Laki-laki</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-rose-800 font-bold bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200">
                      <Venus className="w-3.5 h-3.5 text-rose-600" />
                      <span>Perempuan</span>
                    </span>
                  )}
                </span>
              </div>
              <div>
                <span className="text-xs text-black font-bold uppercase block">Nama Orang Tua / Wali:</span>
                <span className="font-semibold text-black">{student.parentName || '-'}</span>
              </div>
              <div>
                <span className="text-xs text-black font-bold uppercase block">No. Kontak / WhatsApp:</span>
                <span className="font-mono text-black font-bold flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-black" />
                  {student.phone || '-'}
                </span>
              </div>
              <div className="md:col-span-2">
                <span className="text-xs text-black font-bold uppercase block">Alamat Lengkap:</span>
                <span className="font-semibold text-black flex items-start gap-1">
                  <MapPin className="w-4 h-4 text-black shrink-0 mt-0.5" />
                  {student.address || '-'}
                </span>
              </div>
              {student.notes && (
                <div className="md:col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-black">
                  <span className="font-bold block text-xs uppercase">Catatan / Prestasi:</span>
                  <span className="font-medium text-sm">{student.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Administrative Record Details */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-black flex items-center gap-2 text-sm uppercase tracking-wider">
                <FileCheck2 className="w-4.5 h-4.5 text-black" />
                <span>Status Kelengkapan Berkas & Administrasi Buku Induk</span>
              </h4>
              <span className="text-xs text-green-950 bg-green-100 px-3 py-1 rounded-full border border-green-300 font-bold">
                Terverifikasi EMIS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-sm">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-black block text-xs font-bold uppercase">Nomor Induk Siswa (NIS)</span>
                <span className="font-mono font-bold text-black text-base">{student.nis}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-black block text-xs font-bold uppercase">NISN Siswa</span>
                <span className="font-mono font-bold text-black text-base">{student.nisn || '-'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-black block text-xs font-bold uppercase">Rombongan Belajar (Rombel)</span>
                <span className="font-bold text-black text-base">Kelas {student.classId}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-7 py-5 border-t border-slate-200 bg-slate-50 rounded-b-[32px]">
          <button
            id="btn-print-active-letter"
            onClick={() => onPrintActiveLetter(student)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-black bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition"
          >
            <FileText className="w-4.5 h-4.5 text-black" />
            <span>Cetak Surat Keterangan Siswa Aktif</span>
          </button>

          <div className="flex items-center justify-end gap-2.5">
            <button
              onClick={() => onEdit(student)}
              className="px-4 py-2.5 text-sm font-bold text-black bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition"
            >
              Ubah Data
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition shadow-xs"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
