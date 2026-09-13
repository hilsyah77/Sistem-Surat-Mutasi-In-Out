import React, { useState, useEffect } from 'react';
import { X, Send, UserMinus, ShieldAlert, RotateCw, Search } from 'lucide-react';
import { TransferOut, TransferStatus, Student, InstitutionProfile } from '../types';
import { defaultInstitution } from '../services/mockData';
import { generateLetterNumber, getNextSequenceNumber } from '../utils/letterNumber';

interface TransferOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transfer: TransferOut, student: Student) => Promise<void>;
  activeStudents: Student[];
  institution?: InstitutionProfile;
  existingTransfers?: TransferOut[];
}

export const TransferOutModal: React.FC<TransferOutModalProps> = ({
  isOpen,
  onClose,
  onSave,
  activeStudents,
  institution = defaultInstitution,
  existingTransfers = [],
}) => {
  const computeAutoLetterNumber = () => {
    const nextSeq = getNextSequenceNumber(existingTransfers);
    return generateLetterNumber(institution.letterFormatOut, nextSeq);
  };

  const availableStudents = activeStudents.filter(s => s.status === 'Aktif');

  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(availableStudents[0]?.id || '');
  const [formData, setFormData] = useState<Partial<TransferOut>>({
    letterNumber: computeAutoLetterNumber(),
    destinationSchool: '',
    destinationAddress: '',
    destinationNpsn: '',
    requestDate: new Date().toISOString().slice(0, 10),
    reason: 'Pindah domisili orang tua ke luar kota',
    status: 'Menunggu',
    clearances: {
      keuanganSpp: true,
      perpustakaan: true,
      waliKelas: true,
    },
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const filteredAvailableStudents = availableStudents.filter(s => {
    if (!studentSearchQuery.trim()) return true;
    const query = studentSearchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(query) ||
      s.nis.toLowerCase().includes(query) ||
      s.nisn.toLowerCase().includes(query) ||
      s.classId.toLowerCase().includes(query)
    );
  });

  // Sinkronkan nomor surat otomatis saat modal dibuka atau format pengaturan berubah
  useEffect(() => {
    if (isOpen) {
      setStudentSearchQuery('');
      const generated = computeAutoLetterNumber();
      const firstActiveStudent = activeStudents.find(s => s.status === 'Aktif');
      if (firstActiveStudent) {
        setSelectedStudentId(firstActiveStudent.id);
      }
      setFormData({
        letterNumber: generated,
        destinationSchool: '',
        destinationAddress: '',
        destinationNpsn: '',
        requestDate: new Date().toISOString().slice(0, 10),
        reason: 'Pindah domisili orang tua ke luar kota',
        status: 'Menunggu',
        clearances: {
          keuanganSpp: true,
          perpustakaan: true,
          waliKelas: true,
        },
        notes: '',
      });
      setErrorMsg('');
    }
  }, [isOpen, institution.letterFormatOut, existingTransfers.length]);

  const handleRefreshLetterNumber = () => {
    const generated = computeAutoLetterNumber();
    setFormData(prev => ({ ...prev, letterNumber: generated }));
  };

  if (!isOpen) return null;

  const selectedStudent = activeStudents.find(s => s.id === selectedStudentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      setErrorMsg('Pilih siswa yang akan mengajukan mutasi keluar');
      return;
    }
    if (!formData.destinationSchool?.trim()) {
      setErrorMsg('Sekolah/Madrasah tujuan wajib diisi');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const transferItem: TransferOut = {
        id: `tout-${Date.now()}`,
        letterNumber: formData.letterNumber || computeAutoLetterNumber(),
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        nis: selectedStudent.nis,
        nisn: selectedStudent.nisn,
        currentClass: selectedStudent.classId,
        academicYear: selectedStudent.academicYear || institution.currentAcademicYear,
        destinationSchool: formData.destinationSchool || '',
        destinationAddress: formData.destinationAddress || '',
        destinationNpsn: formData.destinationNpsn || '',
        requestDate: formData.requestDate || new Date().toISOString().slice(0, 10),
        reason: formData.reason || '',
        status: (formData.status as TransferStatus) || 'Menunggu',
        clearances: formData.clearances || {
          keuanganSpp: true,
          perpustakaan: true,
          waliKelas: true,
        },
        notes: formData.notes || '',
        approvedBy: formData.status === 'Disetujui' ? institution.headmasterName : undefined,
        createdAt: new Date().toISOString(),
      };

      await onSave(transferItem, selectedStudent);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan permohonan mutasi keluar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-[32px] shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col border border-[#EAE7E2]">
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-200 bg-slate-50 rounded-t-[32px]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-950 font-bold">
              <UserMinus className="w-6 h-6 text-emerald-950" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-black">
                Pengajuan Surat Mutasi Keluar Siswa
              </h3>
              <p className="text-xs text-black font-medium">
                Penerbitan Surat Keterangan Pindah Madrasah & validasi bebas tanggungan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-black rounded-xl hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-7 space-y-4 text-sm">
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-black">
                  Nomor Surat Resmi Madrasah (Pindah) *
                </label>
                <button
                  type="button"
                  onClick={handleRefreshLetterNumber}
                  title="Ambil ulang sesuai format nomor surat keluar di Pengaturan"
                  className="inline-flex items-center gap-1 text-[11px] text-emerald-800 hover:text-emerald-950 font-bold cursor-pointer"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Format Pengaturan</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={formData.letterNumber || ''}
                onChange={e => setFormData({ ...formData, letterNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 outline-hidden font-mono text-xs bg-white text-black font-semibold"
                placeholder="Format nomor surat keluar"
              />
              <p className="text-[10px] text-black font-sans font-medium">
                Otomatis dari Pengaturan: <code className="text-emerald-900 font-mono font-bold">{institution.letterFormatOut || 'MTs.01.05/PP.00.5/{NO}/2026'}</code>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-black mb-1">
                Tanggal Permohonan Pindah
              </label>
              <input
                type="date"
                required
                value={formData.requestDate || ''}
                onChange={e => setFormData({ ...formData, requestDate: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 outline-hidden bg-white text-black font-semibold"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-black">
                Pilih Siswa yang Akan Mutasi Keluar *
              </label>
              <span className="text-[11px] text-slate-500 font-semibold">
                {studentSearchQuery ? `${filteredAvailableStudents.length} siswa ditemukan` : `${availableStudents.length} siswa aktif`}
              </span>
            </div>

            {/* Input Pencarian Siswa */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={studentSearchQuery}
                onChange={e => {
                  const q = e.target.value;
                  setStudentSearchQuery(q);
                  const matched = availableStudents.filter(s => {
                    if (!q.trim()) return true;
                    const query = q.toLowerCase();
                    return (
                      s.name.toLowerCase().includes(query) ||
                      s.nis.toLowerCase().includes(query) ||
                      s.nisn.toLowerCase().includes(query) ||
                      s.classId.toLowerCase().includes(query)
                    );
                  });
                  if (matched.length > 0 && !matched.some(s => s.id === selectedStudentId)) {
                    setSelectedStudentId(matched[0].id);
                  }
                }}
                placeholder="Cari siswa berdasarkan nama, NIS, NISN, atau kelas..."
                className="w-full pl-9 pr-8 py-2 border border-slate-300 rounded-xl text-xs text-black font-semibold placeholder:text-slate-400 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-700 outline-hidden"
              />
              {studentSearchQuery && (
                <button
                  type="button"
                  onClick={() => setStudentSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black p-0.5 cursor-pointer"
                  title="Hapus pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown Siswa */}
            <select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 outline-hidden bg-white font-bold text-black"
            >
              {filteredAvailableStudents.length === 0 ? (
                <option value="">-- Tidak ada siswa yang sesuai hasil pencarian --</option>
              ) : (
                filteredAvailableStudents.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} (NIS: {s.nis} - Kelas {s.classId})
                  </option>
                ))
              )}
            </select>
          </div>

          {selectedStudent && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-black font-medium">NISN: <span className="font-mono text-black font-bold">{selectedStudent.nisn}</span></span>
                <span className="text-black font-medium">Kelas: <span className="font-bold text-black">{selectedStudent.classId}</span></span>
                <span className="text-black font-medium">Orang Tua: <span className="text-black font-bold">{selectedStudent.parentName}</span></span>
              </div>
              <p className="text-black font-medium">Alamat Asal: <span className="text-black font-semibold">{selectedStudent.address}</span></p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-black mb-1">
                Madrasah / Sekolah Tujuan *
              </label>
              <input
                type="text"
                required
                value={formData.destinationSchool || ''}
                onChange={e => setFormData({ ...formData, destinationSchool: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 outline-hidden bg-white text-black font-semibold"
                placeholder="Contoh: MTs Negeri 1 Surakarta"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-black mb-1">
                NPSN Sekolah Tujuan (Opsional)
              </label>
              <input
                type="text"
                value={formData.destinationNpsn || ''}
                onChange={e => setFormData({ ...formData, destinationNpsn: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 outline-hidden font-mono bg-white text-black font-semibold"
                placeholder="20328901"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-black mb-1">
              Alamat Lengkap Sekolah Tujuan
            </label>
            <input
              type="text"
              value={formData.destinationAddress || ''}
              onChange={e => setFormData({ ...formData, destinationAddress: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 outline-hidden bg-white text-black font-semibold"
              placeholder="Kota / Kabupaten, Provinsi Tujuan"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-black mb-1">
              Alasan Kepindahan Siswa
            </label>
            <input
              type="text"
              value={formData.reason || ''}
              onChange={e => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 outline-hidden bg-white text-black font-semibold"
              placeholder="Contoh: Mengikuti perpindahan tugas kedinasan orang tua"
            />
          </div>

          {/* Bebas Tanggungan Clearance Checklist */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
            <span className="text-xs font-bold text-black flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-emerald-800" />
              Validasi Bebas Tanggungan Siswa (Syarat Mutasi Keluar)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-black">
              <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  checked={formData.clearances?.keuanganSpp ?? true}
                  onChange={e => setFormData({
                    ...formData,
                    clearances: { ...formData.clearances!, keuanganSpp: e.target.checked }
                  })}
                  className="rounded text-emerald-800 focus:ring-emerald-700"
                />
                <span className="font-semibold text-black">Bebas SPP / Keuangan</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  checked={formData.clearances?.perpustakaan ?? true}
                  onChange={e => setFormData({
                    ...formData,
                    clearances: { ...formData.clearances!, perpustakaan: e.target.checked }
                  })}
                  className="rounded text-emerald-800 focus:ring-emerald-700"
                />
                <span className="font-semibold text-black">Bebas Pinjam Buku</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  checked={formData.clearances?.waliKelas ?? true}
                  onChange={e => setFormData({
                    ...formData,
                    clearances: { ...formData.clearances!, waliKelas: e.target.checked }
                  })}
                  className="rounded text-emerald-800 focus:ring-emerald-700"
                />
                <span className="font-semibold text-black">ACC Wali Kelas</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-black mb-1">
              Status Persetujuan Kepala Madrasah
            </label>
            <select
              value={formData.status || 'Menunggu'}
              onChange={e => setFormData({ ...formData, status: e.target.value as TransferStatus })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 outline-hidden bg-white font-bold text-black"
            >
              <option value="Menunggu">Menunggu Verifikasi Bebas Tanggungan</option>
              <option value="Disetujui">Disetujui (Terbitkan Surat Mutasi Keluar Resmi)</option>
              <option value="Ditolak">Ditolak / Dibatalkan</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-black bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-900 rounded-xl hover:bg-emerald-800 transition disabled:opacity-50 shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Memproses...' : 'Proses Pengajuan Pindah'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
