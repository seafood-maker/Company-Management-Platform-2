import React, { useState, useEffect } from 'react';
import { User, Schedule, Vehicle, UserRole } from './types';
import { MOCK_USERS } from './constants';
import { storage } from './services/storage';
import Login from './components/Auth';
import CalendarView from './components/Calendar';
import ScheduleForm from './components/ScheduleForm';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import UserManagement from './components/UserManagement';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | undefined>(undefined);
  const [view, setView] = useState<'calendar' | 'list' | 'user-mgmt'>('calendar');

  // 初始化：從 Google Firebase 讀取資料
  useEffect(() => {
    const initLoad = async () => {
      try {
        const [u, s] = await Promise.all([
          storage.getUsers(),
          storage.getSchedules()
        ]);
        setUsers(u);
        setSchedules(s);
        setVehicles(storage.getVehicles());
      } catch (error) {
        console.error("初始化資料失敗:", error);
      }
    };
    initLoad();
    
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

  const handleSaveSchedule = async (schedule: Schedule) => {
    try {
      await storage.saveSchedule(schedule);
      const updatedSchedules = await storage.getSchedules();
      setSchedules(updatedSchedules);
      setIsFormOpen(false);
      setEditingSchedule(undefined);
    } catch (error) {
      alert("儲存行程失敗。");
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (window.confirm("確定要刪除此行程嗎？")) {
      try {
        await storage.deleteSchedule(id);
        const updatedSchedules = await storage.getSchedules();
        setSchedules(updatedSchedules);
      } catch (error) {
        alert("刪除行程失敗。");
      }
    }
  };

  const handleAddUser = async (newUser: User) => {
    try {
      await storage.saveUser(newUser);
      const latestUsers = await storage.getUsers();
      setUsers(latestUsers);
      alert(`人員 ${newUser.name} 已同步至 Google 雲端！`);
    } catch (error) {
      alert("新增人員失敗。");
    }
  };

  // --- 新增：處理刪除人員的邏輯 ---
  const handleDeleteUser = async (id: string) => {
    // 預防措施：不讓使用者刪除「目前登入的自己」
    if (id === currentUser?.id) {
      alert("您無法刪除目前登入的帳號。");
      return;
    }

    if (window.confirm("確定要刪除此人員嗎？這不會刪除該人員過去的行程紀錄。")) {
      try {
        await storage.deleteUser(id); // 從 Google 雲端刪除
        const latestUsers = await storage.getUsers(); // 重新整理清單
        setUsers(latestUsers);
      } catch (error) {
        alert("刪除人員失敗。");
      }
    }
  };

  const handleOpenUserMgmt = () => {
    const adminKey = "123456"; 
    const input = prompt("請輸入管理員金鑰以進入人員管理：");
    if (input === adminKey) {
      setView('user-mgmt');
    } else if (input !== null) {
      alert("金鑰錯誤，拒絕存取。");
    }
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
    return <Login onLogin={handleLogin} users={users.length > 0 ? users : MOCK_USERS} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar 
        onAddSchedule={() => { setEditingSchedule(undefined); setIsFormOpen(true); }} 
        activeView={view}
        setView={setView}
        onOpenUserMgmt={handleOpenUserMgmt}
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header user={currentUser} onLogout={handleLogout} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            {view === 'user-mgmt' ? (
              /* 這裡傳遞了 users, onAddUser, 以及新加入的 onDeleteUser */
              <UserManagement 
                users={users} 
                onAddUser={handleAddUser} 
                onDeleteUser={handleDeleteUser} 
              />
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
