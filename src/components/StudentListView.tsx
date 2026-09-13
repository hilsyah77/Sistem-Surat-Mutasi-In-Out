import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  FileSpreadsheet, 
  FileText, 
  MoreHorizontal, 
  Edit3, 
  Trash2, 
  Eye, 
  Printer, 
  Phone, 
  ArrowUpDown, 
  GraduationCap, 
  Users, 
  School, 
  Upload, 
  UserPlus,
  Mars,
  Venus 
} from 'lucide-react';
import { Student, Gender, StudentStatus } from '../types';
import { classesList } from '../services/mockData';
import { ExportService } from '../services/exportService';

interface StudentListViewProps {
  students: Student[];
  availableClasses?: string[];
  onOpenClassModal?: () => void;
  onOpenAddModal?: () => void;
  onOpenUploadModal?: () => void;
  onEditStudent: (student: Student) => void;
  onSelectStudent: (student: Student) => void;
  onDeleteStudent: (student: Student) => void;
  onPrintActiveLetter: (student: Student) => void;
}

export const StudentListView: React.FC<StudentListViewProps> = ({
  students,
  availableClasses,
  onOpenClassModal,
  onOpenAddModal,
  onOpenUploadModal,
  onEditStudent,
  onSelectStudent,
  onDeleteStudent,
  onPrintActiveLetter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('Semua Kelas');
  const [selectedStatus, setSelectedStatus] = useState('Semua');
  const [selectedGender, setSelectedGender] = useState('Semua');
  const [sortBy, setSortBy] = useState<'name' | 'nis' | 'class'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Dynamic class filter options based on availableClasses or fallback
  const classFilterOptions = useMemo(() => {
    if (availableClasses && availableClasses.length > 0) {
      return ['Semua Kelas', ...availableClasses];
    }
    return classesList;
  }, [availableClasses]);

  // Filtered & Sorted Students
  const filteredStudents = useMemo(() => {
    return students
      .filter(s => {
        const matchesSearch = 
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.nis.includes(searchQuery) ||
          s.nisn.includes(searchQuery) ||
          s.parentName.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesClass = selectedClass === 'Semua Kelas' || s.classId === selectedClass;
        const matchesStatus = selectedStatus === 'Semua' || s.status === selectedStatus;
        const matchesGender = selectedGender === 'Semua' || s.gender === selectedGender;

        return matchesSearch && matchesClass && matchesStatus && matchesGender;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'name') comp = a.name.localeCompare(b.name);
        else if (sortBy === 'nis') comp = a.nis.localeCompare(b.nis);
        else if (sortBy === 'class') comp = a.classId.localeCompare(b.classId);

        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [students, searchQuery, selectedClass, selectedStatus, selectedGender, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExportExcel = () => {
    ExportService.exportStudentsToExcel(filteredStudents, selectedClass);
  };

  const handleExportPDF = () => {
    ExportService.exportStudentsToPDF(filteredStudents, undefined, selectedClass);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-black">Data Induk Kesiswaan (Buku Induk)</h2>
          <p className="text-sm text-black font-medium mt-1">
            Kelola data siswa, biodata orang tua, mutasi masuk/keluar, dan ekspor laporan resmi EMIS
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onOpenClassModal && (
            <button
              id="btn-class-settings"
              onClick={onOpenClassModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-bold text-slate-800 bg-slate-100 border border-slate-300 rounded-xl hover:bg-slate-200 transition shadow-2xs group cursor-pointer"
              title="Pengaturan daftar rombel / kelas madrasah"
            >
              <School className="w-4 h-4 text-emerald-700 group-hover:scale-110 transition" />
              <span>Setting Kelas</span>
            </button>
          )}

          <button
            id="btn-export-excel"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-black bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition shadow-2xs cursor-pointer"
            title="Ekspor daftar siswa ke format Microsoft Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Excel (.xlsx)</span>
          </button>

          <button
            id="btn-export-pdf"
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-black bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition shadow-2xs cursor-pointer"
            title="Ekspor daftar siswa resmi ke format PDF dokumen madrasah"
          >
            <FileText className="w-4 h-4 text-amber-700" />
            <span>PDF Laporan</span>
          </button>

          {onOpenUploadModal && (
            <button
              id="btn-upload-student-list"
              onClick={onOpenUploadModal}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-amber-900 bg-amber-50 border border-amber-300 rounded-xl hover:bg-amber-100 transition shadow-2xs group cursor-pointer"
              title="Unggah dan impor berkas Excel (.xlsx) atau CSV siswa baru"
            >
              <Upload className="w-4 h-4 text-amber-800 group-hover:scale-110 transition" />
              <span>Upload Siswa</span>
            </button>
          )}

          {onOpenAddModal && (
            <button
              id="btn-add-student-main"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4.5 py-2.5 text-sm font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition shadow-xs group cursor-pointer"
              title="Tambah data siswa baru secara manual"
            >
              <UserPlus className="w-4.5 h-4.5 text-emerald-950 group-hover:scale-110 transition" />
              <span>+ Tambah Siswa</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="w-4.5 h-4.5 text-black absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama, NIS, NISN, wali..."
              className="w-full pl-10 pr-3 py-2.5 text-sm font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 outline-hidden bg-white text-black placeholder:text-slate-500"
            />
          </div>

          {/* Filter Kelas */}
          <div>
            <select
              value={selectedClass}
              onChange={e => {
                setSelectedClass(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3.5 py-2.5 text-sm font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 outline-hidden bg-white text-black cursor-pointer"
            >
              {classFilterOptions.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3.5 py-2.5 text-sm font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 outline-hidden bg-white text-black"
            >
              <option value="Semua">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Mutasi Masuk">Mutasi Masuk</option>
              <option value="Mutasi Keluar">Mutasi Keluar</option>
              <option value="Lulus">Lulus</option>
            </select>
          </div>

          {/* Filter Gender */}
          <div>
            <select
              value={selectedGender}
              onChange={e => {
                setSelectedGender(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3.5 py-2.5 text-sm font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 outline-hidden bg-white text-black cursor-pointer"
            >
              <option value="Semua">Semua Jenis Kelamin</option>
              <option value="L">♂ Laki-laki</option>
              <option value="P">♀ Perempuan</option>
            </select>
          </div>
        </div>

        {/* Counter & Active filters */}
        <div className="flex flex-wrap items-center justify-between text-sm text-black pt-2.5 border-t border-slate-100 font-medium">
          <div>
            Menampilkan <strong className="text-black font-bold">{filteredStudents.length}</strong> siswa
            {selectedClass !== 'Semua Kelas' && ` di kelas ${selectedClass}`}
            {selectedStatus !== 'Semua' && ` (${selectedStatus})`}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-black font-semibold">Urutkan:</span>
            <button
              onClick={() => {
                if (sortBy === 'name') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                else { setSortBy('name'); setSortOrder('asc'); }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                sortBy === 'name' ? 'bg-black text-white' : 'bg-slate-100 text-black hover:bg-slate-200'
              }`}
            >
              Nama {sortBy === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
            </button>
            <button
              onClick={() => {
                if (sortBy === 'nis') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                else { setSortBy('nis'); setSortOrder('asc'); }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                sortBy === 'nis' ? 'bg-black text-white' : 'bg-slate-100 text-black hover:bg-slate-200'
              }`}
            >
              NIS {sortBy === 'nis' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
            </button>
            <button
              onClick={() => {
                if (sortBy === 'class') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                else { setSortBy('class'); setSortOrder('asc'); }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                sortBy === 'class' ? 'bg-black text-white' : 'bg-slate-100 text-black hover:bg-slate-200'
              }`}
            >
              Kelas {sortBy === 'class' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
            </button>
          </div>
        </div>
      </div>

      {/* Main Students Table */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-black uppercase font-bold text-xs tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 text-black">No</th>
                <th className="py-3.5 px-4 text-black">Identitas Siswa</th>
                <th className="py-3.5 px-4 text-center text-black">Kelas</th>
                <th className="py-3.5 px-4 text-center text-black">L/P</th>
                <th className="py-3.5 px-4 text-black">Tempat, Tgl Lahir</th>
                <th className="py-3.5 px-4 text-black">Orang Tua / Kontak</th>
                <th className="py-3.5 px-4 text-center text-black">Status</th>
                <th className="py-3.5 px-4 text-center text-black">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2 text-slate-500">
                      <Users className="w-12 h-12 text-slate-300 stroke-[1.5]" />
                      <p className="font-bold text-slate-700 text-sm">
                        {students.length === 0 
                          ? 'Belum ada data siswa di buku induk'
                          : 'Tidak ada data siswa yang cocok dengan filter pencarian'}
                      </p>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        {students.length === 0 
                          ? 'Basis data buku induk madrasah siap digunakan. Silakan gunakan tombol "+ Tambah Siswa" atau "Upload Siswa" untuk menginput data siswa.'
                          : 'Coba ubah kata kunci pencarian atau filter kelas/status.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student, idx) => {
                  const globalIdx = (currentPage - 1) * itemsPerPage + idx + 1;
                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition group">
                      <td className="py-3.5 px-4 font-mono text-black font-bold">
                        {globalIdx}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border ${
                            student.gender === 'L' 
                              ? 'bg-blue-50 text-blue-700 border-blue-200' 
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {student.gender === 'L' ? (
                              <Mars className="w-4.5 h-4.5 text-blue-600" />
                            ) : (
                              <Venus className="w-4.5 h-4.5 text-rose-600" />
                            )}
                          </div>
                          <div>
                            <button
                              onClick={() => onSelectStudent(student)}
                              className="font-bold text-black hover:text-emerald-800 text-left hover:underline text-sm sm:text-base block cursor-pointer"
                            >
                              {student.name}
                            </button>
                            <p className="text-xs font-mono text-black font-medium mt-0.5">
                              NIS: {student.nis} | NISN: {student.nisn}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-black">
                        <span className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-black font-bold text-sm">
                          {student.classId}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                          student.gender === 'L'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}>
                          {student.gender === 'L' ? (
                            <Mars className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          ) : (
                            <Venus className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          )}
                          <span>{student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-sm text-black">
                        <span className="font-bold text-black block">{student.birthPlace || '-'}</span>
                        <span className="text-xs text-black font-medium">{student.birthDate}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-black truncate max-w-[170px] text-sm">
                          {student.parentName || '-'}
                        </p>
                        {student.phone ? (
                          <a
                            href={`https://wa.me/62${student.phone.replace(/^0/, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-mono text-emerald-900 font-bold hover:underline mt-0.5"
                          >
                            <Phone className="w-3 h-3 text-emerald-700" />
                            {student.phone}
                          </a>
                        ) : (
                          <span className="text-xs text-black">-</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          student.status === 'Aktif' ? 'bg-green-100 text-green-950 border border-green-300' :
                          student.status === 'Mutasi Masuk' ? 'bg-sky-100 text-sky-950 border border-sky-300' :
                          student.status === 'Mutasi Keluar' ? 'bg-amber-100 text-amber-950 border border-amber-300' :
                          'bg-slate-200 text-black border border-slate-300'
                        }`}>
                          {student.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onSelectStudent(student)}
                            className="p-2 text-black hover:text-emerald-800 hover:bg-slate-100 rounded-lg transition"
                            title="Lihat Detail Profil Siswa"
                          >
                            <Eye className="w-4.5 h-4.5" />
                          </button>
                          <button
                            onClick={() => onPrintActiveLetter(student)}
                            className="p-2 text-black hover:text-emerald-800 hover:bg-slate-100 rounded-lg transition"
                            title="Cetak Surat Keterangan Siswa Aktif"
                          >
                            <Printer className="w-4.5 h-4.5" />
                          </button>
                          <button
                            onClick={() => onEditStudent(student)}
                            className="p-2 text-black hover:text-amber-700 hover:bg-slate-100 rounded-lg transition"
                            title="Ubah Data Siswa"
                          >
                            <Edit3 className="w-4.5 h-4.5" />
                          </button>
                          <button
                            onClick={() => onDeleteStudent(student)}
                            className="p-2 text-black hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                            title="Hapus Data Siswa"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50 text-sm text-black font-semibold gap-3">
          <span>
            Halaman <strong className="text-black font-bold">{currentPage}</strong> dari <strong className="text-black font-bold">{totalPages}</strong> (Total {filteredStudents.length} siswa)
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-black hover:bg-slate-100 disabled:opacity-40 transition font-bold text-xs"
            >
              Sebelumnya
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-9 h-9 rounded-xl font-bold text-xs transition ${
                  p === currentPage
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-white border border-slate-300 text-black hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-black hover:bg-slate-100 disabled:opacity-40 transition font-bold text-xs"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
