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
import VehicleManagement from './components/VehicleManagement'; // 新增
import MileageLog from './components/MileageLog'; // 新增
import ProfileSettings from './components/ProfileSettings'; // 新增

const App: React.FC = () => {
  // --- 狀態管理 ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | undefined>(undefined);
  
  // 擴充 view 狀態，包含所有新頁面
  const [view, setView] = useState<'calendar' | 'user-mgmt' | 'vehicle-mgmt' | 'mileage-log' | 'profile'>('calendar');

  // --- 初始化：從雲端抓取所有資料 ---
  const refreshData = async () => {
    try {
      const [u, s, v] = await Promise.all([
        storage.getUsers(),
        storage.getSchedules(),
        storage.getVehicles() // 現在車輛也是從雲端抓取
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

  // --- 登入/登出 ---
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('fleetflow_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('fleetflow_user');
    setView('calendar');
  };

  // --- 行程操作 ---
  const handleSaveSchedule = async (schedule: Schedule) => {
    await storage.saveSchedule(schedule);
    await refreshData();
    setIsFormOpen(false);
    setEditingSchedule(undefined);
  };

  const handleDeleteSchedule = async (id: string) => {
    if (window.confirm("確定要刪除此行程嗎？")) {
      await storage.deleteSchedule(id);
      await refreshData();
    }
  };

  // --- 人員管理 ---
  const handleAddUser = async (newUser: User) => {
    await storage.saveUser(newUser);
    await refreshData();
    alert(`人員 ${newUser.name} 已新增`);
  };

  const handleDeleteUser = async (id: string) => {
    if (id === currentUser?.id) return alert("不能刪除自己");
    if (window.confirm("確定要刪除此人員？")) {
      await storage.deleteUser(id);
      await refreshData();
    }
  };

  // --- 車輛管理操作 ---
  const handleSaveVehicle = async (vehicle: Vehicle) => {
    await storage.saveVehicle(vehicle);
    await refreshData();
  };

  const handleDeleteVehicle = async (id: string) => {
    if (window.confirm("確定要刪除此車輛？")) {
      await storage.deleteVehicle(id);
      await refreshData();
    }
  };

  // --- 個人設定更新 ---
  const handleUpdateProfile = async (updatedUser: User) => {
    await storage.saveUser(updatedUser);
    setCurrentUser(updatedUser);
    localStorage.setItem('fleetflow_user', JSON.stringify(updatedUser));
    await refreshData();
    alert("個人資料已更新");
  };

  // --- 權限驗證進入管理頁面 ---
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

  // --- 渲染判斷 ---
  if (!currentUser) {
    return <Login onLogin={handleLogin} users={users.length > 0 ? users : MOCK_USERS} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* 側邊欄：傳遞新視圖的切換功能 */}
      <Sidebar 
        onAddSchedule={() => { setEditingSchedule(undefined); setIsFormOpen(true); }} 
        activeView={view}
        setView={setView}
        onOpenUserMgmt={() => handleVerifyAdmin('user-mgmt')}
        onOpenVehicleMgmt={() => handleVerifyAdmin('vehicle-mgmt')}
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* 標題列：點擊頭像或姓名可進入個人設定 */}
        <Header 
          user={currentUser} 
          onLogout={handleLogout} 
          onOpenProfile={() => setView('profile')} 
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            {/* 根據 view 狀態切換顯示內容 */}
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
