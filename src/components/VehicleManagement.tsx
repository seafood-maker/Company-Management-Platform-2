import React, { useState } from 'react';
import { Vehicle, Schedule, User } from '../types';
import { storage } from '../services/storage';

interface Props {
  vehicles: Vehicle[];
  schedules: Schedule[]; // 必須傳入行程資料
  users: User[];         // 為了顯示同行人員姓名
  onSave: (v: Vehicle) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

const VehicleManagement: React.FC<Props> = ({ vehicles, schedules, users, onSave, onDelete, onRefresh }) => {
  const [formData, setFormData] = useState<Partial<Vehicle>>({ 
    name: '', plateNumber: '', type: '', status: 'available', totalMileage: 0 
  });
  const [selectedVehId, setSelectedVehId] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<Schedule | null>(null);

  // 1. 提交車輛基本資料 (新增/修改)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: formData.id || 'v' + Date.now() } as Vehicle);
    setFormData({ name: '', plateNumber: '', type: '', status: 'available', totalMileage: 0 });
  };

  // 2. 統計邏輯：計算加油紀錄
  const getGasStats = (vId: string) => {
    const history = schedules
      .filter(s => String(s.vehicleId) === String(vId) && s.mileageCompleted)
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
    
    const gasRecords = history.filter(h => h.isRefueled);
    
    if (gasRecords.length < 2) return "⛽ 加油數據不足 (需兩次紀錄)";
    
    const lastIdx = gasRecords.length - 1;
    const prevIdx = gasRecords.length - 2;
    const lastInterval = (gasRecords[lastIdx].endKm || 0) - (gasRecords[prevIdx].endKm || 0);
    
    const totalDistCovered = (gasRecords[lastIdx].endKm || 0) - (gasRecords[0].endKm || 0);
    const avg = Math.round(totalDistCovered / (gasRecords.length - 1));

    return `平均每 ${avg}km 加油 | 距上次加油行駛了 ${lastInterval}km`;
  };

  // 3. 輔助：解析同行人員姓名標籤
  const getCompanionNames = (ids?: string[]) => {
    if (!ids || ids.length === 0) return <span className="text-slate-300">-</span>;
    const names = ids.map(id => users.find(u => u.id === id)?.name).filter(Boolean);
    return (
      <div className="flex flex-wrap gap-1">
        {names.map((name, i) => (
          <span key={i} className="bg-pink-50 text-pink-600 px-1.5 py-0.5 rounded text-[10px] font-bold border border-pink-100">
            {name}
          </span>
        ))}
      </div>
    );
  };

