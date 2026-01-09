import React, { useState, useMemo } from 'react';
import { Schedule, Vehicle, User, Project } from '../types';

interface StatsViewProps {
  schedules: Schedule[];
  vehicles: Vehicle[];
  users: User[];
  projects: Project[];
}

const StatsView: React.FC<StatsViewProps> = ({ schedules, vehicles, users, projects }) => {
  // 1. 時間範圍狀態 (預設顯示本月)
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const [filterType, setFilterType] = useState<'month' | 'range'>('month');
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 2. 輔助函式：計算兩時間點的時數差
  const calculateHours = (start: string, end: string) => {
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    return (h2 * 60 + m2 - (h1 * 60 + m1)) / 60;
  };

  // 3. 過濾資料
  const filteredSchedules = useMemo(() => {
    return schedules.filter(s => {
      if (filterType === 'month') {
        return s.date.startsWith(selectedMonth);
      } else {
        return (!startDate || s.date >= startDate) && (!endDate || s.date <= endDate);
      }
    });
  }, [schedules, filterType, selectedMonth, startDate, endDate]);

  // --- 4. 第一列：核心數據總結 ---
  const summary = useMemo(() => {
    let totalKm = 0;
    let vehicleTrips = 0;
    let personnelCount = 0;

    filteredSchedules.forEach(s => {
      if (s.mileageCompleted) totalKm += (s.tripMileage || 0);
      if (s.vehicleId) vehicleTrips += 1;
      // 扣除休假的人次計算
      if (s.category !== '休假') {
        personnelCount += 1; // 申請人本人
        if (s.accompanimentIds) personnelCount += s.accompanimentIds.length; // 同行人員
      }
    });

    return { totalKm, vehicleTrips, personnelCount };
  }, [filteredSchedules]);

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">
      
      {/* --- 1. 時間篩選列 --- */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center">
          <i className="fas fa-filter mr-2 text-indigo-500"></i> 數據查詢範圍
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button onClick={() => setFilterType('month')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${filterType === 'month' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>按月份</button>
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

      {/* --- 2. 第一列：三欄核心數據 --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-3xl shadow-sm">
          <p className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-2">
            <i className="fas fa-road mr-1"></i> 範圍內總里程
          </p>
          <p className="text-3xl font-black text-blue-800">{summary.totalKm.toLocaleString()} <span className="text-sm font-bold">km</span></p>
        </div>
        <div className="bg-purple-50 border-2 border-purple-200 p-6 rounded-3xl shadow-sm">
          <p className="text-purple-600 text-xs font-bold uppercase tracking-wider mb-2">
            <i className="fas fa-car-side mr-1"></i> 車輛總趟數
          </p>
          <p className="text-3xl font-black text-purple-800">{summary.vehicleTrips} <span className="text-sm font-bold">趟</span></p>
        </div>
        <div className="bg-orange-50 border-2 border-orange-200 p-6 rounded-3xl shadow-sm">
          <p className="text-orange-600 text-xs font-bold uppercase tracking-wider mb-2">
            <i className="fas fa-users mr-1"></i> 人員外勤人次
          </p>
          <p className="text-3xl font-black text-orange-800">{summary.personnelCount} <span className="text-sm font-bold">人次</span></p>
        </div>
      </div>

      {/* --- 3. 第二部分：車輛行駛歷程紀錄 --- */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h4 className="font-bold text-slate-800 flex items-center">
            <i className="fas fa-truck-loading mr-2 text-blue-500"></i> 車輛行駛統計清單 🚛
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-slate-400 border-b">
              <tr>
                <th className="p-4">車名/車牌</th>
                <th>行駛天數</th>
                <th>總趟數</th>
                <th>累積使用時數</th>
                <th>累積里程數</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {vehicles.map(v => {
                const vSchedules = filteredSchedules.filter(s => String(s.vehicleId) === String(v.id));
                const days = new Set(vSchedules.map(s => s.date)).size;
                const hours = vSchedules.reduce((acc, s) => acc + calculateHours(s.startTime, s.endTime), 0);
                const km = vSchedules.reduce((acc, s) => acc + (s.tripMileage || 0), 0);
                return (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="p-4">
                      <p className="font-bold text-slate-700">{v.name}</p>
                      <p className="text-[10px] font-mono text-slate-400">{v.plateNumber}</p>
                    </td>
                    <td className="font-medium">{days} 天</td>
                    <td>{vSchedules.length} 趟</td>
                    <td>{hours.toFixed(1)} 小時</td>
                    <td className="font-bold text-blue-600">{km} km</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- 4. 第三部分：同仁外勤歷程紀錄 --- */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h4 className="font-bold text-slate-800 flex items-center">
            <i className="fas fa-user-tie mr-2 text-orange-500"></i> 同仁外勤貢獻榜 🏃‍♂️
          </h4>
        </div>
        <div className="p-4 space-y-6">
          {users.map(u => {
            // 篩選出該同仁參與的行程 (本人申請 OR 同行) 且 非休假
            const involved = filteredSchedules.filter(s => 
              (s.userId === u.id || s.accompanimentIds?.includes(u.id)) && s.category !== '休假'
            );
            const days = new Set(involved.map(s => s.date)).size;
            const hours = involved.reduce((acc, s) => acc + calculateHours(s.startTime, s.endTime), 0);
            
            // 活躍度計算 (簡單權限：天數 * 10 + 時數 * 2，最高 100)
            const score = Math.min((days * 15) + (hours * 3), 100);

            return (
              <div key={u.id} className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-slate-50 pb-4">
                <div className="flex items-center space-x-3 w-40">
                  <img src={u.avatar} className="w-10 h-10 rounded-full border" alt="" />
                  <span className="font-bold text-slate-700">{u.name}</span>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="text-xs">外勤 <span className="font-bold text-indigo-600">{days}</span> 天</div>
                  <div className="text-xs">總計 <span className="font-bold text-indigo-600">{hours.toFixed(1)}</span> 小時</div>
                </div>
                <div className="w-full sm:w-48">
                  <div className="flex justify-between text-[10px] mb-1 font-bold text-slate-400">
                    <span>活躍度指標</span>
                    <span>{Math.round(score)}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-1000" style={{ width: `${score}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- 5. 最後部分：計畫外勤統計資料 --- */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h4 className="font-bold text-slate-800 flex items-center">
            <i className="fas fa-project-diagram mr-2 text-emerald-500"></i> 計畫執行深度統計 📊
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-400">
              <tr>
                <th className="p-4">計畫名稱</th>
                <th>車輛天數</th>
                <th>車輛里程</th>
                <th>總人員時數</th>
                <th>總人員天數</th>
                <th className="p-4">出勤比例 (前三名)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {projects.map(p => {
                const pSchedules = filteredSchedules.filter(s => s.projectName === p.name);
                const vehDays = new Set(pSchedules.filter(s => s.vehicleId).map(s => s.date)).size;
                const vehKm = pSchedules.reduce((acc, s) => acc + (s.tripMileage || 0), 0);
                
                // 計算計畫內所有參與人
                const participants: { [name: string]: number } = {};
                let totalPersHours = 0;
                pSchedules.forEach(s => {
                  const h = calculateHours(s.startTime, s.endTime);
                  const names = [s.userName, ...(s.accompanimentIds?.map(id => users.find(u => u.id === id)?.name).filter(Boolean) || [])];
                  names.forEach(n => {
                    participants[n as string] = (participants[n as string] || 0) + 1;
                    totalPersHours += h;
                  });
                });

                const topThree = Object.entries(participants)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 3)
                  .map(([name]) => name)
                  .join(', ');

                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-700">{p.name}</td>
                    <td>{vehDays} 天</td>
                    <td className="font-bold text-blue-600">{vehKm} km</td>
                    <td>{totalPersHours.toFixed(1)} hr</td>
                    <td>{pSchedules.length} 天次</td>
                    <td className="p-4">
                      <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded font-bold">
                        {topThree || '無紀錄'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StatsView;
