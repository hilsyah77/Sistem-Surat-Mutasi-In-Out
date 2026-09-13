import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  getDoc,
  setDoc, 
  doc, 
  deleteDoc, 
  onSnapshot,
  getDocFromServer 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Student, TransferIn, TransferOut, InstitutionProfile } from '../types';
import { defaultInstitution } from './mockData';

// Initialize Firebase App singleton
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific database ID from config
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Local Storage Keys for offline / high-availability resilience
const LS_STUDENTS = 'sim_madrasah_students_v1';
const LS_TRANSFERS_IN = 'sim_madrasah_transfers_in_v1';
const LS_TRANSFERS_OUT = 'sim_madrasah_transfers_out_v1';
const LS_INSTITUTION = 'sim_madrasah_institution_v1';
const LS_CLASSES = 'sim_madrasah_classes_v1';
const DEMO_PURGED_FLAG = 'sim_madrasah_demo_purged_v3';

export const defaultClassesList = ['VII-A', 'VII-B', 'VIII-A', 'VIII-B', 'IX-A', 'IX-B'];

export class DataService {
  private static isFirebaseConnected = true;
  private static statusListeners: ((status: { connected: boolean; projectId: string; dbId: string }) => void)[] = [];

  public static setFirebaseConnected(val: boolean) {
    this.isFirebaseConnected = val;
    const status = this.getFirebaseStatus();
    this.statusListeners.forEach(cb => cb(status));
  }

  public static onStatusChange(callback: (status: { connected: boolean; projectId: string; dbId: string }) => void): () => void {
    callback(this.getFirebaseStatus());
    this.statusListeners.push(callback);
    return () => {
      this.statusListeners = this.statusListeners.filter(cb => cb !== callback);
    };
  }

  public static getFirebaseStatus(): { connected: boolean; projectId: string; dbId: string } {
    return {
      connected: this.isFirebaseConnected,
      projectId: firebaseConfig.projectId,
      dbId: firebaseConfig.firestoreDatabaseId || '(default)'
    };
  }

