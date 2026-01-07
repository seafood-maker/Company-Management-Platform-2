
import React from 'react';

interface SidebarProps {
  onAddSchedule: () => void;
  activeView: 'calendar' | 'list';
  setView: (view: 'calendar' | 'list') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onAddSchedule, activeView, setView }) => {
  return (
    <div className="hidden md:flex flex-col w-64 bg-slate-900 text-white p-6">
      <div className="flex items-center space-x-3 mb-10">
        <div className="bg-indigo-500 p-2 rounded-lg">
          <i className="fas fa-car-side text-xl"></i>
        </div>
        <h1 className="text-xl font-bold tracking-tight">FleetFlow</h1>
      </div>

      <button
        onClick={onAddSchedule}
        className="mb-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition shadow-lg shadow-indigo-900/20 flex items-center justify-center space-x-2"
      >
        <i className="fas fa-plus"></i>
        <span>新增行程</span>
      </button>

      <nav className="flex-1 space-y-2">
        <button
          onClick={() => setView('calendar')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition ${
            activeView === 'calendar' ? 'bg-slate-800 text-indigo-400' : 'hover:bg-slate-800 text-slate-400'
          }`}
        >
          <i className="fas fa-calendar-alt"></i>
          <span>行程月曆</span>
        </button>
        <button
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition hover:bg-slate-800 text-slate-400"
        >
          <i className="fas fa-truck"></i>
          <span>車輛管理</span>
        </button>
        <button
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition hover:bg-slate-800 text-slate-400"
        >
          <i className="fas fa-chart-pie"></i>
          <span>統計報表</span>
        </button>
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-800">
        <div className="p-4 bg-slate-800 rounded-xl">
          <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">系統狀態</p>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-300">連線正常</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
