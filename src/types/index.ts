export type UserRole = 'guru' | 'wali_kelas' | 'manajemen' | 'tata_usaha';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  nip?: string;
  assignedClass?: string;
  avatar?: string;
}

export type StudentStatus = 'Aktif' | 'Mutasi Masuk' | 'Mutasi Keluar' | 'Lulus' | 'Non-Aktif';
export type Gender = 'L' | 'P';

export interface Student {
  id: string;
  nis: string;
  nisn: string;
  name: string;
  gender: Gender;
  birthPlace: string;
  birthDate: string;
  classId: string;
  academicYear: string;
  parentName: string;
  phone: string;
  address: string;
  status: StudentStatus;
  violationsCount?: number;
  achievementsCount?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type TransferStatus = 'Menunggu' | 'Disetujui' | 'Ditolak';

export interface TransferIn {
  id: string;
  letterNumber: string;
  studentName: string;
  nisn: string;
  gender: Gender;
  originSchool: string;
  originNpsn: string;
  targetClass: string;
  academicYear: string;
  requestDate: string;
  approvalDate?: string;
  reason: string;
  status: TransferStatus;
  parentName: string;
  parentPhone: string;
  documents: {
    rapor: boolean;
    suratPindahAsal: boolean;
    kartuKeluarga: boolean;
    kelakuanBaik?: boolean;
    ijazahSebelumnya: boolean;
  };
  notes?: string;
  approvedBy?: string;
  createdAt: string;
}

export interface TransferOut {
  id: string;
  letterNumber: string;
  studentId: string;
  studentName: string;
  nis: string;
  nisn: string;
  currentClass: string;
  academicYear: string;
  destinationSchool: string;
  destinationNpsn?: string;
  destinationAddress: string;
  requestDate: string;
  approvalDate?: string;
  reason: string;
  status: TransferStatus;
  clearances: {
    keuanganSpp: boolean;
    perpustakaan: boolean;
    waliKelas: boolean;
  };
  approvedBy?: string;
  notes?: string;
  createdAt: string;
}

export interface InstitutionProfile {
  name: string;
  ministry?: string;
  nsm: string;
  npsn: string;
  level: string;
  address: string;
  village: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  headmasterName: string;
  headmasterNip: string;
  headmasterTitle: string;
  headTUName?: string;
  headTUNip?: string;
  accreditation?: string;
  letterFormatIn?: string;
  letterFormatOut?: string;
  currentAcademicYear: string;
  currentSemester: string;
  logoUrl?: string;
  kopImageUrl?: string;
  useCustomKopImage?: boolean;
}