  public static async testConnection(): Promise<boolean> {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
      this.setFirebaseConnected(true);
      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration.");
        this.setFirebaseConnected(false);
        return false;
      }
      this.setFirebaseConnected(true);
      return true;
    }
  }

  // Ensure any lingering demo records in local storage are purged
  public static checkAndPurgeLocalDemo() {
    try {
      if (typeof window !== 'undefined') {
        const flag = localStorage.getItem(DEMO_PURGED_FLAG);
        if (flag !== 'true') {
          localStorage.setItem(LS_STUDENTS, JSON.stringify([]));
          localStorage.setItem(LS_TRANSFERS_IN, JSON.stringify([]));
          localStorage.setItem(LS_TRANSFERS_OUT, JSON.stringify([]));
          localStorage.setItem(DEMO_PURGED_FLAG, 'true');
        }
      }
    } catch {
      // ignore
    }
  }

  // --- STUDENTS ---
  public static async getStudents(): Promise<Student[]> {
    this.checkAndPurgeLocalDemo();

    try {
      const colRef = collection(db, 'students');
      const snapshot = await getDocs(colRef);
      this.isFirebaseConnected = true;
      const list: Student[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as Student;
        // Exclude any legacy demo records
        if (!docSnap.id.startsWith('std-0') && !data.id?.startsWith('std-0')) {
          list.push({ ...data, id: docSnap.id });
        }
      });
      localStorage.setItem(LS_STUDENTS, JSON.stringify(list));
      return list;
    } catch (err) {
      console.warn('Firestore fetch fallback to cache:', err);
    }

    // Fallback to local storage
    const cached = localStorage.getItem(LS_STUDENTS);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          return parsed.filter(s => !s.id?.startsWith('std-0'));
        }
      } catch (e) {
        console.error('Failed to parse cached students:', e);
      }
    }

    localStorage.setItem(LS_STUDENTS, JSON.stringify([]));
    return [];
  }

  public static async saveStudent(student: Student): Promise<void> {
    // 1. Update local storage immediately for fast UI
    const cached = localStorage.getItem(LS_STUDENTS);
    let list: Student[] = cached ? JSON.parse(cached) : [];
    const index = list.findIndex(s => s.id === student.id);
    if (index >= 0) {
      list[index] = student;
    } else {
      list.unshift(student);
    }
    localStorage.setItem(LS_STUDENTS, JSON.stringify(list));

    // 2. Sync to Firestore
    try {
      const docRef = doc(db, 'students', student.id);
      await setDoc(docRef, student);
      this.isFirebaseConnected = true;
    } catch (err) {
      console.warn('Could not sync student to Firestore (saved locally):', err);
    }
  }

  public static async saveStudentsBatch(newStudents: Student[]): Promise<number> {
    if (!newStudents || newStudents.length === 0) return 0;

    // 1. Update local storage
    const cached = localStorage.getItem(LS_STUDENTS);
    let list: Student[] = cached ? JSON.parse(cached) : [];
    
    for (const student of newStudents) {
      const index = list.findIndex(s => s.id === student.id || s.nis === student.nis);
      if (index >= 0) {
        list[index] = { ...list[index], ...student };
      } else {
        list.unshift(student);
      }
    }
    localStorage.setItem(LS_STUDENTS, JSON.stringify(list));

    // 2. Sync to Firestore in parallel
    try {
      const promises = newStudents.map(s => setDoc(doc(db, 'students', s.id), s));
      await Promise.allSettled(promises);
      this.isFirebaseConnected = true;
    } catch (err) {
      console.warn('Could not batch sync students to Firestore (saved locally):', err);
    }
    return newStudents.length;
  }

  public static async deleteStudent(studentId: string): Promise<void> {
    // 1. Update local storage
    const cached = localStorage.getItem(LS_STUDENTS);
    if (cached) {
      let list: Student[] = JSON.parse(cached);
      list = list.filter(s => s.id !== studentId);
      localStorage.setItem(LS_STUDENTS, JSON.stringify(list));
    }

    // 2. Delete in Firestore
    try {
      await deleteDoc(doc(db, 'students', studentId));
    } catch (err) {
      console.warn('Could not delete from Firestore:', err);
    }
  }

  public static subscribeToStudents(callback: (students: Student[]) => void): () => void {
    try {
      const colRef = collection(db, 'students');
      return onSnapshot(colRef, (snapshot) => {
        const list: Student[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data() as Student;
          if (!docSnap.id.startsWith('std-0') && !data.id?.startsWith('std-0')) {
            list.push({ ...data, id: docSnap.id });
          }
        });
        localStorage.setItem(LS_STUDENTS, JSON.stringify(list));
        callback(list);
      }, (error) => {
        console.warn('Firestore subscription notice:', error);
      });
    } catch (err) {
      console.warn('Firestore subscribe error:', err);
      return () => {};
    }
  }

  // --- TRANSFERS IN ---
  public static async getTransfersIn(): Promise<TransferIn[]> {
    this.checkAndPurgeLocalDemo();

    try {
      const colRef = collection(db, 'transfers_in');
      const snapshot = await getDocs(colRef);
      this.isFirebaseConnected = true;
      const list: TransferIn[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as TransferIn;
        if (!docSnap.id.startsWith('tin-') && !data.id?.startsWith('tin-')) {
          list.push({ ...data, id: docSnap.id });
        }
      });
      localStorage.setItem(LS_TRANSFERS_IN, JSON.stringify(list));
      return list;
    } catch (err) {
      console.warn('Transfers in firestore fallback:', err);
    }

    const cached = localStorage.getItem(LS_TRANSFERS_IN);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          return parsed.filter(t => !t.id?.startsWith('tin-'));
        }
      } catch (e) {
        console.error(e);
      }
    }

    localStorage.setItem(LS_TRANSFERS_IN, JSON.stringify([]));
    return [];
  }

  public static async saveTransferIn(transfer: TransferIn): Promise<void> {
    const cached = localStorage.getItem(LS_TRANSFERS_IN);
    let list: TransferIn[] = cached ? JSON.parse(cached) : [];
    const index = list.findIndex(t => t.id === transfer.id);
    if (index >= 0) {
      list[index] = transfer;
    } else {
      list.unshift(transfer);
    }
    localStorage.setItem(LS_TRANSFERS_IN, JSON.stringify(list));

    try {
      await setDoc(doc(db, 'transfers_in', transfer.id), transfer);
    } catch (err) {
      console.warn('Error saving transfer_in to Firestore:', err);
    }
  }

  // --- TRANSFERS OUT ---
  public static async getTransfersOut(): Promise<TransferOut[]> {
    this.checkAndPurgeLocalDemo();

    try {
      const colRef = collection(db, 'transfers_out');
      const snapshot = await getDocs(colRef);
      this.isFirebaseConnected = true;
      const list: TransferOut[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as TransferOut;
        if (!docSnap.id.startsWith('tout-') && !data.id?.startsWith('tout-')) {
          list.push({ ...data, id: docSnap.id });
        }
      });
      localStorage.setItem(LS_TRANSFERS_OUT, JSON.stringify(list));
      return list;
    } catch (err) {
      console.warn('Transfers out firestore fallback:', err);
    }

    const cached = localStorage.getItem(LS_TRANSFERS_OUT);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          return parsed.filter(t => !t.id?.startsWith('tout-'));
        }
      } catch (e) {
        console.error(e);
      }
    }

    localStorage.setItem(LS_TRANSFERS_OUT, JSON.stringify([]));
    return [];
  }

  public static async saveTransferOut(transfer: TransferOut): Promise<void> {
    const cached = localStorage.getItem(LS_TRANSFERS_OUT);
    let list: TransferOut[] = cached ? JSON.parse(cached) : [];
    const index = list.findIndex(t => t.id === transfer.id);
    if (index >= 0) {
      list[index] = transfer;
    } else {
      list.unshift(transfer);
    }
    localStorage.setItem(LS_TRANSFERS_OUT, JSON.stringify(list));

    try {
      await setDoc(doc(db, 'transfers_out', transfer.id), transfer);
    } catch (err) {
      console.warn('Error saving transfer_out to Firestore:', err);
    }
  }

  // --- INSTITUTION PROFILE & SETTINGS ---
  public static async getInstitutionProfile(): Promise<InstitutionProfile> {
    try {
      const docRef = doc(db, 'settings', 'institution');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        this.isFirebaseConnected = true;
        let profile = docSnap.data() as InstitutionProfile;
        if (profile.name?.includes('TELADAN') || profile.nsm === '121235780001') {
          profile = {
            ...defaultInstitution,
            ...profile,
            name: defaultInstitution.name,
            nsm: defaultInstitution.nsm,
            npsn: defaultInstitution.npsn,
          };
          delete (profile as any).ministry;
          this.saveInstitutionProfile(profile).catch(() => {});
        }
        localStorage.setItem(LS_INSTITUTION, JSON.stringify(profile));
        return profile;
      }
    } catch (err) {
      console.warn('Firestore institution profile fallback to cache:', err);
    }

    const cached = localStorage.getItem(LS_INSTITUTION);
    if (cached) {
      try {
        let parsed = JSON.parse(cached);
        if (parsed.name?.includes('TELADAN') || parsed.nsm === '121235780001') {
          parsed = {
            ...defaultInstitution,
            ...parsed,
            name: defaultInstitution.name,
            nsm: defaultInstitution.nsm,
            npsn: defaultInstitution.npsn,
          };
          delete parsed.ministry;
          localStorage.setItem(LS_INSTITUTION, JSON.stringify(parsed));
        }
        return { ...defaultInstitution, ...parsed };
      } catch (e) {
        console.error('Failed to parse cached institution profile:', e);
      }
    }

    localStorage.setItem(LS_INSTITUTION, JSON.stringify(defaultInstitution));
    return defaultInstitution;
  }

  public static async saveInstitutionProfile(profile: InstitutionProfile): Promise<void> {
    localStorage.setItem(LS_INSTITUTION, JSON.stringify(profile));

    try {
      const docRef = doc(db, 'settings', 'institution');
      await setDoc(docRef, profile);
      this.isFirebaseConnected = true;
    } catch (err) {
      console.warn('Could not sync institution settings to Firestore (saved locally):', err);
    }
  }

  // --- CLASSES / ROMBEL MANAGEMENT ---
  public static async getClasses(): Promise<string[]> {
    try {
      const docRef = doc(db, 'settings', 'classes');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        this.isFirebaseConnected = true;
        const data = docSnap.data();
        if (data && Array.isArray(data.list) && data.list.length > 0) {
          localStorage.setItem(LS_CLASSES, JSON.stringify(data.list));
          return data.list;
        }
      }
    } catch (err) {
      console.warn('Firestore classes fallback to cache:', err);
    }

    const cached = localStorage.getItem(LS_CLASSES);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse cached classes:', e);
      }
    }

    localStorage.setItem(LS_CLASSES, JSON.stringify(defaultClassesList));
    return defaultClassesList;
  }

  public static async saveClasses(classes: string[]): Promise<void> {
    const cleanList = Array.from(new Set(classes.map(c => c.trim()).filter(Boolean)));
    localStorage.setItem(LS_CLASSES, JSON.stringify(cleanList));

    try {
      const docRef = doc(db, 'settings', 'classes');
      await setDoc(docRef, { list: cleanList, updatedAt: new Date().toISOString() });
      this.isFirebaseConnected = true;
    } catch (err) {
      console.warn('Could not sync classes to Firestore (saved locally):', err);
    }
  }

  public static async renameClass(oldName: string, newName: string): Promise<number> {
    const currentClasses = await this.getClasses();
    const updatedClasses = currentClasses.map(c => c === oldName ? newName : c);
    await this.saveClasses(updatedClasses);

    // Update any students currently enrolled in the renamed class
    const students = await this.getStudents();
    const affected = students.filter(s => s.classId === oldName);
    if (affected.length > 0) {
      const updated = affected.map(s => ({ ...s, classId: newName, updatedAt: new Date().toISOString() }));
      await this.saveStudentsBatch(updated);
    }
    return affected.length;
  }

  public static subscribeToClasses(callback: (classes: string[]) => void): () => void {
    try {
      const docRef = doc(db, 'settings', 'classes');
      return onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data && Array.isArray(data.list)) {
            localStorage.setItem(LS_CLASSES, JSON.stringify(data.list));
            callback(data.list);
          }
        }
      }, (err) => {
        console.warn('Firestore classes subscription notice:', err);
      });
    } catch (err) {
      return () => {};
    }
  }

  // --- PURGE ALL DEMO & RESET HELPERS ---
  public static async clearAllData(): Promise<{ students: Student[]; transfersIn: TransferIn[]; transfersOut: TransferOut[]; institution: InstitutionProfile }> {
    localStorage.setItem(LS_STUDENTS, JSON.stringify([]));
    localStorage.setItem(LS_TRANSFERS_IN, JSON.stringify([]));
    localStorage.setItem(LS_TRANSFERS_OUT, JSON.stringify([]));
    localStorage.setItem(DEMO_PURGED_FLAG, 'true');

    try {
      const [stdSnap, inSnap, outSnap] = await Promise.all([
        getDocs(collection(db, 'students')),
        getDocs(collection(db, 'transfers_in')),
        getDocs(collection(db, 'transfers_out')),
      ]);

      await Promise.allSettled([
        ...stdSnap.docs.map(d => deleteDoc(d.ref)),
        ...inSnap.docs.map(d => deleteDoc(d.ref)),
        ...outSnap.docs.map(d => deleteDoc(d.ref)),
      ]);
      this.isFirebaseConnected = true;
    } catch (e) {
      console.warn('Reset sync to Firestore partially completed:', e);
    }

    return {
      students: [],
      transfersIn: [],
      transfersOut: [],
      institution: defaultInstitution
    };
  }

  public static async resetToDefaultData(): Promise<{ students: Student[]; transfersIn: TransferIn[]; transfersOut: TransferOut[]; institution: InstitutionProfile }> {
    return this.clearAllData();
  }

  public static async restoreAllBackup(payload: {
    students?: Student[];
    transfersIn?: TransferIn[];
    transfersOut?: TransferOut[];
    institution?: InstitutionProfile;
  }): Promise<void> {
    if (payload.students) {
      localStorage.setItem(LS_STUDENTS, JSON.stringify(payload.students));
      payload.students.forEach(s => setDoc(doc(db, 'students', s.id), s).catch(() => {}));
    }
    if (payload.transfersIn) {
      localStorage.setItem(LS_TRANSFERS_IN, JSON.stringify(payload.transfersIn));
      payload.transfersIn.forEach(t => setDoc(doc(db, 'transfers_in', t.id), t).catch(() => {}));
    }
    if (payload.transfersOut) {
      localStorage.setItem(LS_TRANSFERS_OUT, JSON.stringify(payload.transfersOut));
      payload.transfersOut.forEach(t => setDoc(doc(db, 'transfers_out', t.id), t).catch(() => {}));
    }
    if (payload.institution) {
      localStorage.setItem(LS_INSTITUTION, JSON.stringify(payload.institution));
      setDoc(doc(db, 'settings', 'institution'), payload.institution).catch(() => {});
    }
  }
}

// Automatically check and purge any old demo records in browser cache & validate Firestore connection
DataService.checkAndPurgeLocalDemo();
DataService.testConnection().catch(() => {});
