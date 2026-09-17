import React, { useState } from 'react';
import { 
  UserPlus, 
  Printer, 
  FileSpreadsheet, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Eye, 
  Check, 
  FileText,
  School,
  Download,
  Mars,
  Venus
} from 'lucide-react';
import { TransferIn, TransferStatus } from '../types';
import { ExportService } from '../services/exportService';

interface TransferInViewProps {
  transfersIn: TransferIn[];
  onOpenAddModal: () => void;
  onPreviewLetter: (transfer: TransferIn) => void;
  onUpdateStatus: (id: string, newStatus: TransferStatus) => Promise<void>;
}

export const TransferInView: React.FC<TransferInViewProps> = ({
  transfersIn,
  onOpenAddModal,
  onPreviewLetter,
  onUpdateStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  const filtered = transfersIn.filter(t => {
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch = 
      (t.studentName || '').toLowerCase().includes(q) ||
      (t.letterNumber || '').toLowerCase().includes(q) ||
      (t.originSchool || '').toLowerCase().includes(q) ||
      (t.nisn || '').includes(searchQuery);

    const matchesStatus = statusFilter === 'Semua' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportExcel = () => {
    ExportService.exportTransfersInToExcel(filtered);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-black border border-slate-300">
              Pelayanan Kesiswaan Persuratan
            </span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-black mt-1.5">
            Menu Surat Mutasi Masuk Siswa
          </h2>
          <p className="text-sm text-black font-medium mt-0.5">
            Penerimaan siswa pindahan dari madrasah/sekolah lain dan penerbitan Surat Keterangan Diterima resmi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-black bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition"
          >
            <FileSpreadsheet className="w-4.5 h-4.5 text-black" />
            <span>EXCEL (.xlsx)</span>
          </button>

          <button
            id="btn-add-transfer-in"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition shadow-xs"
          >
            <UserPlus className="w-4.5 h-4.5" />
            <span>+ Daftarkan Mutasi Masuk</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4.5 h-4.5 text-black absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari siswa, nomor surat, sekolah asal..."
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-hidden bg-slate-50 text-black font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-sm font-bold text-black">Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-hidden bg-white text-black font-bold"
          >
            <option value="Semua">Semua Status</option>
            <option value="Disetujui">Disetujui</option>
            <option value="Menunggu">Menunggu</option>
            <option value="Ditolak">Ditolak</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-black uppercase font-bold text-xs tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-4 px-4 text-black">Nomor Surat Dinas</th>
                <th className="py-4 px-4 text-black">Nama Siswa / NISN</th>
                <th className="py-4 px-4 text-black">Madrasah / Sekolah Asal</th>
                <th className="py-4 px-4 text-center text-black">Kelas Tujuan</th>
                <th className="py-4 px-4 text-black">Tanggal Masuk</th>
                <th className="py-4 px-4 text-center text-black">Berkas</th>
                <th className="py-4 px-4 text-center text-black">Status</th>
                <th className="py-4 px-4 text-center text-black">Cetak / Kelola</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-black font-medium">
                    Belum ada permohonan mutasi masuk yang terdata.
                  </td>
                </tr>
              ) : (
                filtered.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-black text-xs">
                      {t.letterNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-black text-sm">{t.studentName}</p>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                          t.gender === 'L' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {t.gender === 'L' ? <Mars className="w-3 h-3 text-blue-600" /> : <Venus className="w-3 h-3 text-rose-600" />}
                          <span>{t.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                        </span>
                      </div>
                      <p className="text-xs font-mono text-black font-medium mt-0.5">
                        NISN: {t.nisn}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-black">
                      <div className="flex items-center gap-1.5">
                        <School className="w-4 h-4 text-black shrink-0" />
                        <span className="font-medium text-black">{t.originSchool}</span>
                      </div>
                      {t.originNpsn && (
                        <p className="text-xs text-black font-mono pl-5.5 font-medium">NPSN: {t.originNpsn}</p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="px-3 py-1 rounded-lg bg-slate-100 text-black font-bold border border-slate-300 text-xs">
                        {t.targetClass}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-black text-xs font-medium">
                      {t.requestDate}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        title={`Rapor: ${t.documents.rapor ? '✓' : '✗'}, Surat Pindah: ${t.documents.suratPindahAsal ? '✓' : '✗'}, Kartu Keluarga: ${(t.documents.kartuKeluarga ?? t.documents.kelakuanBaik) ? '✓' : '✗'}, Ijazah: ${t.documents.ijazahSebelumnya ? '✓' : '✗'}`}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold cursor-help ${
                          t.documents.rapor && t.documents.suratPindahAsal && (t.documents.kartuKeluarga ?? t.documents.kelakuanBaik)
                            ? 'bg-green-100 text-green-950 border border-green-300'
                            : 'bg-amber-100 text-amber-950 border border-amber-300'
                        }`}
                      >
                        {t.documents.rapor && t.documents.suratPindahAsal && (t.documents.kartuKeluarga ?? t.documents.kelakuanBaik) ? 'Lengkap' : 'Sebagian'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        t.status === 'Disetujui' ? 'bg-green-100 text-green-950 border border-green-300' :
                        t.status === 'Menunggu' ? 'bg-amber-100 text-amber-950 border border-amber-300' : 'bg-rose-100 text-rose-950 border border-rose-300'
                      }`}>
                        {t.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onPreviewLetter(t)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition shadow-2xs"
                          title="Pratinjau & Cetak Surat Resmi Madrasah"
                        >
                          <Printer className="w-4 h-4" />
                          <span>Cetak Surat</span>
                        </button>

                        {t.status === 'Menunggu' && (
                          <button
                            onClick={() => onUpdateStatus(t.id, 'Disetujui')}
                            className="p-2 text-green-800 hover:bg-green-100 rounded-xl transition font-bold"
                            title="Setujui Penerimaan Siswa"
                          >
                            <Check className="w-4.5 h-4.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
