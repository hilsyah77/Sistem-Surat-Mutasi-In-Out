import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  UserMinus, 
  BarChart3, 
  Settings, 
  FileSpreadsheet, 
  FileText, 
  School, 
  Calendar, 
  Menu, 
  X, 
  ShieldCheck,
  Cloud
} from 'lucide-react';
import { InstitutionProfile } from '../types';
import { defaultInstitution } from '../services/mockData';

export type TabType = 'dasbor' | 'siswa' | 'mutasi_masuk' | 'mutasi_keluar' | 'analitik' | 'pengaturan';

interface TopNavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenAddStudent?: () => void;
  onOpenUploadStudent?: () => void;
  institution?: InstitutionProfile;
  totalStudents: number;
  transfersInCount: number;
  transfersOutCount: number;
  onExportExcel: () => void;
  onExportPDF: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddStudent,
  onOpenUploadStudent,
  institution = defaultInstitution,
  totalStudents,
  transfersInCount,
  transfersOutCount,
  onExportExcel,
  onExportPDF,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { 
      id: 'dasbor' as TabType, 
      label: 'Dasbor', 
      shortLabel: 'Dasbor',
      icon: LayoutDashboard,
      badge: null
    },
    { 
      id: 'siswa' as TabType, 
      label: 'Buku Induk Siswa', 
      shortLabel: 'Buku Induk',
      icon: Users,
      badge: totalStudents > 0 ? totalStudents.toString() : null
    },
    { 
      id: 'mutasi_masuk' as TabType, 
      label: 'Mutasi Masuk', 
      shortLabel: 'Mutasi Masuk',
      icon: UserPlus,
      badge: transfersInCount > 0 ? transfersInCount.toString() : null
    },
    { 
      id: 'mutasi_keluar' as TabType, 
      label: 'Mutasi Keluar', 
      shortLabel: 'Mutasi Keluar',
      icon: UserMinus,
      badge: transfersOutCount > 0 ? transfersOutCount.toString() : null
    },
    { 
      id: 'analitik' as TabType, 
      label: 'Analitik EMIS', 
      shortLabel: 'Analitik',
      icon: BarChart3,
      badge: null
    },
    { 
      id: 'pengaturan' as TabType, 
      label: 'Pengaturan Lembaga', 
      shortLabel: 'Pengaturan',
      icon: Settings,
      badge: null
    },
  ];

  const handleSelectTab = (tab: TabType) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full shadow-md">
      {/* ─── TIER 1: TOP BRAND & ACTION BANNER ─── */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white border-b border-emerald-700/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            
            {/* Left: Brand Crest & Institution Info */}
            <div className="flex items-center gap-3 overflow-hidden">
              {institution.logoUrl ? (
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center p-1 shadow-md border border-amber-200/50 shrink-0 overflow-hidden">
                  <img
                    src={institution.logoUrl}
                    alt="Logo Madrasah"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-300 to-emerald-400 flex items-center justify-center font-bold text-base shadow-md border border-amber-200/50 shrink-0">
                  <School className="w-5 h-5 text-emerald-950" />
                </div>
              )}

              <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                  <h1 className="font-serif font-extrabold text-lg sm:text-xl text-white leading-tight truncate tracking-tight">
                    {institution.name}
                  </h1>
                  <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/15 text-white border border-white/20 backdrop-blur-xs shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                    NSM: {institution.nsm}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-emerald-100 font-medium mt-0.5">
                  <span className="truncate">{institution.level} • {institution.city}</span>
                  <span className="opacity-60">•</span>
                  <span className="flex items-center gap-1 text-white font-bold shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-amber-300" />
                    T.A. {institution.currentAcademicYear} ({institution.currentSemester})
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Actions & User */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              
              {/* Firebase Cloud Live Badge */}
              <div 
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-400/40 text-white text-xs font-semibold shadow-xs"
                title="Google Firebase Firestore Live Terhubung"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <Cloud className="w-3.5 h-3.5 text-emerald-300" />
                <span className="font-bold text-[11px] text-emerald-200 tracking-wide">Firebase Live</span>
              </div>

              {/* Quick Export Excel & PDF Buttons */}
              <div className="hidden lg:flex items-center gap-1 bg-black/20 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={onExportExcel}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition"
                  title="Ekspor Seluruh Siswa ke Excel (.xlsx)"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
                </button>
                <button
                  type="button"
                  onClick={onExportPDF}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition"
                  title="Cetak Laporan Resmi Siswa ke PDF"
                >
                  <FileText className="w-4 h-4 text-emerald-300" />
                </button>
              </div>

              {/* User Profile Card */}
              <div 
                className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-white/15 bg-white/10 text-left"
                title="Sistem Informasi Manajemen Kesiswaan Madrasah"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-950/40 flex items-center justify-center font-bold text-sm shrink-0 text-emerald-200">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm leading-tight text-white">
                    SIM Madrasah
                  </p>
                  <p className="text-xs text-emerald-200 font-medium leading-tight">
                    Sistem Aktif
                  </p>
                </div>
              </div>

              {/* Mobile Hamburger Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition border border-white/20"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ─── TIER 2: MENU NAVIGASI UTAMA BERJAJAR DI ATAS (HORIZONTAL NAVBAR) ─── */}
      <nav className="bg-white border-b border-slate-200/90 shadow-xs hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            
            {/* Horizontal Menu Tabs: Menu Navigasi Utama Berjajar di Atas */}
            <div className="flex items-center gap-1 sm:gap-1.5 py-2 overflow-x-auto no-scrollbar min-w-0">
              {/* Label Indikator Menu Navigasi Utama */}
              <div className="hidden xl:flex items-center gap-2 pr-3 mr-1 border-r border-slate-200 text-xs font-black uppercase tracking-wider text-slate-800 shrink-0 select-none">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>Menu Navigasi Utama:</span>
              </div>

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    id={`nav-menu-${item.id}`}
                    type="button"
                    onClick={() => handleSelectTab(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs xl:text-sm font-bold transition duration-150 shrink-0 select-none ${
                      isActive 
                        ? 'bg-emerald-800 text-white shadow-xs' 
                        : 'text-slate-700 hover:text-emerald-950 hover:bg-emerald-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                    <span className="whitespace-nowrap">{item.label}</span>

                    {item.badge && (
                      <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-full leading-none shrink-0 ${
                        isActive
                          ? 'bg-emerald-950 text-emerald-100 border border-emerald-600'
                          : 'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Status Tag on Right Side of Navbar */}
            <div className="hidden 2xl:flex items-center gap-2.5 py-2 text-xs text-slate-600 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span className="font-bold text-slate-700">SIM Madrasah Terhubung</span>
              <span className="text-slate-300">|</span>
              <span className="font-mono text-xs text-slate-700 font-semibold">
                Akreditasi {institution.accreditation || 'A'}
              </span>
            </div>

          </div>
        </div>
      </nav>

      {/* ─── MOBILE RESPONSIVE DROPDOWN MENU ─── */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="p-4 space-y-1.5 max-h-[80vh] overflow-y-auto">
            <div className="text-xs font-black uppercase tracking-wider text-slate-800 px-3 py-1 flex items-center justify-between border-b border-slate-100 pb-2 mb-1">
              <span>Menu Navigasi Utama</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">SIM</span>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition ${
                    isActive
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${
                      isActive 
                        ? 'bg-emerald-950 text-emerald-100 border border-emerald-600' 
                        : 'bg-slate-200 text-slate-800'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Quick Mobile Tools */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onExportExcel();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Ekspor Excel</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onExportPDF();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Cetak PDF</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </header>
  );
};
