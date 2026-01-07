export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

// 新增行程類別
export type ScheduleCategory = '會議' | '外勤' | '休假' | '其他';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  avatar?: string;
  password?: string; // 新增：4位數密碼
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  name: string;
  type: string;
  status: 'available' | 'maintenance'; // 可預約 / 維修中
  currentMileage: number; // 總里程
}

export interface Schedule {
  id: string;
  userId: string;
  userName: string;
  date: string; 
  startTime: string; 
  endTime: string; 
  destination: string;
  purpose: string;
  category: ScheduleCategory; // 新增：類別
  vehicleId: string | null;
  vehicleName?: string;
  // 里程紀錄
  startKm?: number; // 出發里程
  endKm?: number;   // 回來里程
  mileageCompleted?: boolean; // 是否已填寫里程
}
