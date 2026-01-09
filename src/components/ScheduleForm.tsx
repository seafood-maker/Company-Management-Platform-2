import React, { useState, useEffect } from 'react';
import { Vehicle, Schedule, User, Project, ScheduleCategory } from '../types';
import { checkCollision } from '../services/storage';

interface ScheduleFormProps {
  onClose: () => void;
  onSave: (schedule: Schedule) => void;
  vehicles: Vehicle[];
  schedules: Schedule[];
  users: User[]; // 新增：傳入人員清單
  projects: Project[]; // 新增：傳入計畫清單
  currentUser: User;
  initialData?: Schedule;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({ 
  onClose, 
  onSave, 
  vehicles, 
  schedules, 
  users,
  projects,
  currentUser, 
  initialData 
}) => {
  // 1. 初始化表單資料
  const [formData, setFormData] = useState<Partial<Schedule>>({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '11:00',
    purpose: '', // 原「事由」與「目的地」合併於此
    category: '外勤',
    projectName: '',
    accompanimentIds: [], // 同行人員 ID 陣列
    vehicleId: 'none'
  });
  
  const [error, setError] = useState<string | null>(null);

  // 載入編輯資料或預設值
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else if (projects.length > 0) {
      setFormData(prev => ({ ...prev, projectName: projects[0].name }));
    }
  }, [initialData, projects]);

  // 同行人員切換邏輯
  const toggleAccompaniment = (userId: string) => {
    const current = formData.accompanimentIds || [];
    if (current.includes(userId)) {
      setFormData({ ...formData, accompanimentIds: current.filter(id => id !== userId) });
    } else {
      setFormData({ ...formData, accompanimentIds: [...current, userId] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 基本驗證
    if (formData.startTime! >= formData.endTime!) {
      setError("結束時間必須晚於開始時間。");
      return;
    }

    if (!formData.projectName) {
      setError("請選擇計畫名稱。");
      return;
    }

    // 衝突檢查 (僅在有選車時才檢查衝突)
    if (formData.vehicleId && formData.vehicleId !== 'none') {
      const collisionMsg = checkCollision(formData, schedules);
      if (collisionMsg) {
        setError(collisionMsg);
        return;
      }
    }

    const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId);
    
    // 組裝最終資料
    const finalData: Schedule = {
      id: initialData?.id || 's' + Date.now(),
      userId: currentUser.id, // 固定為目前登入者
      userName: currentUser.name,
      date: formData.date!,
      startTime: formData.startTime!,
      endTime: formData.endTime!,
      purpose: formData.purpose!,
      category: (formData.category as ScheduleCategory) || '其他',
      projectName: formData.projectName!,
      accompanimentIds: formData.accompanimentIds || [],
      vehicleId: formData.vehicleId === 'none' ? null : formData.vehicleId!,
      vehicleName: selectedVehicle ? `${selectedVehicle.name} (${selectedVehicle.plateNumber})` : undefined
    };

    onSave(finalData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* 標題列 */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">
            {initialData ? '修改外差行程' : '新增外差行程'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* 錯誤訊息提示區 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-start space-x-2">
              <i className="fas fa-exclamation-triangle mt-0.5"></i>
              <span>{error}</span>
            </div>
          )}

          {/* 第一列：雙欄配置 - 同仁姓名 (唯讀) 與 類別 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">同仁姓名</label>
              <input 
                type="text"
                value={currentUser.name}
                disabled
                className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-600 outline-none cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">類別</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as ScheduleCategory})}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="會議">會議</option>
                <option value="外勤">外勤</option>
                <option value="休假">休假</option>
                <option value="其他">其他</option>
              </select>
            </div>
          </div>

          {/* 第二列：計畫名稱 (單欄) */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">計畫名稱</label>
            <select 
              value={formData.projectName}
              onChange={e => setFormData({...formData, projectName: e.target.value})}
              className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              required
            >
              <option value="">請選擇計畫名稱...</option>
              {projects.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* 第三列：日期選擇器 (單欄) */}
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

          {/* 第四列：時間選擇器 (雙欄並列) */}
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

          {/* 第五列：預約車輛 (單欄) */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">預約車輛</label>
            <select 
              value={formData.vehicleId || 'none'}
              onChange={e => setFormData({...formData, vehicleId: e.target.value})}
              className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
              <option value="none">不須用車 / 自行前往</option>
              {vehicles.map(v => {
                const isMaintenance = v.status === 'maintenance';
                const isBooked = schedules.some(s => 
                  s.id !== initialData?.id && 
                  s.date === formData.date &&
                  s.vehicleId === v.id &&
                  (formData.startTime! < s.endTime && formData.endTime! > s.startTime)
                );
                const isDisabled = isMaintenance || isBooked;

                return (
                  <option key={v.id} value={v.id} disabled={isDisabled}>
                    {v.name} ({v.plateNumber}) 
                    {isMaintenance ? ' [維修中]' : isBooked ? ' [已被預約]' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* 第六列：同行人員 (多選標籤) */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">同行人員 (選填，可複選)</label>
            <div className="flex flex-wrap gap-2 p-2.5 border border-slate-200 rounded-xl min-h-[45px] bg-white">
              {users.filter(u => u.id !== currentUser.id).map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => toggleAccompaniment(u.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    formData.accompanimentIds?.includes(u.id)
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {u.name}
                </button>
              ))}
              {users.length <= 1 && <span className="text-slate-400 text-[11px] italic">目前無其他人員可選擇</span>}
            </div>
          </div>

          {/* 第七列：事由/目的地 (單欄) */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">事由/目的地</label>
            <textarea 
              rows={2}
              required
              placeholder="請輸入詳細事由與具體地點"
              value={formData.purpose}
              onChange={e => setFormData({...formData, purpose: e.target.value})}
              className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            ></textarea>
          </div>

          {/* 按鈕區 */}
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
