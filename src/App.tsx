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
import VehicleManagement from './components/VehicleManagement'; 
import MileageLog from './components/MileageLog'; 
import ProfileSettings from './components/ProfileSettings'; 

const App: React.FC = () => {
  // --- 1. 狀態管理 (保留所有原始狀態) ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | undefined>(undefined);
  
  // 頁面視圖狀態：calendar, user-mgmt, vehicle-mgmt, mileage-log, profile
  const [view, setView] = useState<'calendar' | 'user-mgmt' | 'vehicle-mgmt' | 'mileage-log' | 'profile'>('calendar');

  // --- 2. 雲端資料同步邏輯 ---
  const refreshData = async () => {
    try {
      const [u, s, v] = await Promise.all([
        storage.getUsers(),
        storage.getSchedules(),
        storage.getVehicles() 
      ]);
      setUsers(u);
      setSchedules(s);
      setVehicles(v);
    } catch (error) {
      console.error("資料載入失敗:", error);
    }
  };

  useEffect(() => {
    refreshData();
    const savedUser = localStorage.getItem('fleetflow_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  // --- 3. 帳號登入/登出 ---
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('fleetflow_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('fleetflow_user');
    setView('calendar');
  };

  // --- 4. 行程操作 (含刪除立即同步) ---
  const handleSaveSchedule = async (schedule: Schedule) => {
    try {
      await storage.saveSchedule(schedule);
      await refreshData();
      setIsFormOpen(false);
      setEditingSchedule(undefined);
    } catch (error) {
      alert("儲存失敗");
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (window.confirm("確定要刪除此行程嗎？")) {
      try {
        await storage.deleteSchedule(id);
        // 【修正點】立即更新本地狀態，不必等待雲端重新載入
        setSchedules(prev => prev.filter(s => s.id !== id));
      } catch (error) {
        alert("刪除行程失敗");
      }
    }
  };

  // --- 5. 人員管理 (含刪除立即同步) ---
  const handleAddUser = async (newUser: User) => {
    try {
      await storage.saveUser(newUser);
      await refreshData();
      alert(`人員 ${newUser.name} 已新增`);
    } catch (error) {
      alert("新增人員失敗");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (id === currentUser?.id) return alert("不能刪除自己");
    if (window.confirm("確定要刪除此人員？")) {
      try {
        await storage.deleteUser(id);
        // 【修正點】立即更新本地狀態，讓人員立刻消失
        setUsers(prev => prev.filter(u => u.id !== id));
      } catch (error) {
        alert("刪除人員失敗");
      }
    }
  };

  // --- 6. 車輛管理操作 (含刪除立即同步) ---
  const handleSaveVehicle = async (vehicle: Vehicle) => {
    try {
      await storage.saveVehicle(vehicle);
      await refreshData();
    } catch (error) {
      alert("儲存車輛失敗");
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (window.confirm("確定要刪除此車輛？")) {
      try {
        await storage.deleteVehicle(id);
        // 【修正點】立即更新本地車輛清單
        setVehicles(prev => prev.filter(v => v.id !== id));
      } catch (error) {
        alert("刪除車輛失敗");
      }
    }
  };

  // --- 7. 個人設定與管理員驗證 ---
  const handleUpdateProfile = async (updatedUser: User) => {
    try {
      await storage.saveUser(updatedUser);
      setCurrentUser(updatedUser);
      localStorage.setItem('fleetflow_user', JSON.stringify(updatedUser));
      await refreshData();
      alert("個人資料已更新");
    } catch (error) {
      alert("更新失敗");
    }
  };

  const handleVerifyAdmin = (targetView: 'user-mgmt' | 'vehicle-mgmt') => {
    const adminKey = "123456"; 
    const input = prompt("請輸入管理員金鑰：");
    if (input === adminKey) {
      setView(targetView);
    } else if (input !== null) {
      alert("金鑰錯誤");
    }
  };

  const openEditForm = (schedule: Schedule) => {
    if (currentUser?.id !== schedule.userId && currentUser?.role !== UserRole.ADMIN) {
      alert("權限不足");
      return;
    }
    setEditingSchedule(schedule);
    setIsFormOpen(true);
  };

  // --- 8. 介面渲染 ---
  if (!currentUser) {
    return <Login onLogin={handleLogin} users={users.length > 0 ? users : MOCK_USERS} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* 側邊欄 */}
      <Sidebar 
        onAddSchedule={() => { setEditingSchedule(undefined); setIsFormOpen(true); }} 
        activeView={view}
        setView={setView}
        onOpenUserMgmt={() => handleVerifyAdmin('user-mgmt')}
        onOpenVehicleMgmt={() => handleVerifyAdmin('vehicle-mgmt')}
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* 標題列 */}
        <Header 
          user={currentUser} 
          onLogout={handleLogout} 
          onOpenProfile={() => setView('profile')} 
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            {/* 視圖切換邏輯 */}
            {view === 'calendar' && (
              <CalendarView 
                schedules={schedules} 
                onEdit={openEditForm}
                onDelete={handleDeleteSchedule}
                currentUser={currentUser}
              />
            )}

            {view === 'user-mgmt' && (
              <UserManagement 
                users={users} 
                onAddUser={handleAddUser} 
                onDeleteUser={handleDeleteUser} 
              />
            )}

            {view === 'vehicle-mgmt' && (
              <VehicleManagement 
                vehicles={vehicles} 
                onSave={handleSaveVehicle} 
                onDelete={handleDeleteVehicle} 
              />
            )}

            {view === 'mileage-log' && (
              <MileageLog 
                schedules={schedules} 
                currentUser={currentUser} 
                onRefresh={refreshData} 
              />
            )}

            {view === 'profile' && (
              <ProfileSettings 
                user={currentUser} 
                onUpdate={handleUpdateProfile} 
              />
            )}
          </div>
        </main>
      </div>

      {/* 彈出表單 */}
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
