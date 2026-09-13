import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserMinus, 
  BookOpen, 
  GraduationCap, 
  TrendingUp, 
  FileSpreadsheet, 
  FileText, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  Clock, 
  Eye,
  Cloud,
  ShieldCheck,
  Mars,
  Venus
} from 'lucide-react';
import { Student, TransferIn, TransferOut } from '../types';
import { DataService } from '../services/firebase';

interface DashboardViewProps {
  students: Student[];
  transfersIn: TransferIn[];
  transfersOut: TransferOut[];
  onNavigateTab: (tab: string) => void;
  onOpenAddStudent?: () => void;
  onOpenUploadStudent?: () => void;
  onOpenTransferIn?: () => void;
  onOpenTransferOut?: () => void;
  onSelectStudent: (student: Student) => void;
  onPreviewLetter: (type: 'mutasi_masuk' | 'mutasi_keluar' | 'siswa_aktif', data: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  transfersIn,
  transfersOut,
  onNavigateTab,
  onSelectStudent,
  onPreviewLetter,
}) => {
  const [fbStatus, setFbStatus] = useState(DataService.getFirebaseStatus());

  useEffect(() => {
    const unsub = DataService.onStatusChange(status => {
      setFbStatus(status);
    });
    return () => unsub();
  }, []);

  const activeStudents = students.filter(s => s.status === 'Aktif' || s.status === 'Mutasi Masuk');
  const totalCount = students.length;
  const boysCount = students.filter(s => s.gender === 'L').length;
  const girlsCount = students.filter(s => s.gender === 'P').length;

  // Class distribution
  const classes = ['VII-A', 'VII-B', 'VIII-A', 'VIII-B', 'IX-A', 'IX-B'];
  const classCounts = classes.map(c => ({
    name: c,
    count: students.filter(s => s.classId === c).length,
    boys: students.filter(s => s.classId === c && s.gender === 'L').length,
    girls: students.filter(s => s.classId === c && s.gender === 'P').length,
  }));

  const maxClassCount = Math.max(...classCounts.map(c => c.count), 1);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-slate-900 rounded-[28px] p-7 text-white shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
              Dasbor Kesiswaan Real-Time
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Firebase Live
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-serif font-bold tracking-tight text-white mt-2">
            Selamat Datang di Portal SIM Madrasah
          </h2>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Sistem informasi manajemen kesiswaan, monitoring performa kelas, dan layanan persuratan mutasi siswa resmi standar EMIS.
          </p>
        </div>

        {/* Live Firebase Cloud Status Card in Banner */}
        <div className="flex items-center gap-3.5 bg-slate-800/90 border border-emerald-500/30 rounded-2xl px-4 py-3.5 shrink-0 shadow-sm backdrop-blur-xs">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
            <Cloud className="w-5 h-5 text-emerald-400" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">
                Google Firebase Firestore
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-400 text-emerald-950">
                LIVE
              </span>
            </div>
            <div className="text-[11px] text-slate-300 font-mono flex items-center gap-2">
              <span className="text-slate-400">Project:</span>
              <span className="text-amber-300 font-bold">{fbStatus.projectId}</span>
            </div>
            <div className="text-[10px] text-emerald-300/80 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Real-Time Cloud Synced</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div 
          onClick={() => onNavigateTab('siswa')}
          className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-xs hover:border-amber-400/60 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-black uppercase tracking-wider">Total Siswa</span>
            <div className="w-10 h-10 rounded-2xl bg-slate-100 group-hover:bg-amber-100 text-black group-hover:text-amber-900 transition flex items-center justify-center">
              <Users className="w-5 h-5 text-black" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-3">
            <h3 className="text-3xl sm:text-4xl font-serif font-bold text-black">{totalCount}</h3>
            <span className="text-xs text-emerald-950 font-bold bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-300">
              {activeStudents.length} Aktif
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-black font-medium mt-3 pt-3 border-t border-slate-100">
            <span className="inline-flex items-center gap-1.5 text-blue-800 font-bold">
              <Mars className="w-4 h-4 text-blue-600" />
              <span>{boysCount} Laki-laki</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-rose-800 font-bold">
              <Venus className="w-4 h-4 text-rose-600" />
              <span>{girlsCount} Perempuan</span>
            </span>
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('mutasi_masuk')}
          className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-xs hover:border-emerald-400/60 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-black uppercase tracking-wider">Mutasi Masuk</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5 text-emerald-800" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-3">
            <h3 className="text-3xl sm:text-4xl font-serif font-bold text-black">{transfersIn.length}</h3>
            <span className="text-xs text-emerald-950 font-bold bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-300">
              {transfersIn.filter(t => t.status === 'Disetujui').length} Disetujui
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-black font-medium mt-3 pt-3 border-t border-slate-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span className="truncate">Surat Resmi Madrasah</span>
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('mutasi_keluar')}
          className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-xs hover:border-amber-400/60 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-black uppercase tracking-wider">Mutasi Keluar</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-amber-800" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-3">
            <h3 className="text-3xl sm:text-4xl font-serif font-bold text-black">{transfersOut.length}</h3>
            <span className="text-xs text-amber-950 font-bold bg-amber-100 px-3 py-1 rounded-lg border border-amber-300">
              {transfersOut.filter(t => t.status === 'Menunggu').length} Menunggu TU
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-black font-medium mt-3 pt-3 border-t border-slate-100">
            <Clock className="w-4 h-4 text-amber-700" />
            <span className="truncate">Validasi bebas administrasi</span>
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('siswa')}
          className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-xs hover:border-amber-400/60 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-black uppercase tracking-wider">Rombel / Kelas</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 group-hover:bg-amber-100 text-amber-900 transition flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-amber-900" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-3">
            <h3 className="text-3xl sm:text-4xl font-serif font-bold text-black">{classes.length}</h3>
            <span className="text-xs text-amber-950 font-bold bg-amber-100 px-3 py-1 rounded-lg border border-amber-300">
              Rombel Aktif
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-black font-medium mt-3 pt-3 border-t border-slate-100">
            <span>Kelas VII, VIII, IX</span>
            <span className="font-bold text-amber-800 hover:underline">Kelola Siswa &rarr;</span>
          </div>
        </div>
      </div>

      {/* Grid: Class Distribution & Gender Ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-[28px] border border-slate-200 p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-serif font-bold text-black text-lg sm:text-xl">Distribusi Siswa per Rombel / Kelas</h3>
              <p className="text-sm text-black font-medium mt-0.5">Jumlah peserta didik terdaftar pada semester berjalan</p>
            </div>
            <button
              onClick={() => onNavigateTab('siswa')}
              className="text-sm font-bold text-amber-800 hover:underline"
            >
              Lihat Semua &rarr;
            </button>
          </div>

          <div className="space-y-4 pt-1">
            {classCounts.map(c => {
              const widthPct = Math.max(8, (c.count / maxClassCount) * 100);
              return (
                <div key={c.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-black">Kelas {c.name}</span>
                    <div className="flex items-center gap-2 text-black font-medium">
                      <span>{c.boys} L</span>
                      <span>•</span>
                      <span>{c.girls} P</span>
                      <span>•</span>
                      <span className="font-mono font-bold text-black">{c.count} Siswa</span>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-slate-900 transition-all duration-500 rounded-full"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gender & Status Composition */}
        <div className="bg-white rounded-[28px] border border-slate-200 p-7 shadow-xs space-y-5 flex flex-col justify-between">
          <div>
            <h3 className="font-serif font-bold text-black text-lg sm:text-xl">Komposisi & Demografi</h3>
            <p className="text-sm text-black font-medium mt-0.5">Rasio peserta didik laki-laki & perempuan</p>

            {/* Gender Ratio Card */}
            <div className="mt-5 p-4.5 bg-slate-50 rounded-2xl space-y-3.5 border border-slate-200">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-blue-800 flex items-center gap-1.5">
                  <Mars className="w-4 h-4 text-blue-600" />
                  <span>Laki-laki ({boysCount})</span>
                </span>
                <span className="text-rose-800 flex items-center gap-1.5">
                  <Venus className="w-4 h-4 text-rose-600" />
                  <span>Perempuan ({girlsCount})</span>
                </span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-blue-600 transition-all duration-500 rounded-l-full"
                  style={{ width: `${totalCount > 0 ? (boysCount / totalCount) * 100 : 50}%` }}
                />
                <div 
                  className="h-full bg-rose-500 transition-all duration-500 rounded-r-full"
                  style={{ width: `${totalCount > 0 ? (girlsCount / totalCount) * 100 : 50}%` }}
                />
              </div>
              <div className="text-center text-xs text-black font-semibold">
                Rasio: {totalCount > 0 ? Math.round((boysCount / totalCount) * 100) : 0}% Laki-laki vs {totalCount > 0 ? Math.round((girlsCount / totalCount) * 100) : 0}% Perempuan
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-xs uppercase tracking-wider font-bold text-black block">Layanan Cepat Surat Kesiswaan</span>
            <button
              onClick={() => onNavigateTab('mutasi_masuk')}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm text-left transition"
            >
              <span className="font-bold text-black">Cetak Surat Penerimaan Mutasi Masuk</span>
              <ArrowDownLeft className="w-4.5 h-4.5 text-emerald-700" />
            </button>
            <button
              onClick={() => onNavigateTab('mutasi_keluar')}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm text-left transition"
            >
              <span className="font-bold text-black">Cetak Surat Keterangan Pindah Keluar</span>
              <ArrowUpRight className="w-4.5 h-4.5 text-amber-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transfer Operations Table */}
      <div className="bg-white rounded-[28px] border border-slate-200 p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-serif font-bold text-black text-lg sm:text-xl">Aktivitas Terkini Surat Mutasi Kesiswaan</h3>
            <p className="text-sm text-black font-medium mt-0.5">Daftar permohonan mutasi masuk dan surat pindah keluar terbaru</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onNavigateTab('mutasi_masuk')}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-black hover:bg-slate-100 transition"
            >
              Semua Mutasi Masuk
            </button>
            <button
              onClick={() => onNavigateTab('mutasi_keluar')}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-black hover:bg-slate-100 transition"
            >
              Semua Mutasi Keluar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-black font-bold uppercase text-xs tracking-wider rounded-xl">
              <tr>
                <th className="py-3.5 px-3.5 rounded-l-xl text-black">Tipe</th>
                <th className="py-3.5 px-3.5 text-black">Nomor Surat Dinas</th>
                <th className="py-3.5 px-3.5 text-black">Nama Siswa</th>
                <th className="py-3.5 px-3.5 text-black">Sekolah Asal / Tujuan</th>
                <th className="py-3.5 px-3.5 text-black">Tanggal</th>
                <th className="py-3.5 px-3.5 text-center text-black">Status</th>
                <th className="py-3.5 px-3.5 text-center rounded-r-xl text-black">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transfersIn.length === 0 && transfersOut.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500 font-medium">
                    Belum ada riwayat mutasi masuk maupun mutasi keluar yang dicatat.
                  </td>
                </tr>
              ) : (
                <>
                  {transfersIn.slice(0, 3).map(tin => (
                    <tr key={tin.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-3.5">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-950 border border-emerald-300">
                          Mutasi Masuk
                        </span>
                      </td>
                      <td className="py-3.5 px-3.5 font-mono text-xs font-bold text-black">{tin.letterNumber}</td>
                      <td className="py-3.5 px-3.5 font-bold text-black text-sm">{tin.studentName}</td>
                      <td className="py-3.5 px-3.5 text-black font-medium">Dari: {tin.originSchool} &rarr; Masuk {tin.targetClass}</td>
                      <td className="py-3.5 px-3.5 text-black font-medium">{tin.requestDate}</td>
                      <td className="py-3.5 px-3.5 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          tin.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-950 border border-emerald-300' :
                          tin.status === 'Menunggu' ? 'bg-amber-100 text-amber-950 border border-amber-300' : 'bg-rose-100 text-rose-950 border border-rose-300'
                        }`}>
                          {tin.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3.5 text-center">
                        <button
                          onClick={() => onPreviewLetter('mutasi_masuk', tin)}
                          className="p-2 text-black hover:text-emerald-800 hover:bg-slate-100 rounded-lg transition"
                          title="Lihat & Cetak Surat"
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {transfersOut.slice(0, 3).map(tout => (
                    <tr key={tout.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-3.5">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-950 border border-amber-300">
                          Mutasi Keluar
                        </span>
                      </td>
                      <td className="py-3.5 px-3.5 font-mono text-xs font-bold text-black">{tout.letterNumber}</td>
                      <td className="py-3.5 px-3.5 font-bold text-black text-sm">{tout.studentName}</td>
                      <td className="py-3.5 px-3.5 text-black font-medium">Kelas {tout.currentClass} &rarr; Ke: {tout.destinationSchool}</td>
                      <td className="py-3.5 px-3.5 text-black font-medium">{tout.requestDate}</td>
                      <td className="py-3.5 px-3.5 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          tout.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-950 border border-emerald-300' :
                          tout.status === 'Menunggu' ? 'bg-amber-100 text-amber-950 border border-amber-300' : 'bg-rose-100 text-rose-950 border border-rose-300'
                        }`}>
                          {tout.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3.5 text-center">
                        <button
                          onClick={() => onPreviewLetter('mutasi_keluar', tout)}
                          className="p-2 text-black hover:text-amber-800 hover:bg-slate-100 rounded-lg transition"
                          title="Lihat & Cetak Surat"
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
