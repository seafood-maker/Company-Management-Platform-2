import { db } from '../lib/firebase';
import { collection, getDocs, setDoc, doc, deleteDoc, query, orderBy } from "firebase/firestore";
import { User, Schedule, Vehicle } from '../types';
import { MOCK_VEHICLES, INITIAL_SCHEDULES, MOCK_USERS } from '../constants';

// --- 1. 具名匯出：讓 ScheduleForm.tsx 可以讀取到衝突檢查邏輯 ---
export const checkCollision = (newData: Partial<Schedule>, allSchedules: Schedule[]): string | null => {
  if (!newData.vehicleId || newData.vehicleId === 'none') return null;

  const collision = allSchedules.find(s => {
    // 如果是編輯模式，排除掉正在編輯的這筆資料本身
    if (s.id === newData.id) return false;

    // 同一天且同一台車
    if (s.date === newData.date && s.vehicleId === newData.vehicleId) {
      const newStart = newData.startTime!;
      const newEnd = newData.endTime!;
      const oldStart = s.startTime;
      const oldEnd = s.endTime;

      // 檢查時間重疊：(新開始 < 舊結束) 且 (新結束 > 舊開始)
      return (newStart < oldEnd) && (newEnd > oldStart);
    }
    return false;
  });

  if (collision) {
    return `派車衝突！該車輛已被 ${collision.userName} 預約 (時段：${collision.startTime} - ${collision.endTime})`;
  }
  return null;
};

// --- 2. 物件匯出：讓 App.tsx 可以讀取到所有資料庫操作 ---
export const storage = {
  // 人員管理
  getUsers: async (): Promise<User[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const users = querySnapshot.docs.map(doc => doc.data() as User);
      return users.length > 0 ? users : MOCK_USERS;
    } catch (error) {
      console.error("讀取人員失敗:", error);
      return MOCK_USERS;
    }
  },
  saveUser: async (user: User) => {
    await setDoc(doc(db, "users", user.id), user);
  },
  deleteUser: async (id: string) => {
    await deleteDoc(doc(db, "users", id));
  },

  // 行程管理
  getSchedules: async (): Promise<Schedule[]> => {
    try {
      const q = query(collection(db, "schedules"), orderBy("date", "asc"));
      const querySnapshot = await getDocs(q);
      const schedules = querySnapshot.docs.map(doc => doc.data() as Schedule);
      return schedules.length > 0 ? schedules : INITIAL_SCHEDULES;
    } catch (error) {
      console.error("讀取行程失敗:", error);
      return INITIAL_SCHEDULES;
    }
  },
  saveSchedule: async (schedule: Schedule) => {
    await setDoc(doc(db, "schedules", schedule.id), schedule);
  },
  deleteSchedule: async (id: string) => {
    await deleteDoc(doc(db, "schedules", id));
  },

  // 車輛管理
  getVehicles: (): Vehicle[] => {
    return MOCK_VEHICLES;
  }
};
