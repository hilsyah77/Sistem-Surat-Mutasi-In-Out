import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  const [deleting, setDeleting] = React.useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setDeleting(true);
      await onConfirm();
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-[32px] shadow-2xl max-w-sm w-full p-7 text-center border border-[#EAE7E2]">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-200 shadow-2xs">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-serif font-bold text-[#5A5A40] mb-2">{title}</h3>
        <p className="text-xs text-[#7A7A6E] mb-6 leading-relaxed">{message}</p>
        
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-[#7A7A6E] bg-white border border-[#EAE7E2] rounded-xl hover:bg-[#F5F5F0] transition"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-red-700 rounded-xl hover:bg-red-800 transition disabled:opacity-50 shadow-xs"
          >
            <Trash2 className="w-4 h-4" />
            <span>{deleting ? 'Menghapus...' : 'Ya, Hapus'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
