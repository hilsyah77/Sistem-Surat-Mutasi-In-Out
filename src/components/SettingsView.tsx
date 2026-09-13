import React, { useState } from 'react';
import { 
  Building2, 
  UserCheck, 
  Calendar, 
  FileText, 
  Palette, 
  Database, 
  Save, 
  RefreshCw, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  School, 
  ShieldCheck, 
  Award, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Sparkles,
  Sliders,
  Image as ImageIcon,
  Trash2,
  Eye,
  FileImage,
  UploadCloud
} from 'lucide-react';
import { InstitutionProfile, Student, TransferIn, TransferOut } from '../types';
import { generateLetterNumber } from '../utils/letterNumber';

interface SettingsViewProps {
  institution: InstitutionProfile;
  onSaveInstitution: (updated: InstitutionProfile) => Promise<void>;
  students?: Student[];
  transfersIn?: TransferIn[];
  transfersOut?: TransferOut[];
  onResetAllData?: () => Promise<void>;
  onResetData?: () => Promise<void>;
  onRestoreBackup: (payload: any) => Promise<void>;
}

type SettingsSection = 'profil' | 'kop' | 'pejabat' | 'akademik' | 'surat' | 'backup';

export const SettingsView: React.FC<SettingsViewProps> = ({
  institution,
  onSaveInstitution,
  students = [],
  transfersIn = [],
  transfersOut = [],
  onResetAllData,
  onResetData,
  onRestoreBackup
}) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('profil');
  const [formData, setFormData] = useState<InstitutionProfile>({ ...institution });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isResetting, setIsResetting] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);

  const handleChange = (field: keyof InstitutionProfile, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setSaveStatus('idle');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Harap pilih berkas gambar yang valid (PNG, JPG, WebP, atau SVG).');
      return;
    }
    if (file.size > 2.5 * 1024 * 1024) {
      alert('Ukuran berkas logo maksimal 2.5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      handleChange('logoUrl', base64);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleKopUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Harap pilih berkas gambar yang valid (PNG, JPG, atau WebP).');
      return;
    }
    if (file.size > 4.5 * 1024 * 1024) {
      alert('Ukuran berkas gambar kop surat maksimal 4.5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      handleChange('kopImageUrl', base64);
      handleChange('useCustomKopImage', true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      await onSaveInstitution(formData);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3500);
    } catch (err) {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  // Export Complete Backup JSON
  const handleExportBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      institution: formData,
      studentsCount: students.length,
      transfersInCount: transfersIn.length,
      transfersOutCount: transfersOut.length,
      students,
      transfersIn,
      transfersOut
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    const fileName = `backup_sim_madrasah_${formData.name.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().slice(0, 10)}.json`;
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import Backup JSON
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.students && Array.isArray(json.students)) {
          await onRestoreBackup(json);
          if (json.institution) {
            setFormData(json.institution);
          }
          setRestoreMessage(`Berhasil memulihkan ${json.students.length} siswa dan data mutasi.`);
          setTimeout(() => setRestoreMessage(null), 5000);
        } else {
          alert('Format berkas cadangan tidak sesuai!');
        }
      } catch (err) {
        alert('Gagal membaca berkas JSON cadangan!');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const sections: { id: SettingsSection; label: string; icon: any; desc: string }[] = [
    { id: 'profil', label: 'Profil Madrasah', icon: Building2, desc: 'Identitas, NSM & NPSN' },
    { id: 'kop', label: 'Logo & Kop Surat', icon: ImageIcon, desc: 'Upload Logo & Kop Surat' },
    { id: 'pejabat', label: 'Pimpinan & TU', icon: UserCheck, desc: 'Kepala & Titi Mangsa' },
    { id: 'akademik', label: 'Tahun Pelajaran', icon: Calendar, desc: 'Tahun Ajaran & Semester' },
    { id: 'surat', label: 'Format Nomor Surat', icon: FileText, desc: 'Klasifikasi Surat Mutasi' },
    { id: 'backup', label: 'Cadangan & Reset', icon: Database, desc: 'JSON Backup & Pemulihan' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner Header: Islamic Madrasah Settings Identity */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 sm:p-8 rounded-[28px] shadow-sm border border-emerald-600/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none text-9xl">
          ☪
        </div>
        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-900/60 rounded-full text-emerald-200 text-xs font-semibold border border-emerald-500/30">
            <Sliders className="w-3.5 h-3.5 text-emerald-300" />
            <span>Pusat Konfigurasi & Preferensi Sistem</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
            Pengaturan Lembaga & Sistem
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Kelola profil resmi madrasah, upload logo dan kop surat, penandatangan surat dinas, tahun ajaran aktif, dan klasifikasi nomor surat.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold rounded-xl shadow-md transition text-xs sm:text-sm disabled:opacity-60 cursor-pointer"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Settings Navigation & Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Category Navigation */}
        <div className="lg:col-span-1 space-y-2">
          <div className="bg-white p-3 rounded-2xl border border-emerald-100 shadow-2xs space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              Kategori Pengaturan
            </div>
            {sections.map(s => {
              const Icon = s.icon;
              const isActive = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left text-xs transition ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/80 shadow-2xs'
                      : 'text-slate-600 hover:bg-emerald-50/50 hover:text-emerald-800'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg shrink-0 ${
                    isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="block truncate font-semibold">{s.label}</span>
                    <span className="text-[10px] text-slate-400 block truncate">{s.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Summary Card */}
          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/60 text-xs space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-900 font-bold">
              <School className="w-4 h-4 text-emerald-700" />
              <span className="truncate">{formData.name}</span>
            </div>
            <div className="text-[11px] text-emerald-800/80 space-y-1 font-mono">
              <p>NSM: <span className="font-bold text-emerald-950">{formData.nsm}</span></p>
              <p>NPSN: <span className="font-bold text-emerald-950">{formData.npsn}</span></p>
              <p>TP: <span className="font-bold text-emerald-950">{formData.currentAcademicYear} ({formData.currentSemester})</span></p>
            </div>
          </div>
        </div>

        {/* Right Side: Form Configuration Content */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-[28px] border border-emerald-100 shadow-2xs space-y-6">
            
            {/* 1. Profil & Legalitas Lembaga */}
            {activeSection === 'profil' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-emerald-100 pb-4">
                  <h3 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-700" />
                    Identitas & Legalitas Madrasah
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Informasi resmi lembaga yang akan tercetak otomatis pada Kop Surat, Buku Induk Siswa, dan Surat Mutasi.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Nama Resmi Madrasah *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => handleChange('name', e.target.value)}
                      required
                      placeholder="Contoh: MTs. Asy-Syafi'iyyah Jatibarang"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none uppercase font-semibold text-slate-900 bg-slate-50/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Nomor Statistik Madrasah (NSM) *</label>
                    <input
                      type="text"
                      value={formData.nsm}
                      onChange={e => handleChange('nsm', e.target.value)}
                      required
                      placeholder="12 digit angka NSM"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Nomor Pokok Sekolah Nasional (NPSN) *</label>
                    <input
                      type="text"
                      value={formData.npsn}
                      onChange={e => handleChange('npsn', e.target.value)}
                      required
                      placeholder="8 digit NPSN"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Jenjang / Bentuk Pendidikan</label>
                    <select
                      value={formData.level}
                      onChange={e => handleChange('level', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-slate-800"
                    >
                      <option value="Madrasah Ibtidaiyah (MI)">Madrasah Ibtidaiyah (MI)</option>
                      <option value="Madrasah Tsanawiyah (MTs)">Madrasah Tsanawiyah (MTs)</option>
                      <option value="Madrasah Aliyah (MA)">Madrasah Aliyah (MA)</option>
                      <option value="Madrasah Aliyah Kejuruan (MAK)">Madrasah Aliyah Kejuruan (MAK)</option>
                      <option value="Pondok Pesantren / Madrasah Diniyah">Pondok Pesantren / Diniyah</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Status Akreditasi Badan BAN-SM</label>
                    <input
                      type="text"
                      value={formData.accreditation || 'A (Unggul)'}
                      onChange={e => handleChange('accreditation', e.target.value)}
                      placeholder="Contoh: A (Unggul)"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Alamat Jalan & Komplek Gedung</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={e => handleChange('address', e.target.value)}
                      placeholder="Jl. Pemuda No. 45, Komplek Pendidikan Islami"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Kelurahan / Desa</label>
                    <input
                      type="text"
                      value={formData.village}
                      onChange={e => handleChange('village', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Kecamatan</label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={e => handleChange('district', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Kota / Kabupaten</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={e => handleChange('city', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Provinsi & Kode Pos</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={formData.province}
                        onChange={e => handleChange('province', e.target.value)}
                        placeholder="Provinsi"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800"
                      />
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={e => handleChange('postalCode', e.target.value)}
                        placeholder="Kode Pos"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Telepon / No. HP Madrasah</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={e => handleChange('phone', e.target.value)}
                      placeholder="(021) 8612984"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Email Resmi</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => handleChange('email', e.target.value)}
                      placeholder="info@mtsn1teladan.sch.id"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Website Resmi Madrasah</label>
                    <input
                      type="text"
                      value={formData.website}
                      onChange={e => handleChange('website', e.target.value)}
                      placeholder="https://mts-asysyafiiyyah.sch.id"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. Logo & Kop Surat Madrasah */}
            {activeSection === 'kop' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-emerald-100 pb-4">
                  <h3 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-emerald-700" />
                    Pengaturan Logo & Kop Surat Resmi
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Unggah logo lambang lembaga dan gambar kop surat resmi madrasah untuk penerbitan surat mutasi, surat keterangan, dan cetak dokumen dinas.
                  </p>
                </div>

                {/* 1. Upload Logo Madrasah */}
                <div className="p-5 sm:p-6 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <School className="w-4 h-4 text-emerald-700" />
                        Logo / Lambang Madrasah
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Ditampilkan pada navigasi sistem, kop surat otomatis, dan identitas resmi madrasah.
                      </p>
                    </div>
                    {formData.logoUrl ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Logo Terpasang
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold border border-amber-300">
                        Logo Bawaan Sistem
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-5 pt-2">
                    {/* Logo Preview Box */}
                    <div className="w-28 h-28 rounded-2xl bg-white border-2 border-dashed border-emerald-300 flex items-center justify-center p-2 shadow-xs shrink-0 overflow-hidden relative group">
                      {formData.logoUrl ? (
                        <img
                          src={formData.logoUrl}
                          alt="Logo Madrasah"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-center p-2">
                          <School className="w-8 h-8 text-emerald-600/50 mx-auto" />
                          <span className="text-[10px] text-slate-400 font-medium block mt-1">Belum Ada Logo</span>
                        </div>
                      )}
                    </div>

                    {/* Logo Action Controls */}
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <input
                          type="file"
                          id="file-upload-logo"
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="file-upload-logo"
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-2xs"
                        >
                          <UploadCloud className="w-4 h-4" />
                          <span>{formData.logoUrl ? 'Ganti Logo Madrasah' : 'Pilih & Upload Logo'}</span>
                        </label>

                        {formData.logoUrl && (
                          <button
                            type="button"
                            onClick={() => handleChange('logoUrl', '')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 text-rose-600" />
                            <span>Hapus Logo</span>
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Format yang didukung: <strong>PNG (disarankan transparan), JPG, WebP, SVG</strong>. Ukuran proporsional persegi (1:1), maksimal 2.5MB.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Upload Berkas Gambar Kop Surat */}
                <div className="p-5 sm:p-6 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <FileImage className="w-4 h-4 text-emerald-700" />
                        Gambar Kop Surat Resmi (Banner Horizontal)
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Unggah berkas gambar kop surat dinas lengkap yang sudah didesain khusus oleh madrasah.
                      </p>
                    </div>
                    {formData.kopImageUrl ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Kop Surat Terpasang
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-xs font-medium">
                        Kop Otomatis Teks
                      </span>
                    )}
                  </div>

                  {/* Kop Surat Preview Box */}
                  <div className="w-full min-h-[110px] max-h-[160px] rounded-2xl bg-white border-2 border-dashed border-emerald-300 flex items-center justify-center p-3 shadow-xs overflow-hidden">
                    {formData.kopImageUrl ? (
                      <img
                        src={formData.kopImageUrl}
                        alt="Berkas Kop Surat"
                        className="w-full max-h-36 object-contain"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <FileImage className="w-10 h-10 text-emerald-600/40 mx-auto" />
                        <p className="text-xs text-slate-500 font-semibold mt-1.5">
                          Belum ada berkas gambar kop surat yang diunggah
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Sistem saat ini menggunakan format kop surat teks standar madrasah secara otomatis.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Toggle Checkbox: Use Custom Kop Image */}
                  {formData.kopImageUrl && (
                    <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          id="chk-use-custom-kop"
                          checked={formData.useCustomKopImage ?? true}
                          onChange={e => handleChange('useCustomKopImage', e.target.checked)}
                          className="w-4 h-4 text-emerald-700 rounded-sm focus:ring-emerald-500 cursor-pointer"
                        />
                        <label htmlFor="chk-use-custom-kop" className="text-xs font-bold text-emerald-950 cursor-pointer">
                          Gunakan gambar kop surat ini saat cetak & unduh PDF surat resmi
                        </label>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900">
                        {formData.useCustomKopImage ? 'AKTIF' : 'NONAKTIF'}
                      </span>
                    </div>
                  )}

                  {/* Kop Action Controls */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <input
                      type="file"
                      id="file-upload-kop"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleKopUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload-kop"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-2xs"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>{formData.kopImageUrl ? 'Ganti Gambar Kop Surat' : 'Pilih & Upload Kop Surat'}</span>
                    </label>

                    {formData.kopImageUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          handleChange('kopImageUrl', '');
                          handleChange('useCustomKopImage', false);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-rose-600" />
                        <span>Hapus Kop Surat</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Format gambar yang didukung: <strong>PNG, JPG, WebP</strong>. Disarankan gambar memanjang horizontal dengan resolusi tajam (contoh: 1200x250 px atau 1800x350 px), maksimal 4.5MB.
                  </p>
                </div>

                {/* 3. Live Preview Card */}
                <div className="p-5 sm:p-6 bg-white rounded-2xl border-2 border-emerald-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-emerald-700" />
                      Pratinjau Tampilan Kop Surat Pada Dokumen Resmi
                    </h4>
                    <span className="text-[10px] font-semibold text-slate-500">
                      Ukuran Proporsional Kertas A4
                    </span>
                  </div>

                  <div className="p-4 sm:p-6 bg-white rounded-xl border border-slate-200 shadow-xs">
                    {formData.useCustomKopImage && formData.kopImageUrl ? (
                      <div className="border-b-2 border-slate-900 pb-2">
                        <img
                          src={formData.kopImageUrl}
                          alt="Kop Surat Aktif"
                          className="w-full max-h-32 object-contain mx-auto"
                        />
                      </div>
                    ) : (
                      <div className="text-center pb-3 border-b-4 border-double border-emerald-900">
                        <div className="flex items-center justify-center gap-4 mb-2">
                          {formData.logoUrl ? (
                            <img
                              src={formData.logoUrl}
                              alt="Logo Madrasah"
                              className="w-14 h-14 object-contain shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-emerald-800 text-amber-300 flex items-center justify-center font-bold text-xl border-2 border-amber-400 shadow-xs shrink-0">
                              ☪
                            </div>
                          )}
                          <div>
                            <h2 className="font-sans font-extrabold text-lg sm:text-xl text-emerald-900 uppercase tracking-tight">
                              {formData.name}
                            </h2>
                            <p className="text-[11px] text-slate-600 font-sans mt-0.5">
                              {formData.address}, {formData.village}, {formData.district}, {formData.city} {formData.postalCode}
                            </p>
                            <p className="text-[11px] text-slate-600 font-sans">
                              Telp: {formData.phone} | Email: {formData.email} | Web: {formData.website}
                            </p>
                            <p className="text-[11px] font-sans font-semibold text-emerald-800 mt-0.5">
                              NSM: {formData.nsm} | NPSN: {formData.npsn} {formData.accreditation ? `| Akreditasi: ${formData.accreditation}` : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* 3. Pimpinan & Penandatangan TU */}
            {activeSection === 'pejabat' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-emerald-100 pb-4">
                  <h3 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-emerald-700" />
                    Pimpinan Madrasah & Penandatangan Surat Dinas
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Nama dan NIP pejabat yang secara sah berwenang menandatangani Surat Keterangan Pindah, Surat Mutasi Masuk, dan Surat Siswa Aktif.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Nama Lengkap Kepala Madrasah & Gelar *</label>
                    <input
                      type="text"
                      value={formData.headmasterName}
                      onChange={e => handleChange('headmasterName', e.target.value)}
                      required
                      placeholder="Contoh: Drs. H. Ahmad Fauzi, M.Pd.I"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">NIP Kepala Madrasah</label>
                    <input
                      type="text"
                      value={formData.headmasterNip}
                      onChange={e => handleChange('headmasterNip', e.target.value)}
                      placeholder="19740815 199903 1 004 (atau kosong jika swasta)"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Sebutan Jabatan Pimpinan</label>
                    <input
                      type="text"
                      value={formData.headmasterTitle}
                      onChange={e => handleChange('headmasterTitle', e.target.value)}
                      placeholder="Kepala Madrasah"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Nama Kepala Tata Usaha (TU)</label>
                    <input
                      type="text"
                      value={formData.headTUName || 'M. Zulkifli, S.Kom'}
                      onChange={e => handleChange('headTUName', e.target.value)}
                      placeholder="Nama Kepala TU"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">NIP Kepala Tata Usaha</label>
                    <input
                      type="text"
                      value={formData.headTUNip || '19820410 200801 1 012'}
                      onChange={e => handleChange('headTUNip', e.target.value)}
                      placeholder="NIP Kepala TU"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono text-slate-800"
                    />
                  </div>

                  <div className="sm:col-span-2 p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/60 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    <div className="text-xs text-emerald-900 leading-relaxed">
                      <strong>Ketentuan Naskah Dinas Madrasah:</strong> Dokumen yang dicetak menggunakan tanda tangan resmi ini memiliki keabsahan hukum administratif dan telah disesuaikan dengan pedoman tata naskah dinas resmi madrasah.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Tahun Ajaran & Periode */}
            {activeSection === 'akademik' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-emerald-100 pb-4">
                  <h3 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-700" />
                    Periode Akademik & Tahun Pelajaran
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Atur tahun pelajaran yang sedang berlangsung serta semester aktif madrasah.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Tahun Pelajaran Berjalan *</label>
                    <select
                      value={formData.currentAcademicYear}
                      onChange={e => handleChange('currentAcademicYear', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-mono font-bold text-emerald-950"
                    >
                      <option value="2024/2025">2024/2025</option>
                      <option value="2025/2026">2025/2026</option>
                      <option value="2026/2027">2026/2027</option>
                      <option value="2027/2028">2027/2028</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Semester Aktif *</label>
                    <select
                      value={formData.currentSemester}
                      onChange={e => handleChange('currentSemester', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-bold text-emerald-950"
                    >
                      <option value="Ganjil">Semester Ganjil (I)</option>
                      <option value="Genap">Semester Genap (II)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Kota Tempat Terbit Surat (Titi Mangsa)</label>
                    <input
                      type="text"
                      value={formData.city.replace(/Kota\s+|Kabupaten\s+/i, '')}
                      onChange={e => handleChange('city', e.target.value)}
                      placeholder="Padang / Jakarta / Surabaya"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900"
                    />
                    <span className="text-[10px] text-slate-400">Digunakan pada tanggal surat (Contoh: "Jakarta, 12 Juli 2026")</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Format Nomor Surat Dinas */}
            {activeSection === 'surat' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-emerald-100 pb-4">
                  <h3 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-700" />
                    Pola Format Penomoran Surat Dinas Mutasi
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Klasifikasi tata persuratan kearsipan Kementerian Agama untuk penerbitan surat otomatis.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/70 rounded-2xl text-emerald-900 text-xs flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Sinkronisasi Otomatis ke Formulir</p>
                      <p className="text-emerald-800 text-[11px] mt-0.5">
                        Nomor surat pada formulir <strong>Pendaftaran Mutasi Masuk</strong> dan <strong>Pengajuan Mutasi Keluar</strong> akan terisi secara otomatis mengikuti format yang Anda simpan di sini.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Format Nomor Surat Mutasi Masuk (Diterima)</label>
                    <input
                      type="text"
                      value={formData.letterFormatIn || 'MTs.01.05/PP.00.5/{NO}/2026'}
                      onChange={e => handleChange('letterFormatIn', e.target.value)}
                      placeholder="Contoh: MTs.01.05/PP.00.5/{NO}/2026"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono text-slate-900"
                    />
                    <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-500 mt-1">
                      <span>Variabel yang didukung:</span>
                      <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-800 font-bold">{'{NO}'}</code>
                      <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-800 font-bold">{'{BULAN}'}</code>
                      <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-800 font-bold">{'{ROMAN_BULAN}'}</code>
                      <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-800 font-bold">{'{TAHUN}'}</code>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Format Nomor Surat Keterangan Pindah (Mutasi Keluar)</label>
                    <input
                      type="text"
                      value={formData.letterFormatOut || 'MTs.01.05/PP.00.5/{NO}/2026'}
                      onChange={e => handleChange('letterFormatOut', e.target.value)}
                      placeholder="Contoh: MTs.01.05/PP.00.5/{NO}/2026"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono text-slate-900"
                    />
                    <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-500 mt-1">
                      <span>Variabel yang didukung:</span>
                      <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-800 font-bold">{'{NO}'}</code>
                      <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-800 font-bold">{'{BULAN}'}</code>
                      <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-800 font-bold">{'{ROMAN_BULAN}'}</code>
                      <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-800 font-bold">{'{TAHUN}'}</code>
                    </div>
                  </div>

                  {/* Sample Letter Preview Box */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Pratinjau Hasil Nomor Surat Otomatis
                      </span>
                      <span className="text-[10px] text-slate-400 italic">
                        Contoh nomor urut 001 & 042
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="font-mono text-xs text-emerald-950 font-medium bg-white p-3 rounded-xl border border-emerald-200/80 flex items-center justify-between">
                        <span className="text-slate-500 font-sans text-[11px] font-semibold">Mutasi Masuk:</span>
                        <span className="font-bold text-emerald-800">{generateLetterNumber(formData.letterFormatIn, 42)}</span>
                      </div>
                      <div className="font-mono text-xs text-emerald-950 font-medium bg-white p-3 rounded-xl border border-emerald-200/80 flex items-center justify-between">
                        <span className="text-slate-500 font-sans text-[11px] font-semibold">Mutasi Keluar:</span>
                        <span className="font-bold text-emerald-800">{generateLetterNumber(formData.letterFormatOut, 19)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Cadangan & Reset Data */}
            {activeSection === 'backup' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-emerald-100 pb-4">
                  <h3 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-700" />
                    Pusat Cadangan (Backup) & Pemulihan Data
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Amankan seluruh basis data Buku Induk Siswa, riwayat mutasi masuk, mutasi keluar, dan pengaturan lembaga ke dalam berkas JSON mandiri.
                  </p>
                </div>

                {restoreMessage && (
                  <div className="p-4 bg-emerald-100 text-emerald-900 rounded-2xl border border-emerald-300 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>{restoreMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Backup Card */}
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Unduh Cadangan Lengkap (JSON)</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Menyimpan {students.length} siswa, {transfersIn.length} mutasi masuk, dan {transfersOut.length} mutasi keluar.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleExportBackup}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
                    >
                      <Download className="w-4 h-4" />
                      <span>Unduh File Backup</span>
                    </button>
                  </div>

                  {/* Restore Card */}
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Pulihkan dari Berkas Cadangan</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Impor kembali berkas JSON cadangan yang pernah diunduh sebelumnya.
                      </p>
                    </div>
                    <label className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs">
                      <Upload className="w-4 h-4" />
                      <span>Pilih File Cadangan (.json)</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportBackup}
                        className="hidden"
                      />
                    </label>
                  </div>

                </div>

                {/* Reset / Kosongkan Data Section with Caution */}
                <div className="p-5 bg-rose-50/70 rounded-2xl border border-rose-200 space-y-3 mt-4">
                  <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Hapus Seluruh Data Siswa & Mutasi (Kosongkan Data)</span>
                  </div>
                  <p className="text-xs text-rose-700 leading-relaxed">
                    Tindakan ini akan menghapus seluruh data siswa, riwayat mutasi masuk, dan mutasi keluar baik di penyimpanan cloud Firebase maupun lokal. Aplikasi akan berada dalam kondisi bersih (0 siswa) dan siap untuk penginputan data riil madrasah.
                  </p>
                  <button
                    type="button"
                    disabled={isResetting}
                    onClick={async () => {
                      if (window.confirm('Apakah Anda yakin ingin menghapus seluruh data siswa dan mutasi? Database akan dikosongkan secara permanen.')) {
                        setIsResetting(true);
                        try {
                          await onResetAllData();
                          setRestoreMessage('Seluruh data siswa dan mutasi telah berhasil dihapus dan dikosongkan.');
                          setTimeout(() => setRestoreMessage(null), 4000);
                        } finally {
                          setIsResetting(false);
                        }
                      }
                    }}
                    className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-xl transition disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {isResetting ? 'Menghapus data...' : 'Hapus & Kosongkan Semua Data'}
                  </button>
                </div>

              </div>
            )}

            {/* Bottom Form Action Buttons & Notification */}
            <div className="pt-5 border-t border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {saveStatus === 'success' && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Pengaturan berhasil disimpan ke penyimpanan lokal & cloud!</span>
                  </div>
                )}
                {saveStatus === 'error' && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-700 font-bold bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Terjadi kendala saat menyimpan. Silakan coba lagi.</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition disabled:opacity-60 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
                </button>
              </div>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
};
