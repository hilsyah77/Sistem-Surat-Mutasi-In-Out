import React, { useRef } from 'react';
import { Printer, Download, X, CheckCircle, ShieldCheck } from 'lucide-react';
import { defaultInstitution } from '../services/mockData';
import { InstitutionProfile } from '../types';
import { generateLetterNumber } from '../utils/letterNumber';
import jsPDF from 'jspdf';

interface OfficialLetterProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'mutasi_masuk' | 'mutasi_keluar' | 'siswa_aktif';
  data: any;
  institution?: InstitutionProfile;
}

export const OfficialLetterPreviewModal: React.FC<OfficialLetterProps> = ({
  isOpen,
  onClose,
  type,
  data,
  institution = defaultInstitution
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const inst = institution;
    let titleY = 46;

    // Kop Surat
    if (inst.useCustomKopImage && inst.kopImageUrl) {
      try {
        doc.addImage(inst.kopImageUrl, 'PNG', 18, 10, 174, 30, undefined, 'FAST');
        titleY = 46;
      } catch (e) {
        console.warn('Could not add custom kop image to PDF, falling back to text:', e);
      }
    } else {
      if (inst.logoUrl) {
        try {
          doc.addImage(inst.logoUrl, 'PNG', 20, 14, 20, 20, undefined, 'FAST');
        } catch (e) {
          console.warn('Could not add logo to PDF:', e);
        }
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(20, 83, 45); // Dark Islamic Green
      doc.text((inst?.name || 'MADRASAH').toUpperCase(), 108, 19, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(75, 85, 99);
      doc.text(`${inst.address}, ${inst.village}, ${inst.district}, ${inst.city} ${inst.postalCode}`, 108, 24, { align: 'center' });
      doc.text(`Telp: ${inst.phone} | Email: ${inst.email} | Website: ${inst.website}`, 108, 28, { align: 'center' });
      doc.text(`NSM: ${inst.nsm} | NPSN: ${inst.npsn}${inst.accreditation ? ` | Status Akreditasi: ${inst.accreditation}` : ''}`, 108, 32, { align: 'center' });

      // Double divider line
      doc.setDrawColor(20, 83, 45);
      doc.setLineWidth(0.8);
      doc.line(18, 36, 192, 36);
      doc.setLineWidth(0.2);
      doc.line(18, 37.2, 192, 37.2);
      titleY = 45;
    }

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);
    
    let title = 'SURAT KETERANGAN RESMI MADRASAH';
    const fallbackNum = type === 'mutasi_masuk'
      ? generateLetterNumber(inst.letterFormatIn, 1)
      : type === 'mutasi_keluar'
      ? generateLetterNumber(inst.letterFormatOut, 1)
      : generateLetterNumber(inst.letterFormatOut || inst.letterFormatIn, 1);
    const letNum = data.letterNumber || fallbackNum;
    
    if (type === 'mutasi_masuk') {
      title = 'SURAT KETERANGAN PENERIMAAN MUTASI MASUK';
    } else if (type === 'mutasi_keluar') {
      title = 'SURAT KETERANGAN PINDAH / MUTASI KELUAR';
    } else {
      title = 'SURAT KETERANGAN SISWA AKTIF';
    }

    doc.text(title, 105, titleY, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text(`Nomor: ${letNum}`, 105, titleY + 5, { align: 'center' });

    // Intro statement
    doc.setFontSize(10);
    doc.text(`Yang bertanda tangan di bawah ini, ${inst.headmasterTitle} ${inst.name} menerangkan bahwa:`, 22, titleY + 15);

    // Body content
    let startY = titleY + 24;
    const lineSpacing = 6.5;

    if (type === 'mutasi_masuk') {
      const items = [
        ['Nama Siswa', `: ${data.studentName}`],
        ['NISN', `: ${data.nisn}`],
        ['Jenis Kelamin', `: ${data.gender === 'L' ? 'Laki-laki' : 'Perempuan'}`],
        ['Madrasah / Sekolah Asal', `: ${data.originSchool}`],
        ['NPSN Asal', `: ${data.originNpsn || '-'}`],
        ['Diterima di Kelas', `: ${data.targetClass}`],
        ['Tahun Pelajaran', `: ${data.academicYear || inst.currentAcademicYear}`],
        ['Nama Orang Tua / Wali', `: ${data.parentName || '-'}`],
        ['Alasan Mutasi', `: ${data.reason}`]
      ];

      items.forEach(([label, val]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 26, startY);
        doc.setFont('helvetica', 'normal');
        doc.text(val, 75, startY);
        startY += lineSpacing;
      });

      startY += 4;
      doc.text('Telah memenuhi syarat administrasi penerimaan siswa pindahan (mutasi masuk) dan resmi dinyatakan', 22, startY);
      startY += 5;
      doc.setFont('helvetica', 'bold');
      doc.text(`DITERIMA sebagai peserta didik di lingkungan ${inst.name}.`, 22, startY);
      doc.setFont('helvetica', 'normal');
      startY += 6;
      doc.text('Demikian surat keterangan penerimaan ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.', 22, startY);

    } else if (type === 'mutasi_keluar') {
      const items = [
        ['Nama Siswa', `: ${data.studentName}`],
        ['Nomor Induk Siswa (NIS)', `: ${data.nis}`],
        ['NISN', `: ${data.nisn}`],
        ['Kelas Terakhir', `: ${data.currentClass}`],
        ['Madrasah / Sekolah Tujuan', `: ${data.destinationSchool}`],
        ['Alamat Tujuan', `: ${data.destinationAddress || '-'}`],
        ['Tahun Pelajaran', `: ${data.academicYear || inst.currentAcademicYear}`],
        ['Alasan Pindah', `: ${data.reason}`]
      ];

      items.forEach(([label, val]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 26, startY);
        doc.setFont('helvetica', 'normal');
        doc.text(val, 78, startY);
        startY += lineSpacing;
      });

      startY += 4;
      doc.text('Berdasarkan permohonan tertulis orang tua/wali siswa bersangkutan dan setelah dilakukan verifikasi,', 22, startY);
      startY += 5;
      doc.text('yang bersangkutan TIDAK MEMILIKI TANGGUNGAN administrasi akademik, perpustakaan, maupun keuangan madrasah.', 22, startY);
      startY += 6;
      doc.text('Demikian surat keterangan pindah/mutasi keluar ini diterbitkan untuk dipergunakan sesuai ketentuan yang berlaku.', 22, startY);
    } else {
      const items = [
        ['Nama Lengkap Siswa', `: ${data.name}`],
        ['Nomor Induk Siswa (NIS)', `: ${data.nis}`],
        ['NISN', `: ${data.nisn}`],
        ['Tempat, Tanggal Lahir', `: ${data.birthPlace}, ${data.birthDate}`],
        ['Jenis Kelamin', `: ${data.gender === 'L' ? 'Laki-laki' : 'Perempuan'}`],
        ['Duduk di Kelas', `: ${data.classId}`],
        ['Nama Orang Tua / Wali', `: ${data.parentName}`],
        ['Alamat Tempat Tinggal', `: ${data.address}`]
      ];

      items.forEach(([label, val]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 26, startY);
        doc.setFont('helvetica', 'normal');
        doc.text(val, 75, startY);
        startY += lineSpacing;
      });

      startY += 4;
      doc.text(`Adalah benar-benar siswa aktif ${inst.name} pada Tahun Ajaran ${inst.currentAcademicYear}.`, 22, startY);
      startY += 6;
      doc.text('Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.', 22, startY);
    }

    // Signature Block
    const sigY = Math.max(startY + 15, 175);
    const sigX = 130;
    doc.text(`${inst.city}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, sigX, sigY);
    doc.text(inst.headmasterTitle, sigX, sigY + 5);
    
    doc.setFont('helvetica', 'bold');
    doc.text(inst.headmasterName, sigX, sigY + 28);
    doc.setFont('helvetica', 'normal');
    doc.text(`NIP. ${inst.headmasterNip}`, sigX, sigY + 33);

    // Save
    doc.save(`Surat_${type}_${(data.studentName || data.name || 'Dokumen').replace(/\s+/g, '_')}.pdf`);
  };

  const inst = institution;
  const isMasuk = type === 'mutasi_masuk';
  const isKeluar = type === 'mutasi_keluar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-[32px] shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-[#EAE7E2]">
        {/* Modal Header (Hidden during browser print) */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#F5F5F0] bg-[#FDFBF7] rounded-t-[32px] print:hidden">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#F5F5F0] border border-[#EAE7E2] flex items-center justify-center text-[#5A5A40] font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-[#5A5A40]">
                {isMasuk && 'Pratinjau Surat Penerimaan Mutasi Masuk'}
                {isKeluar && 'Pratinjau Surat Keterangan Mutasi Keluar'}
                {!isMasuk && !isKeluar && 'Pratinjau Surat Keterangan Siswa Aktif'}
              </h3>
              <p className="text-xs text-[#A3A398]">
                Format resmi standar madrasah dengan Kop Surat & Nomor Agenda Dinas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              id="btn-print-letter"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#7A7A6E] bg-white border border-[#EAE7E2] rounded-xl hover:bg-[#F5F5F0] transition shadow-2xs"
            >
              <Printer className="w-4 h-4 text-[#7A7A6E]" />
              <span>Cetak (Print)</span>
            </button>
            <button
              id="btn-download-pdf-letter"
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#5A5A40] rounded-xl hover:bg-[#484833] transition shadow-2xs"
            >
              <Download className="w-4 h-4" />
              <span>Unduh PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#A3A398] hover:text-[#434343] rounded-xl hover:bg-[#F5F5F0] transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Paper Area */}
        <div className="p-6 md:p-10 overflow-y-auto bg-[#F5F5F0] flex justify-center">
          <div 
            ref={printRef}
            id="official-letter-paper"
            className="w-full max-w-[210mm] min-h-[297mm] bg-white p-8 md:p-12 shadow-lg text-gray-900 font-serif leading-relaxed text-[13px] border border-[#EAE7E2] print:border-none print:shadow-none print:p-0 print:m-0"
          >
            {/* KOP SURAT MADRASAH */}
            {inst.useCustomKopImage && inst.kopImageUrl ? (
              <div className="text-center mb-6 pb-2 border-b-2 border-slate-900">
                <img
                  src={inst.kopImageUrl}
                  alt="Kop Surat Resmi Madrasah"
                  className="w-full max-h-36 object-contain mx-auto"
                />
              </div>
            ) : (
              <div className="text-center pb-3 border-b-4 border-double border-emerald-900 mb-6">
                <div className="flex items-center justify-center gap-4 mb-2">
                  {inst.logoUrl ? (
                    <img
                      src={inst.logoUrl}
                      alt="Logo Madrasah"
                      className="w-16 h-16 object-contain shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-emerald-800 text-amber-300 flex items-center justify-center font-bold text-xl border-2 border-amber-400 shadow-xs shrink-0">
                      ☪
                    </div>
                  )}
                  <div>
                    <h2 className="font-sans font-extrabold text-xl md:text-2xl text-emerald-900 uppercase tracking-tight">
                      {inst.name}
                    </h2>
                    <p className="text-xs text-gray-600 font-sans mt-0.5">
                      {inst.address}, {inst.village}, {inst.district}, {inst.city} {inst.postalCode}
                    </p>
                    <p className="text-xs text-gray-600 font-sans">
                      Telp: {inst.phone} | Email: {inst.email} | Web: {inst.website}
                    </p>
                    <p className="text-[11px] font-sans font-semibold text-emerald-800 mt-0.5">
                      NSM: {inst.nsm} | NPSN: {inst.npsn} {inst.accreditation ? `| Status Akreditasi: ${inst.accreditation}` : ''}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* LETTER TITLE & NUMBER */}
            <div className="text-center my-6">
              <h3 className="font-sans font-bold text-base md:text-lg underline uppercase text-gray-900">
                {isMasuk && 'SURAT KETERANGAN PENERIMAAN MUTASI MASUK'}
                {isKeluar && 'SURAT KETERANGAN PINDAH / MUTASI KELUAR'}
                {!isMasuk && !isKeluar && 'SURAT KETERANGAN SISWA AKTIF'}
              </h3>
              <p className="font-sans text-xs text-gray-700 mt-1 font-medium">
                Nomor: {data.letterNumber || (isMasuk ? generateLetterNumber(inst.letterFormatIn, 1) : isKeluar ? generateLetterNumber(inst.letterFormatOut, 1) : generateLetterNumber(inst.letterFormatOut || inst.letterFormatIn, 1))}
              </p>
            </div>

            {/* PREAMBLE */}
            <p className="mb-4">
              Yang bertanda tangan di bawah ini Kepala {inst.name} menerangkan dengan sesungguhnya bahwa:
            </p>

            {/* STUDENT DATA TABLE */}
            <div className="my-4 pl-4 font-sans text-xs md:text-sm">
              <table className="w-full">
                <tbody>
                  {isMasuk && (
                    <>
                      <tr className="border-b border-gray-100">
                        <td className="py-1.5 w-48 font-semibold text-gray-700">Nama Lengkap Siswa</td>
                        <td className="py-1.5 font-bold text-gray-900">: {data.studentName}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1.5 font-semibold text-gray-700">NISN</td>
                        <td className="py-1.5">: {data.nisn}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1.5 font-semibold text-gray-700">Jenis Kelamin</td>
                        <td className="py-1.5">: {data.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1.5 font-semibold text-gray-700">Madrasah / Sekolah Asal</td>
                        <td className="py-1.5 font-medium">: {data.originSchool} (NPSN: {data.originNpsn || '-'})</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1.5 font-semibold text-gray-700">Diterima di Kelas</td>
                        <td className="py-1.5 font-bold text-emerald-800">: {data.targetClass}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1.5 font-semibold text-gray-700">Tahun Pelajaran</td>
                        <td className="py-1.5">: {data.academicYear || inst.currentAcademicYear}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1.5 font-semibold text-gray-700">Nama Orang Tua / Wali</td>
                        <td className="py-1.5">: {data.parentName || '-'} (No. Telp: {data.parentPhone || '-'})</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1.5 font-semibold text-gray-700">Alasan Mutasi Masuk</td>
                        <td className="py-1.5 italic text-gray-600">: {data.reason}</td>
                      </tr>
                    </>
                  )}

                  {isKeluar && (
                    <>
                      <tr className="border-b border-gray-100">
                        <td className="py-1.5 w-48 font-semibold text-gray-700">Nama Lengkap Siswa</td>
                        <td className="py-1.5 font-bold text-gray-900">: {data.studentName}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1.5 font-semibold text-gray-700">Nomor Induk Siswa (NIS)</td>
                        <td className="py-1.5">: {data.nis}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1.5 font-semibold text-gray-700">NISN</td>
                        <td className="py-1.5">: {data.nisn}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1.5 font-semibold text-gray-700">Kelas Terakhir</td>
                        <td className="py-1.5">: {data.currentClass}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1.5 font-semibold text-gray-700">Madrasah / Sekolah Tujuan</td>
                        <td className="py-1.5 font-bold text-emerald-800">: {data.destinationSchool}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1.5 font-semibold text-gray-700">Alamat Tujuan</td>
                        <td className="py-1.5">: {data.destinationAddress || '-'}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1.5 font-semibold text-gray-700">Alasan Pindah</td>
                        <td className="py-1.5 italic text-gray-600">: {data.reason}</td>
                      </tr>
                    </>
                  )}

                  {!isMasuk && !isKeluar && (
                    <>
                      <tr className="border-b border-gray-100">
                        <td className="py-1.5 w-48 font-semibold text-gray-700">Nama Lengkap Siswa</td>
                        <td className="py-1.5 font-bold text-gray-900">: {data.name}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1.5 font-semibold text-gray-700">Nomor Induk Siswa (NIS)</td>
                        <td className="py-1.5">: {data.nis}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1.5 font-semibold text-gray-700">NISN</td>
                        <td className="py-1.5">: {data.nisn}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1.5 font-semibold text-gray-700">Tempat, Tanggal Lahir</td>
                        <td className="py-1.5">: {data.birthPlace}, {data.birthDate}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1.5 font-semibold text-gray-700">Jenis Kelamin</td>
                        <td className="py-1.5">: {data.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1.5 font-semibold text-gray-700">Duduk di Kelas</td>
                        <td className="py-1.5 font-bold text-emerald-800">: {data.classId}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1.5 font-semibold text-gray-700">Nama Orang Tua / Wali</td>
                        <td className="py-1.5">: {data.parentName}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* CLOSING STATEMENT */}
            <div className="mt-6 mb-8 text-justify">
              {isMasuk && (
                <p>
                  Setelah meneliti kelengkapan berkas raport asli, surat permohonan pindah dari madrasah/sekolah asal, fotocopy kartu keluarga, serta daya tampung kelas yang tersedia, siswa tersebut di atas secara resmi <strong>TELAH DITERIMA</strong> sebagai peserta didik pindahan di {inst.name} pada Tahun Pelajaran {inst.currentAcademicYear}.
                </p>
              )}

              {isKeluar && (
                <p>
                  Sesuai dengan surat permohonan pindah dari orang tua/wali siswa bersangkutan dan setelah diteliti, siswa tersebut di atas <strong>TIDAK MEMILIKI TANGGUNGAN</strong> baik dalam hal keuangan madrasah, peminjaman buku perpustakaan, maupun administrasi kesiswaan lainnya. Surat keterangan ini diterbitkan untuk dipergunakan dalam pengurusan mutasi ke madrasah/sekolah tujuan.
                </p>
              )}

              {!isMasuk && !isKeluar && (
                <p>
                  Adalah benar yang bersangkutan tercatat sebagai <strong>SISWA AKTIF</strong> pada {inst.name} Tahun Pelajaran {inst.currentAcademicYear} dan berkelakuan baik. Surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.
                </p>
              )}
            </div>

            {/* SIGNATURE & STAMP SECTION */}
            <div className="mt-12 flex justify-between items-end font-sans">
              {/* QR Code Verification */}
              <div className="text-center p-3 border border-gray-200 rounded-lg bg-gray-50 inline-block">
                <div className="w-20 h-20 bg-gray-900 text-white flex items-center justify-center p-1 font-mono text-[9px] text-center leading-tight mx-auto rounded">
                  [QR VALIDASI RESMI MADRASAH]
                </div>
                <p className="text-[10px] text-gray-500 font-mono mt-1">
                  ID: SIM-MTS-{data.id || '2026-01'}
                </p>
                <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-700 font-semibold mt-0.5">
                  <CheckCircle className="w-3 h-3" />
                  <span>Dokumen Terverifikasi</span>
                </div>
              </div>

              {/* Headmaster Signature */}
              <div className="text-center w-64">
                <p className="text-xs text-gray-700">
                  {inst.city}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="text-xs font-semibold text-gray-900 mt-0.5">
                  {inst.headmasterTitle}
                </p>

                {/* Stempel Digital & Signature space */}
                <div className="relative h-24 flex items-center justify-center my-1">
                  <div className="absolute -left-2 w-20 h-20 rounded-full border-2 border-dashed border-emerald-600/40 flex items-center justify-center rotate-[-15deg] pointer-events-none">
                    <span className="text-[9px] font-bold text-emerald-700/60 uppercase text-center px-1">
                      CAP RESMI<br/>{inst.name.replace(/Madrasah\s+Tsanawiyah\s+/i, 'MTs. ')}
                    </span>
                  </div>
                  <div className="font-serif italic text-2xl text-indigo-900 select-none opacity-80 rotate-[-5deg]">
                    {inst.headmasterName.split(',')[0].replace(/^(Drs\.|H\.|Hj\.)\s*/gi, '')}
                  </div>
                </div>

                <p className="font-bold text-sm text-gray-900 underline">
                  {inst.headmasterName}
                </p>
                <p className="text-xs text-gray-600 font-mono mt-0.5">
                  NIP. {inst.headmasterNip}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
