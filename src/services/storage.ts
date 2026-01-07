import { db } from '../lib/firebase';
import { collection, getDocs, setDoc, doc, deleteDoc, query, orderBy, updateDoc } from "firebase/firestore";
import { User, Schedule, Vehicle } from '../types';
import { INITIAL_SCHEDULES, MOCK_USERS } from '../constants';

export const storage = {
  // --- 人員管理 ---
  getUsers: async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    return querySnapshot.docs.map(doc => doc.data() as User);
  },
  saveUser: async (user: User) => {
    await setDoc(doc(db, "users", user.id), user);
  },
  deleteUser: async (id: string) => {
    await deleteDoc(doc(db, "users", id));
  },

  // --- 車輛管理 (新增) ---
  getVehicles: async (): Promise<Vehicle[]> => {
    const querySnapshot = await getDocs(collection(db, "vehicles"));
    return querySnapshot.docs.map(doc => doc.data() as Vehicle);
  },
  saveVehicle: async (vehicle: Vehicle) => {
    await setDoc(doc(db, "vehicles", vehicle.id), vehicle);
  },
  deleteVehicle: async (id: string) => {
    await deleteDoc(doc(db, "vehicles", id));
  },

  // --- 行程與里程管理 ---
  getSchedules: async () => {
    const q = query(collection(db, "schedules"), orderBy("date", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Schedule);
  },
  saveSchedule: async (schedule: Schedule) => {
    await setDoc(doc(db, "schedules", schedule.id), schedule);
  },
  // 更新里程並同步回報車輛總里程
  updateMileage: async (scheduleId: string, vehicleId: string, startKm: number, endKm: number) => {
    const totalTrip = endKm - startKm;
    // 1. 更新行程紀錄
    await updateDoc(doc(db, "schedules", scheduleId), {
      startKm,
      endKm,
      mileageCompleted: true
    });
    // 2. 更新車輛總里程 (這是一個簡化邏輯，實際應計算所有行程總和)
    const vehDoc = doc(db, "vehicles", vehicleId);
    await updateDoc(vehDoc, {
      currentMileage: endKm 
    });
  }
};

// 衝突檢查邏輯 (已包含車輛反白檢查邏輯基礎)
export const checkCollision = (newData: Partial<Schedule>, allSchedules: Schedule[]): string | null => {
  if (!newData.vehicleId || newData.vehicleId === 'none') return null;
  const collision = allSchedules.find(s => {
    if (s.id === newData.id) return false;
    if (s.date === newData.date && s.vehicleId === newData.vehicleId) {
      return (newData.startTime! < s.endTime) && (newData.endTime! > s.startTime);
    }
    return false;
  });
  return collision ? `此時段該車輛已被 ${collision.userName} 預約` : null;
};
