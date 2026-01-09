import React, { useState, useMemo } from 'react';
import { Schedule, Vehicle, User, Project } from '../types';

interface StatsViewProps {
  schedules: Schedule[];
  vehicles: Vehicle[];
  users: User[];
  projects: Project[];
}

const StatsView: React.FC<StatsViewProps> = ({ schedules = [], vehicles = [], users = [], projects = [] }) => {
  // 1. 時間範圍狀態
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const [filterType, setFilterType] = useState<'month' | 'range'>('month');
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 2. 輔助函式：計算兩時間點的時數差 (加入防當機檢查)
  const calculateHours = (start?: string, end?: string) => {
    if (!start || !end) return 0;
    try {
      const [h1, m1] = start.split(':').map(Number);
      const [h2, m2] = end.split(':').map(Number);
      const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
      return diff > 0 ? diff / 60 : 0;
    } catch (e) {
      return 0;
    }
  };

  // 3. 過濾資料
  const filteredSchedules = useMemo(() => {
    return schedules.filter(s => {
      if (!s.date) return false;
      if (filterType === 'month') {
        return s.date.startsWith(selectedMonth);
      } else {
        return (!startDate || s.date >= startDate) && (!endDate || s.date <= endDate);
      }
    });
  }, [schedules, filterType, selectedMonth, startDate, endDate]);

  // --- 4. 數據統計邏輯 ---
  const summary = useMemo(() => {
    let totalKm = 0;
    let vehicleTrips = 0;
    let personnelCount = 0;

    filteredSchedules.forEach(s => {
      if (s.mileageCompleted) totalKm += (s.tripMileage || 0);
      if (s.vehicleId && s.vehicleId !== 'none') vehicleTrips += 1;
      
      // 只要不是休假，都算外勤人次
      if (s.category !== '休假') {
        personnelCount += 1; // 申請人本人
        if (s.accompanimentIds) personnelCount += s.accompanimentIds.length; // 同行人員
      }
    });

    return { totalKm, vehicleTrips, personnelCount };
  }, [filteredSchedules]);

  // 如果連 users 或 vehicles 都還沒載入，顯示載入中提示
  if (!users.length && !vehicles.length && schedules.length === 0) {
    return <div className="p-10 text-center text-slate-400">📊 正在串連雲端數據，請稍後...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-12">
      
      {/* --- 1. 時間篩選列 --- */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-black flex items-center">
          <i className="fas fa-search-chart mr-2 text-indigo-500"></i> 統計報表查詢範圍
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button onClick={() => setFilterType('month')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${filterType === 'month' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>按月分</button>
            <button onClick={() => setFilterType('range')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${filterType === 'range' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>自訂範圍</button>
          </div>
          {filterType === 'month' ? (
            <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="border rounded-xl p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
          ) : (
            <div className="flex items-center space-x-2">
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border rounded-xl p-2 text-sm" />
              <span className="text-slate-400">~</span>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border rounded-xl p-2 text-sm" />
            </div>
          )}
        </div>
      </div>

      {/* --- 2. 核心數據區 (彩色方框) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 border-2 border-blue-100 p-6 rounded-3xl shadow-sm relative overflow-hidden group">
          <i className="fas fa-road absolute -right-4 -bottom-4 text-blue-100 text-7xl rotate-12 transition-transform group-hover:scale-110"></i>
          <p className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-2">本月總里程</p>
          <p className="text-3xl font-black text-blue-900">{summary.totalKm.toLocaleString()} <span className="text-sm font-bold text-blue-500 ml-1">km</span></p>
        </div>
        <div className="bg-purple-50 border-2 border-purple-100 p-6 rounded-3xl shadow-sm relative overflow-hidden group">
          <i className="fas fa-car absolute -right-4 -bottom-4 text-purple-100 text-7xl rotate-12 transition-transform group-hover:scale-110"></i>
          <p className="text-purple-600 text-xs font-bold uppercase tracking-wider mb-2">車輛總趟數</p>
          <p className="text-3xl font-black text-purple-900">{summary.vehicleTrips} <span className="text-sm font-bold text-purple-500 ml-1">趟</span></p>
        </div>
        <div className="bg-orange-50 border-2 border-orange-100 p-6 rounded-3xl shadow-sm relative overflow-hidden group">
          <i className="fas fa-users absolute -right-4 -bottom-4 text-orange-100 text-7xl rotate-12 transition-transform group-hover:scale-110"></i>
          <p className="text-orange-600 text-xs font-bold uppercase tracking-wider mb-2">人員外勤人次</p>
          <p className="text-3xl font-black text-orange-900">{summary.personnelCount} <span className="text-sm font-bold text-orange-500 ml-1">人次</span></p>
        </div>
      </div>

      {/* --- 3. 第二部分：車輛行駛歷程紀錄 --- */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h4 className="font-bold text-black flex items-center">
            <i className="fas fa-truck-moving mr-2 text-blue-500"></i> 車輛行駛統計清單 🚛
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-slate-400 bg-slate-50/30 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-4">車名 / 車牌</th>
                <th>行駛天數</th>
                <th>總趟數</th>
                <th>累積時數</th>
                <th className="p-4">累積里程</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {vehicles.map(v => {
                const vSchedules = filteredSchedules.filter(s => String(s.vehicleId) === String(v.id));
                const days = new Set(vSchedules.map(s => s.date)).size;
                const hours = vSchedules.reduce((acc, s) => acc + calculateHours(s.startTime, s.endTime), 0);
                const km = vSchedules.reduce((acc, s) => acc + (s.tripMileage || 0), 0);
                return (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{v.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{v.plateNumber}</div>
                    </td>
                    <td>{days} 天</td>
                    <td>{vSchedules.length} 趟</td>
                    <td>{hours.toFixed(1)} hr</td>
                    <td className="p-4 font-black text-blue-600">{km.toLocaleString()} km</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- 4. 第三部分：同仁外勤貢獻榜 --- */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h4 className="font-bold text-black flex items-center">
            <i className="fas fa-medal mr-2 text-orange-500"></i> 同仁外勤貢獻榜 🏃‍♂️
          </h4>
        </div>
        <div className="p-6 space-y-6">
          {users.map(u => {
            const involved = filteredSchedules.filter(s => 
              (s.userId === u.id || s.accompanimentIds?.includes(u.id)) && s.category !== '休假'
            );
            const days = new Set(involved.map(s => s.date)).size;
            const hours = involved.reduce((acc, s) => acc + calculateHours(s.startTime, s.endTime), 0);
            
            // 活躍度：天數 * 15 + 時數 * 5，封頂 100
            const score = Math.min((days * 12) + (hours * 4), 100);

            return (
              <div key={u.id} className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center space-x-3 w-40 shrink-0">
                  <img src={u.avatar} className="w-10 h-10 rounded-full border border-slate-100 object-cover" alt="" />
                  <span className="font-bold text-slate-700">{u.name}</span>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="text-xs text-slate-500 font-bold">外勤 <span className="text-indigo-600 text-sm">{days}</span> 天</div>
                  <div className="text-xs text-slate-500 font-bold">總時數 <span className="text-indigo-600 text-sm">{hours.toFixed(1)}</span> hr</div>
                </div>
                <div className="w-full sm:w-60">
                  <div className="flex justify-between text-[10px] mb-1.5 font-black text-slate-400 uppercase tracking-tighter">
                    <span>活躍度指標</span>
                    <span className="text-orange-500">{Math.round(score)}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-400 to-rose-500 transition-all duration-1000 ease-out" 
                      style={{ width: `${score}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- 5. 第五部分：計畫外勤統計資料 --- */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h4 className="font-bold text-black flex items-center">
            <i className="fas fa-chart-pie mr-2 text-emerald-500"></i> 計畫執行深度統計 📊
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-slate-400 bg-slate-50/30 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-4 w-40">計畫名稱</th>
                <th>車輛天數</th>
                <th>車輛里程</th>
                <th>總人時</th>
                <th>總天次</th>
                <th className="p-4">出勤比例 (前三名)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {projects.map(p => {
                const pSchedules = filteredSchedules.filter(s => s.projectName === p.name);
                const vehDays = new Set(pSchedules.filter(s => s.vehicleId && s.vehicleId !== 'none').map(s => s.date)).size;
                const vehKm = pSchedules.reduce((acc, s) => acc + (s.tripMileage || 0), 0);
                
                const participants: { [name: string]: number } = {};
                let totalPersHours = 0;
                
                pSchedules.forEach(s => {
                  if (s.category === '休假') return;
                  const h = calculateHours(s.startTime, s.endTime);
                  const names = [s.userName, ...(s.accompanimentIds?.map(id => users.find(u => u.id === id)?.name).filter(Boolean) || [])];
                  names.forEach(n => {
                    if (n) {
                      participants[n] = (participants[n] || 0) + 1;
                      totalPersHours += h;
                    }
                  });
                });

                const topThree = Object.entries(participants)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 3)
                  .map(([name]) => name)
                  .join(', ');

                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-800">{p.name}</td>
                    <td>{vehDays} 天</td>
                    <td className="font-bold text-blue-600">{vehKm.toLocaleString()} km</td>
                    <td>{totalPersHours.toFixed(1)} hr</td>
                    <td>{pSchedules.length} 次</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-1">
                        <i className="fas fa-users-crown text-emerald-400 text-[10px]"></i>
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-black text-[10px]">
                          {topThree || '無外勤紀錄'}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {projects.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-400 italic">尚無計畫資料</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StatsView;
