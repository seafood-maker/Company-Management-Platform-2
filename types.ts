
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  name: string;
  type: string;
  status: 'available' | 'maintenance' | 'busy';
}

export interface Schedule {
  id: string;
  userId: string;
  userName: string;
  date: string; // ISO format YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  destination: string;
  purpose: string;
  vehicleId: string | null; // null if no vehicle needed
  vehicleName?: string;
}

export interface AppState {
  currentUser: User | null;
  schedules: Schedule[];
  vehicles: Vehicle[];
}
