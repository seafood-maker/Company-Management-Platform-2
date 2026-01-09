import React, { useState, useRef } from 'react';
import { Schedule, User, UserRole } from '../types';

interface CalendarProps {
  schedules: Schedule[];
  onEdit: (schedule: Schedule) => void;
  onDelete: (id: string) => void;
  currentUser: User;
  users: User[]; // 新增：傳入人員資料庫以解析同行人員姓名
}

const CalendarView: React.FC<CalendarProps> = ({ schedules, onEdit, onDelete, currentUser, users }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const listRef = useRef<HTMLDivElement>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthName = currentMonth.toLocaleString('zh-TW', { month: 'long' });

  // --- 1. 日曆導覽邏輯 ---
  const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const totalDays = daysInMonth(year, month);
  
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
  // 輔助函式：根據 ID 陣列轉為同仁姓名標籤
  const getCompanionNames = (ids?: string[]) => {
    if (!ids || ids.length === 0) return null;
    return ids
      .map(id => users.find(u => u.id === id)?.name)
      .filter(Boolean)
      .join(', ');
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

  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  // --- 3. 天氣跑馬燈內容 ---
  const weatherReport = "台北 ☀️ 24°C | 新北 ☁️ 23°C | 桃園 🌤️ 22°C | 新竹 🌬️ 21°C | 台中 ☀️ 25°C | 台南 ☀️ 27°C | 高雄 ☀️ 28°C | 基隆 🌧️ 19°C | 宜蘭 🌧️ 20°C | 花蓮 🌤️ 21°C | 台東 ☀️ 24°C";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
      
      {/* 4. 天氣跑馬燈 */}
      <div className="bg-slate-900 text-white py-2.5 px-4 overflow-hidden relative shrink-0 border-b border-slate-800">
        <div className="whitespace-nowrap inline-block animate-marquee text-xs font-medium">
          <span className="mx-4"><i className="fas fa-bullhorn mr-2 text-indigo-400"></i>今日全台氣象預報：{weatherReport}</span>
          <span className="mx-4"><i className="fas fa-bullhorn mr-2 text-indigo-400"></i>今日全台氣象預報：{weatherReport}</span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 35s linear infinite;
        }
      `}} />

      {/* 5. 標題與月份控制列 */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white shrink-0">
        <h3 className="text-lg font-bold text-slate-800 flex items-center">
          <i className="fas fa-calendar-alt text-indigo-500 mr-2"></i>
          {year}年 {monthName}
        </h3>
        
        <div className="flex items-center space-x-2">
          <button onClick={goToToday} className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition">今天</button>
          <div className="flex bg-slate-50 border border-slate-200 rounded-lg p-0.5">
            <button onClick={prevMonth} className="p-1.5 text-slate-600 hover:text-indigo-600 transition"><i className="fas fa-chevron-left text-xs"></i></button>
            <button onClick={nextMonth} className="p-1.5 text-slate-600 hover:text-indigo-600 transition"><i className="fas fa-chevron-right text-xs"></i></button>
          </div>
        </div>
      </div>

      {/* 6. 逐日列表區塊 */}
      <div 
        ref={listRef} 
        className="flex-1 overflow-y-auto divide-y divide-slate-100"
        style={{ maxHeight: 'calc(100vh - 280px)' }} 
      >
        {days.map(day => {
          const daySchedules = getSchedulesForDay(day);
          const activeToday = isToday(day);

          return (
            <div key={day} className={`flex flex-col md:flex-row p-3 transition hover:bg-slate-50/50 ${activeToday ? 'bg-indigo-50/30' : ''}`}>
              
              {/* 日期側欄 */}
              <div className="flex md:flex-col items-center md:items-start md:w-20 mb-2 md:mb-0 shrink-0">
                <div className="flex items-center space-x-2 md:space-x-0 md:flex-col">
                  <div className={`text-xl font-bold ${activeToday ? 'text-indigo-600' : 'text-slate-700'}`}>
                    {String(day).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] font-medium text-slate-400 uppercase">
                    {getWeekday(day)}
                  </div>
                </div>
              </div>

              {/* 行程列表區 */}
              <div className="flex-1 space-y-1 overflow-hidden">
                {daySchedules.length > 0 ? (
                  daySchedules.map(s => (
                    <div 
                      key={s.id}
                      className="group flex flex-row items-center justify-between p-2 bg-white border border-slate-100 rounded-lg hover:border-indigo-200 hover:shadow-sm transition text-[13px] whitespace-nowrap overflow-hidden"
                    >
                      {/* 左側資訊區：單行排列 */}
                      <div className="flex items-center space-x-3 flex-1 min-w-0 overflow-hidden">
                        
                        {/* 時間 */}
                        <div className="text-indigo-600 font-bold w-24 shrink-0">
                          <i className="far fa-clock mr-1 text-[10px]"></i>
                          {s.startTime} - {s.endTime}
                        </div>

                        {/* 類別標籤 */}
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          s.category === '會議' ? 'bg-blue-100 text-blue-600' :
                          s.category === '外勤' ? 'bg-green-100 text-green-600' :
                          s.category === '休假' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {s.category || '其他'}
                        </span>

                        {/* 主要人員 (加粗) */}
                        <div className="font-bold text-slate-800 w-20 shrink-0 truncate">
                          {s.userName}
                        </div>

                        {/* 同行人員顯示 (新增) */}
                        {s.accompanimentIds && s.accompanimentIds.length > 0 && (
                          <div className="text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded text-[11px] font-medium shrink-0 flex items-center">
                            <i className="fas fa-user-friends mr-1"></i>
                            {getCompanionNames(s.accompanimentIds)}
                          </div>
                        )}

                        {/* 計畫名稱與事由 */}
                        <div className="text-slate-500 truncate flex-1 min-w-0" title={`${s.projectName}: ${s.purpose}`}>
                          <span className="text-slate-700 font-medium">{s.projectName}</span>
                          <span className="mx-1 opacity-50">|</span>
                          <span>{s.purpose || '無填寫事由'}</span>
                        </div>

                        {/* 車牌 (若有) */}
                        {s.vehicleId && (
                          <div className="flex items-center bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-100 font-mono text-[11px] shrink-0">
                            <i className="fas fa-car mr-1.5 text-[10px]"></i>
                            {extractPlate(s.vehicleName)}
                          </div>
                        )}
                      </div>

                      {/* 右側操作區 */}
                      <div className="flex items-center space-x-1 ml-4 shrink-0 opacity-0 group-hover:opacity-100 transition">
                        {(s.userId === currentUser.id || currentUser.role === UserRole.ADMIN) && (
                          <>
                            <button 
                              onClick={() => onEdit(s)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 transition"
                              title="編輯行程"
                            >
                              <i className="fas fa-edit text-xs"></i>
                            </button>
                            <button 
                              onClick={() => { if(window.confirm('確定要刪除此行程？')) onDelete(s.id); }}
                              className="p-1.5 text-slate-400 hover:text-red-500 transition"
                              title="刪除行程"
                            >
                              <i className="fas fa-trash-alt text-xs"></i>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-2 text-slate-300 text-[11px] italic">
                    今日暫無行程
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
