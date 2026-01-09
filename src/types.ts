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

export interface Project {
  id: string;
  name: string;
}

export interface Schedule {
  id: string;
  userId: string;
  userName: string;
  date: string; 
  startTime: string; 
  endTime: string; 
  // destination: string; // 移除此欄位
  purpose: string; // 對應你的「事由/目的地」
  category: ScheduleCategory;
  projectName: string; // 新增：計畫名稱
  accompanimentIds: string[]; // 新增：同行人員 ID 列表
  vehicleId: string | null;
  vehicleName?: string;
  startKm?: number;
  endKm?: number;
  mileageCompleted?: boolean;
}
