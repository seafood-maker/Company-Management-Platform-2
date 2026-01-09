import React from 'react';
import { User } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onOpenProfile: () => void;
  onToggleMenu: () => void; // 新增：用於觸發手機版側邊欄開關
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onOpenProfile, onToggleMenu }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between flex-shrink-0 z-20 sticky top-0">
      
      {/* 左側區域：手機版漢堡選單 + Logo */}
      <div className="flex items-center space-x-2">
        {/* 手機版漢堡按鈕 (僅在 md 以下顯示) */}
        <button 
          onClick={onToggleMenu}
          className="md:hidden text-slate-600 w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-xl transition-all active:scale-90"
          title="開啟選單"
        >
          <i className="fas fa-bars text-xl"></i>
        </button>

        {/* 行動端 Logo 區 */}
        <div className="flex items-center space-x-2">
          <i className="fas fa-car-side text-indigo-600 text-xl"></i>
          <span className="font-bold text-slate-900 tracking-tight">專案組行程管理</span>
        </div>
      </div>
      
      {/* 電腦端標題 (僅在 md 以上顯示) */}
      <div className="hidden md:block">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">
          行程概覽
        </h2>
      </div>

      {/* 右側區域：使用者資訊與登出 */}
      <div className="flex items-center space-x-2 md:space-x-4">
        
        {/* 個人設定入口 */}
        <div 
          onClick={onOpenProfile}
          className="flex items-center space-x-2 md:space-x-3 cursor-pointer group transition-all"
          title="修改個人資料"
        >
          {/* 文字資訊 (手機版隱藏姓名，節省空間) */}
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              {user.name}
            </p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {user.role}
            </p>
          </div>
          
          {/* 頭像與在線小圓點 */}
          <div className="relative">
            <img 
              src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky'} 
              alt={user.name}
              className="w-9 h-9 rounded-full border border-slate-200 shadow-sm group-hover:border-indigo-300 group-hover:ring-2 group-hover:ring-indigo-50 transition-all object-cover"
            />
            {/* 裝飾性的小綠點 */}
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
        </div>

        {/* 分隔線 */}
        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        {/* 登出按鈕 */}
        <button 
          onClick={onLogout}
          className="text-slate-400 hover:text-red-500 hover:bg-red-50 w-9 h-9 rounded-lg transition-all flex items-center justify-center active:scale-90"
          title="登出系統"
        >
          <i className="fas fa-sign-out-alt text-lg"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;
