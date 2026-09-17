import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  School, 
  Trash2, 
  Edit2, 
  Check, 
  RotateCcw, 
  AlertCircle, 
  Users, 
  Sparkles 
} from 'lucide-react';
import { Student } from '../types';
import { defaultClassesList } from '../services/firebase';

interface ClassSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: string[];
  students: Student[];
  onSaveClasses: (newClasses: string[]) => Promise<void>;
  onRenameClass: (oldName: string, newName: string) => Promise<number>;
}

export const ClassSettingsModal: React.FC<ClassSettingsModalProps> = ({
  isOpen,
  onClose,
  classes,
  students,
  onSaveClasses,
  onRenameClass,
}) => {
  const [newClassName, setNewClassName] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classToDelete, setClassToDelete] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  if (!isOpen) return null;

  // Student count map per class
  const studentCountByClass = students.reduce((acc: Record<string, number>, s) => {
    const c = s.classId || 'Belum Ditentukan';
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});

  const showNotice = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3500);
  };

  const handleAddClass = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = (newClassName || '').trim().toUpperCase();
    if (!trimmed) {
      showNotice('Mohon masukkan nama kelas / rombel.', 'error');
      return;
    }
    if (classes.some(c => String(c || '').toLowerCase() === trimmed.toLowerCase())) {
      showNotice(`Kelas "${trimmed}" sudah terdaftar di daftar rombel.`, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = [...classes, trimmed];
      await onSaveClasses(updated);
      setNewClassName('');
      showNotice(`Kelas "${trimmed}" berhasil ditambahkan!`, 'success');
    } catch (err: any) {
      showNotice(err.message || 'Gagal menambahkan kelas.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAdd = async (presetName: string) => {
    if (classes.includes(presetName)) {
      showNotice(`Kelas ${presetName} sudah ada dalam daftar.`, 'info');
      return;
    }
    setIsSubmitting(true);
    try {
      const updated = [...classes, presetName];
      await onSaveClasses(updated);
      showNotice(`Kelas "${presetName}" berhasil ditambahkan!`, 'success');
    } catch (err: any) {
      showNotice(err.message || 'Gagal menambahkan kelas.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (idx: number, currentName: string) => {
    setEditingIndex(idx);
    setEditingValue(currentName);
  };

  const handleSaveEdit = async (idx: number, oldName: string) => {
    const trimmed = (editingValue || '').trim().toUpperCase();
    if (!trimmed) {
      showNotice('Nama kelas tidak boleh kosong.', 'error');
      return;
    }
    if (trimmed === oldName) {
      setEditingIndex(null);
      return;
    }
    if (classes.some((c, i) => i !== idx && String(c || '').toLowerCase() === trimmed.toLowerCase())) {
      showNotice(`Kelas "${trimmed}" sudah ada di daftar.`, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const affectedStudents = await onRenameClass(oldName, trimmed);
      setEditingIndex(null);
      if (affectedStudents > 0) {
        showNotice(`Kelas diubah menjadi "${trimmed}" & ${affectedStudents} data siswa otomatis diperbarui!`, 'success');
      } else {
        showNotice(`Nama kelas berhasil diubah menjadi "${trimmed}".`, 'success');
      }
    } catch (err: any) {
      showNotice(err.message || 'Gagal mengubah nama kelas.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (classNameToDelete: string) => {
    setClassToDelete(classNameToDelete);
  };

  const handleConfirmDelete = async () => {
    if (!classToDelete) return;
    const target = classToDelete;
    setIsSubmitting(true);
    try {
      const updated = classes.filter(c => c !== target);
      await onSaveClasses(updated);
      showNotice(`Kelas "${target}" berhasil dihapus.`, 'info');
      setClassToDelete(null);
    } catch (err: any) {
      showNotice(err.message || 'Gagal menghapus kelas.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReset = async () => {
    setIsSubmitting(true);
    try {
      await onSaveClasses(defaultClassesList);
      showNotice('Daftar kelas berhasil diatur ulang ke format standar.', 'success');
      setShowResetConfirm(false);
    } catch (err: any) {
      showNotice(err.message || 'Gagal mengatur ulang kelas.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Common suggestion chips
  const commonPresets = [
    'VII-A', 'VII-B', 'VII-C', 'VII-D',
    'VIII-A', 'VIII-B', 'VIII-C', 'VIII-D',
    'IX-A', 'IX-B', 'IX-C', 'IX-D',
    'VII-Tahfidz', 'VIII-Tahfidz', 'IX-Tahfidz',
    'X-A', 'XI-A', 'XII-A'
  ].filter(p => !classes.includes(p)).slice(0, 6);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-[28px] shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-900 font-bold border border-emerald-200 shrink-0">
              <School className="w-5 h-5 text-emerald-800" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-slate-900">
                Pengaturan Rombongan Belajar (Kelas)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Kelola daftar kelas madrasah yang tampil di formulir siswa & filter buku induk
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-200/60 transition cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Notification Alert */}
          {message && (
            <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' :
              message.type === 'error' ? 'bg-rose-50 text-rose-900 border-rose-200' :
              'bg-blue-50 text-blue-900 border-blue-200'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{message.text}</span>
            </div>
          )}

          {/* Form Input Tambah Kelas */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <label className="block text-xs font-bold text-slate-800">
              Tambah Kelas / Rombel Baru
            </label>
            <form onSubmit={handleAddClass} className="flex gap-2">
              <input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="Contoh: VII-C, VII-Tahfidz, X-IPA 1"
                disabled={isSubmitting}
                className="flex-1 px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition uppercase placeholder:normal-case"
              />
              <button
                type="submit"
                disabled={isSubmitting || !newClassName.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-xs transition cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah</span>
              </button>
            </form>

            {/* Quick Suggestions Chips */}
            {commonPresets.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Saran cepat penambahan kelas:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {commonPresets.map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleQuickAdd(preset)}
                      disabled={isSubmitting}
                      className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-900 border border-slate-200 text-slate-700 rounded-lg transition shadow-2xs cursor-pointer"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Daftar Kelas Aktif */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">
                  Daftar Kelas Terdaftar
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 text-slate-700 font-mono">
                  {classes.length} Rombel
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                disabled={isSubmitting}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 hover:underline transition cursor-pointer"
                title="Kembalikan ke kelas bawaan"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Standar</span>
              </button>
            </div>

            {/* Reset confirmation box */}
            {showResetConfirm && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-900">
                <p className="font-bold">Kembalikan daftar rombel ke format standar (VII-A s.d. IX-B)?</p>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1 bg-white border border-amber-200 text-slate-700 rounded-lg hover:bg-slate-50 font-bold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmReset}
                    disabled={isSubmitting}
                    className="px-3 py-1 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-bold cursor-pointer"
                  >
                    Ya, Reset Standar
                  </button>
                </div>
              </div>
            )}

            {/* Delete confirmation box */}
            {classToDelete && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs text-rose-950">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Konfirmasi Hapus Kelas "{classToDelete}"</p>
                    <p className="text-[11px] text-rose-800 mt-0.5">
                      {(studentCountByClass[classToDelete] || 0) > 0 
                        ? `Peringatan: Terdapat ${studentCountByClass[classToDelete]} siswa aktif di kelas ini. Menghapus kelas tidak menghapus biodata siswa, namun kelas mereka akan kosong.`
                        : 'Apakah Anda yakin ingin menghapus kelas ini dari daftar rombel?'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setClassToDelete(null)}
                    className="px-3 py-1 bg-white border border-rose-200 text-slate-700 rounded-lg hover:bg-slate-50 font-bold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    disabled={isSubmitting}
                    className="px-3 py-1 bg-rose-600 text-white rounded-lg hover:bg-rose-700 font-bold cursor-pointer"
                  >
                    Ya, Hapus Kelas
                  </button>
                </div>
              </div>
            )}

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs max-h-72 overflow-y-auto">
              {classes.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Belum ada rombel kelas yang ditambahkan.
                </div>
              ) : (
                classes.map((cls, idx) => {
                  const count = studentCountByClass[cls] || 0;
                  const isEditing = editingIndex === idx;

                  return (
                    <div 
                      key={cls} 
                      className="flex items-center justify-between p-3.5 hover:bg-slate-50/80 transition group"
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-2 flex-1 mr-2">
                          <input
                            type="text"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            disabled={isSubmitting}
                            className="flex-1 px-3 py-1.5 text-xs font-bold border border-emerald-500 rounded-lg uppercase focus:outline-hidden"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(idx, cls)}
                            disabled={isSubmitting}
                            className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                            title="Simpan"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingIndex(null)}
                            disabled={isSubmitting}
                            className="p-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
                            title="Batal"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 text-center text-xs font-mono font-bold text-slate-400">
                              {idx + 1}.
                            </span>
                            <span className="font-bold text-sm text-slate-900 font-mono">
                              {cls}
                            </span>
                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                              count > 0 
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>
                              <Users className="w-3 h-3" />
                              <span>{count} Siswa</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(idx, cls)}
                              disabled={isSubmitting}
                              className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition"
                              title="Ubah Nama Kelas"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteClick(cls)}
                              disabled={isSubmitting}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Hapus Kelas"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-medium">
            Perubahan otomatis tersinkron ke cloud Firebase & buku induk
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
};
