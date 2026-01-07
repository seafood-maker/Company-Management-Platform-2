import { Schedule, Vehicle, User } from '../types';
import { MOCK_VEHICLES, INITIAL_SCHEDULES, MOCK_USERS } from '../constants';

export const storage = {
  // --- 人員管理 ---
  getUsers: (): User[] => {
    const saved = localStorage.getItem('fleetflow_users');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  },
  saveUsers: (users: User[]) => {
    localStorage.setItem('fleetflow_users', JSON.stringify(users));
  },

  // --- 行程管理 ---
  getSchedules: (): Schedule[] => {
    const saved = localStorage.getItem('fleetflow_schedules');
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULES;
  },
  saveSchedules: (schedules: Schedule[]) => {
    localStorage.setItem('fleetflow_schedules', JSON.stringify(schedules));
  },

  // --- 車輛管理 ---
  getVehicles: (): Vehicle[] => {
    return MOCK_VEHICLES;
  }
};

export const checkCollision = (newData: Partial<Schedule>, allSchedules: Schedule[]): string | null => {
  // ... (保留你之前的 checkCollision 代碼) ...
  return null; 
};
