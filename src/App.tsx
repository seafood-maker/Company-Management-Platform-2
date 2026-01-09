import React, { useState, useEffect } from 'react';
import { User, Schedule, Vehicle, UserRole, Project } from './types'; 
import { MOCK_USERS } from './constants';
import { storage } from './services/storage';
import Login from './components/Auth';
import CalendarView from './components/Calendar';
import ScheduleForm from './components/ScheduleForm';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import UserManagement from './components/UserManagement';
import VehicleManagement from './components/VehicleManagement'; 
import ProjectManagement from './components/ProjectManagement'; 
import MileageLog from './components/MileageLog'; 
import ProfileSettings from './components/ProfileSettings'; 

const App: React.FC = () => {
  // --- 1. 狀態管理 ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]); 
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | undefined>(undefined);
  
  // 頁面視圖狀態
  const [view, setView] = useState<'calendar' | 'user-mgmt' | 'vehicle-mgmt' | 'project-mgmt' | 'stats' | 'mileage-log' | 'profile'>('calendar');

  // --- 2. 雲端資料同步邏輯 ---
  const refreshData = async () => {
    try {
      // 【修正點】加入遺漏的逗號，確保 Promise.all 正常運作
      const [u, s, v, p] = await Promise.all([
        storage.getUsers(),
        storage.getSchedules(),
        storage.getVehicles(),
        storage.getProjects() 
      ]);
      setUsers(u);
      setSchedules(s);
      setVehicles(v);
      setProjects(p);
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

  // --- 4. 行程操作 ---
  const handleSaveSchedule = async (schedule: Schedule) => {
    try {
      await storage.saveSchedule(schedule);
      await refreshData();
      setIsFormOpen(false);
      setEditingSchedule(undefined);
    } catch (error) {
      alert("儲存行程失敗");
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (window.confirm("確定要刪除此行程嗎？")) {
      try {
        await storage.deleteSchedule(id);
        await refreshData(); // 刪除後同步重新計算總里程
      } catch (error) {
        alert("刪除行程失敗");
      }
    }
  };

  // --- 5. 管理功能：人員、車輛、計畫 ---
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
        await refreshData();
      } catch (error) {
        alert("刪除人員失敗");
      }
    }
  };

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
        await refreshData();
      } catch (error) {
        alert("刪除車輛失敗");
      }
    }
  };

  const handleSaveProject = async (project: Project) => {
    try {
      await storage.saveProject(project);
      await refreshData();
    } catch (error) {
      alert("儲存計畫失敗");
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm("確定要刪除此計畫？")) {
      try {
        await storage.deleteProject(id);
        await refreshData();
      } catch (error) {
        alert("刪除計畫失敗");
      }
    }
  };

  // --- 6. 管理員金鑰驗證 ---
  const handleVerifyAdmin = (targetView: string) => {
    const adminKey = "123456"; 
    const input = prompt("請輸入管理員金鑰：");
    if (input === adminKey) {
      setView(targetView as any); 
    } else if (input !== null) {
      alert("金鑰錯誤");
    }
  };

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

  const openEditForm = (schedule: Schedule) => {
    if (currentUser?.id !== schedule.userId && currentUser?.role !== UserRole.ADMIN) {
      alert("權限不足");
      return;
    }
    setEditingSchedule(schedule);
    setIsFormOpen(true);
  };

  // --- 7. 登入檢查 ---
  if (!currentUser) {
    return <Login onLogin={handleLogin} users={users.length > 0 ? users : MOCK_USERS} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* 側邊欄 */}
      <Sidebar 
        onAddSchedule={() => { 
          setEditingSchedule(undefined); 
          setIsFormOpen(true); 
        }} 
        activeView={view}
        setView={setView}
        onVerifyAdmin={handleVerifyAdmin} 
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
            {/* 視圖切換 */}
            {view === 'calendar' && (
              <CalendarView 
                schedules={schedules} 
                onEdit={openEditForm}
                onDelete={handleDeleteSchedule}
                currentUser={currentUser}
                users={users} 
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
                schedules={schedules}
                users={users}
                onSave={handleSaveVehicle} 
                onDelete={handleDeleteVehicle} 
                onRefresh={refreshData} 
              />
            )}

            {view === 'project-mgmt' && (
              <ProjectManagement 
                projects={projects} 
                onSave={handleSaveProject} 
                onDelete={handleDeleteProject} 
              />
            )}

            {view === 'stats' && (
              <div className="bg-white p-10 rounded-2xl border text-center">
                <i className="fas fa-chart-bar text-4xl text-slate-200 mb-4"></i>
                <h3 className="text-xl font-bold text-slate-400">統計資料功能開發中...</h3>
              </div>
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

      {/* 彈出表單 (Modal) */}
      {isFormOpen && (
        <ScheduleForm
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveSchedule}
          vehicles={vehicles}
          schedules={schedules}
          users={users} 
          projects={projects}
          currentUser={currentUser}
          initialData={editingSchedule}
        />
      )}
    </div>
  );
};

export default App;
