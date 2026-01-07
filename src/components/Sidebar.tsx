import React from 'react';

interface SidebarProps {
  onAddSchedule: () => void;
  activeView: 'calendar' | 'list' | 'user-mgmt';
  setView: (view: 'calendar' | 'list' | 'user-mgmt') => void;
  onOpenUserMgmt: () => void; // 新增：開啟人員管理的 Function
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onAddSchedule, 
  activeView, 
  setView, 
  onOpenUserMgmt 
}) => {
  return (
    <div className="hidden md:flex flex-col w-64 bg-slate-900 text-white p-6">
      {/* 系統標題 */}
      <div className="flex items-center space-x-3 mb-10">
        <div className="bg-indigo-500 p-2 rounded-lg">
          <i className="fas fa-car-side text-xl"></i>
        </div>
        <h1 className="text-xl font-bold tracking-tight">FleetFlow</h1>
      </div>

      {/* 新增行程按鈕 */}
      <button
        onClick={onAddSchedule}
        className="mb-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition shadow-lg shadow-indigo-900/20 flex items-center justify-center space-x-2"
      >
        <i className="fas fa-plus"></i>
        <span>新增行程</span>
      </button>

      {/* 選單列表 */}
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

        {/* 人員管理按鈕：點擊時觸發金鑰驗證 */}
        <button
          onClick={onOpenUserMgmt}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition ${
            activeView === 'user-mgmt' ? 'bg-slate-800 text-indigo-400' : 'hover:bg-slate-800 text-slate-400'
          }`}
        >
          <i className="fas fa-users-cog"></i>
          <span>人員管理</span>
        </button>

        <button
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition hover:bg-slate-800 text-slate-400 cursor-not-allowed opacity-50"
          disabled
        >
          <i className="fas fa-truck"></i>
          <span>車輛管理 (開發中)</span>
        </button>

        <button
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition hover:bg-slate-800 text-slate-400 cursor-not-allowed opacity-50"
          disabled
        >
          <i className="fas fa-chart-pie"></i>
          <span>統計報表 (開發中)</span>
        </button>
      </nav>

      {/* 底部狀態 */}
      <div className="mt-auto pt-6 border-t border-slate-800">
        <div className="p-4 bg-slate-800 rounded-xl">
          <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">系統狀態</p>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-300">管理員模式已就緒</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
