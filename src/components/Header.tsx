import React from 'react';
import { User } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onOpenProfile: () => void; // 新增：開啟個人設定的功能
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onOpenProfile }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0 z-20">
      
      {/* 1. 行動端 Logo (原本被簡化掉的部分) */}
      <div className="md:hidden flex items-center space-x-2">
        <i className="fas fa-car-side text-indigo-600 text-xl"></i>
        <span className="font-bold text-slate-900">FleetFlow</span>
      </div>
      
      {/* 2. 電腦端標題 */}
      <div className="hidden md:block">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">
          行程概覽
        </h2>
      </div>

      {/* 3. 右側使用者資訊區塊 */}
      <div className="flex items-center space-x-4">
        
        {/* 個人設定入口：點擊姓名或頭像觸發 */}
        <div 
          onClick={onOpenProfile}
          className="flex items-center space-x-3 cursor-pointer group transition-all"
          title="修改個人資料"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              {user.name}
            </p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {user.role}
            </p>
          </div>
          
          <div className="relative">
            <img 
              src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky'} 
              alt={user.name}
              className="w-9 h-9 rounded-full border border-slate-200 shadow-sm group-hover:border-indigo-300 group-hover:ring-2 group-hover:ring-indigo-50 transition-all"
            />
            {/* 裝飾性的小綠點，代表在線 */}
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
        </div>

        {/* 分隔線 */}
        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        {/* 登出按鈕 */}
        <button 
          onClick={onLogout}
          className="text-slate-400 hover:text-red-500 hover:bg-red-50 w-9 h-9 rounded-lg transition-all flex items-center justify-center"
          title="登出系統"
        >
          <i className="fas fa-sign-out-alt"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;
