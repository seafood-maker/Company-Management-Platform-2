import { db } from '../lib/firebase';
import { collection, getDocs, setDoc, doc, deleteDoc, query, orderBy, updateDoc } from "firebase/firestore";
import { User, Schedule, Vehicle } from '../types';
import { MOCK_VEHICLES, INITIAL_SCHEDULES, MOCK_USERS } from '../constants';

export const storage = {
  // --- 人員管理 ---
  getUsers: async (): Promise<User[]> => {
    const querySnapshot = await getDocs(collection(db, "users"));
    // 修正點：確保將雲端的 doc.id 映射到 id 屬性，否則刪除時會找不到 ID
    const users = querySnapshot.docs.map(d => ({ ...d.data(), id: d.id } as User));
    return users.length > 0 ? users : MOCK_USERS;
  },
  saveUser: async (user: User) => {
    await setDoc(doc(db, "users", user.id), user);
  },
  deleteUser: async (id: string) => {
    await deleteDoc(doc(db, "users", id));
  },

  // --- 車輛管理 ---
  getVehicles: async (): Promise<Vehicle[]> => {
    const querySnapshot = await getDocs(collection(db, "vehicles"));
    // 修正點：確保映射 doc.id
    const vehicles = querySnapshot.docs.map(d => ({ ...d.data(), id: d.id } as Vehicle));
    return vehicles.length > 0 ? vehicles : MOCK_VEHICLES;
  },
  saveVehicle: async (vehicle: Vehicle) => {
    await setDoc(doc(db, "vehicles", vehicle.id), vehicle);
  },
  deleteVehicle: async (id: string) => {
    await deleteDoc(doc(db, "vehicles", id));
  },

  // --- 行程管理 ---
  getSchedules: async (): Promise<Schedule[]> => {
    const q = query(collection(db, "schedules"), orderBy("date", "asc"));
    const querySnapshot = await getDocs(q);
    // 修正點：確保映射 doc.id，這是解決行程刪除失敗的關鍵
    return querySnapshot.docs.map(d => ({ ...d.data(), id: d.id } as Schedule));
  },
  saveSchedule: async (schedule: Schedule) => {
    await setDoc(doc(db, "schedules", schedule.id), schedule);
  },
  deleteSchedule: async (id: string) => {
    // 執行刪除
    await deleteDoc(doc(db, "schedules", id));
  },

  // --- 里程管理 (完整保留您的原始邏輯) ---
  updateMileage: async (scheduleId: string, vehicleId: string, startKm: number, endKm: number) => {
    // 1. 更新行程紀錄中的里程資訊與狀態
    await updateDoc(doc(db, "schedules", scheduleId), {
      startKm,
      endKm,
      mileageCompleted: true
    });
    // 2. 同步更新該車輛的目前總里程
    const vehDoc = doc(db, "vehicles", vehicleId);
    await updateDoc(vehDoc, {
      currentMileage: endKm 
    });
  }
};

// --- 衝突檢查邏輯 (完整保留您的原始邏輯) ---
export const checkCollision = (newData: Partial<Schedule>, allSchedules: Schedule[]): string | null => {
  if (!newData.vehicleId || newData.vehicleId === 'none') return null;
  const collision = allSchedules.find(s => {
    if (s.id === newData.id) return false;
    if (s.date === newData.date && s.vehicleId === newData.vehicleId) {
      // 時間重疊判定
      return (newData.startTime! < s.endTime) && (newData.endTime! > s.startTime);
    }
    return false;
  });
  return collision ? `此時段該車輛已被 ${collision.userName} 預約` : null;
};
