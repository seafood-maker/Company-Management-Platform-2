import React, { useState } from 'react';
// 這裡的 import 路徑必須與你的檔案名稱完全一致（注意大小寫）
import Login from './components/Auth';
import CalendarView from './components/Calendar';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ScheduleForm from './components/ScheduleForm';
import { User, UserRole, Schedule, Vehicle } from './types';

// 1. 建立一些測試用的初始資料
const MOCK_USERS: User[] = [
  { id: '1', name: '管理員', role: UserRole.ADMIN, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin' },
  { id: '2', name: '王小明', role: UserRole.USER, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' }
];

const MOCK_VEHICLES: Vehicle[] = [
  { id: 'v1', name: 'Toyota Camry', plateNumber: 'ABC-1234', status: 'active' },
  { id: 'v2', name: 'Tesla Model 3', plateNumber: 'EVS-8888', status: 'active' },
  { id: 'v3', name: '公務巴士', plateNumber: 'BUS-001', status: 'maintenance' }
];

export default function App() {
  // --- 狀態管理 (State) ---
  const [user, setUser] = useState<User | null>(null); // 控制是否登入
  const [schedules, setSchedules] = useState<Schedule[]>([]); // 儲存所有行程
  const [view, setView] = useState<'calendar' | 'list'>('calendar'); // 控制目前頁面
  const [isFormOpen, setIsFormOpen] = useState(false); // 控制新增視窗是否打開
  const [editingSchedule, setEditingSchedule] = useState<Schedule | undefined>(undefined); // 正在編輯的行程

  // --- 行為處理 (Functions) ---
  const handleAddSchedule = () => {
    setEditingSchedule(undefined);
    setIsFormOpen(true);
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setIsFormOpen(true);
  };

  const handleSaveSchedule = (newSchedule: Schedule) => {
    if (editingSchedule) {
      // 如果是編輯舊行程
      setSchedules(schedules.map(s => s.id === newSchedule.id ? newSchedule : s));
    } else {
      // 如果是新增行程
      setSchedules([...schedules, newSchedule]);
    }
    setIsFormOpen(false);
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules(schedules.filter(s => s.id !== id));
  };

  // --- 畫面渲染 (Rendering) ---
  
  // 如果還沒登入，顯示登入畫面
  if (!user) {
    return <Login users={MOCK_USERS} onLogin={setUser} />;
  }

  // 登入後顯示主系統畫面
  return (
    <div className="flex h-screen bg-slate-50">
      {/* 左側選單 */}
      <Sidebar 
        onAddSchedule={handleAddSchedule} 
        activeView={view} 
        setView={setView} 
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 上方導覽列 */}
        <Header user={user} onLogout={() => setUser(null)} />

        {/* 主要內容區塊 */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <CalendarView 
            schedules={schedules} 
            currentUser={user}
            onEdit={handleEditSchedule}
            onDelete={handleDeleteSchedule}
          />
        </main>
      </div>

      {/* 彈出式新增/編輯表單 */}
      {isFormOpen && (
        <ScheduleForm 
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveSchedule}
          vehicles={MOCK_VEHICLES}
          schedules={schedules}
          currentUser={user}
          initialData={editingSchedule}
        />
      )}
    </div>
  );
}