  // 4. 儲存後台修正的出勤紀錄
  const handleSaveHistoryRecord = async () => {
    if (!editingRecord) return;
    try {
      await storage.saveSchedule(editingRecord);
      alert("歷史紀錄已修正！總行駛里程數已同步更新。");
      setEditingRecord(null);
      onRefresh(); 
    } catch (e) {
      alert("修正失敗");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6 animate-in fade-in duration-500">
      <h3 className="text-xl font-bold mb-6 text-black flex items-center">
        <i className="fas fa-truck mr-2 text-indigo-500"></i>
        車輛管理
      </h3>
      
      {/* 編輯表單 (手機版自動排列) */}
      <form onSubmit={handleSubmit} className="mb-8 p-4 md:p-5 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
            <i className="fas fa-car mr-1 text-blue-500"></i> 車名/型號
          </label>
          <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white" required />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
            <i className="fas fa-id-card mr-1 text-emerald-500"></i> 車牌號碼
          </label>
          <input value={formData.plateNumber} onChange={e => setFormData({...formData, plateNumber: e.target.value})} className="w-full border p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white" required />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
            <i className="fas fa-toggle-on mr-1 text-orange-500"></i> 狀態
          </label>
          <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
            <option value="available">可預約 (Available)</option>
            <option value="maintenance">維修中 (Maintenance)</option>
          </select>
        </div>
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 transition active:scale-95">
          儲存車輛資料
        </button>
      </form>

      {/* 車輛列表 (增加橫向捲軸 div) */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <table className="w-full text-left text-sm min-w-[650px]">
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
            {vehicles.map(v => {
              const carHistory = schedules.filter(s => String(s.vehicleId) === String(v.id) && s.mileageCompleted);
              const isOpen = selectedVehId === v.id;

              return (
                <React.Fragment key={v.id}>
                  {/* 主列 */}
                  <tr 
                    className={`border-b hover:bg-slate-50 cursor-pointer transition-all ${isOpen ? 'bg-indigo-50/50' : ''}`}
                    onClick={() => setSelectedVehId(isOpen ? null : v.id)}
                  >
                    <td className="py-4 px-2 font-bold text-slate-700">
                      <i className={`fas fa-caret-${isOpen ? 'down' : 'right'} mr-2 text-indigo-500 w-4 transition-transform`}></i>
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
                      <button onClick={() => setFormData(v)} className="text-indigo-400 hover:text-indigo-600 p-2"><i className="fas fa-edit"></i></button>
                      <button onClick={() => onDelete(v.id)} className="text-slate-300 hover:text-red-500 p-2"><i className="fas fa-trash-alt"></i></button>
                    </td>
                  </tr>

                  {/* 下拉詳情 */}
                  {isOpen && (
                    <tr>
                      <td colSpan={5} className="p-0 border-b border-indigo-100">
                        <div className="bg-slate-50 p-2 md:p-5 animate-in slide-in-from-top-2 duration-300">
                          <div className="bg-white rounded-xl border border-indigo-100 p-4 md:p-5 shadow-sm">
                            
                            {/* 詳情標題與統計 */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                              <h4 className="font-bold text-black flex items-center">
                                <i className="fas fa-history mr-2 text-indigo-500"></i> 出勤紀錄與統計數據
                              </h4>
                              <div className="text-[11px] md:text-xs font-bold text-amber-700 bg-amber-50 border border-amber-100 px-4 py-2 rounded-lg">
                                <i className="fas fa-gas-pump mr-2"></i> {getGasStats(v.id)}
                              </div>
                            </div>
                            
                            {/* 歷史清單表格 (內部捲軸) */}
                            <div className="overflow-x-auto rounded-lg border border-slate-100">
                              <table className="w-full text-[11px] md:text-xs text-left min-w-[700px]">
                                <thead className="bg-slate-100 text-slate-500 font-bold uppercase">
                                  <tr>
                                    <th className="p-3">日期</th>
                                    <th>人員</th>
                                    <th>同行人員</th>
                                    <th>出發/結束</th>
                                    <th>單次里程</th>
                                    <th className="text-center">加油</th>
                                    <th className="text-center">洗車</th>
                                    <th className="text-right p-3">操作</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                  {carHistory.sort((a,b) => b.date.localeCompare(a.date)).map(h => (
                                    <tr key={h.id} className="hover:bg-slate-50">
                                      <td className="p-3 font-medium text-slate-600">{h.date}</td>
                                      <td className="font-bold text-slate-700">{h.userName}</td>
                                      <td>{getCompanionNames(h.accompanimentIds)}</td>
                                      <td className="font-mono">
                                        <span className="text-blue-500">{h.startKm}</span> → <span className="text-red-500">{h.endKm}</span>
                                      </td>
                                      <td className="font-bold text-indigo-600">{h.tripMileage || 0} km</td>
                                      <td className="text-center">{h.isRefueled ? <i className="fas fa-gas-pump text-orange-500"></i> : '-'}</td>
                                      <td className="text-center">{h.isWashed ? <i className="fas fa-soap text-sky-500"></i> : '-'}</td>
                                      <td className="text-right p-3">
                                        <button onClick={() => setEditingRecord(h)} className="text-slate-300 hover:text-indigo-600 transition"><i className="fas fa-pen text-[10px]"></i></button>
                                      </td>
                                    </tr>
                                  ))}
                                  {carHistory.length === 0 && (
                                    <tr>
                                      <td colSpan={8} className="p-10 text-center text-slate-400 italic">目前尚無里程填報紀錄</td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 修正歷史里程彈窗 (Modal) */}
      {editingRecord && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in duration-200">
            <h4 className="text-lg font-bold mb-5 text-black flex items-center">
              <i className="fas fa-edit mr-2 text-indigo-500"></i> 修正歷史出勤紀錄
            </h4>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    <i className="fas fa-play text-blue-500 mr-1"></i> 出發里程
                  </label>
                  <input type="number" value={editingRecord.startKm || 0} onChange={e => setEditingRecord({...editingRecord, startKm: parseInt(e.target.value) || 0})} className="w-full border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    <i className="fas fa-stop text-red-500 mr-1"></i> 結束里程
                  </label>
                  <input type="number" value={editingRecord.endKm || 0} onChange={e => {
                    const end = parseInt(e.target.value) || 0;
                    setEditingRecord({...editingRecord, endKm: end, tripMileage: end - (editingRecord.startKm || 0)});
                  }} className="w-full border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="flex space-x-6 py-2 px-1 border-y border-slate-50">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 text-orange-500 rounded" checked={editingRecord.isRefueled || false} onChange={e => setEditingRecord({...editingRecord, isRefueled: e.target.checked})} />
                  <span className="text-xs font-bold text-slate-600 group-hover:text-orange-500"><i className="fas fa-gas-pump mr-1"></i> 加油</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 text-sky-500 rounded" checked={editingRecord.isWashed || false} onChange={e => setEditingRecord({...editingRecord, isWashed: e.target.checked})} />
                  <span className="text-xs font-bold text-slate-600 group-hover:text-sky-500"><i className="fas fa-soap mr-1"></i> 洗車</span>
                </label>
              </div>
              <div className="flex space-x-3 pt-2">
                <button onClick={() => setEditingRecord(null)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-500">取消</button>
                <button onClick={handleSaveHistoryRecord} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100">儲存修正</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleManagement;
