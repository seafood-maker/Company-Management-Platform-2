
import React, { useState } from 'react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  users: User[];
}

const Login: React.FC<LoginProps> = ({ onLogin, users }) => {
  const [selectedUserId, setSelectedUserId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.id === selectedUserId);
    if (user) {
      onLogin(user);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-indigo-600 p-8 text-white text-center">
          <div className="inline-block bg-white/20 p-4 rounded-full mb-4">
            <i className="fas fa-car-side text-4xl"></i>
          </div>
          <h1 className="text-2xl font-bold">FleetFlow</h1>
          <p className="text-indigo-100 mt-2">行程與派車管理系統</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8">
          <label className="block text-sm font-medium text-slate-700 mb-2">選擇登入帳號</label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none"
            required
          >
            <option value="">請選擇人員...</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
          
          <div className="mt-4 p-4 bg-amber-50 rounded-lg text-xs text-amber-700 flex items-start space-x-2">
            <i className="fas fa-info-circle mt-0.5"></i>
            <span>示範模式：直接選擇人員即可登入進入系統。</span>
          </div>

          <button
            type="submit"
            className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-indigo-200"
          >
            登入系統
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
