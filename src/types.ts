export enum UserRole {
  ADMIN = '管理員',
  USER = '一般使用者'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
}

export interface Vehicle {
  id: string;
  name: string;
  plateNumber: string;
  status: 'active' | 'maintenance';
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
  vehicleId?: string | null;
  vehicleName?: string;
}
