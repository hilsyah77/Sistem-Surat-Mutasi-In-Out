import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Student, TransferIn, TransferOut, InstitutionProfile } from '../types';
import { defaultInstitution } from './mockData';

export class ExportService {
  /**
   * Ekspor Data Siswa ke Excel (.xlsx)
   */
  public static exportStudentsToExcel(students: Student[], classFilter?: string): void {
    const dataToExport = students.map((s, idx) => ({
      'No': idx + 1,
      'NIS': s.nis,
      'NISN': s.nisn,
      'Nama Lengkap Siswa': s.name,
      'Jenis Kelamin': s.gender === 'L' ? 'Laki-laki' : 'Perempuan',
      'Kelas': s.classId,
      'Tempat Lahir': s.birthPlace,
      'Tanggal Lahir': s.birthDate,
      'Nama Orang Tua / Wali': s.parentName,
      'No. WhatsApp / HP': s.phone,
      'Status': s.status,
      'Alamat': s.address,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // Auto-fit column widths
    const colWidths = [
      { wch: 5 },  // No
      { wch: 14 }, // NIS
      { wch: 14 }, // NISN
      { wch: 30 }, // Nama
      { wch: 14 }, // JK
      { wch: 10 }, // Kelas
      { wch: 18 }, // Tempat Lahir
      { wch: 14 }, // Tgl Lahir
      { wch: 24 }, // Ortu
      { wch: 16 }, // HP
      { wch: 14 }, // Status
      { wch: 40 }, // Alamat
    ];
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    const sheetName = classFilter && classFilter !== 'Semua Kelas' ? `Kelas ${classFilter}` : 'Data Siswa';
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const fileName = `Data_Siswa_${sheetName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  /**
   * Ekspor Rekap Surat Mutasi Masuk ke Excel (.xlsx)
   */
  public static exportTransfersInToExcel(transfers: TransferIn[]): void {
    const data = transfers.map((t, idx) => ({
      'No': idx + 1,
      'No. Surat Resmi': t.letterNumber,
      'Nama Siswa': t.studentName,
      'NISN': t.nisn,
      'L/P': t.gender,
      'Madrasah / Sekolah Asal': t.originSchool,
      'NPSN Asal': t.originNpsn,
      'Kelas Tujuan': t.targetClass,
      'Tanggal Permohonan': t.requestDate,
      'Alasan Pindah': t.reason,
      'Status Approval': t.status,
      'Nama Wali': t.parentName,
      'No. HP Wali': t.parentPhone,
      'Berkas Rapor': t.documents.rapor ? 'Lengkap' : 'Belum',
      'Surat Pindah': t.documents.suratPindahAsal ? 'Lengkap' : 'Belum',
      'Fotocopy Kartu Keluarga': (t.documents.kartuKeluarga ?? t.documents.kelakuanBaik) ? 'Lengkap' : 'Belum',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mutasi Masuk');
    XLSX.writeFile(wb, `Rekap_Mutasi_Masuk_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  /**
   * Ekspor Rekap Surat Mutasi Keluar ke Excel (.xlsx)
   */
  public static exportTransfersOutToExcel(transfers: TransferOut[]): void {
    const data = transfers.map((t, idx) => ({
      'No': idx + 1,
      'No. Surat Keterangan': t.letterNumber,
      'Nama Siswa': t.studentName,
      'NIS': t.nis,
      'NISN': t.nisn,
      'Kelas Asal': t.currentClass,
      'Madrasah / Sekolah Tujuan': t.destinationSchool,
      'Alamat Tujuan': t.destinationAddress,
      'Tanggal Pengajuan': t.requestDate,
      'Alasan Mutasi': t.reason,
      'Status Bebas SPP': t.clearances.keuanganSpp ? 'Lunas' : 'Belum',
      'Bebas Pinjaman Perpus': t.clearances.perpustakaan ? 'Bebas' : 'Belum',
      'Rekomendasi Wali Kelas': t.clearances.waliKelas ? 'Disetujui' : 'Belum',
      'Status Surat': t.status,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mutasi Keluar');
    XLSX.writeFile(wb, `Rekap_Mutasi_Keluar_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  /**
   * Ekspor Data Siswa ke PDF (.pdf) dengan Kop Resmi Madrasah
   */
  public static exportStudentsToPDF(students: Student[], institution: InstitutionProfile = defaultInstitution, classFilter?: string): void {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // 1. Kop Surat Resmi
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(institution.ministry.toUpperCase(), 148.5, 12, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(20, 83, 45); // Islamic Madrasah dark green #14532d
    doc.text(institution.name.toUpperCase(), 148.5, 18, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    doc.text(`${institution.address}, ${institution.city}, ${institution.province} | Telp: ${institution.phone} | Email: ${institution.email}`, 148.5, 23, { align: 'center' });
    doc.text(`NSM: ${institution.nsm}  |  NPSN: ${institution.npsn}  |  Akreditasi: A (Unggul)`, 148.5, 27, { align: 'center' });

    // Double rule lines for official letterhead
    doc.setDrawColor(20, 83, 45);
    doc.setLineWidth(0.8);
    doc.line(14, 30, 283, 30);
    doc.setLineWidth(0.2);
    doc.line(14, 31.2, 283, 31.2);

    // Document Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);
    const titleText = classFilter && classFilter !== 'Semua Kelas'
      ? `LAPORAN DATA SISWA RESMI KELAS ${classFilter}`
      : 'BUKU INDUK / LAPORAN DATA SISWA RESMI';
    doc.text(titleText, 148.5, 38, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Tahun Ajaran: ${institution.currentAcademicYear} | Semester: ${institution.currentSemester} | Dicetak: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}`, 148.5, 43, { align: 'center' });

    // Table
    const tableData = students.map((s, i) => [
       (i + 1).toString(),
       s.nis,
       s.nisn,
       s.name,
       s.gender,
       s.classId,
       `${s.birthPlace}, ${s.birthDate}`,
       s.parentName,
       s.phone,
       s.status,
     ]);

    autoTable(doc, {
      startY: 47,
      head: [['No', 'NIS', 'NISN', 'Nama Lengkap', 'L/P', 'Kelas', 'TTL', 'Orang Tua / Wali', 'No. HP', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [20, 83, 45], // Emerald green #14532d
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'center'
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { halign: 'center', cellWidth: 22 },
        2: { halign: 'center', cellWidth: 24 },
        3: { cellWidth: 55 },
        4: { halign: 'center', cellWidth: 12 },
        5: { halign: 'center', cellWidth: 16 },
        6: { cellWidth: 42 },
        7: { cellWidth: 40 },
        8: { cellWidth: 25 },
        9: { halign: 'center', cellWidth: 22 },
      },
      margin: { left: 14, right: 14 }
    });

    // Signature block at bottom right
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    if (finalY < 185) {
      const sigX = 220;
      doc.setFontSize(8.5);
      doc.text(`${institution.city}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, sigX, finalY);
      doc.text(institution.headmasterTitle, sigX, finalY + 4);
      doc.setFont('helvetica', 'bold');
      doc.text(institution.headmasterName, sigX, finalY + 22);
      doc.setFont('helvetica', 'normal');
      doc.text(`NIP. ${institution.headmasterNip}`, sigX, finalY + 26);
    }

    doc.save(`Laporan_Siswa_${institution.name.replace(/\s+/g, '_')}.pdf`);
  }
}
