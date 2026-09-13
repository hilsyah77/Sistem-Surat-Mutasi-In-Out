/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ArrowDownLeft, 
  ArrowUpRight, 
  BarChart3, 
  Database, 
  Plus, 
  FileSpreadsheet, 
  FileText, 
  Bell, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

import { 
  Student, 
  TransferIn, 
  TransferOut, 
  TransferStatus, 
  InstitutionProfile 
} from './types';
import { DataService } from './services/firebase';
import { defaultInstitution } from './services/mockData';
import { ExportService } from './services/exportService';

// Components
import { TopNavigation, TabType } from './components/TopNavigation';
import { DashboardView } from './components/DashboardView';
import { StudentListView } from './components/StudentListView';
import { TransferInView } from './components/TransferInView';
import { TransferOutView } from './components/TransferOutView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';

// Modals
import { StudentModal } from './components/StudentModal';
import { StudentDetailModal } from './components/StudentDetailModal';
import { StudentUploadModal } from './components/StudentUploadModal';
import { TransferInModal } from './components/TransferInModal';
import { TransferOutModal } from './components/TransferOutModal';
import { OfficialLetterPreviewModal } from './components/OfficialLetterPreviewModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ClassSettingsModal } from './components/ClassSettingsModal';
import { defaultClassesList } from './services/firebase';

