import { Schedule } from '../types';

/**
 * 檢查預約時間是否衝突
 * @param newData 欲新增或修改的行程資料
 * @param allSchedules 現有的所有行程
 * @returns 衝突訊息，若無衝突則回傳 null
 */
export const checkCollision = (newData: Partial<Schedule>, allSchedules: Schedule[]): string | null => {
  // 如果沒有選擇車輛，或選擇「不需用車」，則不檢查衝突
  if (!newData.vehicleId || newData.vehicleId === 'none') {
    return null;
  }

  const collision = allSchedules.find(s => {
    // 如果是編輯模式，要排除掉「正在編輯的這筆資料本身」，否則會跟自己衝突
    if (s.id === newData.id) return false;

    // 必須是同一天、同一台車
    const isSameDay = s.date === newData.date;
    const isSameVehicle = s.vehicleId === newData.vehicleId;

    if (isSameDay && isSameVehicle) {
      // 檢查時間重疊邏輯：
      // (新開始時間 < 舊結束時間) 且 (新結束時間 > 舊開始時間) 代表有重疊
      const newStart = newData.startTime!;
      const newEnd = newData.endTime!;
      const oldStart = s.startTime;
      const oldEnd = s.endTime;

      return (newStart < oldEnd) && (newEnd > oldStart);
    }
    return false;
  });

  if (collision) {
    return `派車衝突！該車輛已被 ${collision.userName} 預約 (時段：${collision.startTime} - ${collision.endTime})`;
  }

  return null;
};
