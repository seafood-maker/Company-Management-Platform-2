
import React from 'react';
import { User } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0">
      <div className="md:hidden flex items-center space-x-2">
        <i className="fas fa-car-side text-indigo-600 text-xl"></i>
        <span className="font-bold text-slate-900">FleetFlow</span>
      </div>
      
      <div className="hidden md:block">
        <h2 className="text-lg font-semibold text-slate-800">
          行程概覽
        </h2>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-slate-900">{user.name}</p>
          <p className="text-xs text-slate-500">{user.role}</p>
        </div>
        <img 
          src={user.avatar} 
          alt={user.name}
          className="w-9 h-9 rounded-full border border-slate-200 shadow-sm"
        />
        <button 
          onClick={onLogout}
          className="text-slate-400 hover:text-red-500 transition p-2"
          title="登出"
        >
          <i className="fas fa-sign-out-alt"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;
