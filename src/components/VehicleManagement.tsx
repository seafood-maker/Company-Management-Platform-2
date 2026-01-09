import React, { useState } from 'react';
import { Vehicle, Schedule } from '../types';

interface Props {
  vehicles: Vehicle[];
  schedules: Schedule[];
  onSave: (v: Vehicle) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

const VehicleManagement: React.FC<Props> = ({ vehicles, schedules, onSave, onDelete, onRefresh }) => {
  const [formData, setFormData] = useState<Partial<Vehicle>>({ name: '', plateNumber: '', type: '', status: 'available', totalMileage: 0 });
  const [selectedVehId, setSelectedVehId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: formData.id || 'v' + Date.now() } as Vehicle);
    setFormData({ name: '', plateNumber: '', type: '', status: 'available', totalMileage: 0 });
  };

  // 統計邏輯：加油計算
  const getGasStats = (vId: string) => {
    const history = schedules.filter(s => s.vehicleId === vId && s.mileageCompleted).sort((a, b) => a.date.localeCompare(b.date));
    const gasRecords = history.filter(h => h.isRefueled);
    
    if (gasRecords.length < 2) return "資料不足 (需兩次加油紀錄以上)";
    
    const totalDist = gasRecords[gasRecords.length - 1].endKm! - gasRecords[0].endKm!;
    const avg = Math.round(totalDist / (gasRecords.length - 1));
    const lastDist = gasRecords.length >= 2 ? (gasRecords[gasRecords.length - 1].endKm! - gasRecords[gasRecords.length - 2].endKm!) : 0;

    return `平均每 ${avg}km 加油一次 | 距上次加油已行駛 ${lastDist}km`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-in fade-in">
      <h3 className="text-xl font-bold mb-6 text-black flex items-center">
        <i className="fas fa-truck mr-2 text-indigo-500"></i>車輛管理
      </h3>
      
      {/* 編輯/新增區 */}
      <form onSubmit={handleSubmit} className="mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">車名/型號</label>
          <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">車牌</label>
          <input value={formData.plateNumber} onChange={e => setFormData({...formData, plateNumber: e.target.value})} className="w-full border p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">狀態</label>
          <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full border p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
            <option value="available">可預約</option>
            <option value="maintenance">維修中</option>
          </select>
        </div>
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700">儲存車輛</button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-slate-400 border-b">
            <tr>
              <th className="py-3">車名/型號</th>
              <th>車牌</th>
              <th>總行駛里程數</th>
              <th>狀態</th>
              <th className="text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map(v => (
              <React.Fragment key={v.id}>
                <tr className={`border-b hover:bg-slate-50 cursor-pointer ${selectedVehId === v.id ? 'bg-indigo-50/30' : ''}`} onClick={() => setSelectedVehId(selectedVehId === v.id ? null : v.id)}>
                  <td className="py-4 font-bold text-slate-700">{v.name}</td>
                  <td className="font-mono">{v.plateNumber}</td>
                  <td className="font-bold">{v.totalMileage || 0} km</td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${v.status === 'available' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {v.status === 'available' ? '可預約' : '維修中'}
                    </span>
                  </td>
                  <td className="text-right space-x-2" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setFormData(v)} className="text-indigo-400 hover:text-indigo-600 p-2"><i className="fas fa-edit"></i></button>
                    <button onClick={() => onDelete(v.id)} className="text-slate-300 hover:text-red-500 p-2"><i className="fas fa-trash-alt"></i></button>
                  </td>
                </tr>

                {/* 展開詳情區域 */}
                {selectedVehId === v.id && (
                  <tr>
                    <td colSpan={5} className="p-4 bg-slate-50">
                      <div className="bg-white rounded-xl border p-4 shadow-inner">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-indigo-600"><i className="fas fa-history mr-2"></i>出勤紀錄清單</h4>
                          <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                            <i className="fas fa-gas-pump mr-1"></i>加油統計：{getGasStats(v.id)}
                          </div>
                        </div>
                        
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-100 text-slate-500">
                            <tr>
                              <th className="p-2">日期</th>
                              <th>人員</th>
                              <th>出發里程</th>
                              <th>結束里程</th>
                              <th>總里程</th>
                              <th>加油</th>
                              <th>洗車</th>
                            </tr>
                          </thead>
                          <tbody>
                            {schedules.filter(s => s.vehicleId === v.id && s.mileageCompleted).map(h => (
                              <tr key={h.id} className="border-b">
                                <td className="p-2">{h.date}</td>
                                <td>{h.userName}</td>
                                <td>{h.startKm}</td>
                                <td>{h.endKm}</td>
                                <td className="font-bold text-indigo-600">{h.tripMileage} km</td>
                                <td>{h.isRefueled ? <i className="fas fa-check text-green-500"></i> : '-'}</td>
                                <td>{h.isWashed ? <i className="fas fa-check text-blue-500"></i> : '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default VehicleManagement;
