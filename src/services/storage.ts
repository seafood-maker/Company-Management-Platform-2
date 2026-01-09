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
    // 映射 doc.id 並確保 totalMileage 有預設值
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
  saveSchedule: async (schedule: Schedule) => {
    // 確保存儲時包含所有欄位 (包含 projectName, accompanimentIds 等)
    await setDoc(doc(db, "schedules", schedule.id), schedule);
  },
  deleteSchedule: async (id: string) => {
    await deleteDoc(doc(db, "schedules", id));
  },

  // --- 4. 里程管理 (修正後的累加邏輯) ---
  updateMileage: async (
    scheduleId: string, 
    vehicleId: string, 
    startKm: number, 
    endKm: number, 
    isRefueled: boolean, 
    isWashed: boolean
  ) => {
    // A. 計算當次行駛里程
    const tripMileage = endKm - startKm;

    // B. 更新該筆行程紀錄：加入出發、結束、當次里程、加油、洗車狀態
    const scheduleRef = doc(db, "schedules", scheduleId);
    await updateDoc(scheduleRef, {
      startKm,
      endKm,
      tripMileage,
      isRefueled,
      isWashed,
      mileageCompleted: true
    });

    // C. 更新車輛的「總行駛里程數」 (累加邏輯)
    const vehRef = doc(db, "vehicles", vehicleId);
    const vehSnap = await getDoc(vehRef);
    
    if (vehSnap.exists()) {
      const vehData = vehSnap.data() as Vehicle;
      // 拿原本的總里程 (totalMileage) 加上 這次跑的里程 (tripMileage)
      const newTotalMileage = (vehData.totalMileage || 0) + tripMileage;
      
      await updateDoc(vehRef, {
        totalMileage: newTotalMileage
      });
    }
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
  // 如果「不須用車」，不進行衝突檢查
  if (!newData.vehicleId || newData.vehicleId === 'none') return null;
  
  const collision = allSchedules.find(s => {
    if (s.id === newData.id) return false; // 排除正在編輯的同一筆
    if (s.date === newData.date && s.vehicleId === newData.vehicleId) {
      // 時間重疊判定邏輯
      return (newData.startTime! < s.endTime && newData.endTime! > s.startTime);
    }
    return false;
  });
  
  return collision ? `此時段該車輛已被 ${collision.userName} 預約` : null;
};
