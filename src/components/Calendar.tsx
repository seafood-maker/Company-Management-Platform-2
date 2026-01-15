import React, { useState, useRef } from 'react';
import { Schedule, User, UserRole } from '../types';

interface CalendarProps {
  schedules: Schedule[];
  onEdit: (schedule: Schedule) => void;
  onDelete: (id: string) => void;
  currentUser: User;
  users: User[]; // 用於解析同行人員姓名
}

// 這裡組件名稱維持為 CalendarView，以對應 App.tsx 的 import 叫法
const CalendarView: React.FC<CalendarProps> = ({ schedules, onEdit, onDelete, currentUser, users }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list'); // 預設為清單模式
  const [expandedId, setExpandedId] = useState<string | null>(null); // 手機版展開狀態
  const listRef = useRef<HTMLDivElement>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthName = currentMonth.toLocaleString('zh-TW', { month: 'long' });

  // --- 1. 日曆運算邏輯 ---
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 該月第一天是星期幾
  
  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const getWeekday = (day: number) => {
    const date = new Date(year, month, day);
    return date.toLocaleDateString('zh-TW', { weekday: 'short' });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  // --- 2. 資訊處理邏輯 ---
  const getCompanionNames = (ids?: string[]) => {
    if (!ids || ids.length === 0) return "";
    return ids.map(id => users.find(u => u.id === id)?.name).filter(Boolean).join(', ');
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

  // 天氣跑馬燈
  const weatherReport = "台北 ☀️ 24°C | 新北 ☁️ 23°C | 桃園 🌤️ 22°C | 新竹 🌬️ 21°C | 台中 ☀️ 25°C | 台南 ☀️ 27°C | 高雄 ☀️ 28°C";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
      
      {/* 天氣跑馬燈區塊 */}
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

      {/* 標題與模式切換控制列 */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white shrink-0">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center">
            <i className="fas fa-calendar-alt text-indigo-500 mr-2"></i>
            {year}年 {monthName}
          </h3>
          
          {/* 模式切換按鈕 (列表/月曆) */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <i className="fas fa-list-ul mr-1.5"></i>詳情列表
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <i className="fas fa-th-large mr-1.5"></i>月曆視圖
            </button>
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
        
        {/* 模式 1：詳情列表 (手機版點擊展開) */}
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
                    {daySchedules.length > 0 ? (
                      daySchedules.map(s => {
                        const isExpanded = expandedId === s.id;
                        return (
                          <div 
                            key={s.id}
                            onClick={() => setExpandedId(isExpanded ? null : s.id)}
                            className={`group border rounded-xl transition-all cursor-pointer bg-white ${isExpanded ? 'border-indigo-300 shadow-md' : 'border-slate-100 hover:border-indigo-200'}`}
                          >
                            <div className="p-3 flex items-center justify-between gap-2 text-[13px]">
                              <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <div className="text-indigo-600 font-bold w-24 shrink-0"><i className="far fa-clock mr-1 text-[10px]"></i>{s.startTime}-{s.endTime}</div>
                                <span className={`hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                                  s.category === '會議' ? 'bg-blue-100 text-blue-600' :
                                  s.category === '外勤' ? 'bg-green-100 text-green-600' :
                                  s.category === '休假' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                                }`}>{s.category || '其他'}</span>
                                <div className="font-bold text-slate-800 w-16 shrink-0 truncate">{s.userName}</div>
                                <div className="text-slate-500 truncate font-medium flex-1">{s.projectName}</div>
                                {s.vehicleId && (
                                  <div className="hidden md:flex items-center bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-100 font-mono text-[11px] shrink-0">
                                    {extractPlate(s.vehicleName)}
                                  </div>
                                )}
                              </div>
                              <i className={`md:hidden fas fa-chevron-${isExpanded ? 'up' : 'down'} text-slate-300 text-[10px]`}></i>
                            </div>

                            {isExpanded && (
                              <div className="px-3 pb-4 pt-1 border-t border-slate-50 animate-in slide-in-from-top-1 duration-200 text-[12px] space-y-2">
                                <div className="flex flex-col"><span className="text-slate-400 font-bold mb-1">事由/目的地</span><div className="bg-slate-50 p-2 rounded-lg text-slate-700 italic">{s.purpose || '無填寫事由'}</div></div>
                                {s.accompanimentIds && s.accompanimentIds.length > 0 && (
                                  <div className="flex flex-col"><span className="text-slate-400 font-bold mb-1">同行同仁</span><div className="flex flex-wrap gap-1">
                                    {getCompanionNames(s.accompanimentIds).split(',').map((name, i) => (
                                      <span key={i} className="bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full font-bold text-[10px]">{name.trim()}</span>
                                    ))}
                                  </div></div>
                                )}
                                {s.vehicleId && <div className="md:hidden flex justify-between"><span className="text-slate-400 font-bold">預約車輛</span><span className="font-mono text-amber-700 bg-amber-50 px-2 rounded">{s.vehicleName}</span></div>}
                                <div className="flex space-x-2 pt-2">
                                  {(s.userId === currentUser.id || currentUser.role === UserRole.ADMIN) && (
                                    <>
                                      <button onClick={(e) => { e.stopPropagation(); onEdit(s); }} className="flex-1 bg-slate-100 text-slate-600 py-1.5 rounded-lg font-bold"><i className="fas fa-edit mr-1"></i>編輯</button>
                                      <button onClick={(e) => { e.stopPropagation(); onDelete(s.id); }} className="flex-1 bg-red-50 text-red-600 py-1.5 rounded-lg font-bold"><i className="fas fa-trash-alt mr-1"></i>刪除</button>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-2 text-slate-300 text-[11px] italic">今日暫無行程</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 模式 2：月曆網格視圖 (一眼看全月車況) */}
        {viewMode === 'grid' && (
          <div className="h-full flex flex-col animate-in fade-in duration-300">
            <div className="grid grid-cols-7 bg-white border-b text-[11px] font-black text-slate-400 uppercase tracking-widest">
              {['日', '一', '二', '三', '四', '五', '六'].map(d => (
                <div key={d} className="py-2 text-center">{d}</div>
              ))}
            </div>
            
            <div className="flex-1 overflow-y-auto grid grid-cols-7 auto-rows-fr bg-slate-200 gap-px">
              {/* 前月補白 */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`blank-${i}`} className="bg-slate-50/50 h-24 md:h-32"></div>
              ))}
              
              {/* 本月日期格子 */}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const daySchedules = getSchedulesForDay(day);
                const activeToday = isToday(day);
                return (
                  <div key={day} className={`bg-white h-24 md:h-32 p-1 flex flex-col transition-colors hover:bg-indigo-50/20 ${activeToday ? 'ring-1 ring-inset ring-indigo-500' : ''}`}>
                    <div className={`text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full mb-1 ${activeToday ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
                      {day}
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-0.5">
                      {daySchedules.map(s => (
                        <div 
                          key={s.id}
                          onClick={() => { setViewMode('list'); setExpandedId(s.id); }}
                          className={`text-[9px] p-1 rounded-md border leading-tight truncate transition-transform active:scale-95 shadow-sm ${
                            s.vehicleId 
                              ? 'bg-amber-50 text-amber-700 border-amber-100' 
                              : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                          }`}
                        >
                          <span className="font-bold">{s.startTime.split(':')[0]}時</span> {s.vehicleId && '🚗'}{s.userName}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {/* 後月補白 */}
              {Array.from({ length: (7 - (firstDayOfMonth + daysInMonth) % 7) % 7 }).map((_, i) => (
                <div key={`blank-post-${i}`} className="bg-slate-50/50 h-24 md:h-32"></div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;
