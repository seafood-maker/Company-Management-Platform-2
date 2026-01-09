import React, { useState } from 'react';
import { Vehicle, Schedule, User } from '../types';
import { storage } from '../services/storage';

interface Props {
  vehicles: Vehicle[];
  schedules: Schedule[]; // 必須傳入
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

  // 1. 提交車輛基本資料
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: formData.id || 'v' + Date.now() } as Vehicle);
    setFormData({ name: '', plateNumber: '', type: '', status: 'available', totalMileage: 0 });
  };

  // 2. 統計邏輯：計算加油與洗車紀錄
  const getGasStats = (vId: string) => {
    const history = schedules
      .filter(s => String(s.vehicleId) === String(vId) && s.mileageCompleted)
      .sort((a, b) => a.date.localeCompare(b.date));
    
    const gasRecords = history.filter(h => h.isRefueled);
    
    if (gasRecords.length < 2) return "⛽ 加油數據不足 (至少需兩次紀錄)";
    
    const lastIdx = gasRecords.length - 1;
    const prevIdx = gasRecords.length - 2;
    // 間距里程 = 最後一次結束里程 - 倒數第二次結束里程
    const lastInterval = (gasRecords[lastIdx].endKm || 0) - (gasRecords[prevIdx].endKm || 0);
    
    // 平均里程 = (最後一次結束 - 第一次結束) / 次數
    const totalDist = (gasRecords[lastIdx].endKm || 0) - (gasRecords[0].endKm || 0);
    const avg = Math.round(totalDist / (gasRecords.length - 1));

    return `平均每 ${avg}km 加油 | 距上次加油已行駛 ${lastInterval}km`;
  };

  // 3. 輔助：解析同行人員姓名 (彩色小圖案版本)
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

  // 4. 儲存後台編輯的歷史紀錄
  const handleSaveHistoryRecord = async () => {
    if (!editingRecord) return;
    try {
      await storage.saveSchedule(editingRecord);
      alert("歷史紀錄已成功修正！");
      setEditingRecord(null);
      onRefresh();
    } catch (e) {
      alert("修正失敗");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-in fade-in duration-500">
      <h3 className="text-xl font-bold mb-6 text-black flex items-center">
        <i className="fas fa-truck mr-2 text-indigo-500"></i>
        車輛管理
      </h3>
      
      {/* 新增/編輯表單 */}
      <form onSubmit={handleSubmit} className="mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">
            <i className="fas fa-info-circle mr-1 text-blue-500"></i> 車名/型號
          </label>
          <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white" required />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">
            <i className="fas fa-id-card mr-1 text-emerald-500"></i> 車牌號碼
          </label>
          <input value={formData.plateNumber} onChange={e => setFormData({...formData, plateNumber: e.target.value})} className="w-full border p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white" required />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">
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

      {/* 車輛列表 */}
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
            {vehicles.map(v => {
              // 篩選該車輛的出勤紀錄 (關鍵：String 強制轉型)
              const carHistory = schedules.filter(s => String(s.vehicleId) === String(v.id) && s.mileageCompleted);
              const isOpen = selectedVehId === v.id;

              return (
                <React.Fragment key={v.id}>
                  {/* 車輛主列 */}
                  <tr 
                    className={`border-b hover:bg-slate-50 cursor-pointer transition-colors ${isOpen ? 'bg-indigo-50/50' : ''}`}
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
                      <button onClick={() => setFormData(v)} className="text-indigo-400 hover:text-indigo-600 p-2" title="編輯基本資料"><i className="fas fa-edit"></i></button>
                      <button onClick={() => onDelete(v.id)} className="text-slate-300 hover:text-red-500 p-2" title="刪除車輛"><i className="fas fa-trash-alt"></i></button>
                    </td>
                  </tr>

                  {/* 下拉詳情內容 (摺疊選單) */}
                  {isOpen && (
                    <tr>
                      <td colSpan={5} className="p-0 border-b border-indigo-100">
                        <div className="bg-slate-50 p-5 animate-in slide-in-from-top-2 duration-300">
                          <div className="bg-white rounded-xl border border-indigo-100 p-5 shadow-sm">
                            
                            {/* 統計與標題列 */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                              <h4 className="font-bold text-black flex items-center">
                                <i className="fas fa-chart-line mr-2 text-indigo-500"></i> 出勤統計與清單
                              </h4>
                              <div className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-100 px-4 py-2 rounded-lg">
                                <i className="fas fa-gas-pump mr-2"></i> {getGasStats(v.id)}
                              </div>
                            </div>
                            
                            {/* 歷史紀錄清單表格 */}
                            <div className="overflow-x-auto rounded-lg border border-slate-100">
                              <table className="w-full text-xs text-left">
                                <thead className="bg-slate-100 text-slate-500 font-bold uppercase">
                                  <tr>
                                    <th className="p-3">出勤日期</th>
                                    <th>人員</th>
                                    <th>同行人員</th>
                                    <th>出發 / 結束里程</th>
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
                                      <td className="font-mono text-slate-400">
                                        <span className="text-blue-500">{h.startKm}</span> → <span className="text-red-500">{h.endKm}</span>
                                      </td>
                                      <td className="font-bold text-indigo-600">{h.tripMileage || 0} km</td>
                                      <td className="text-center">
                                        {h.isRefueled ? <i className="fas fa-gas-pump text-orange-500" title="有加油"></i> : <span className="text-slate-200">-</span>}
                                      </td>
                                      <td className="text-center">
                                        {h.isWashed ? <i className="fas fa-soap text-sky-500" title="有洗車"></i> : <span className="text-slate-200">-</span>}
                                      </td>
                                      <td className="text-right p-3">
                                        <button 
                                          onClick={() => setEditingRecord(h)} 
                                          className="text-slate-300 hover:text-indigo-600 transition"
                                          title="編輯此筆里程紀錄"
                                        >
                                          <i className="fas fa-pen text-[10px]"></i>
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                  {carHistory.length === 0 && (
                                    <tr>
                                      <td colSpan={8} className="p-12 text-center text-slate-400 italic">
                                        <i className="fas fa-folder-open mb-2 block text-2xl"></i>
                                        此車目前無任何里程填報紀錄
                                      </td>
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

      {/* 3. 歷史紀錄編輯視窗 (修正後的窄版彩色圖案視窗) */}
      {editingRecord && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in duration-200">
            <h4 className="text-lg font-bold mb-5 flex items-center text-black">
              <i className="fas fa-edit mr-2 text-indigo-500"></i> 修正歷史里程紀錄
            </h4>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    <i className="fas fa-play text-blue-500 mr-1"></i> 出發里程
                  </label>
                  <input 
                    type="number" 
                    value={editingRecord.startKm || 0} 
                    onChange={e => setEditingRecord({...editingRecord, startKm: parseInt(e.target.value) || 0})}
                    className="w-full border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    <i className="fas fa-stop text-red-500 mr-1"></i> 結束里程
                  </label>
                  <input 
                    type="number" 
                    value={editingRecord.endKm || 0} 
                    onChange={e => {
                      const end = parseInt(e.target.value) || 0;
                      setEditingRecord({...editingRecord, endKm: end, tripMileage: end - (editingRecord.startKm || 0)});
                    }}
                    className="w-full border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  />
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
                <button onClick={() => setEditingRecord(null)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50">取消</button>
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
