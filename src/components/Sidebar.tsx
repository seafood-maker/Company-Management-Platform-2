import React from 'react';

// 定義 Prop，包含手機版所需的 isOpen 與 onClose
interface SidebarProps {
  onAddSchedule: () => void;
  activeView: string; 
  setView: (view: any) => void;
  onVerifyAdmin: (targetView: string) => void;
  isOpen: boolean;    // 手機版是否開啟
  onClose: () => void; // 關閉手機版選單的函式
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onAddSchedule, 
  activeView, 
  setView, 
  onVerifyAdmin, 
  isOpen, 
  onClose 
}) => {
  return (
    <>
      {/* 1. 手機版專用背景遮罩 (當選單打開時，背景變暗) */}
      <div 
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[40] transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      ></div>

      {/* 2. 側邊欄主體 */}
      <div className={`
        fixed inset-y-0 left-0 z-[50] w-64 bg-slate-900 text-white p-6 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:flex md:flex-col md:h-screen
      `}>
        
        {/* 標題與 Logo 區塊 (包含手機版關閉按鈕) */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-500 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
              <i className="fas fa-car-side text-xl"></i>
            </div>
            <h1 className="text-xl font-bold tracking-tight">專案組行程管理系統</h1>
          </div>
          
          {/* 手機版專用：叉叉關閉按鈕 */}
          <button 
            onClick={onClose} 
            className="md:hidden text-slate-400 hover:text-white p-2 transition-colors"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* 主要操作：新增行程 (保留您原始的強烈陰影設計) */}
        <button
          onClick={() => { onAddSchedule(); onClose(); }}
          className="mb-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-indigo-900/40 flex items-center justify-center space-x-2 active:scale-95"
        >
          <i className="fas fa-plus"></i>
          <span>新增外差行程</span>
        </button>

        {/* 選單導覽列表 (加入自定義捲軸防止內容過長) */}
        <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2">
          
          {/* --- 一般功能區 --- */}
          <button
            onClick={() => { setView('calendar'); onClose(); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition ${
              activeView === 'calendar' ? 'bg-slate-800 text-indigo-400' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <i className="fas fa-calendar-alt w-5"></i>
            <span className="font-medium">行程月曆</span>
          </button>

          <button
            onClick={() => { setView('mileage-log'); onClose(); }}
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
            onClick={() => { onVerifyAdmin('user-mgmt'); onClose(); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition ${
              activeView === 'user-mgmt' ? 'bg-slate-800 text-indigo-400' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <i className="fas fa-users-cog w-5"></i>
            <span className="font-medium">人員管理</span>
          </button>

          {/* 車輛管理 */}
          <button
            onClick={() => { onVerifyAdmin('vehicle-mgmt'); onClose(); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition ${
              activeView === 'vehicle-mgmt' ? 'bg-slate-800 text-indigo-400' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <i className="fas fa-truck w-5"></i>
            <span className="font-medium">車輛管理</span>
          </button>

          {/* 計畫管理 */}
          <button
            onClick={() => { onVerifyAdmin('project-mgmt'); onClose(); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition ${
              activeView === 'project-mgmt' ? 'bg-slate-800 text-indigo-400' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <i className="fas fa-project-diagram w-5"></i>
            <span className="font-medium">計畫管理</span>
          </button>

          {/* 統計資料 */}
          <button
            onClick={() => { onVerifyAdmin('stats'); onClose(); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition ${
              activeView === 'stats' ? 'bg-slate-800 text-indigo-400' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <i className="fas fa-chart-bar w-5"></i>
            <span className="font-medium">統計資料</span>
          </button>
        </nav>

        {/* 4. 底部狀態列 (完整還原原本精美的 UI，在手機版視情況顯示) */}
        <div className="mt-auto pt-6 border-t border-slate-800 hidden md:block">
          <div className="p-4 bg-slate-800 rounded-xl border border-slate-700/50 shadow-inner">
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

      {/* 自定義捲軸樣式 CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}} />
    </>
  );
};

export default Sidebar;
