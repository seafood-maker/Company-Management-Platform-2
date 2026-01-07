import { db } from '../lib/firebase';
import { collection, getDocs, setDoc, doc, deleteDoc, query, orderBy } from "firebase/firestore";
import { User, Schedule, Vehicle } from '../types';
import { MOCK_VEHICLES, INITIAL_SCHEDULES, MOCK_USERS } from '../constants';

export const storage = {
  // --- 人員管理 ---
  getUsers: async (): Promise<User[]> => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const users = querySnapshot.docs.map(doc => doc.data() as User);
    return users.length > 0 ? users : MOCK_USERS;
  },
  saveUser: async (user: User) => {
    await setDoc(doc(db, "users", user.id), user);
  },

  // --- 行程管理 ---
  getSchedules: async (): Promise<Schedule[]> => {
    const q = query(collection(db, "schedules"), orderBy("date", "asc"));
    const querySnapshot = await getDocs(q);
    const schedules = querySnapshot.docs.map(doc => doc.data() as Schedule);
    return schedules.length > 0 ? schedules : INITIAL_SCHEDULES;
  },
  saveSchedules: async (schedules: Schedule[]) => {
    // 批次儲存到 Firestore
    for (const s of schedules) {
      await setDoc(doc(db, "schedules", s.id), s);
    }
  },
  // 供 ScheduleForm 使用的保存單一行程功能
  saveSchedule: async (schedule: Schedule) => {
    await setDoc(doc(db, "schedules", schedule.id), schedule);
  },
  deleteSchedule: async (id: string) => {
    await deleteDoc(doc(db, "schedules", id));
  },

  // --- 車輛管理 (暫持維持靜態) ---
  getVehicles: (): Vehicle[] => {
    return MOCK_VEHICLES;
  }
};;
