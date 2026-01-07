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
        // 同時抓取人員與行程資料
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
    
    // 檢查本地登入狀態
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

  // 儲存行程：存到 Google 雲端
  const handleSaveSchedule = async (schedule: Schedule) => {
    try {
      await storage.saveSchedule(schedule); // 呼叫 Firebase 儲存
      const updatedSchedules = await storage.getSchedules(); // 重新從雲端拉取最新清單
      setSchedules(updatedSchedules);
      setIsFormOpen(false);
      setEditingSchedule(undefined);
    } catch (error) {
      alert("儲存失敗，請檢查網路連線。");
    }
  };

  // 刪除行程：從 Google 雲端刪除
  const handleDeleteSchedule = async (id: string) => {
    if (window.confirm("確定要刪除此行程嗎？")) {
      try {
        await storage.deleteSchedule(id); // 從 Firebase 刪除
        const updatedSchedules = await storage.getSchedules();
        setSchedules(updatedSchedules);
      } catch (error) {
        alert("刪除失敗。");
      }
    }
  };

  // 新增人員：存到 Google 雲端
  const handleAddUser = async (newUser: User) => {
    try {
      await storage.saveUser(newUser); // 存到 Firebase
      const latestUsers = await storage.getUsers(); // 重新拉取最新名單
      setUsers(latestUsers);
      alert(`人員 ${newUser.name} 已同步至 Google 雲端！`);
    } catch (error) {
      alert("新增人員失敗。");
    }
  };

  const handleOpenUserMgmt = () => {
    const adminKey = "123456"; // 這是你的管理員金鑰
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
    // 登入畫面的人員清單
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
  );
};

export default App;
