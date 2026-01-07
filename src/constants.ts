
import { User, Vehicle, Schedule, UserRole } from './types';

export const MOCK_USERS: User[] = [
  { id: 'u1', username: 'admin', name: '系統管理員', role: UserRole.ADMIN, avatar: 'https://picsum.photos/seed/admin/100' },
  { id: 'u2', username: 'user1', name: '王小明', role: UserRole.USER, avatar: 'https://picsum.photos/seed/user1/100' },
  { id: 'u3', username: 'user2', name: '李華', role: UserRole.USER, avatar: 'https://picsum.photos/seed/user2/100' },
];

export const MOCK_VEHICLES: Vehicle[] = [
  { id: 'v1', plateNumber: 'ABC-1234', name: '白色 SUV', type: 'SUV', status: 'available' },
  { id: 'v2', plateNumber: 'XYZ-5678', name: '黑色房車', type: 'Sedan', status: 'available' },
  { id: 'v3', plateNumber: 'CAR-9999', name: '公務小貨車', type: 'Van', status: 'maintenance' },
];

export const INITIAL_SCHEDULES: Schedule[] = [
  {
    id: 's1',
    userId: 'u2',
    userName: '王小明',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '12:00',
    destination: '內湖科學園區',
    purpose: '客戶拜訪',
    vehicleId: 'v1',
    vehicleName: '白色 SUV (ABC-1234)'
  },
  {
    id: 's2',
    userId: 'u3',
    userName: '李華',
    date: new Date().toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '17:00',
    destination: '市政府',
    purpose: '公務會議',
    vehicleId: 'v2',
    vehicleName: '黑色房車 (XYZ-5678)'
  }
];
