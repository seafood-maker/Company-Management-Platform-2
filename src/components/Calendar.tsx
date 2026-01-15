import React, { useState, useRef } from 'react';
import { Schedule, User, UserRole, ScheduleCategory } from '../types';

interface CalendarProps {
  schedules: Schedule[];
  onEdit: (schedule: Schedule) => void;
  onDelete: (id: string) => void;
  currentUser: User;
  users: User[]; 
}

const CalendarView: React.FC<CalendarProps> = ({ schedules, onEdit, onDelete, currentUser, users }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedDayInfo, setSelectedDayInfo] = useState<{day: number, schedules: Schedule[]} | null>(null);
  
  const listRef = useRef<HTMLDivElement>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthName = currentMonth.toLocaleString('zh-TW', { month: 'long' });

  // --- 1. 配色與格式化輔助函式 ---

  // 根據行程類別回傳風格 (用於邊條與類別標籤)
  const getCategoryStyles = (category: ScheduleCategory) => {
    switch (category) {
      case '會議': return { border: 'border-blue-500', text: 'text-blue-600', bg: 'bg-blue-50' };
      case '外勤': return { border: 'border-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50' };
      case '休假': return { border: 'border-rose-500', text: 'text-rose-600', bg: 'bg-rose-50' };
      default: return { border: 'border-slate-400', text: 'text-slate-600', bg: 'bg-slate-50' };
    }
  };

  // 根據人員 ID 產生固定背景色 (用於姓名區隔)
  const getUserColorStyle = (userId: string) => {
    const colors = [
      'bg-indigo-100 text-indigo-700 border-indigo-200',
      'bg-amber-100 text-amber-700 border-amber-200',
      'bg-cyan-100 text-cyan-700 border-cyan-200',
      'bg-purple-100 text-purple-700 border-purple-200',
      'bg-orange-100 text-orange-700 border-orange-200',
      'bg-lime-100 text-lime-700 border-lime-200',
      'bg-pink-100 text-pink-700 border-pink-200'
    ];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const getCompanionNames = (ids?: string[]) => {
    if (!ids || ids.length === 0) return "";
    return ids.map(id => users.find(u => u.id === id)?.name).filter(Boolean).join(', ');
  };

  // --- 2. 日曆運算邏輯 ---
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const getWeekday = (day: number) => {
    return new Date(year, month, day).toLocaleDateString('zh-TW', { weekday: 'short' });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  const extractPlate = (name?: string) => {
    if (!name) return "";
    const match = name.match(/\((.*?)\)/);
    return match ? match[1] : name;
  };

  const getSchedulesForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return schedules.filter(s => s.date === dateStr).sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const weatherReport = "台北 ☀️ 24°C | 新北 ☁️ 23°C | 桃園 🌤️ 22°C | 台中 ☀️ 25°C | 高雄 ☀️ 28°C";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden relative">
      
      {/* 4. 天氣跑馬燈 */}
      <div className="bg-slate-900 text-white py-2.5 px-4 overflow-hidden relative shrink-0 border-b border-slate-800">
        <div className="whitespace-nowrap inline-block animate-marquee text-xs font-medium">
          <span className="mx-4"><i className="fas fa-bullhorn mr-2 text-indigo-400"></i>今日全台氣象預報：{weatherReport}</span>
          <span className="mx-4"><i className="fas fa-bullhorn mr-2 text-indigo-400"></i>今日全台氣象預報：{weatherReport}</span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { display: inline-block; animation: marquee 35s linear infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}} />

      {/* 5. 標題與模式切換 */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white shrink-0">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center">
            <i className="fas fa-calendar-alt text-indigo-500 mr-2"></i>
            {year}年 {monthName}
          </h3>
          
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>詳情列表</button>
            <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>月曆視圖</button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button onClick={goToToday} className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition">今天</button>
          <div className="flex bg-slate-50 border border-slate-200 rounded-lg p-0.5">
            <button onClick={prevMonth} className="p-1.5 text-slate-600 hover:text-indigo-600 transition"><i className="fas fa-chevron-left text-xs"></i></button>
            <button onClick={nextMonth} className="p-1.5 text-slate-600 hover:text-indigo-600 transition"><i className="fas fa-chevron-right text-xs"></i></button>
          </div>
        </div>
      </div>

      {/* --- 內容區域 --- */}
      <div className="flex-1 overflow-hidden bg-slate-50/30">
        
        {/* 模式 1：詳情列表 */}
        {viewMode === 'list' && (
          <div ref={listRef} className="h-full overflow-y-auto divide-y divide-slate-100 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 280px)' }}>
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const daySchedules = getSchedulesForDay(day);
              const activeToday = isToday(day);
              return (
                <div key={day} className={`flex flex-col md:flex-row p-3 transition ${activeToday ? 'bg-indigo-50/30' : ''}`}>
                  <div className="flex md:flex-col items-center md:items-start md:w-20 mb-2 md:mb-0 shrink-0">
                    <div className={`text-xl font-bold ${activeToday ? 'text-indigo-600' : 'text-slate-700'}`}>{String(day).padStart(2, '0')}</div>
                    <div className="text-[10px] font-medium text-slate-400 uppercase ml-2 md:ml-0">{getWeekday(day)}</div>
                  </div>
                  <div className="flex-1 space-y-2">
                    {daySchedules.length > 0 ? daySchedules.map(s => {
                      const isExpanded = expandedId === s.id;
                      const catStyle = getCategoryStyles(s.category);
                      const userStyle = getUserColorStyle(s.userId);
                      const companionSummary = getCompanionNames(s.accompanimentIds);

                      return (
                        <div 
                          key={s.id} 
                          onClick={() => setExpandedId(isExpanded ? null : s.id)} 
                          className={`group border rounded-xl transition-all bg-white overflow-hidden ${isExpanded ? 'ring-2 ring-indigo-200 shadow-md' : 'border-slate-100 hover:border-slate-300'}`}
                          style={{ borderLeft: `6px solid ${catStyle.border.replace('border-', '#')}` }}
                        >
                          <div className="p-3 flex items-center justify-between gap-2 text-[13px]">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className="text-indigo-600 font-bold w-24 shrink-0"><i className="far fa-clock mr-1 text-[10px]"></i>{s.startTime}-{s.endTime}</div>
                              
                              {/* 類別標籤 */}
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-black border bg-white ${catStyle.text}`}>{s.category}</span>
                              
                              {/* 姓名標籤：彩色背景 */}
                              <div className={`px-2 py-0.5 rounded-lg font-black shrink-0 border-b-2 ${userStyle}`}>
                                {s.userName}
                              </div>

                              {/* 計畫名稱與同行人員 */}
                              <div className="text-slate-500 truncate font-medium flex-1">
                                {s.projectName}
                                {companionSummary && <span className="ml-2 text-[11px] text-pink-500 font-bold">(同行: {companionSummary})</span>}
                              </div>

                              {s.vehicleId && (
                                <div className="hidden md:flex items-center bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-100 font-mono text-[11px] shrink-0">
                                  <i className="fas fa-car mr-1 text-[10px]"></i>{extractPlate(s.vehicleName)}
                                </div>
                              )}
                            </div>
                            <i className={`md:hidden fas fa-chevron-${isExpanded ? 'up' : 'down'} text-slate-300 text-[10px]`}></i>
                          </div>
                          {isExpanded && (
                            <div className="px-3 pb-4 pt-1 border-t border-slate-50 animate-in slide-in-from-top-1 text-[12px] space-y-2">
                              <div className="flex flex-col mt-2"><span className="text-slate-400 font-bold">事由/目的地</span><div className="bg-slate-50 p-2 rounded-lg italic text-slate-700 border border-slate-100">{s.purpose || '無填寫事由'}</div></div>
                              {s.accompanimentIds?.length > 0 && <div className="flex flex-col"><span className="text-slate-400 font-bold">完整同行同仁清單</span><div className="flex flex-wrap gap-1 mt-1">{companionSummary.split(',').map((n, i) => <span key={i} className="bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full font-bold text-[10px] border border-pink-100">{n}</span>)}</div></div>}
                              {s.vehicleId && <div className="md:hidden flex justify-between items-center"><span className="text-slate-400 font-bold">預約車輛</span><span className="font-mono text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-100">{s.vehicleName}</span></div>}
                              <div className="flex space-x-2 pt-2 border-t mt-2">
                                {(s.userId === currentUser.id || currentUser.role === UserRole.ADMIN) && (
                                  <>
                                    <button onClick={(e) => { e.stopPropagation(); onEdit(s); }} className="flex-1 bg-slate-100 text-slate-600 py-1.5 rounded-lg font-bold hover:bg-slate-200 transition"><i className="fas fa-edit mr-1"></i>編輯</button>
                                    <button onClick={(e) => { e.stopPropagation(); onDelete(s.id); }} className="flex-1 bg-rose-50 text-rose-600 py-1.5 rounded-lg font-bold hover:bg-rose-100 transition"><i className="fas fa-trash-alt mr-1"></i>刪除</button>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }) : <div className="py-2 text-slate-300 text-[11px] italic">今日暫無行程</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 模式 2：月曆視圖 */}
        {viewMode === 'grid' && (
          <div className="h-full flex flex-col animate-in fade-in duration-300">
            <div className="grid grid-cols-7 bg-white border-b text-[11px] font-black text-slate-400 uppercase tracking-widest">
              {['日', '一', '二', '三', '四', '五', '六'].map(d => <div key={d} className="py-2 text-center">{d}</div>)}
            </div>
            
            <div className="flex-1 overflow-y-auto grid grid-cols-7 auto-rows-fr bg-slate-200 gap-px">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`blank-${i}`} className="bg-slate-50/50 h-24 md:h-32 border-b border-r border-slate-100"></div>)}
              
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const daySchedules = getSchedulesForDay(day);
                const activeToday = isToday(day);
                return (
                  <div 
                    key={day} 
                    onClick={() => daySchedules.length > 0 && setSelectedDayInfo({day, schedules: daySchedules})}
                    className={`bg-white h-24 md:h-32 p-1 flex flex-col transition-all cursor-pointer hover:bg-indigo-50/40 ${activeToday ? 'ring-1 ring-inset ring-indigo-500 bg-indigo-50/5' : ''}`}
                  >
                    <div className={`text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full mb-1 ${activeToday ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
                      {day}
                    </div>
                    
                    <div className="flex-1 overflow-hidden space-y-0.5">
                      {daySchedules.map(s => {
                        const userStyle = getUserColorStyle(s.userId);
                        const companionCount = s.accompanimentIds?.length || 0;
                        return (
                          <div 
                            key={s.id} 
                            className={`text-[9px] p-1 rounded border-l-2 leading-tight truncate font-bold shadow-sm ${userStyle} border-white/40`}
                            style={{ borderLeftColor: getCategoryStyles(s.category).border.replace('border-', '#') }}
                          >
                            {s.startTime.split(':')[0]}時 {s.vehicleId && '🚗'}{s.userName}{companionCount > 0 && `+${companionCount}`}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {Array.from({ length: (7 - (firstDayOfMonth + daysInMonth) % 7) % 7 }).map((_, i) => <div key={`blank-post-${i}`} className="bg-slate-50/50 h-24 md:h-32"></div>)}
            </div>
          </div>
        )}
      </div>

      {/* 彈窗：當日資訊詳情 */}
      {selectedDayInfo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-indigo-600 p-4 text-white flex justify-between items-center shadow-lg">
              <h4 className="font-bold flex items-center"><i className="fas fa-calendar-day mr-2"></i> {month + 1}月{selectedDayInfo.day}日 詳細行程</h4>
              <button onClick={() => setSelectedDayInfo(null)} className="hover:rotate-90 transition-transform p-1"><i className="fas fa-times text-lg"></i></button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4 custom-scrollbar">
              {selectedDayInfo.schedules.map(s => {
                const userStyle = getUserColorStyle(s.userId);
                const companionSummary = getCompanionNames(s.accompanimentIds);
                const catStyle = getCategoryStyles(s.category);
                return (
                  <div key={s.id} className="border-l-4 rounded-xl p-4 bg-slate-50 shadow-sm" style={{ borderLeftColor: catStyle.border.replace('border-', '#') }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-black text-indigo-600 text-sm">{s.startTime} - {s.endTime}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border bg-white font-black text-slate-500 uppercase ${catStyle.text}`}>{s.category}</span>
                    </div>
                    <div className="flex items-center mb-2">
                       <span className={`px-2 py-0.5 rounded-lg font-black text-xs ${userStyle}`}>{s.userName}</span>
                       <span className="mx-2 text-slate-300">➔</span>
                       <span className="font-bold text-slate-800 text-sm truncate">{s.projectName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mb-3 p-2 bg-white rounded-lg italic border border-slate-100">"{s.purpose || '無填寫事由'}"</div>
                    <div className="space-y-1.5">
                      {companionSummary && (
                        <div className="text-[10px] text-pink-600 bg-pink-50 px-2 py-1 rounded border border-pink-100 font-bold flex items-center">
                          <i className="fas fa-user-friends mr-1.5"></i>同行：{companionSummary}
                        </div>
                      )}
                      {s.vehicleId && (
                        <div className="text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-100 font-bold flex items-center">
                          <i className="fas fa-car mr-1.5"></i>車輛：{s.vehicleName}
                        </div>
                      )}
                    </div>
                    {(s.userId === currentUser.id || currentUser.role === UserRole.ADMIN) && (
                      <div className="flex gap-2 mt-4">
                        <button onClick={() => { onEdit(s); setSelectedDayInfo(null); }} className="flex-1 py-2 bg-white border border-slate-200 text-[10px] font-bold rounded-lg text-indigo-600 hover:bg-indigo-50 transition shadow-sm">編輯</button>
                        <button onClick={() => { if(window.confirm('確定刪除？')) onDelete(s.id); setSelectedDayInfo(null); }} className="flex-1 py-2 bg-white border border-slate-200 text-[10px] font-bold rounded-lg text-rose-600 hover:bg-rose-50 transition shadow-sm">刪除</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <button onClick={() => setSelectedDayInfo(null)} className="w-full py-4 bg-slate-50 text-xs font-bold text-slate-400 border-t hover:text-indigo-600 transition">關閉視窗</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
