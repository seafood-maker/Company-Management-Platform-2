import React, { useState } from 'react';
import { Vehicle, Schedule } from '../types';
import { storage } from '../services/storage';

interface Props {
  vehicles: Vehicle[];
  schedules: Schedule[]; // 這是關鍵：必須有行程資料才能統計
  onSave: (v: Vehicle) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

const VehicleManagement: React.FC<Props> = ({ vehicles, schedules, onSave, onDelete, onRefresh }) => {
  const [formData, setFormData] = useState<Partial<Vehicle>>({ name: '', plateNumber: '', type: '', status: 'available', totalMileage: 0 });
  const [selectedVehId, setSelectedVehId] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<Schedule | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: formData.id || 'v' + Date.now() } as Vehicle);
    setFormData({ name: '', plateNumber: '', type: '', status: 'available', totalMileage: 0 });
  };

  // 統計邏輯：計算加油紀錄
  const getGasStats = (vId: string) => {
    const history = schedules
      .filter(s => s.vehicleId === vId && s.mileageCompleted)
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
    
    const gasRecords = history.filter(h => h.isRefueled);
    
    if (gasRecords.length < 2) return "加油數據不足 (至少需兩次加油紀錄)";
    
    // 計算最後兩次加油之間的里程
    const lastIdx = gasRecords.length - 1;
    const prevIdx = gasRecords.length - 2;
    const lastInterval = gasRecords[lastIdx].endKm! - gasRecords[prevIdx].endKm!;
    
    // 計算所有加油紀錄的平均間距
    const totalDist = gasRecords[lastIdx].endKm! - gasRecords[0].endKm!;
    const avg = Math.round(totalDist / (gasRecords.length - 1));

    return `平均每 ${avg}km 加油一次 | 距上次加油行駛了 ${lastInterval}km`;
  };

  // 處理紀錄編輯儲存
  const handleSaveHistoryRecord = async () => {
    if (!editingRecord) return;
    try {
      await storage.saveSchedule(editingRecord);
      alert("歷史紀錄已修正");
      setEditingRecord(null);
      onRefresh();
    } catch (e) {
      alert("修正失敗");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-in fade-in">
      <h3 className="text-xl font-bold mb-6 text-black flex items-center">
        <i className="fas fa-truck mr-2 text-indigo-500"></i>車輛管理
      </h3>
      
      {/* 1. 車輛基本資訊編輯/新增表單 */}
      <form onSubmit={handleSubmit} className="mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">車名/型號</label>
          <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">車牌號碼</label>
          <input value={formData.plateNumber} onChange={e => setFormData({...formData, plateNumber: e.target.value})} className="w-full border p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">狀態</label>
          <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full border p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
            <option value="available">可預約 (Available)</option>
            <option value="maintenance">維修中 (Maintenance)</option>
          </select>
        </div>
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 transition">
          儲存車輛
        </button>
      </form>

      {/* 2. 車輛列表 */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-slate-400 border-b">
            <tr>
              <th className="py-3 px-2">車名/型號</th>
              <th>車牌</th>
              <th>總行駛里程數</th>
              <th>狀態</th>
              <th className="text-right px-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map(v => (
              <React.Fragment key={v.id}>
                {/* 車輛主列 (點擊展開) */}
                <tr 
                  className={`border-b hover:bg-slate-50 cursor-pointer transition-colors ${selectedVehId === v.id ? 'bg-indigo-50/50' : ''}`}
                  onClick={() => setSelectedVehId(selectedVehId === v.id ? null : v.id)}
                >
                  <td className="py-4 px-2 font-bold text-slate-700">
                    <i className={`fas fa-chevron-${selectedVehId === v.id ? 'down' : 'right'} mr-2 text-[10px] text-slate-300`}></i>
                    {v.name}
                  </td>
                  <td className="font-mono text-slate-500">{v.plateNumber}</td>
                  <td className="font-bold text-slate-900">{v.totalMileage || 0} km</td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${v.status === 'available' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {v.status === 'available' ? '可預約' : '維修中'}
                    </span>
                  </td>
                  <td className="text-right px-2" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setFormData(v)} className="text-indigo-400 hover:text-indigo-600 p-2" title="編輯基本資料"><i className="fas fa-edit"></i></button>
                    <button onClick={() => onDelete(v.id)} className="text-slate-300 hover:text-red-500 p-2" title="刪除車輛"><i className="fas fa-trash-alt"></i></button>
                  </td>
                </tr>

                {/* 下拉詳情內容 */}
                {selectedVehId === v.id && (
                  <tr>
                    <td colSpan={5} className="p-4 bg-slate-50 border-b border-indigo-100 animate-in slide-in-from-top-2 duration-300">
                      <div className="bg-white rounded-xl border border-indigo-100 p-5 shadow-sm">
                        
                        {/* 統計資料列 */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                          <h4 className="font-bold text-indigo-600 flex items-center">
                            <i className="fas fa-history mr-2"></i> 出勤紀錄與統計
                          </h4>
                          <div className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-100 px-4 py-2 rounded-lg">
                            <i className="fas fa-gas-pump mr-2"></i> {getGasStats(v.id)}
                          </div>
                        </div>
                        
                        {/* 出勤清單表格 */}
                        <div className="overflow-hidden rounded-lg border border-slate-100">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-slate-100 text-slate-500 uppercase font-bold">
                              <tr>
                                <th className="p-3">日期</th>
                                <th>人員</th>
                                <th>出發里程</th>
                                <th>結束里程</th>
                                <th>單次行駛</th>
                                <th className="text-center">加油</th>
                                <th className="text-center">洗車</th>
                                <th className="text-right p-3">操作</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {schedules
                                .filter(s => s.vehicleId === v.id && s.mileageCompleted)
                                .sort((a,b) => b.date.localeCompare(a.date))
                                .map(h => (
                                <tr key={h.id} className="hover:bg-slate-50/80">
                                  <td className="p-3 font-medium">{h.date}</td>
                                  <td>{h.userName}</td>
                                  <td>{h.startKm} km</td>
                                  <td>{h.endKm} km</td>
                                  <td className="font-bold text-indigo-600">{h.tripMileage || 0} km</td>
                                  <td className="text-center">
                                    {h.isRefueled ? <i className="fas fa-gas-pump text-orange-500"></i> : <span className="text-slate-200">-</span>}
                                  </td>
                                  <td className="text-center">
                                    {h.isWashed ? <i className="fas fa-soap text-sky-500"></i> : <span className="text-slate-200">-</span>}
                                  </td>
                                  <td className="text-right p-3">
                                    <button 
                                      onClick={() => setEditingRecord(h)}
                                      className="text-slate-400 hover:text-indigo-600 transition"
                                    >
                                      <i className="fas fa-pen text-[10px]"></i>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                              {schedules.filter(s => s.vehicleId === v.id && s.mileageCompleted).length === 0 && (
                                <tr>
                                  <td colSpan={8} className="p-10 text-center text-slate-400 italic">該車輛尚無出勤里程紀錄</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. 彈出式歷史紀錄編輯視窗 (後台編輯功能) */}
      {editingRecord && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6">
            <h4 className="text-lg font-bold mb-4 flex items-center">
              <i className="fas fa-edit mr-2 text-indigo-500"></i> 修正歷史里程紀錄
            </h4>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">出發里程</label>
                  <input 
                    type="number" 
                    value={editingRecord.startKm || 0} 
                    onChange={e => setEditingRecord({...editingRecord, startKm: parseInt(e.target.value) || 0})}
                    className="w-full border rounded-xl p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">結束里程</label>
                  <input 
                    type="number" 
                    value={editingRecord.endKm || 0} 
                    onChange={e => {
                      const end = parseInt(e.target.value) || 0;
                      setEditingRecord({...editingRecord, endKm: end, tripMileage: end - (editingRecord.startKm || 0)});
                    }}
                    className="w-full border rounded-xl p-2 text-sm"
                  />
                </div>
              </div>
              <div className="flex space-x-4 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={editingRecord.isRefueled} onChange={e => setEditingRecord({...editingRecord, isRefueled: e.target.checked})} />
                  <span className="text-xs font-bold">加油紀錄</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={editingRecord.isWashed} onChange={e => setEditingRecord({...editingRecord, isWashed: e.target.checked})} />
                  <span className="text-xs font-bold">洗車紀錄</span>
                </label>
              </div>
              <div className="flex space-x-3 pt-4">
                <button onClick={() => setEditingRecord(null)} className="flex-1 py-2 border rounded-xl text-sm font-bold">取消</button>
                <button onClick={handleSaveHistoryRecord} className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100">儲存修正</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleManagement;
