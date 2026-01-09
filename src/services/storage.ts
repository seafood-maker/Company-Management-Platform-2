import { db } from '../lib/firebase';
import { collection, getDocs, getDoc, setDoc, doc, deleteDoc, query, orderBy, updateDoc } from "firebase/firestore";
import { User, Schedule, Vehicle, Project } from '../types';
import { MOCK_VEHICLES, MOCK_USERS } from '../constants';

export const storage = {
  // --- 1. 人員管理 ---
  getUsers: async (): Promise<User[]> => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const users = querySnapshot.docs.map(d => ({ ...d.data(), id: d.id } as User));
    return users;
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
    return vehicles;
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

  // [核心關鍵修正] 同步更新車輛總里程數：初始里程 + 所有歷史行程累計
  syncVehicleMileage: async (vehicleId: string) => {
    if (!vehicleId || vehicleId === 'none') return;

    // A. 獲取車輛基本資料 (取得 initialMileage)
    const vehRef = doc(db, "vehicles", vehicleId);
    const vehSnap = await getDoc(vehRef);
    if (!vehSnap.exists()) return;
    const vehData = vehSnap.data() as Vehicle;
    const initial = vehData.initialMileage || 0;

    // B. 抓取所有行程資料
    const q = query(collection(db, "schedules"));
    const querySnapshot = await getDocs(q);
    const allSchedules = querySnapshot.docs.map(d => d.data() as Schedule);
    
    // C. 篩選該車輛「已完成」紀錄並加總 tripMileage
    const tripSum = allSchedules
      .filter(s => String(s.vehicleId) === String(vehicleId) && s.mileageCompleted)
      .reduce((sum, s) => {
        // 如果有 tripMileage 就直接加，沒有的話就用 end - start 算
        const trip = s.tripMileage !== undefined ? s.tripMileage : ((s.endKm || 0) - (s.startKm || 0));
        return sum + (trip > 0 ? trip : 0);
      }, 0);

    // D. 最終計算：總行駛里程 = 初始里程 + 累計行駛距離
    const finalTotal = initial + tripSum;

    await updateDoc(vehRef, { totalMileage: finalTotal });
    console.log(`同步完成：車輛 ${vehicleId} 總行駛里程已校正為: ${finalTotal} (含初始里程 ${initial})`);
  },

  // 修正存檔邏輯：儲存後自動觸發重新加總
  saveSchedule: async (schedule: Schedule) => {
    // 存檔前自動計算當次行駛里程 (Trip Mileage)
    if (schedule.mileageCompleted && schedule.startKm !== undefined && schedule.endKm !== undefined) {
      schedule.tripMileage = schedule.endKm - schedule.startKm;
    }

    await setDoc(doc(db, "schedules", schedule.id), schedule);
    
    // 儲存後同步車輛總里程
    if (schedule.vehicleId && schedule.vehicleId !== 'none') {
      await storage.syncVehicleMileage(schedule.vehicleId);
    }
  },

  // 修正刪除邏輯：刪除後重新計算總里程
  deleteSchedule: async (id: string) => {
    const docRef = doc(db, "schedules", id);
    const docSnap = await getDoc(docRef);
    const data = docSnap.data() as Schedule;

    await deleteDoc(docRef);

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

    const scheduleRef = doc(db, "schedules", scheduleId);
    await updateDoc(scheduleRef, {
      startKm,
      endKm,
      tripMileage,
      isRefueled,
      isWashed,
      mileageCompleted: true
    });

    // 觸發重新加總 (包含初始里程)
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

// --- 6. 衝突檢查邏輯 (輔助函式) ---
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
