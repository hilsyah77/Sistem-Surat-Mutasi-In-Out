import React, { useState } from 'react';
import { 
  Users, 
  BookOpen, 
  Download, 
  Filter, 
  BarChart3, 
  ChevronRight,
  GraduationCap,
  MapPin,
  CheckCircle2,
  FileSpreadsheet,
  ArrowDownLeft,
  ArrowUpRight,
  UserCheck,
  Mars,
  Venus
} from 'lucide-react';
import { Student } from '../types';
import { defaultInstitution } from '../services/mockData';
import { ExportService } from '../services/exportService';

interface AnalyticsViewProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  students,
  onSelectStudent,
}) => {
  const [selectedClass, setSelectedClass] = useState('Semua Kelas');

  const filteredStudents = selectedClass === 'Semua Kelas'
    ? students
    : students.filter(s => s.classId === selectedClass);

  // Key Demographics Aggregations
  const totalStudents = filteredStudents.length;
  const activeCount = filteredStudents.filter(s => s.status === 'Aktif' || s.status === 'Mutasi Masuk').length;
  const boysCount = filteredStudents.filter(s => s.gender === 'L').length;
  const girlsCount = filteredStudents.filter(s => s.gender === 'P').length;

  const boysPercentage = totalStudents > 0 ? Math.round((boysCount / totalStudents) * 100) : 0;
  const girlsPercentage = totalStudents > 0 ? Math.round((girlsCount / totalStudents) * 100) : 0;

  // Status Distribution
  const statusCounts = {
    aktif: filteredStudents.filter(s => s.status === 'Aktif').length,
    mutasiMasuk: filteredStudents.filter(s => s.status === 'Mutasi Masuk').length,
    mutasiKeluar: filteredStudents.filter(s => s.status === 'Mutasi Keluar').length,
    lulus: filteredStudents.filter(s => s.status === 'Lulus').length,
  };

  // Class Comparison
  const classes = ['VII-A', 'VII-B', 'VIII-A', 'VIII-B', 'IX-A', 'IX-B'];
  const classBreakdown = classes.map(c => {
    const inClass = students.filter(s => s.classId === c);
    const boys = inClass.filter(s => s.gender === 'L').length;
    const girls = inClass.filter(s => s.gender === 'P').length;
    return {
      classId: c,
      total: inClass.length,
      boys,
      girls,
    };
  });
  const maxClassCount = Math.max(...classBreakdown.map(c => c.total), 1);

  // Birth Place / Origin Regional Distribution
  const birthPlaceMap: Record<string, number> = {};
  filteredStudents.forEach(s => {
    const place = (s.birthPlace || 'Lainnya').trim();
    birthPlaceMap[place] = (birthPlaceMap[place] || 0) + 1;
  });
  const sortedBirthPlaces = Object.entries(birthPlaceMap)
    .map(([place, count]) => ({ place, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Data completeness check
  const hasNisnCount = filteredStudents.filter(s => s.nisn && s.nisn.trim().length > 0).length;
  const hasPhoneCount = filteredStudents.filter(s => s.phone && s.phone.trim().length > 3).length;
  const hasAddressCount = filteredStudents.filter(s => s.address && s.address.trim().length > 3).length;

  return (
    <div className="space-y-6">
      {/* Top Banner with Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[28px] border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
              <span>Statistik Resmi EMIS</span>
            </span>
          </div>
          <h2 className="text-xl font-serif font-bold text-slate-900 mt-1.5">
            Statistik & Rekapitulasi Demografi Siswa
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Rekap data kesiswaan, rombel, rasio gender, dan sebaran demografis semester {defaultInstitution.currentSemester} TP {defaultInstitution.currentAcademicYear}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500 font-medium">Filter Kelas:</span>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="bg-transparent font-bold text-slate-800 outline-hidden cursor-pointer"
            >
              <option value="Semua Kelas">Semua Kelas</option>
              {classes.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => ExportService.exportStudentsToExcel(filteredStudents, selectedClass)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Siswa</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-slate-900 mt-3">{totalStudents}</div>
          <div className="flex items-center gap-1 text-xs text-emerald-800 font-medium mt-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{activeCount} Siswa Aktif Terdaftar</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Laki-laki</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold">
              <Mars className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-slate-900 mt-3">{boysCount}</div>
          <p className="text-xs text-slate-500 mt-2 font-medium">{boysPercentage}% dari populasi siswa</p>
        </div>

        <div className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Perempuan</span>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center font-bold">
              <Venus className="w-5 h-5 text-rose-600" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-slate-900 mt-3">{girlsCount}</div>
          <p className="text-xs text-slate-500 mt-2 font-medium">{girlsPercentage}% dari populasi siswa</p>
        </div>

        <div className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rombel Aktif</span>
            <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-slate-900 mt-3">{classes.length}</div>
          <p className="text-xs text-slate-500 mt-2 font-medium">Kelas VII, VIII, IX</p>
        </div>
      </div>

      {/* Grid: Class Breakdown & Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Distribution Breakdown */}
        <div className="bg-white rounded-[28px] border border-slate-200 p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-700" />
              <h3 className="font-serif font-bold text-slate-900 text-base sm:text-lg">Distribusi Siswa per Rombel / Kelas</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Standar EMIS</span>
          </div>

          <div className="space-y-4 pt-1">
            {classBreakdown.map(cb => {
              const widthPct = Math.max(8, (cb.total / maxClassCount) * 100);
              return (
                <div key={cb.classId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">Kelas {cb.classId}</span>
                    <div className="flex items-center gap-2.5 text-slate-500 font-medium">
                      <span className="inline-flex items-center gap-1 text-blue-700 font-semibold">
                        <Mars className="w-3.5 h-3.5 text-blue-600" /> {cb.boys} L
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 text-rose-700 font-semibold">
                        <Venus className="w-3.5 h-3.5 text-rose-600" /> {cb.girls} P
                      </span>
                      <span>•</span>
                      <span className="font-mono font-bold text-slate-900">{cb.total} Siswa</span>
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-slate-900"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Kesiswaan & Kelengkapan Dokumen */}
        <div className="bg-white rounded-[28px] border border-slate-200 p-7 shadow-xs space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="font-serif font-bold text-slate-900 text-base sm:text-lg">Status Kesiswaan & Buku Induk</h3>
              </div>
              <span className="text-xs text-slate-400">Verifikasi Data</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl">
                <span className="text-xs font-bold text-emerald-800 block">Siswa Aktif</span>
                <span className="text-2xl font-serif font-bold text-emerald-900 mt-1 block">{statusCounts.aktif}</span>
                <span className="text-[11px] text-emerald-700">Kegiatan KBM reguler</span>
              </div>
              <div className="p-4 bg-sky-50/60 border border-sky-200 rounded-2xl">
                <span className="text-xs font-bold text-sky-800 block">Mutasi Masuk</span>
                <span className="text-2xl font-serif font-bold text-sky-900 mt-1 block">{statusCounts.mutasiMasuk}</span>
                <span className="text-[11px] text-sky-700">Pindahan semester ini</span>
              </div>
              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl">
                <span className="text-xs font-bold text-amber-800 block">Mutasi Keluar</span>
                <span className="text-2xl font-serif font-bold text-amber-900 mt-1 block">{statusCounts.mutasiKeluar}</span>
                <span className="text-[11px] text-amber-700">Pindah sekolah lain</span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-xs font-bold text-slate-700 block">Siswa Lulus</span>
                <span className="text-2xl font-serif font-bold text-slate-900 mt-1 block">{statusCounts.lulus}</span>
                <span className="text-[11px] text-slate-500">Alumni madrasah</span>
              </div>
            </div>
          </div>

          {/* Kelengkapan Data Buku Induk */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 mt-4">
            <span className="text-xs font-bold text-slate-800 block">Kelengkapan Data Buku Induk (NISN & Kontak)</span>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <span className="font-mono font-bold text-slate-900 block">{hasNisnCount}/{totalStudents}</span>
                <span className="text-[10px] text-slate-500">NISN Valid</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <span className="font-mono font-bold text-slate-900 block">{hasPhoneCount}/{totalStudents}</span>
                <span className="text-[10px] text-slate-500">Kontak Ortu</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <span className="font-mono font-bold text-slate-900 block">{hasAddressCount}/{totalStudents}</span>
                <span className="text-[10px] text-slate-500">Alamat Lengkap</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Sebaran Tempat Lahir & Daftar Siswa Terdaftar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sebaran Wilayah / Tempat Lahir */}
        <div className="bg-white rounded-[28px] border border-slate-200 p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-700" />
              <h3 className="font-serif font-bold text-slate-900 text-base sm:text-lg">Sebaran Wilayah Tempat Lahir Siswa</h3>
            </div>
            <span className="text-xs text-slate-400">Demografi Domisili</span>
          </div>

          <div className="space-y-2.5">
            {sortedBirthPlaces.map(({ place, count }) => {
              const pct = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
              return (
                <div key={place} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-slate-800">{place}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900">{count} Siswa</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Siswa Terbaru Terdaftar */}
        <div className="bg-white rounded-[28px] border border-slate-200 p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-700" />
              <h3 className="font-serif font-bold text-slate-900 text-base sm:text-lg">Daftar Siswa Terdaftar</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Buku Induk Kesiswaan</span>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {filteredStudents.slice(0, 7).map(s => (
              <div
                key={s.id}
                onClick={() => onSelectStudent(s)}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-between text-xs cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border ${
                    s.gender === 'L' 
                      ? 'bg-blue-50 text-blue-700 border-blue-200' 
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {s.gender === 'L' ? <Mars className="w-4 h-4 text-blue-600" /> : <Venus className="w-4 h-4 text-rose-600" />}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">{s.name}</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      NIS: {s.nis} | Kelas {s.classId}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    s.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800' :
                    s.status === 'Mutasi Masuk' ? 'bg-sky-100 text-sky-800' :
                    s.status === 'Mutasi Keluar' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-200 text-slate-700'
                  }`}>
                    {s.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
