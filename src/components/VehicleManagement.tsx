import React, { useState } from 'react';
import { Vehicle } from '../types';

interface Props {
  vehicles: Vehicle[];
  onSave: (v: Vehicle) => void;
  onDelete: (id: string) => void;
}

const VehicleManagement: React.FC<Props> = ({ vehicles, onSave, onDelete }) => {
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    name: '', plateNumber: '', type: '', status: 'available', currentMileage: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newVehicle: Vehicle = {
      ...formData,
      id: formData.id || 'v' + Date.now(),
    } as Vehicle;
    onSave(newVehicle);
    setFormData({ name: '', plateNumber: '', type: '', status: 'available', currentMileage: 0 });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-xl font-bold mb-6 text-slate-800">車輛管理</h3>
      
      <form onSubmit={handleSubmit} className="mb-8 p-4 bg-slate-50 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">車輛名稱 (例: Toyota)</label>
          <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-2 rounded-lg text-sm" required />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">車牌號碼</label>
          <input value={formData.plateNumber} onChange={e => setFormData({...formData, plateNumber: e.target.value})} className="w-full border p-2 rounded-lg text-sm" required />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">車輛狀態</label>
          <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full border p-2 rounded-lg text-sm">
            <option value="available">可預約</option>
            <option value="maintenance">維修中</option>
          </select>
        </div>
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm">儲存車輛</button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-slate-400">
              <th className="py-2">車名/型號</th>
              <th>車牌</th>
              <th>目前里程</th>
              <th>狀態</th>
              <th className="text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map(v => (
              <tr key={v.id} className="border-b hover:bg-slate-50">
                <td className="py-3 font-medium">{v.name}</td>
                <td>{v.plateNumber}</td>
                <td>{v.currentMileage || 0} km</td>
                <td>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${v.status === 'available' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {v.status === 'available' ? '可預約' : '維修中'}
                  </span>
                </td>
                <td className="text-right">
                  <button onClick={() => onDelete(v.id)} className="text-slate-300 hover:text-red-500"><i className="fas fa-trash-alt"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VehicleManagement;