export default function App() {
  // State
  const [activeTab, setActiveTab] = useState<TabType>('dasbor');
  const [institution, setInstitution] = useState<InstitutionProfile>(defaultInstitution);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<string[]>(defaultClassesList);
  const [transfersIn, setTransfersIn] = useState<TransferIn[]>([]);
  const [transfersOut, setTransfersOut] = useState<TransferOut[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Modal States
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isTransferInModalOpen, setIsTransferInModalOpen] = useState(false);
  const [isTransferOutModalOpen, setIsTransferOutModalOpen] = useState(false);

  // Official Letter Modal
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);
  const [letterConfig, setLetterConfig] = useState<{
    type: 'mutasi_masuk' | 'mutasi_keluar' | 'siswa_aktif';
    data: any;
  } | null>(null);

  // Delete Confirm Modal
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Initial Load & Real-time Subscription
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const [stData, tinData, toutData, instData, clsData] = await Promise.all([
          DataService.getStudents(),
          DataService.getTransfersIn(),
          DataService.getTransfersOut(),
          DataService.getInstitutionProfile(),
          DataService.getClasses(),
        ]);
        setStudents(stData);
        setTransfersIn(tinData);
        setTransfersOut(toutData);
        setInstitution(instData);
        setClasses(clsData);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setLoading(false);
      }
    };

    initData();

    // Subscribe to real-time changes
    const unsubStudents = DataService.subscribeToStudents((updatedStudents) => {
      setStudents(updatedStudents);
    });

    const unsubClasses = DataService.subscribeToClasses((updatedClasses) => {
      setClasses(updatedClasses);
    });

    return () => {
      unsubStudents();
      unsubClasses();
    };
  }, []);

  const reloadData = async () => {
    const [stData, tinData, toutData, instData, clsData] = await Promise.all([
      DataService.getStudents(),
      DataService.getTransfersIn(),
      DataService.getTransfersOut(),
      DataService.getInstitutionProfile(),
      DataService.getClasses(),
    ]);
    setStudents(stData);
    setTransfersIn(tinData);
    setTransfersOut(toutData);
    setInstitution(instData);
    setClasses(clsData);
  };

  // Class / Rombel Management Handlers
  const handleSaveClasses = async (newClasses: string[]) => {
    try {
      await DataService.saveClasses(newClasses);
      setClasses(newClasses);
      showToast('Pengaturan kelas berhasil disimpan ke Firebase!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan pengaturan kelas', 'error');
      throw err;
    }
  };

  const handleRenameClass = async (oldName: string, newName: string) => {
    try {
      const affectedCount = await DataService.renameClass(oldName, newName);
      const updatedClasses = await DataService.getClasses();
      setClasses(updatedClasses);
      const updatedStudents = await DataService.getStudents();
      setStudents(updatedStudents);
      return affectedCount;
    } catch (err: any) {
      showToast(err.message || 'Gagal mengubah nama kelas', 'error');
      throw err;
    }
  };

  // Institution Settings Handlers
  const handleSaveInstitution = async (updatedProfile: InstitutionProfile) => {
    try {
      await DataService.saveInstitutionProfile(updatedProfile);
      setInstitution(updatedProfile);
      showToast('Pengaturan lembaga & profil madrasah berhasil diperbarui!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan pengaturan lembaga', 'error');
    }
  };

  const handleResetAllData = async () => {
    try {
      await DataService.clearAllData();
      await reloadData();
      showToast('Seluruh data siswa & riwayat mutasi telah berhasil dihapus dan dikosongkan.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus data', 'error');
    }
  };

  const handleRestoreBackup = async (backupData: any) => {
    try {
      await DataService.restoreAllBackup(backupData);
      await reloadData();
      showToast('Restore data cadangan berhasil dilakukan secara lengkap!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Format berkas backup tidak valid', 'error');
    }
  };

  // Student CRUD Operations
  const handleSaveStudent = async (studentData: Student) => {
    try {
      await DataService.saveStudent(studentData);
      await reloadData();
      showToast(
        editingStudent
          ? `Data siswa "${studentData.name}" berhasil diperbarui!`
          : `Siswa baru "${studentData.name}" berhasil didaftarkan!`
      );
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan data siswa', 'error');
    }
  };

  const handleConfirmDeleteStudent = async () => {
    if (!studentToDelete) return;
    try {
      await DataService.deleteStudent(studentToDelete.id);
      await reloadData();
      showToast(`Data siswa "${studentToDelete.name}" telah dihapus.`);
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus siswa', 'error');
    }
  };

  const handleImportStudents = async (importedStudents: Student[]) => {
    try {
      const count = await DataService.saveStudentsBatch(importedStudents);
      await reloadData();
      showToast(`Alhamdulillah, berhasil mengimpor ${count} siswa baru ke Buku Induk!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal mengimpor data siswa', 'error');
      throw err;
    }
  };

  // Transfer In Operations
  const handleSaveTransferIn = async (transfer: TransferIn, student?: Student) => {
    try {
      await DataService.saveTransferIn(transfer);
      if (student && transfer.status === 'Disetujui') {
        await DataService.saveStudent(student);
      }
      await reloadData();
      showToast(`Permohonan mutasi masuk atas nama "${transfer.studentName}" berhasil disimpan!`);
    } catch (err: any) {
      showToast(err.message || 'Gagal memproses mutasi masuk', 'error');
    }
  };

  const handleUpdateTransferInStatus = async (id: string, newStatus: TransferStatus) => {
    try {
      const item = transfersIn.find(t => t.id === id);
      if (!item) return;
      const updated: TransferIn = { ...item, status: newStatus };
      await DataService.saveTransferIn(updated);
      await reloadData();
      showToast(`Status mutasi masuk diperbarui menjadi: ${newStatus}`);
    } catch (err: any) {
      showToast('Gagal mengubah status', 'error');
    }
  };

  // Transfer Out Operations
  const handleSaveTransferOut = async (transfer: TransferOut, student: Student) => {
    try {
      await DataService.saveTransferOut(transfer);
      if (transfer.status === 'Disetujui') {
        // Mark student as Mutasi Keluar in registry
        const updatedStudent: Student = { ...student, status: 'Mutasi Keluar' };
        await DataService.saveStudent(updatedStudent);
      }
      await reloadData();
      showToast(`Surat mutasi keluar atas nama "${transfer.studentName}" berhasil diproses!`);
    } catch (err: any) {
      showToast(err.message || 'Gagal memproses mutasi keluar', 'error');
    }
  };

  const handleUpdateTransferOutStatus = async (id: string, newStatus: TransferStatus) => {
    try {
      const item = transfersOut.find(t => t.id === id);
      if (!item) return;
      const updated: TransferOut = { ...item, status: newStatus };
      await DataService.saveTransferOut(updated);

      if (newStatus === 'Disetujui') {
        const student = students.find(s => s.id === item.studentId);
        if (student) {
          await DataService.saveStudent({ ...student, status: 'Mutasi Keluar' });
        }
      }
      await reloadData();
      showToast(`Status mutasi keluar diperbarui menjadi: ${newStatus}`);
    } catch (err: any) {
      showToast('Gagal mengubah status', 'error');
    }
  };

  // Official Letter Modal Trigger
  const handleOpenLetterPreview = (type: 'mutasi_masuk' | 'mutasi_keluar' | 'siswa_aktif', data: any) => {
    setLetterConfig({ type, data });
    setIsLetterModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-black selection:bg-emerald-200">
      {/* Top Navigation Model (Model Menu di Atas) */}
      <TopNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddStudent={() => {
          setEditingStudent(null);
          setIsStudentModalOpen(true);
        }}
        onOpenUploadStudent={() => setIsUploadModalOpen(true)}
        institution={institution}
        totalStudents={students.length}
        transfersInCount={transfersIn.length}
        transfersOutCount={transfersOut.length}
        onExportExcel={() => ExportService.exportStudentsToExcel(students)}
        onExportPDF={() => ExportService.exportStudentsToPDF(students)}
      />

      {/* Container Tampilan Utama di Bawah Header & Navbar */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <main className="transition-opacity duration-300">
            {activeTab === 'dasbor' && (
              <DashboardView
                students={students}
                transfersIn={transfersIn}
                transfersOut={transfersOut}
                onNavigateTab={(tab) => setActiveTab(tab as TabType)}
                onOpenAddStudent={() => {
                  setEditingStudent(null);
                  setIsStudentModalOpen(true);
                }}
                onOpenUploadStudent={() => setIsUploadModalOpen(true)}
                onOpenTransferIn={() => setIsTransferInModalOpen(true)}
                onOpenTransferOut={() => setIsTransferOutModalOpen(true)}
                onSelectStudent={(student) => setDetailStudent(student)}
                onPreviewLetter={handleOpenLetterPreview}
              />
            )}

            {activeTab === 'siswa' && (
              <StudentListView
                students={students}
                availableClasses={classes}
                onOpenClassModal={() => setIsClassModalOpen(true)}
                onOpenAddModal={() => {
                  setEditingStudent(null);
                  setIsStudentModalOpen(true);
                }}
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
                onEditStudent={(student) => {
                  setEditingStudent(student);
                  setIsStudentModalOpen(true);
                }}
                onSelectStudent={(student) => setDetailStudent(student)}
                onDeleteStudent={(student) => setStudentToDelete(student)}
                onPrintActiveLetter={(student) => handleOpenLetterPreview('siswa_aktif', student)}
              />
            )}

            {activeTab === 'mutasi_masuk' && (
              <TransferInView
                transfersIn={transfersIn}
                onOpenAddModal={() => setIsTransferInModalOpen(true)}
                onPreviewLetter={(transfer) => handleOpenLetterPreview('mutasi_masuk', transfer)}
                onUpdateStatus={handleUpdateTransferInStatus}
              />
            )}

            {activeTab === 'mutasi_keluar' && (
              <TransferOutView
                transfersOut={transfersOut}
                onOpenAddModal={() => setIsTransferOutModalOpen(true)}
                onPreviewLetter={(transfer) => handleOpenLetterPreview('mutasi_keluar', transfer)}
                onUpdateStatus={handleUpdateTransferOutStatus}
              />
            )}

            {activeTab === 'analitik' && (
              <AnalyticsView
                students={students}
                onSelectStudent={(student) => setDetailStudent(student)}
              />
            )}

            {activeTab === 'pengaturan' && (
              <SettingsView
                institution={institution}
                onSaveInstitution={handleSaveInstitution}
                students={students}
                transfersIn={transfersIn}
                transfersOut={transfersOut}
                onResetAllData={handleResetAllData}
                onResetData={handleResetAllData}
                onRestoreBackup={handleRestoreBackup}
              />
            )}
          </main>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 bg-slate-900 text-white rounded-2xl shadow-xl text-xs font-semibold border border-slate-800 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* MODALS */}
      {/* 1. Student Create / Edit Modal */}
      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onSave={handleSaveStudent}
        studentToEdit={editingStudent}
        availableClasses={classes}
      />

      {/* 2. Bulk Upload Students Modal */}
      <StudentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onImportSuccess={handleImportStudents}
      />

      {/* Class / Rombel Settings Modal */}
      <ClassSettingsModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        classes={classes}
        students={students}
        onSaveClasses={handleSaveClasses}
        onRenameClass={handleRenameClass}
      />

      {/* 3. Student Detail & Academic Transcript Modal */}
      <StudentDetailModal
        isOpen={!!detailStudent}
        onClose={() => setDetailStudent(null)}
        student={detailStudent}
        onPrintActiveLetter={(student) => handleOpenLetterPreview('siswa_aktif', student)}
      />

      {/* 4. Transfer In Registration Modal */}
      <TransferInModal
        isOpen={isTransferInModalOpen}
        onClose={() => setIsTransferInModalOpen(false)}
        onSave={handleSaveTransferIn}
        institution={institution}
        existingTransfers={transfersIn}
      />

      {/* 5. Transfer Out Registration Modal */}
      <TransferOutModal
        isOpen={isTransferOutModalOpen}
        onClose={() => setIsTransferOutModalOpen(false)}
        onSave={handleSaveTransferOut}
        activeStudents={students}
        institution={institution}
        existingTransfers={transfersOut}
      />

      {/* 6. Official Letter Print & Preview Modal */}
      {letterConfig && (
        <OfficialLetterPreviewModal
          isOpen={isLetterModalOpen}
          onClose={() => setIsLetterModalOpen(false)}
          type={letterConfig.type}
          data={letterConfig.data}
          institution={institution}
        />
      )}

      {/* 7. Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        onConfirm={handleConfirmDeleteStudent}
        title="Hapus Data Siswa"
        message={`Apakah Anda yakin ingin menghapus data siswa "${studentToDelete?.name}"? Tindakan ini akan menghapus rekam data dari sistem kesiswaan.`}
      />
    </div>
  );
}
