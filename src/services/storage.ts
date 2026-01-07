import { Schedule, Vehicle } from '../types';
import { MOCK_VEHICLES, INITIAL_SCHEDULES } from '../constants';

export const storage = {
  // 從瀏覽器讀取行程
  getSchedules: (): Schedule[] => {
    const saved = localStorage.getItem('fleetflow_schedules');
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULES;
  },

  // 儲存行程到瀏覽器
  saveSchedules: (schedules: Schedule[]) => {
    localStorage.setItem('fleetflow_schedules', JSON.stringify(schedules));
  },

  // 取得車輛清單
  getVehicles: (): Vehicle[] => {
    return MOCK_VEHICLES;
  }
};
