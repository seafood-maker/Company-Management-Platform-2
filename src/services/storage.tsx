import { Schedule, Vehicle } from '../types';
import { MOCK_VEHICLES, INITIAL_SCHEDULES } from '../constants';

// 這是給 ScheduleForm.tsx 用的單獨匯出
export const checkCollision = (newData: Partial<Schedule>, allSchedules: Schedule[]): string | null => {
  if (!newData.vehicleId || newData.vehicleId === 'none') return null;

  const collision = allSchedules.find(s => {
    // 如果是編輯模式，排除掉正在編輯的這筆資料本身
    if (s.id === newData.id) return false;

    // 同一天且同一台車
    if (s.date === newData.date && s.vehicleId === newData.vehicleId) {
      const newStart = newData.startTime!;
      const newEnd = newData.endTime!;
      const oldStart = s.startTime;
      const oldEnd = s.endTime;

      // 檢查時間重疊：(新開始 < 舊結束) 且 (新結束 > 舊開始)
      return (newStart < oldEnd) && (newEnd > oldStart);
    }
    return false;
  });

  if (collision) {
    return `派車衝突！該車輛已被 ${collision.userName} 預約 (時段：${collision.startTime} - ${collision.endTime})`;
  }
  return null;
};

// 這是給 App.tsx 用的物件匯出
export const storage = {
  getSchedules: (): Schedule[] => {
    const saved = localStorage.getItem('fleetflow_schedules');
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULES;
  },

  saveSchedules: (schedules: Schedule[]) => {
    localStorage.setItem('fleetflow_schedules', JSON.stringify(schedules));
  },

  getVehicles: (): Vehicle[] => {
    return MOCK_VEHICLES;
  }
};
