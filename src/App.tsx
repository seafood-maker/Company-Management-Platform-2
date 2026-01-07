import React, { useState, useEffect } from 'react';
import { User, Schedule, Vehicle, UserRole } from './types';
import { MOCK_USERS } from './constants';
import { storage } from './services/storage';
import Login from './components/Auth';
import CalendarView from './components/Calendar';
import ScheduleForm from './components/ScheduleForm';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import UserManagement from './components/UserManagement'; // 確保之後會建立這個檔案

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<User[]>([]); // 存放所有人員
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | undefined>(undefined);
  const [view, setView] = useState<'calendar' | 'list' | 'user-mgmt'>('calendar');

  // 初始化讀取資料
  useEffect(() => {
    setSchedules(storage.getSchedules());
    setVehicles(storage.getVehicles());
    setUsers(storage.getUsers()); // 從 storage 讀取人員清單
    
    const savedUser = localStorage.getItem('fleetflow_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('fleetflow_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('fleetflow_user');
  };

  const handleSaveSchedule = (schedule: Schedule) => {
    let updated: Schedule[];
    const exists = schedules.find(s => s.id === schedule.id);
    if (exists) {
      updated = schedules.map(s => s.id === schedule.id ? schedule : s);
    } else {
      updated = [...schedules, schedule];
    }
    setSchedules(updated);
    storage.saveSchedules(updated);
    setIsFormOpen(false);
    setEditingSchedule(undefined);
  };

  const handleDeleteSchedule = (id: string) => {
    const updated = schedules.filter(s => s.id !== id);
    setSchedules(updated);
    storage.saveSchedules(updated);
  };

  // --- 管理員金鑰驗證功能 ---
  const handleOpenUserMgmt = () => {
    const adminKey = "123456"; // 這裡可以修改你的管理員金鑰
    const input = prompt("請輸入管理員金鑰以進入人員管理：");
    if (input === adminKey) {
      setView('user-mgmt');
    } else if (input !== null) {
      alert("金鑰錯誤，拒絕存取。");
    }
  };

  // --- 新增人員功能 ---
  const handleAddUser = (newUser: User) => {
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    storage.saveUsers(updatedUsers); // 儲存到 localStorage
    alert(`人員 ${newUser.name} 新增成功！`);
  };

  const openEditForm = (schedule: Schedule) => {
    if (currentUser?.id !== schedule.userId && currentUser?.role !== UserRole.ADMIN) {
      alert("您沒有權限修改他人的行程。");
      return;
    }
    setEditingSchedule(schedule);
    setIsFormOpen(true);
  };

  if (!currentUser) {
    // 登入畫面的人員選單現在會使用動態讀取的 users
    return <Login onLogin={handleLogin} users={users.length > 0 ? users : MOCK_USERS} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar 
        onAddSchedule={() => { setEditingSchedule(undefined); setIsFormOpen(true); }} 
        activeView={view}
        setView={setView}
        onOpenUserMgmt={handleOpenUserMgmt} // 傳遞金鑰驗證功能給側邊欄
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header user={currentUser} onLogout={handleLogout} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            {/* 根據 view 狀態切換顯示內容 */}
            {view === 'user-mgmt' ? (
              <UserManagement users={users} onAddUser={handleAddUser} />
            ) : (
              <CalendarView 
                schedules={schedules} 
                onEdit={openEditForm}
                onDelete={handleDeleteSchedule}
                currentUser={currentUser}
              />
            )}
          </div>
        </main>
      </div>

      {isFormOpen && (
        <ScheduleForm
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveSchedule}
          vehicles={vehicles}
          schedules={schedules}
          currentUser={currentUser}
          initialData={editingSchedule}
        />
      )}
    </div>
  );
};

export default App;
