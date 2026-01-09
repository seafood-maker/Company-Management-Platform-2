import React, { useState, useEffect } from 'react';
import { Vehicle, Schedule, User, Project, ScheduleCategory } from '../types';
import { checkCollision } from '../services/storage';

interface ScheduleFormProps {
  onClose: () => void;
  onSave: (schedule: Schedule) => void;
  vehicles: Vehicle[];
  schedules: Schedule[];
  users: User[];
  projects: Project[];
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
    purpose: '',
    category: '外勤',
    projectName: '',
    accompanimentIds: [],
    vehicleId: 'none' 
  });
  
  const [error, setError] = useState<string | null>(null);

  // 2. 載入資料與防崩潰保護
  useEffect(() => {
    if (initialData) {
      // 編輯模式：確保資料完整性
      setFormData({
        ...initialData,
        vehicleId: initialData.vehicleId || 'none',
        accompanimentIds: initialData.accompanimentIds || []
      });
    } else {
      // 新增模式：安全地帶入第一個計畫名稱
      if (projects && projects.length > 0) {
        setFormData(prev => ({ ...prev, projectName: projects[0].name }));
      } else {
        // 如果還沒有任何計畫，先設為空字串，防止 projects[0] 導致當機
        setFormData(prev => ({ ...prev, projectName: '' }));
      }
    }
  }, [initialData, projects]);

  // 同行人員：下拉選單選中邏輯
  const handleSelectAccompaniment = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    if (!userId) return;
    
    const currentIds = formData.accompanimentIds || [];
    if (!currentIds.includes(userId)) {
      setFormData({ ...formData, accompanimentIds: [...currentIds, userId] });
    }
    e.target.value = ""; // 選完後重置下拉選單
  };

  // 同行人員：移除標籤
  const removeAccompaniment = (userId: string) => {
    const currentIds = formData.accompanimentIds || [];
    setFormData({ ...formData, accompanimentIds: currentIds.filter(id => id !== userId) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 基本驗證
    if (formData.startTime! >= formData.endTime!) {
      setError("結束時間必須晚於開始時間。");
      return;
    }

    if (!formData.projectName || formData.projectName === "") {
      setError("請選擇計畫名稱。若無選項，請先至系統管理新增計畫。");
      return;
    }

    // 衝突檢查 (只有在真正有選車時才檢查)
    if (formData.vehicleId && formData.vehicleId !== 'none') {
      const collisionMsg = checkCollision(formData, schedules);
      if (collisionMsg) {
        setError(collisionMsg);
        return;
      }
    }

    const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId);
    
    // 組裝最終資料 (關鍵：將 'none' 轉回 null 以利資料庫儲存)
    const finalData: Schedule = {
      id: initialData?.id || 's' + Date.now(),
      userId: initialData?.userId || currentUser.id, 
      userName: initialData?.userName || currentUser.name,
      date: formData.date!,
      startTime: formData.startTime!,
      endTime: formData.endTime!,
      purpose: formData.purpose || "未填寫事由",
      category: (formData.category as ScheduleCategory) || '其他',
      projectName: formData.projectName!,
      accompanimentIds: formData.accompanimentIds || [],
      vehicleId: (formData.vehicleId === 'none' || !formData.vehicleId) ? null : formData.vehicleId,
      vehicleName: selectedVehicle ? `${selectedVehicle.name} (${selectedVehicle.plateNumber})` : ""
    };

    onSave(finalData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      {/* 視窗調整為窄版 max-w-lg (約 512px) */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* 標題列：字體純黑 */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-black">
            {initialData ? '修改外差行程' : '新增外差行程'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-start space-x-2">
              <i className="fas fa-exclamation-triangle mt-0.5"></i>
              <span>{error}</span>
            </div>
          )}

          {/* 第一列：雙欄 - 姓名與類別 (彩色圖示) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                <i className="fas fa-user-circle mr-1 text-blue-500"></i> 同仁姓名
              </label>
              <input 
                type="text" value={currentUser.name} disabled
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-500 outline-none cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                <i className="fas fa-tags mr-1 text-orange-500"></i> 類別
              </label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as any})}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="會議">會議</option>
                <option value="外勤">外勤</option>
                <option value="休假">休假</option>
                <option value="其他">其他</option>
              </select>
            </div>
          </div>

          {/* 第二列：計畫名稱 (彩色圖示) */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
              <i className="fas fa-folder-open mr-1 text-emerald-500"></i> 計畫名稱
            </label>
            <select 
              value={formData.projectName}
              onChange={e => setFormData({...formData, projectName: e.target.value})}
              className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              required
            >
              <option value="" disabled>請選擇計畫名稱...</option>
              {projects.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
              {projects.length === 0 && <option value="">(目前無計畫，請先新增)</option>}
            </select>
          </div>

          {/* 第三列：日期 (彩色圖示) */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
              <i className="fas fa-calendar-alt mr-1 text-red-500"></i> 出差日期
            </label>
            <input 
              type="date" required value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
              className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* 第四列：時間 (彩色圖示) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                <i className="fas fa-clock mr-1 text-violet-500"></i> 開始時間
              </label>
              <input 
                type="time" required value={formData.startTime}
                onChange={e => setFormData({...formData, startTime: e.target.value})}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                <i className="fas fa-hourglass-end mr-1 text-violet-500"></i> 結束時間
              </label>
              <input 
                type="time" required value={formData.endTime}
                onChange={e => setFormData({...formData, endTime: e.target.value})}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* 第五列：預約車輛 (彩色圖示 + 邏輯修正) */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
              <i className="fas fa-car mr-1 text-indigo-500"></i> 預約車輛
            </label>
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

          {/* 第六列：同行人員 (彩色圖示 + 下拉選單) */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
              <i className="fas fa-user-friends mr-1 text-pink-500"></i> 同行人員 (選填)
            </label>
            <select 
              onChange={handleSelectAccompaniment}
              defaultValue=""
              className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white mb-2"
            >
              <option value="" disabled>點擊選擇同仁...</option>
              {users.filter(u => u.id !== currentUser.id).map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            
            {/* 已選擇的人員標籤區 */}
            <div className="flex flex-wrap gap-2 min-h-[32px]">
              {formData.accompanimentIds?.map(id => {
                const user = users.find(u => u.id === id);
                return (
                  <span key={id} className="inline-flex items-center bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100 animate-in zoom-in duration-300">
                    {user?.name}
                    <button type="button" onClick={() => removeAccompaniment(id)} className="ml-1.5 hover:text-red-500 transition">
                      <i className="fas fa-times-circle"></i>
                    </button>
                  </span>
                );
              })}
              {(!formData.accompanimentIds || formData.accompanimentIds.length === 0) && (
                <span className="text-slate-300 text-[11px] italic mt-1">尚未選擇同行人員</span>
              )}
            </div>
          </div>

          {/* 第七列：事由 (彩色圖示) */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
              <i className="fas fa-pen-fancy mr-1 text-sky-500"></i> 事由與目的地
            </label>
            <textarea 
              rows={2}
              required
              placeholder="請輸入出差事由與目的地點"
              value={formData.purpose}
              onChange={e => setFormData({...formData, purpose: e.target.value})}
              className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            ></textarea>
          </div>

          {/* 按鈕區 */}
          <div className="pt-2 flex space-x-3">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition text-sm"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 active:scale-95 text-sm"
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
