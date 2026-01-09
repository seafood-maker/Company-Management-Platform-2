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

  // [核心關鍵] 同步更新車輛總里程數：重新掃描該車所有歷史行程紀錄並重新加總
  syncVehicleMileage: async (vehicleId: string) => {
    if (!vehicleId || vehicleId === 'none') return;

    // 抓取所有行程資料
    const q = query(collection(db, "schedules"));
    const querySnapshot = await getDocs(q);
    const allSchedules = querySnapshot.docs.map(d => d.data() as Schedule);
    
    // 篩選出該車輛「已完成里程填報」的紀錄，並將 tripMileage 進行加總
    const total = allSchedules
      .filter(s => String(s.vehicleId) === String(vehicleId) && s.mileageCompleted)
      .reduce((sum, s) => {
        // 如果有 tripMileage 就直接加，沒有的話就用 end - start 算 (防止舊資料漏掉欄位)
        const trip = s.tripMileage !== undefined ? s.tripMileage : ((s.endKm || 0) - (s.startKm || 0));
        return sum + (trip > 0 ? trip : 0);
      }, 0);

    // 更新到車輛資料表中
    const vehRef = doc(db, "vehicles", vehicleId);
    await updateDoc(vehRef, { totalMileage: total });
    console.log(`同步觸發：車輛 ${vehicleId} 重新計算後的總里程為: ${total}`);
  },

  // 修正存檔邏輯：儲存後自動觸發重新加總
  saveSchedule: async (schedule: Schedule) => {
    // 存檔前自動計算當次行駛里程 (Trip Mileage)
    if (schedule.mileageCompleted && schedule.startKm !== undefined && schedule.endKm !== undefined) {
      schedule.tripMileage = schedule.endKm - schedule.startKm;
    }

    await setDoc(doc(db, "schedules", schedule.id), schedule);
    
    // 如果這筆紀錄有用到車，就必須同步該車的總里程
    if (schedule.vehicleId && schedule.vehicleId !== 'none') {
      await storage.syncVehicleMileage(schedule.vehicleId);
    }
  },

  // 修正刪除邏輯：刪除後也要重新加總里程
  deleteSchedule: async (id: string) => {
    // 刪除前先抓取這筆資料，才知道是哪一台車需要重新同步
    const docRef = doc(db, "schedules", id);
    const docSnap = await getDoc(docRef);
    const data = docSnap.data() as Schedule;

    await deleteDoc(docRef);

    // 刪除後同步
    if (data && data.vehicleId && data.vehicleId !== 'none') {
      await storage.syncVehicleMileage(data.vehicleId);
    }
  },

  // --- 4. 里程填報管理 (與填報介面連動) ---
  updateMileage: async (
    scheduleId: string, 
    vehicleId: string, 
    startKm: number, 
    endKm: number, 
    isRefueled: boolean, 
    isWashed: boolean
  ) => {
    const tripMileage = endKm - startKm;

    // A. 更新行程紀錄：填入填報數據
    const scheduleRef = doc(db, "schedules", scheduleId);
    await updateDoc(scheduleRef, {
      startKm,
      endKm,
      tripMileage,
      isRefueled,
      isWashed,
      mileageCompleted: true
    });

    // B. 觸發重新加總，更新車輛總表數據
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
      // 時間重疊判定
      return (newData.startTime! < s.endTime && newData.endTime! > s.startTime);
    }
    return false;
  });
  
  return collision ? `此時段該車輛已被 ${collision.userName} 預約` : null;
};
