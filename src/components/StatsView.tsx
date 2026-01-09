import React, { useState, useMemo } from 'react';
import { Schedule, Vehicle, User, Project } from '../types';

interface StatsViewProps {
  schedules: Schedule[];
  vehicles: Vehicle[];
  users: User[];
  projects: Project[];
}

// --- 輔助組件：極簡 SVG 圓餅圖 ---
const PieChart = ({ data, colors }: { data: { label: string, value: number }[], colors: string[] }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return <div className="text-slate-300 text-[10px] italic">無外勤紀錄</div>;

  let cumulativePercent = 0;

  // 計算 SVG 扇形路徑
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className="flex items-center space-x-4">
      {/* 圓餅圖本體 */}
      <svg viewBox="-1 -1 2 2" className="w-14 h-14 md:w-16 md:h-16 -rotate-90 shrink-0">
        {data.map((item, index) => {
          const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
          cumulativePercent += item.value / total;
          const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
          const largeArcFlag = item.value / total > 0.5 ? 1 : 0;
          const pathData = [
            `M ${startX} ${startY}`,
            `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
            `L 0 0`,
          ].join(' ');
          return <path key={index} d={pathData} fill={colors[index % colors.length]} className="hover:opacity-80 transition-opacity" />;
        })}
      </svg>
      {/* 圖例說明 */}
      <div className="text-[10px] space-y-1 max-h-24 overflow-y-auto pr-2 custom-scrollbar">
        {data.map((item, index) => (
          <div key={index} className="flex items-center whitespace-nowrap">
            <span className="w-2 h-2 rounded-full mr-1.5 shrink-0" style={{ backgroundColor: colors[index % colors.length] }}></span>
            <span className="text-slate-600 font-medium">{item.label}</span>
            <span className="text-slate-400 ml-1">({item.value}次)</span>
            <span className="text-indigo-600 font-bold ml-1">{Math.round((item.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatsView: React.FC<StatsViewProps> = ({ schedules = [], vehicles = [], users = [], projects = [] }) => {
  // 1. 時間範圍狀態
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [filterType, setFilterType] = useState<'month' | 'range'>('month');
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 2. 輔助函式：計算時數差
  const calculateHours = (start?: string, end?: string) => {
    if (!start || !end) return 0;
    try {
      const [h1, m1] = start.split(':').map(Number);
      const [h2, m2] = end.split(':').map(Number);
      const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
      return diff > 0 ? diff / 60 : 0;
    } catch (e) { return 0; }
  };

  // 3. 過濾資料
  const filteredSchedules = useMemo(() => {
    return schedules.filter(s => {
      if (!s.date) return false;
      return filterType === 'month' ? s.date.startsWith(selectedMonth) : (!startDate || s.date >= startDate) && (!endDate || s.date <= endDate);
    });
  }, [schedules, filterType, selectedMonth, startDate, endDate]);

  // 4. 第一列總結數據
  const summary = useMemo(() => {
    let totalKm = 0, vehicleTrips = 0, personnelCount = 0;
    filteredSchedules.forEach(s => {
      if (s.mileageCompleted) totalKm += (s.tripMileage || 0);
      if (s.vehicleId && s.vehicleId !== 'none') vehicleTrips += 1;
      if (s.category !== '休假') personnelCount += (1 + (s.accompanimentIds?.length || 0));
    });
    return { totalKm, vehicleTrips, personnelCount };
  }, [filteredSchedules]);

  // --- 5. 計畫總占比圖數據 ---
  const projectGlobalShare = useMemo(() => {
    return projects.map(p => {
      const pSchedules = filteredSchedules.filter(s => s.projectName === p.name && s.category !== '休假');
      const count = pSchedules.reduce((acc, s) => acc + 1 + (s.accompanimentIds?.length || 0), 0);
      return { label: p.name, value: count };
    }).filter(p => p.value > 0);
  }, [projects, filteredSchedules]);

  const chartColors = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#475569'];

  if (!users.length && !vehicles.length && schedules.length === 0) {
    return <div className="p-10 text-center text-slate-400 font-bold animate-pulse">📊 正在讀取雲端統計數據...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-12">
      
      {/* 篩選器 */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-black flex items-center"><i className="fas fa-search-chart mr-2 text-indigo-500"></i> 統計報表查詢範圍</h3>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button onClick={() => setFilterType('month')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${filterType === 'month' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>按月分</button>
            <button onClick={() => setFilterType('range')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${filterType === 'range' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>自訂範圍</button>
          </div>
          {filterType === 'month' ? <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="border rounded-xl p-2 text-sm outline-none" /> : 
          <div className="flex items-center space-x-2"><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border rounded-xl p-2 text-sm" /><span>~</span><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border rounded-xl p-2 text-sm" /></div>}
        </div>
      </div>

      {/* 頂部彩色方框 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 border-2 border-blue-100 p-6 rounded-3xl relative group overflow-hidden">
          <i className="fas fa-road absolute -right-2 -bottom-2 text-blue-100 text-6xl rotate-12"></i>
          <p className="text-blue-600 text-xs font-bold uppercase mb-2">本月總里程</p>
          <p className="text-3xl font-black text-blue-900">{summary.totalKm.toLocaleString()} <span className="text-sm font-bold ml-1">km</span></p>
        </div>
        <div className="bg-purple-50 border-2 border-purple-100 p-6 rounded-3xl relative group overflow-hidden">
          <i className="fas fa-car absolute -right-2 -bottom-2 text-purple-100 text-6xl rotate-12"></i>
          <p className="text-purple-600 text-xs font-bold uppercase mb-2">車輛總趟數</p>
          <p className="text-3xl font-black text-purple-900">{summary.vehicleTrips} <span className="text-sm font-bold ml-1">趟</span></p>
        </div>
        <div className="bg-orange-50 border-2 border-orange-100 p-6 rounded-3xl relative group overflow-hidden">
          <i className="fas fa-users absolute -right-2 -bottom-2 text-orange-100 text-6xl rotate-12"></i>
          <p className="text-orange-600 text-xs font-bold uppercase mb-2">人員外勤人次</p>
          <p className="text-3xl font-black text-orange-900">{summary.personnelCount} <span className="text-sm font-bold ml-1">人次</span></p>
        </div>
      </div>

      {/* 計畫統計深度分析 */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <h4 className="font-bold text-black text-lg flex items-center">
              <i className="fas fa-chart-pie mr-2 text-emerald-500"></i> 計畫執行深度統計 📊
            </h4>
            <p className="text-xs text-slate-400 mt-1 font-bold">查看各計畫在指定範圍內的執行強度與人力分布</p>
          </div>

          {/* 全局計畫外勤占比圖 */}
          <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
            <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-tighter">
              各計畫外勤人次總占比
            </p>
            <PieChart data={projectGlobalShare} colors={chartColors} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-slate-400 bg-slate-50/30 font-bold">
              <tr>
                <th className="p-4 w-40">計畫名稱</th>
                <th>車輛天數</th>
                <th>車輛里程</th>
                <th>總人時</th>
                <th>總人次</th>
                <th className="p-4">計畫內人員貢獻比重 (Proportion)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {projects.map(p => {
                const pSchedules = filteredSchedules.filter(s => s.projectName === p.name);
                const vehDays = new Set(pSchedules.filter(s => s.vehicleId && s.vehicleId !== 'none').map(s => s.date)).size;
                const vehKm = pSchedules.reduce((acc, s) => acc + (s.tripMileage || 0), 0);
                const totalHours = pSchedules.reduce((acc, s) => acc + calculateHours(s.startTime, s.endTime), 0);

                // 計算每個人在此計畫的出勤次數
                const personCountMap: { [name: string]: number } = {};
                let projectTotalManPower = 0;
                pSchedules.forEach(s => {
                  if (s.category === '休假') return;
                  const currentTeam = [s.userName, ...(s.accompanimentIds?.map(id => users.find(u => u.id === id)?.name).filter(Boolean) || [])];
                  currentTeam.forEach(name => {
                    if (name) {
                      personCountMap[name as string] = (personCountMap[name as string] || 0) + 1;
                      projectTotalManPower++;
                    }
                  });
                });

                const individualData = Object.entries(personCountMap).map(([name, count]) => ({ label: name, value: count }));

                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-800 border-r border-slate-50">{p.name}</td>
                    <td>{vehDays} 天</td>
                    <td className="font-bold text-blue-600">{vehKm.toLocaleString()} km</td>
                    <td>{totalHours.toFixed(1)} hr</td>
                    <td>{projectTotalManPower} 人次</td>
                    <td className="p-4 bg-slate-50/30">
                      <PieChart data={individualData} colors={['#fb7185', '#38bdf8', '#fbbf24', '#34d399', '#a78bfa', '#f472b6', '#2dd4bf']} />
                    </td>
                  </tr>
                );
              })}
              {projects.length === 0 && (
                <tr><td colSpan={6} className="p-10 text-center text-slate-400 italic">尚無計畫資料</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 車輛清單 (保持原功能) */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50"><h4 className="font-bold text-black flex items-center"><i className="fas fa-truck-moving mr-2 text-blue-500"></i> 車輛行駛統計清單 🚛</h4></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left"><thead className="text-slate-400 bg-slate-50/30 uppercase text-[10px] font-bold"><tr><th className="p-4">車名 / 車牌</th><th>行駛天數</th><th>總趟數</th><th>累積里程</th></tr></thead>
            <tbody className="divide-y">
              {vehicles.map(v => {
                const vSchedules = filteredSchedules.filter(s => String(s.vehicleId) === String(v.id));
                const days = new Set(vSchedules.map(s => s.date)).size;
                const km = vSchedules.reduce((acc, s) => acc + (s.tripMileage || 0), 0);
                return (<tr key={v.id} className="hover:bg-slate-50 transition-colors"><td className="p-4"><div className="font-bold text-slate-800">{v.name}</div><div className="text-[10px] font-mono text-slate-400">{v.plateNumber}</div></td><td>{days} 天</td><td>{vSchedules.length} 趟</td><td className="p-4 font-black text-blue-600">{km.toLocaleString()} km</td></tr>);
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 同仁貢獻榜 (保持原功能) */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50"><h4 className="font-bold text-black flex items-center"><i className="fas fa-medal mr-2 text-orange-500"></i> 同仁外勤貢獻榜 🏃‍♂️</h4></div>
        <div className="p-6 space-y-6">
          {users.map(u => {
            const involved = filteredSchedules.filter(s => (s.userId === u.id || s.accompanimentIds?.includes(u.id)) && s.category !== '休假');
            const days = new Set(involved.map(s => s.date)).size;
            const hours = involved.reduce((acc, s) => acc + calculateHours(s.startTime, s.endTime), 0);
            const score = Math.min((days * 12) + (hours * 4), 100);
            return (
              <div key={u.id} className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center space-x-3 w-40 shrink-0"><img src={u.avatar} className="w-10 h-10 rounded-full border object-cover" alt="" /><span className="font-bold text-slate-700">{u.name}</span></div>
                <div className="flex-1 grid grid-cols-2 gap-4"><div className="text-xs font-bold">外勤 <span className="text-indigo-600">{days}</span> 天</div><div className="text-xs font-bold">時數 <span className="text-indigo-600">{hours.toFixed(1)}</span> hr</div></div>
                <div className="w-full sm:w-60"><div className="flex justify-between text-[10px] mb-1.5 font-black text-slate-400 tracking-tighter"><span>活躍度</span><span className="text-orange-500">{Math.round(score)}%</span></div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-gradient-to-r from-orange-400 to-rose-500 transition-all duration-1000" style={{ width: `${score}%` }}></div></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}} />
    </div>
  );
};

export default StatsView;
