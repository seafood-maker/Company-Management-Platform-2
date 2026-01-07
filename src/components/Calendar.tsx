import React, { useState, useRef } from 'react';
import { Schedule, User, UserRole, ScheduleCategory } from '../types';

interface CalendarProps {
  schedules: Schedule[];
  onEdit: (schedule: Schedule) => void;
  onDelete: (id: string) => void;
  currentUser: User;
}

const CalendarView: React.FC<CalendarProps> = ({ schedules, onEdit, onDelete, currentUser }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const listRef = useRef<HTMLDivElement>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthName = currentMonth.toLocaleString('zh-TW', { month: 'long' });

  // 日曆邏輯
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

  // 1(6) 正則表達式提取車牌：從 "白色 SUV (ABC-1234)" 提取 "ABC-1234"
  const extractPlate = (name?: string) => {
    if (!name) return "";
    const match = name.match(/\((.*?)\)/);
    return match ? match[1] : name;
  };

  // 4. 模擬天氣預報邏輯 (隨機模擬，實際可串接 API)
  const getWeatherIcon = (day: number) => {
    const icons = ["☀️", "☁️", "🌤️", "🌧️"];
    return icons[day % icons.length];
  };

  const getSchedulesForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return schedules.filter(s => s.date === dateStr).sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full max-h-[calc(100vh-160px)]">
      {/* 標題與控制列 */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white sticky top-0 z-10">
        <h3 className="text-lg font-bold text-slate-800 flex items-center">
          <i className="fas fa-calendar-alt text-indigo-500 mr-2"></i>
          {year}年 {monthName}
        </h3>
        
        <div className="flex items-center space-x-2">
          <button onClick={goToToday} className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg">今天</button>
          <div className="flex bg-slate-50 border border-slate-200 rounded-lg p-0.5">
            <button onClick={prevMonth} className="p-1.5 text-slate-600 hover:text-indigo-600"><i className="fas fa-chevron-left text-xs"></i></button>
            <button onClick={nextMonth} className="p-1.5 text-slate-600 hover:text-indigo-600"><i className="fas fa-chevron-right text-xs"></i></button>
          </div>
        </div>
      </div>

      {/* 逐日列表區塊 */}
      <div ref={listRef} className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {days.map(day => {
          const daySchedules = getSchedulesForDay(day);
          const activeToday = isToday(day);

          return (
            <div key={day} className={`flex flex-col md:flex-row p-3 transition hover:bg-slate-50/50 ${activeToday ? 'bg-indigo-50/30' : ''}`}>
              
              {/* 1(4) 日期與天氣側欄 */}
              <div className="flex md:flex-col items-center md:items-start md:w-20 mb-2 md:mb-0 shrink-0">
                <div className="flex items-center space-x-2 md:space-x-0 md:flex-col">
                  <div className={`text-xl font-bold ${activeToday ? 'text-indigo-600' : 'text-slate-700'}`}>
                    {String(day).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] font-medium text-slate-400 uppercase">
                    {getWeekday(day)}
                  </div>
                </div>
                {/* 天氣顯示 */}
                <div className="ml-3 md:ml-0 md:mt-1 text-sm" title="預估天氣">
                  {getWeatherIcon(day)}
                </div>
              </div>

              {/* 1(1) 行程內容 - 佈局重構 */}
              <div className="flex-1 space-y-1">
                {daySchedules.length > 0 ? (
                  daySchedules.map(s => (
                    <div 
                      key={s.id}
                      className="group flex flex-row items-center justify-between p-2 bg-white border border-slate-100 rounded-lg hover:border-indigo-200 hover:shadow-sm transition text-[13px]"
                    >
                      {/* 左側資訊區 */}
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {/* 1(2) 時間 (精簡高度) */}
                        <div className="text-indigo-600 font-bold w-24 shrink-0">
                          <i className="far fa-clock mr-1 text-[10px]"></i>
                          {s.startTime} - {s.endTime}
                        </div>

                        {/* 1(3) 類別標籤 */}
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          s.category === '會議' ? 'bg-blue-100 text-blue-600' :
                          s.category === '外勤' ? 'bg-green-100 text-green-600' :
                          s.category === '休假' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {s.category || '其他'}
                        </span>

                        {/* 1(4) 人員 (加粗) */}
                        <div className="font-bold text-slate-800 w-20 shrink-0 truncate">
                          {s.userName}
                        </div>

                        {/* 1(5) 事由 (自動截斷) */}
                        <div className="text-slate-500 truncate flex-1 hidden lg:block">
                          {s.purpose || '無填寫事由'}
                        </div>

                        {/* 1(6) 車牌 (精簡顯示) */}
                        {s.vehicleId && (
                          <div className="flex items-center bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-100 font-mono text-[11px] shrink-0">
                            <i className="fas fa-car mr-1.5 text-[10px]"></i>
                            {extractPlate(s.vehicleName)}
                          </div>
                        )}
                      </div>

                      {/* 操作按鈕 */}
                      <div className="flex items-center space-x-1 ml-4 opacity-0 group-hover:opacity-100 transition">
                        {(s.userId === currentUser.id || currentUser.role === UserRole.ADMIN) && (
                          <>
                            <button 
                              onClick={() => onEdit(s)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 transition"
                            >
                              <i className="fas fa-edit text-xs"></i>
                            </button>
                            <button 
                              onClick={() => { if(confirm('確定要刪除？')) onDelete(s.id); }}
                              className="p-1.5 text-slate-400 hover:text-red-500 transition"
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
