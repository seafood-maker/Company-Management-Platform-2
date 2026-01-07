import React, { useState } from 'react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  users: User[];
}

const Login: React.FC<LoginProps> = ({ onLogin, users }) => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.id === selectedUserId);
    
    if (user) {
      // 驗證邏輯：
      // 1. 如果資料庫有密碼，就比對密碼
      // 2. 如果是舊帳號（還沒設定密碼），預設密碼為 "0000"
      const correctPassword = user.password || "0000";

      if (password === correctPassword) {
        onLogin(user);
      } else {
        alert("密碼輸入錯誤，請重新輸入。");
        setPassword(''); // 清空密碼框
      }
    } else {
      alert("請先選擇人員。");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-500">
        
        {/* 系統標題區塊 - 已更名為專案組行程管理系統 */}
        <div className="bg-indigo-600 p-8 text-white text-center">
          <div className="inline-block bg-white/20 p-4 rounded-full mb-4">
            <i className="fas fa-car-side text-4xl"></i>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">專案組行程管理系統</h1>
          <p className="text-indigo-100 mt-2 text-sm">請選擇人員並輸入 4 位數密碼登入</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* 人員選擇 */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">選擇人員</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none bg-slate-50 text-slate-700"
              required
            >
              <option value="">請選擇人員...</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
          
          {/* 密碼輸入框 - 新增功能 */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">4 位數密碼</label>
            <input 
              type="password"
              maxLength={4}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入 4 位數密碼"
              className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none bg-slate-50 text-slate-700"
              required
            />
          </div>
          
          <div className="p-4 bg-amber-50 rounded-lg text-[11px] text-amber-700 flex items-start space-x-2">
            <i className="fas fa-info-circle mt-0.5"></i>
            <span>提示：初始帳號密碼預設為 0000。登入後可至人員管理修改。</span>
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-indigo-200 active:scale-95"
          >
            登入系統
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

