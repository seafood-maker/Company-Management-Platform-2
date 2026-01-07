
import React, { useState, useEffect } from 'react';
import { Vehicle, Schedule, User, UserRole } from '../types';
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
  const [formData, setFormData] = useState<Partial<Schedule>>({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '11:00',
    destination: '',
    purpose: '',
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

    // Validation
    if (formData.startTime! >= formData.endTime!) {
      setError("結束時間必須晚於開始時間。");
      return;
    }

    // Collision Check
    const collisionMsg = checkCollision(formData, schedules);
    if (collisionMsg) {
      setError(collisionMsg);
      return;
    }

    const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId);
    
    const finalData: Schedule = {
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      userId: initialData?.userId || currentUser.id,
      userName: initialData?.userName || currentUser.name,
      date: formData.date!,
      startTime: formData.startTime!,
      endTime: formData.endTime!,
      destination: formData.destination!,
      purpose: formData.purpose!,
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-start space-x-3">
              <i className="fas fa-exclamation-triangle mt-0.5"></i>
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">日期</label>
              <input 
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">開始時間</label>
                <input 
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={e => setFormData({...formData, startTime: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">結束時間</label>
                <input 
                  type="time"
                  required
                  value={formData.endTime}
                  onChange={e => setFormData({...formData, endTime: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">目的地</label>
              <input 
                type="text"
                required
                placeholder="例如：內湖辦公室、客戶處"
                value={formData.destination}
                onChange={e => setFormData({...formData, destination: e.target.value})}
                className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">事由</label>
              <textarea 
                rows={2}
                placeholder="請描述出差目的"
                value={formData.purpose}
                onChange={e => setFormData({...formData, purpose: e.target.value})}
                className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">預約車輛</label>
              <select 
                value={formData.vehicleId || 'none'}
                onChange={e => setFormData({...formData, vehicleId: e.target.value})}
                className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              >
                <option value="none">不需用車 / 自行前往</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id} disabled={v.status === 'maintenance'}>
                    {v.name} ({v.plateNumber}) {v.status === 'maintenance' ? '- 維修中' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
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
