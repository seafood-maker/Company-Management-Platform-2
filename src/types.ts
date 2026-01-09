// src/types.ts 完整修正版

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

// 行程類別
export type ScheduleCategory = '會議' | '外勤' | '休假' | '其他';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  avatar?: string;
  password?: string; // 4位數密碼
}

export interface Project {
  id: string;
  name: string;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  name: string;
  type: string;
  status: 'available' | 'maintenance'; // 可預約 / 維修中
  totalMileage: number; // 修正名稱：總行駛里程數 (原為 currentMileage)
}

export interface Schedule {
  id: string;
  userId: string;
  userName: string;
  date: string; 
  startTime: string; 
  endTime: string; 
  purpose: string; // 事由/目的地
  category: ScheduleCategory;
  projectName: string; // 計畫名稱
  accompanimentIds: string[]; // 同行人員 ID 列表
  vehicleId: string | null;
  vehicleName?: string;
  
  // --- 里程與維護紀錄欄位 ---
  startKm?: number;      // 出發里程
  endKm?: number;        // 結束里程
  tripMileage?: number;  // 當次行駛里程 (結束 - 出發)
  isRefueled?: boolean;  // 是否加油
  isWashed?: boolean;    // 是否洗車
  mileageCompleted?: boolean; // 是否已填寫里程
}
