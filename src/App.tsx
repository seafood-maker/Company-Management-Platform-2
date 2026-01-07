import React, { useState, useEffect } from 'react';
import { User, Schedule, Vehicle, UserRole } from './types';
import { MOCK_USERS } from './constants';
import { storage } from './services/storage';
import Login from './components/Auth';
import CalendarView from './components/Calendar';
import ScheduleForm from './components/ScheduleForm';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | undefined>(undefined);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  // 初始化讀取資料
  useEffect(() => {
    setSchedules(storage.getSchedules());
    setVehicles(storage.getVehicles());
    
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

  const openEditForm = (schedule: Schedule) => {
    if (currentUser?.id !== schedule.userId && currentUser?.role !== UserRole.ADMIN) {
      alert("您沒有權限修改他人的行程。");
      return;
    }
    setEditingSchedule(schedule);
    setIsFormOpen(true);
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} users={MOCK_USERS} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar 
        onAddSchedule={() => { setEditingSchedule(undefined); setIsFormOpen(true); }} 
        activeView={view}
        setView={setView}
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header user={currentUser} onLogout={handleLogout} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            <CalendarView 
              schedules={schedules} 
              onEdit={openEditForm}
              onDelete={handleDeleteSchedule}
              currentUser={currentUser}
            />
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
