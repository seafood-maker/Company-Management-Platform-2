import React from 'react';

// 定義 Prop，包含導航、視圖切換以及統一的管理員驗證功能
interface SidebarProps {
  onAddSchedule: () => void;
  activeView: string; // 支援多種視圖字串
  setView: (view: any) => void;
  onVerifyAdmin: (targetView: string) => void; // 統一的管理員驗證入口
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onAddSchedule, 
  activeView, 
  setView, 
  onVerifyAdmin 
}) => {
  return (
    <div className="hidden md:flex flex-col w-64 bg-slate-900 text-white p-6">
      
      {/* 1. 系統標題與 Logo (保留原始精美陰影) */}
      <div className="flex items-center space-x-3 mb-10">
        <div className="bg-indigo-500 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
          <i className="fas fa-car-side text-xl"></i>
        </div>
        <h1 className="text-xl font-bold tracking-tight">專案組行程管理系統</h1>
      </div>

      {/* 2. 主要操作：新增行程 (保留原始動畫與陰影) */}
      <button
        onClick={onAddSchedule}
        className="mb-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-indigo-900/40 flex items-center justify-center space-x-2 active:scale-95"
      >
        <i className="fas fa-plus"></i>
        <span>新增外差行程</span>
      </button>

      {/* 3. 選單導覽列表 */}
      <nav className="flex-1 space-y-2">
        
        {/* --- 一般功能區 --- */}
        <button
          onClick={() => setView('calendar')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition ${
            activeView === 'calendar' ? 'bg-slate-800 text-indigo-400' : 'hover:bg-slate-800 text-slate-400'
          }`}
        >
          <i className="fas fa-calendar-alt w-5"></i>
          <span className="font-medium">行程月曆</span>
        </button>

        <button
          onClick={() => setView('mileage-log')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition ${
            activeView === 'mileage-log' ? 'bg-slate-800 text-indigo-400' : 'hover:bg-slate-800 text-slate-400'
          }`}
        >
          <i className="fas fa-tachometer-alt w-5"></i>
          <span className="font-medium">車輛里程填報</span>
        </button>

        {/* --- 系統管理區 (需驗證) --- */}
        <div className="pt-6 pb-2">
          <p className="px-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">系統管理 (需驗證)</p>
        </div>

        {/* 人員管理 */}
        <button
          onClick={() => onVerifyAdmin('user-mgmt')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition ${
            activeView === 'user-mgmt' ? 'bg-slate-800 text-indigo-400' : 'hover:bg-slate-800 text-slate-400'
          }`}
        >
          <i className="fas fa-users-cog w-5"></i>
          <span className="font-medium">人員管理</span>
        </button>

        {/* 車輛管理 */}
        <button
          onClick={() => onVerifyAdmin('vehicle-mgmt')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition ${
            activeView === 'vehicle-mgmt' ? 'bg-slate-800 text-indigo-400' : 'hover:bg-slate-800 text-slate-400'
          }`}
        >
          <i className="fas fa-truck w-5"></i>
          <span className="font-medium">車輛管理</span>
        </button>

        {/* 計畫管理 (新功能) */}
        <button
          onClick={() => onVerifyAdmin('project-mgmt')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition ${
            activeView === 'project-mgmt' ? 'bg-slate-800 text-indigo-400' : 'hover:bg-slate-800 text-slate-400'
          }`}
        >
          <i className="fas fa-project-diagram w-5"></i>
          <span className="font-medium">計畫管理</span>
        </button>

        {/* 統計資料 (新功能) */}
        <button
          onClick={() => onVerifyAdmin('stats')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition ${
            activeView === 'stats' ? 'bg-slate-800 text-indigo-400' : 'hover:bg-slate-800 text-slate-400'
          }`}
        >
          <i className="fas fa-chart-bar w-5"></i>
          <span className="font-medium">統計資料</span>
        </button>
      </nav>

      {/* 4. 底部狀態列 (完整還原原先精美的 UI) */}
      <div className="mt-auto pt-6 border-t border-slate-800">
        <div className="p-4 bg-slate-800 rounded-xl border border-slate-700/50">
          <p className="text-[10px] text-slate-500 font-bold mb-2 uppercase tracking-wider">雲端同步狀態</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-300">Google Cloud 已連線</span>
            </div>
            <i className="fas fa-shield-alt text-slate-600 text-[10px]"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
