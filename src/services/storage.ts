import { db } from '../lib/firebase';
import { collection, getDocs, getDoc, setDoc, doc, deleteDoc, query, orderBy, updateDoc } from "firebase/firestore";
import { User, Schedule, Vehicle, Project } from '../types';
import { MOCK_VEHICLES, MOCK_USERS } from '../constants';

export const storage = {
  // --- 1. 人員管理 ---
  getUsers: async (): Promise<User[]> => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const users = querySnapshot.docs.map(d => ({ ...d.data(), id: d.id } as User));
    return users.length > 0 ? users : MOCK_USERS;
  },
  saveUser: async (user: User) => {
    await setDoc(doc(db, "users", user.id), user);
  },
  deleteUser: async (id: string) => {
    await deleteDoc(doc(db, "users", id));
  },

  // --- 2. 車輛管理 ---
  getVehicles: async (): Promise<Vehicle[]> => {
    const querySnapshot = await getDocs(collection(db, "vehicles"));
    const vehicles = querySnapshot.docs.map(d => ({ ...d.data(), id: d.id } as Vehicle));
    return vehicles.length > 0 ? vehicles : MOCK_VEHICLES;
  },
  saveVehicle: async (vehicle: Vehicle) => {
    await setDoc(doc(db, "vehicles", vehicle.id), vehicle);
  },
  deleteVehicle: async (id: string) => {
    await deleteDoc(doc(db, "vehicles", id));
  },

  // --- 3. 行程管理 ---
  getSchedules: async (): Promise<Schedule[]> => {
    const q = query(collection(db, "schedules"), orderBy("date", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(d => ({ ...d.data(), id: d.id } as Schedule));
  },

  // [關鍵新增] 同步更新車輛總里程數：重新掃描該車所有已填寫行程並加總
  syncVehicleMileage: async (vehicleId: string) => {
    if (!vehicleId || vehicleId === 'none') return;

    const q = query(collection(db, "schedules"), orderBy("date", "asc"));
    const querySnapshot = await getDocs(q);
    const allSchedules = querySnapshot.docs.map(d => d.data() as Schedule);
    
    // 篩選該車輛所有已完成的行程，重新計算總里程 (tripMileage 的加總)
    const total = allSchedules
      .filter(s => String(s.vehicleId) === String(vehicleId) && s.mileageCompleted)
      .reduce((sum, s) => sum + (s.tripMileage || 0), 0);

    const vehRef = doc(db, "vehicles", vehicleId);
    await updateDoc(vehRef, { totalMileage: total });
  },

  // 修正存檔邏輯：支援後台修改時自動同步車輛總里程
  saveSchedule: async (schedule: Schedule) => {
    await setDoc(doc(db, "schedules", schedule.id), schedule);
    
    // 如果這筆行程有紀錄車輛且已完成里程，儲存後立即更新車輛總表
    if (schedule.vehicleId && schedule.mileageCompleted) {
      await storage.syncVehicleMileage(schedule.vehicleId);
    }
  },

  deleteSchedule: async (id: string) => {
    // 刪除前先抓取資料，確認是否需要同步車輛里程
    const docRef = doc(db, "schedules", id);
    const docSnap = await getDoc(docRef);
    const data = docSnap.data() as Schedule;

    await deleteDoc(docRef);

    // 刪除後，如果該行程原本有里程紀錄，則重新同步車輛里程
    if (data && data.vehicleId && data.mileageCompleted) {
      await storage.syncVehicleMileage(data.vehicleId);
    }
  },

  // --- 4. 里程填報管理 (修正後的累加與同步邏輯) ---
  updateMileage: async (
    scheduleId: string, 
    vehicleId: string, 
    startKm: number, 
    endKm: number, 
    isRefueled: boolean, 
    isWashed: boolean
  ) => {
    const tripMileage = endKm - startKm;

    // A. 更新行程紀錄：加入當次計算的里程與勾選狀態
    const scheduleRef = doc(db, "schedules", scheduleId);
    await updateDoc(scheduleRef, {
      startKm,
      endKm,
      tripMileage,
      isRefueled,
      isWashed,
      mileageCompleted: true
    });

    // B. 呼叫同步函式，更新車輛的「總行駛里程數」
    await storage.syncVehicleMileage(vehicleId);
  },

  // --- 5. 計畫管理 ---
  getProjects: async (): Promise<Project[]> => {
    const querySnapshot = await getDocs(collection(db, "projects"));
    return querySnapshot.docs.map(d => ({ ...d.data(), id: d.id } as Project));
  },
  saveProject: async (project: Project) => {
    await setDoc(doc(db, "projects", project.id), project);
  },
  deleteProject: async (id: string) => {
    await deleteDoc(doc(db, "projects", id));
  }
}; // storage 物件結束

// --- 6. 衝突檢查邏輯 ---
export const checkCollision = (newData: Partial<Schedule>, allSchedules: Schedule[]): string | null => {
  if (!newData.vehicleId || newData.vehicleId === 'none') return null;
  
  const collision = allSchedules.find(s => {
    if (s.id === newData.id) return false; 
    if (s.date === newData.date && s.vehicleId === newData.vehicleId) {
      return (newData.startTime! < s.endTime && newData.endTime! > s.startTime);
    }
    return false;
  });
  
  return collision ? `此時段該車輛已被 ${collision.userName} 預約` : null;
};
