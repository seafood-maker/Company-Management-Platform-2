
import React, { useState, useRef, useEffect } from 'react';
import { Schedule, User, UserRole } from '../types';

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

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const totalDays = daysInMonth(year, month);

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    // Scroll to today will happen via effect if in current month
  };

  const getWeekday = (day: number) => {
    const date = new Date(year, month, day);
    return date.toLocaleDateString('zh-TW', { weekday: 'short' });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  const getSchedulesForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return schedules.filter(s => s.date === dateStr).sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  // 建立當月所有天數的陣列
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full max-h-[calc(100vh-160px)]">
      {/* 標題與控制列 */}
      <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white sticky top-0 z-10">
        <h3 className="text-xl font-bold text-slate-800 flex items-center">
          <i className="fas fa-list-ul text-indigo-500 mr-3"></i>
          {year}年 {monthName}
        </h3>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={goToToday}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition"
          >
            今天
          </button>
          <div className="flex bg-slate-50 border border-slate-200 rounded-lg p-1">
            <button onClick={prevMonth} className="p-2 text-slate-600 hover:text-indigo-600 transition">
              <i className="fas fa-chevron-left"></i>
            </button>
            <button onClick={nextMonth} className="p-2 text-slate-600 hover:text-indigo-600 transition">
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      {/* 逐日列表區塊 */}
      <div ref={listRef} className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {days.map(day => {
          const daySchedules = getSchedulesForDay(day);
          const activeToday = isToday(day);

          return (
            <div 
              key={day} 
              id={`day-${day}`}
              className={`flex flex-col sm:flex-row p-4 transition hover:bg-slate-50/50 ${activeToday ? 'bg-indigo-50/30' : ''}`}
            >
              {/* 日期側欄 */}
              <div className="flex sm:flex-col items-center sm:items-start sm:w-24 mb-3 sm:mb-0 shrink-0">
                <div className={`text-2xl font-bold mr-2 sm:mr-0 ${activeToday ? 'text-indigo-600' : 'text-slate-700'}`}>
                  {String(day).padStart(2, '0')}
                </div>
                <div className={`text-sm font-medium ${activeToday ? 'text-indigo-500' : 'text-slate-400'}`}>
                  {getWeekday(day)}
                  {activeToday && <span className="ml-2 sm:ml-0 sm:block text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded uppercase">Today</span>}
                </div>
              </div>

              {/* 行程內容 */}
              <div className="flex-1 space-y-3">
                {daySchedules.length > 0 ? (
                  daySchedules.map(s => (
                    <div 
                      key={s.id}
                      onClick={() => onEdit(s)}
                      className={`group relative p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
                        s.userId === currentUser.id 
                          ? 'bg-white border-indigo-200 shadow-sm' 
                          : 'bg-white border-slate-200 shadow-sm'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-10 rounded-full ${s.userId === currentUser.id ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-bold text-slate-900">{s.startTime} - {s.endTime}</span>
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">{s.userName}</span>
                            </div>
                            <h4 className="text-base font-semibold text-slate-800 mt-0.5">{s.destination}</h4>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 md:text-right">
                          {s.vehicleId && (
                            <div className="flex items-center text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                              <i className="fas fa-car mr-1.5"></i>
                              {s.vehicleName}
                            </div>
                          )}
                          <div className="text-xs text-slate-500">
                            <i className="fas fa-info-circle mr-1.5"></i>
                            {s.purpose || '無填寫事由'}
                          </div>
                        </div>
                      </div>

                      {/* 操作按鈕 (僅限本人或管理員) */}
                      {(s.userId === currentUser.id || currentUser.role === UserRole.ADMIN) && (
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); onEdit(s); }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 transition"
                            title="編輯"
                          >
                            <i className="fas fa-edit text-xs"></i>
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if(confirm('確定要刪除此行程？')) onDelete(s.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-500 transition"
                            title="刪除"
                          >
                            <i className="fas fa-trash-alt text-xs"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-4 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-300 text-sm italic">
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
