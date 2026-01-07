import React, { useState, useEffect } from 'react';
import { Vehicle, Schedule, User, UserRole, ScheduleCategory } from '../types';
import { checkCollision } from '../services/storage';

interface ScheduleFormProps {
  onClose: () => void;
  onSave: (schedule: Schedule) => void;
  vehicles: Vehicle[];
  schedules: Schedule[];
  currentUser: User;
  initialData?: Schedule;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({ 
  onClose, 
  onSave, 
  vehicles, 
  schedules, 
  currentUser, 
  initialData 
}) => {
  // 初始化表單資料，包含新增的 category
  const [formData, setFormData] = useState<Partial<Schedule>>({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '11:00',
    destination: '',
    purpose: '',
    category: '外勤', // 預設為外勤
    vehicleId: 'none'
  });
  
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 基本驗證
    if (formData.startTime! >= formData.endTime!) {
      setError("結束時間必須晚於開始時間。");
      return;
    }

    // 送出前的最終衝突檢查
    const collisionMsg = checkCollision(formData, schedules);
    if (collisionMsg) {
      setError(collisionMsg);
      return;
    }

    const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId);
    
    const finalData: Schedule = {
      id: initialData?.id || 's' + Date.now(),
      userId: initialData?.userId || currentUser.id,
      userName: initialData?.userName || currentUser.name,
      date: formData.date!,
      startTime: formData.startTime!,
      endTime: formData.endTime!,
      destination: formData.destination!,
      purpose: formData.purpose!,
      category: (formData.category as ScheduleCategory) || '其他', // 確保存入類別
      vehicleId: formData.vehicleId === 'none' ? null : formData.vehicleId!,
      vehicleName: selectedVehicle ? `${selectedVehicle.name} (${selectedVehicle.plateNumber})` : undefined
    };

    onSave(finalData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">
            {initialData ? '修改外差行程' : '新增外差行程'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-start space-x-2">
              <i className="fas fa-exclamation-triangle mt-0.5"></i>
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* 日期選擇 */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">日期</label>
              <input 
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            
            {/* 2. 類別選擇 (會議、外勤、休假、其他) */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">類別</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as ScheduleCategory})}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="會議">會議</option>
                <option value="外勤">外勤</option>
                <option value="休假">休假</option>
                <option value="其他">其他</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">開始時間</label>
              <input 
                type="time"
                required
                value={formData.startTime}
                onChange={e => setFormData({...formData, startTime: e.target.value})}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">結束時間</label>
              <input 
                type="time"
                required
                value={formData.endTime}
                onChange={e => setFormData({...formData, endTime: e.target.value})}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">目的地</label>
            <input 
              type="text"
              required
              placeholder="請輸入目的地"
              value={formData.destination}
              onChange={e => setFormData({...formData, destination: e.target.value})}
              className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">事由</label>
            <textarea 
              rows={2}
              placeholder="請描述出差目的"
              value={formData.purpose}
              onChange={e => setFormData({...formData, purpose: e.target.value})}
              className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            ></textarea>
          </div>

          {/* 2. 預約車輛 (自動反白邏輯) */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">預約車輛</label>
            <select 
              value={formData.vehicleId || 'none'}
              onChange={e => setFormData({...formData, vehicleId: e.target.value})}
              className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
              <option value="none">不需用車 / 自行前往</option>
              {vehicles.map(v => {
                // (1) 檢查車輛是否為維修中
                const isMaintenance = v.status === 'maintenance';
                
                // (2) 檢查該時段是否已被其他人預約
                const isBooked = schedules.some(s => 
                  s.id !== initialData?.id && // 排除目前正在編輯的這一筆
                  s.date === formData.date &&
                  s.vehicleId === v.id &&
                  (formData.startTime! < s.endTime && formData.endTime! > s.startTime)
                );

                const isDisabled = isMaintenance || isBooked;

                return (
                  <option 
                    key={v.id} 
                    value={v.id} 
                    disabled={isDisabled}
                    className={isDisabled ? 'text-slate-400 italic' : 'text-slate-900'}
                  >
                    {v.name} ({v.plateNumber}) 
                    {isMaintenance ? ' [維修中 - 無法預約]' : isBooked ? ' [該時段已被預約]' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="pt-2 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition text-sm"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 text-sm"
            >
              儲存行程
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleForm;
