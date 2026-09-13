import React, { useState, useEffect } from 'react';
import { X, Send, UserPlus, FileCheck, RotateCw, Mars, Venus } from 'lucide-react';
import { TransferIn, Gender, TransferStatus, InstitutionProfile } from '../types';
import { classesList, defaultInstitution } from '../services/mockData';
import { generateLetterNumber, getNextSequenceNumber } from '../utils/letterNumber';

interface TransferInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transfer: TransferIn) => Promise<void>;
  institution?: InstitutionProfile;
  existingTransfers?: TransferIn[];
}

export const TransferInModal: React.FC<TransferInModalProps> = ({
  isOpen,
  onClose,
  onSave,
  institution = defaultInstitution,
  existingTransfers = [],
}) => {
  const computeAutoLetterNumber = () => {
    const nextSeq = getNextSequenceNumber(existingTransfers);
    return generateLetterNumber(institution.letterFormatIn, nextSeq);
  };

  const [formData, setFormData] = useState<Partial<TransferIn>>({
    letterNumber: computeAutoLetterNumber(),
    studentName: '',
    nisn: '',
    gender: 'L',
    originSchool: '',
    originNpsn: '',
    targetClass: 'VII-A',
    academicYear: institution.currentAcademicYear || '2025/2026',
    requestDate: new Date().toISOString().slice(0, 10),
    reason: 'Mengikuti kepindahan domisili orang tua',
    status: 'Menunggu',
    parentName: '',
    parentPhone: '',
    documents: {
      rapor: true,
      suratPindahAsal: true,
      kartuKeluarga: true,
      ijazahSebelumnya: true,
    },
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sinkronkan nomor surat otomatis saat modal dibuka atau format pengaturan berubah
  useEffect(() => {
    if (isOpen) {
      const generated = computeAutoLetterNumber();
      setFormData({
        letterNumber: generated,
        studentName: '',
        nisn: '',
        gender: 'L',
        originSchool: '',
        originNpsn: '',
        targetClass: 'VII-A',
        academicYear: institution.currentAcademicYear || '2025/2026',
        requestDate: new Date().toISOString().slice(0, 10),
        reason: 'Mengikuti kepindahan domisili orang tua',
        status: 'Menunggu',
        parentName: '',
        parentPhone: '',
        documents: {
          rapor: true,
          suratPindahAsal: true,
          kartuKeluarga: true,
          ijazahSebelumnya: true,
        },
        notes: '',
      });
      setErrorMsg('');
    }
  }, [isOpen, institution.letterFormatIn, existingTransfers.length]);

  const handleRefreshLetterNumber = () => {
    const generated = computeAutoLetterNumber();
    setFormData(prev => ({ ...prev, letterNumber: generated }));
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentName?.trim()) {
      setErrorMsg('Nama siswa wajib diisi');
      return;
    }
    if (!formData.originSchool?.trim()) {
      setErrorMsg('Sekolah/Madrasah asal wajib diisi');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const transferItem: TransferIn = {
        id: `tin-${Date.now()}`,
        letterNumber: formData.letterNumber || computeAutoLetterNumber(),
        studentName: formData.studentName || '',
        nisn: formData.nisn || `01${Math.floor(10000000 + Math.random() * 90000000)}`,
        gender: (formData.gender as Gender) || 'L',
        originSchool: formData.originSchool || '',
        originNpsn: formData.originNpsn || '',
        targetClass: formData.targetClass || 'VII-A',
        academicYear: formData.academicYear || institution.currentAcademicYear,
        requestDate: formData.requestDate || new Date().toISOString().slice(0, 10),
        reason: formData.reason || '',
        status: (formData.status as TransferStatus) || 'Menunggu',
        parentName: formData.parentName || '',
        parentPhone: formData.parentPhone || '',
        documents: formData.documents ? {
          rapor: formData.documents.rapor ?? true,
          suratPindahAsal: formData.documents.suratPindahAsal ?? true,
          kartuKeluarga: formData.documents.kartuKeluarga ?? formData.documents.kelakuanBaik ?? true,
          ijazahSebelumnya: formData.documents.ijazahSebelumnya ?? true,
        } : {
          rapor: true,
          suratPindahAsal: true,
          kartuKeluarga: true,
          ijazahSebelumnya: true,
        },
        notes: formData.notes || '',
        approvedBy: formData.status === 'Disetujui' ? institution.headmasterName : undefined,
        createdAt: new Date().toISOString(),
      };

      await onSave(transferItem);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan permohonan mutasi');
    } finally {
      setLoading(false);
    }
  };

  const realClasses = classesList.filter(c => c !== 'Semua Kelas');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-[32px] shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col border border-[#EAE7E2]">
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-200 bg-slate-50 rounded-t-[32px]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-950 font-bold">
              <UserPlus className="w-6 h-6 text-emerald-950" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-black">
                Pendaftaran Siswa Mutasi Masuk
              </h3>
              <p className="text-xs text-black font-medium">
                Catat permohonan pindah madrasah & buat Surat Keterangan Diterima
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
                  Nomor Surat Resmi Madrasah *
                </label>
                <button
                  type="button"
                  onClick={handleRefreshLetterNumber}
                  title="Ambil ulang sesuai format nomor surat di Pengaturan"
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
                placeholder="Format nomor surat dinas"
              />
              <p className="text-[10px] text-black font-sans font-medium">
                Otomatis dari Pengaturan: <code className="text-emerald-900 font-mono font-bold">{institution.letterFormatIn || 'MTs.01.05/PP.00.5/{NO}/2026'}</code>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-black mb-1">
                Tanggal Permohonan Masuk
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-black mb-1">
                Nama Lengkap Siswa *
              </label>
              <input
                type="text"
                required
                value={formData.studentName || ''}
                onChange={e => setFormData({ ...formData, studentName: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 outline-hidden bg-white text-black font-semibold"
                placeholder="Nama calon siswa mutasi"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-black mb-1">
                Jenis Kelamin *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'L' })}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    (formData.gender || 'L') === 'L'
                      ? 'bg-blue-50 border-blue-400 text-blue-800 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Mars className="w-4 h-4 text-blue-600" />
                  <span>Laki-laki</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'P' })}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    formData.gender === 'P'
                      ? 'bg-rose-50 border-rose-400 text-rose-800 ring-2 ring-rose-500/20 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Venus className="w-4 h-4 text-rose-600" />
                  <span>Perempuan</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-black mb-1">
                NISN (10 Digit)
              </label>
              <input
                type="text"
                maxLength={10}
                value={formData.nisn || ''}
                onChange={e => setFormData({ ...formData, nisn: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 outline-hidden font-mono bg-white text-black font-semibold"
                placeholder="0101234567"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-black mb-1">
                Kelas Tujuan Masuk *
              </label>
              <select
                value={formData.targetClass || 'VII-A'}
                onChange={e => setFormData({ ...formData, targetClass: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 outline-hidden bg-white font-bold text-black"
              >
                {realClasses.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-black mb-1">
                Madrasah / Sekolah Asal *
              </label>
              <input
                type="text"
                required
                value={formData.originSchool || ''}
                onChange={e => setFormData({ ...formData, originSchool: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 outline-hidden bg-white text-black font-semibold"
                placeholder="Contoh: MTsN 2 Padang"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-black mb-1">
                NPSN Sekolah Asal
              </label>
              <input
                type="text"
                value={formData.originNpsn || ''}
                onChange={e => setFormData({ ...formData, originNpsn: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 outline-hidden font-mono bg-white text-black font-semibold"
                placeholder="20108922"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-black mb-1">
                Nama Orang Tua / Wali
              </label>
              <input
                type="text"
                value={formData.parentName || ''}
                onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 outline-hidden bg-white text-black font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-black mb-1">
                No. Telp / WhatsApp Wali
              </label>
              <input
                type="text"
                value={formData.parentPhone || ''}
                onChange={e => setFormData({ ...formData, parentPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 outline-hidden font-mono bg-white text-black font-semibold"
                placeholder="081234567890"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-black mb-1">
              Alasan Mutasi Masuk
            </label>
            <input
              type="text"
              value={formData.reason || ''}
              onChange={e => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 outline-hidden bg-white text-black font-semibold"
              placeholder="Contoh: Mengikuti perpindahan tugas kedinasan orang tua"
            />
          </div>

          {/* Document verification checklist */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
            <span className="text-xs font-bold text-black flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-emerald-800" />
              Kelengkapan Berkas Pindahan (Checklist Validasi TU)
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs text-black font-medium">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.documents?.rapor ?? true}
                  onChange={e => setFormData({
                    ...formData,
                    documents: { ...formData.documents!, rapor: e.target.checked }
                  })}
                  className="rounded text-emerald-800 focus:ring-emerald-700"
                />
                <span>Buku Rapor Asli / Legalisir</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.documents?.suratPindahAsal ?? true}
                  onChange={e => setFormData({
                    ...formData,
                    documents: { ...formData.documents!, suratPindahAsal: e.target.checked }
                  })}
                  className="rounded text-emerald-800 focus:ring-emerald-700"
                />
                <span>Surat Pindah Asal Resmi</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.documents?.kartuKeluarga ?? formData.documents?.kelakuanBaik ?? true}
                  onChange={e => setFormData({
                    ...formData,
                    documents: { ...formData.documents!, kartuKeluarga: e.target.checked }
                  })}
                  className="rounded text-emerald-800 focus:ring-emerald-700"
                />
                <span>Fotocopy Kartu Keluarga (KK)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.documents?.ijazahSebelumnya ?? true}
                  onChange={e => setFormData({
                    ...formData,
                    documents: { ...formData.documents!, ijazahSebelumnya: e.target.checked }
                  })}
                  className="rounded text-emerald-800 focus:ring-emerald-700"
                />
                <span>Fotokopi Ijazah & Akta Lahir</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-black mb-1">
              Status Verifikasi & Penerimaan
            </label>
            <select
              value={formData.status || 'Menunggu'}
              onChange={e => setFormData({ ...formData, status: e.target.value as TransferStatus })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 outline-hidden bg-white font-bold text-black"
            >
              <option value="Menunggu">Menunggu Verifikasi Berkas</option>
              <option value="Disetujui">Disetujui (Terbitkan Surat Keterangan Diterima)</option>
              <option value="Ditolak">Ditolak (Kapasitas Kelas Penuh / Berkas Tidak Sesuai)</option>
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
              <span>{loading ? 'Menyimpan...' : 'Simpan & Daftarkan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
