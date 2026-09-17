import { Student, TransferIn, TransferOut, InstitutionProfile, UserProfile } from '../types';

export const defaultInstitution: InstitutionProfile = {
  name: "MTs. Asy-Syafi'iyyah Jatibarang",
  ministry: 'Kementerian Agama Republik Indonesia',
  nsm: '121233290078',
  npsn: '20364748',
  level: 'Madrasah Tsanawiyah (MTs)',
  address: 'Jl. Raya Jatibarang - Brebes',
  village: 'Jatibarang Kidul',
  district: 'Jatibarang',
  city: 'Kabupaten Brebes',
  province: 'Jawa Tengah',
  postalCode: '52261',
  phone: '(0283) 6182001',
  email: 'mts.asysyafiiyyah.jtb@gmail.com',
  website: 'https://mts-asysyafiiyyah.sch.id',
  headmasterName: 'H. Ahmad Syarifuddin, S.Ag., M.Pd.I',
  headmasterNip: '19750512 200501 1 003',
  headmasterTitle: 'Kepala Madrasah',
  headTUName: 'M. Zulkifli, S.Kom',
  headTUNip: '19850410 201101 1 012',
  accreditation: 'A (Unggul)',
  letterFormatIn: 'MTs.01.05/PP.00.5/{NO}/2026',
  letterFormatOut: 'MTs.01.05/PP.00.5/{NO}/2026',
  currentAcademicYear: '2025/2026',
  currentSemester: 'Ganjil',
  logoUrl: '',
  kopImageUrl: '',
  useCustomKopImage: false,
};

export const demoUsers: UserProfile[] = [
  {
    id: 'user-headmaster',
    name: 'H. Ahmad Syarifuddin, S.Ag., M.Pd.I',
    email: 'kepala@mts-asysyafiiyyah.sch.id',
    role: 'manajemen',
    roleTitle: 'Kepala Madrasah / Manajemen',
    nip: '19750512 200501 1 003',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-waka',
    name: 'Dra. Hj. Nur Hasanah, M.A.',
    email: 'waka.kurikulum@mts-asysyafiiyyah.sch.id',
    role: 'manajemen',
    roleTitle: 'Waka Bidang Kurikulum',
    nip: '19780512 200212 2 001',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-wali-7a',
    name: 'Ust. Ridwan Kamil, S.Pd.I',
    email: 'ridwan.wali7a@mts-asysyafiiyyah.sch.id',
    role: 'wali_kelas',
    roleTitle: 'Wali Kelas VII-A / Guru Fiqih',
    nip: '19850320 201001 1 018',
    assignedClass: 'VII-A',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-wali-8a',
    name: 'Fatimah Az-Zahra, S.Pd.',
    email: 'fatimah.wali8a@mts-asysyafiiyyah.sch.id',
    role: 'guru',
    roleTitle: 'Guru Matematika / Wali Kelas VIII-A',
    nip: '19901104 201502 2 005',
    assignedClass: 'VIII-A',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-tu',
    name: 'Siti Aminah, S.Kom',
    email: 'tu.admin@mts-asysyafiiyyah.sch.id',
    role: 'tata_usaha',
    roleTitle: 'Staf Administrasi & Tata Usaha',
    nip: '19920718 201903 2 012',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  },
];

// Inisialisasi basis data bersih tanpa data demo dummy
export const initialStudents: Student[] = [];
export const initialTransfersIn: TransferIn[] = [];
export const initialTransfersOut: TransferOut[] = [];

export const classesList = ['Semua Kelas', 'VII-A', 'VII-B', 'VIII-A', 'VIII-B', 'IX-A', 'IX-B'];
