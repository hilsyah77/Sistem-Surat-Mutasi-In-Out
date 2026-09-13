import React, { useState, useEffect } from 'react';
import { X, Save, UserCheck, AlertCircle, Mars, Venus } from 'lucide-react';
import { Student, Gender, StudentStatus } from '../types';
import { classesList } from '../services/mockData';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Student) => Promise<void>;
  studentToEdit?: Student | null;
  availableClasses?: string[];
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  studentToEdit,
  availableClasses,
}) => {
  const [formData, setFormData] = useState<Partial<Student>>({
    nis: '',
    nisn: '',
    name: '',
    gender: 'L',
    birthPlace: '',
    birthDate: '2012-01-01',
    classId: 'VII-A',
    academicYear: '2025/2026',
    parentName: '',
    phone: '',
    address: '',
    status: 'Aktif',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (studentToEdit) {
      setFormData(studentToEdit);
    } else {
      // Auto generate sample NIS
      const randomNis = `252607${Math.floor(100 + Math.random() * 900)}`;
      const randomNisn = `01${Math.floor(10000000 + Math.random() * 90000000)}`;
      setFormData({
        nis: randomNis,
        nisn: randomNisn,
        name: '',
        gender: 'L',
        birthPlace: '',
        birthDate: '2012-05-15',
        classId: 'VII-A',
        academicYear: '2025/2026',
        parentName: '',
        phone: '',
        address: '',
        status: 'Aktif',
        notes: '',
      });
    }
    setErrorMsg('');
  }, [studentToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setErrorMsg('Nama lengkap siswa wajib diisi');
      return;
    }
    if (!formData.nis?.trim() || !formData.nisn?.trim()) {
      setErrorMsg('NIS dan NISN wajib diisi');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const studentData: Student = {
        id: studentToEdit ? studentToEdit.id : `std-${Date.now()}`,
        nis: formData.nis || '',
        nisn: formData.nisn || '',
        name: formData.name || '',
        gender: (formData.gender as Gender) || 'L',
        birthPlace: formData.birthPlace || '',
        birthDate: formData.birthDate || '',
        classId: formData.classId || 'VII-A',
        academicYear: formData.academicYear || '2025/2026',
        parentName: formData.parentName || '',
        phone: formData.phone || '',
        address: formData.address || '',
        status: (formData.status as StudentStatus) || 'Aktif',
        notes: formData.notes || '',
        createdAt: studentToEdit?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onSave(studentData);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan data siswa');
    } finally {
      setLoading(false);
    }
  };

  const realClasses = availableClasses && availableClasses.length > 0 
    ? availableClasses 
    : classesList.filter(c => c !== 'Semua Kelas');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-[32px] shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col border border-[#EAE7E2]">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-200 bg-slate-50 rounded-t-[32px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-900 font-bold border border-emerald-200">
              <UserCheck className="w-5 h-5 text-emerald-900" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-black">
                {studentToEdit ? 'Ubah Data Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <p className="text-xs text-black font-medium">
                Lengkapi formulir biodata induk kesiswaan madrasah
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-7 space-y-4 text-sm">
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-red-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-black mb-1">
                NIS (Nomor Induk Siswa) *
              </label>
              <input
                type="text"
                required
                value={formData.nis || ''}
                onChange={e => setFormData({ ...formData, nis: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 outline-hidden font-mono bg-white text-black font-semibold"
                placeholder="242507001"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-black mb-1">
                NISN (10 Digit Resmi) *
              </label>
              <input
                type="text"
                required
                maxLength={10}
                value={formData.nisn || ''}
                onChange={e => setFormData({ ...formData, nisn: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 outline-hidden font-mono bg-white text-black font-semibold"
                placeholder="0105829144"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-black mb-1">
              Nama Lengkap Siswa *
            </label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 outline-hidden bg-white text-black font-semibold"
              placeholder="Contoh: Muhammad Farhan Al-Ghifari"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-black mb-1">
                Jenis Kelamin *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'L' })}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
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
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
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

            <div>
              <label className="block text-xs font-bold text-black mb-1">
                Kelas / Rombel *
              </label>
              <select
                value={formData.classId || 'VII-A'}
                onChange={e => setFormData({ ...formData, classId: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 outline-hidden bg-white text-black font-semibold"
              >
                {realClasses.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-black mb-1">
                Status Kesiswaan
              </label>
              <select
                value={formData.status || 'Aktif'}
                onChange={e => setFormData({ ...formData, status: e.target.value as StudentStatus })}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 outline-hidden bg-white text-black font-semibold"
              >
                <option value="Aktif">Aktif</option>
                <option value="Mutasi Masuk">Mutasi Masuk</option>
                <option value="Mutasi Keluar">Mutasi Keluar</option>
                <option value="Lulus">Lulus</option>
                <option value="Non-Aktif">Non-Aktif</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-black mb-1">
                Tempat Lahir
              </label>
              <input
                type="text"
                value={formData.birthPlace || ''}
                onChange={e => setFormData({ ...formData, birthPlace: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 outline-hidden bg-white text-black font-semibold"
                placeholder="Jakarta"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-black mb-1">
                Tanggal Lahir
              </label>
              <input
                type="date"
                value={formData.birthDate || ''}
                onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 outline-hidden bg-white text-black font-semibold"
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
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 outline-hidden bg-white text-black font-semibold"
                placeholder="Nama Ayah / Ibu / Wali"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-black mb-1">
                Nomor WhatsApp / HP Orang Tua
              </label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 outline-hidden font-mono bg-white text-black font-semibold"
                placeholder="08123456789"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-black mb-1">
              Alamat Tempat Tinggal
            </label>
            <textarea
              rows={2}
              value={formData.address || ''}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 outline-hidden resize-none bg-white text-black font-semibold"
              placeholder="Nama jalan, RT/RW, Kelurahan, Kecamatan, Kota"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-black mb-1">
              Catatan Khusus / Prestasi / Keterangan
            </label>
            <input
              type="text"
              value={formData.notes || ''}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 outline-hidden bg-white text-black font-semibold"
              placeholder="Contoh: Juara 1 Tahfidz Juz 30, Aktif Pramuka"
            />
          </div>

          {/* Actions */}
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
              <Save className="w-4 h-4" />
              <span>{loading ? 'Menyimpan...' : (studentToEdit ? 'Simpan Perubahan' : 'Tambahkan Siswa')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
