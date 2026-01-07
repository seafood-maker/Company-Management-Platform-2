import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface Props {
  users: User[];
  onAddUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
}

const UserManagement: React.FC<Props> = ({ users, onAddUser, onDeleteUser }) => {
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState(''); // 新增：密碼狀態
  const [newRole, setNewRole] = useState<UserRole>(UserRole.USER);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 驗證密碼長度
    if (newPassword.length !== 4) {
      alert("請設定 4 位數登入密碼");
      return;
    }

    const newUser: User = {
      id: 'u' + Date.now(),
      username: 'user_' + Date.now(),
      name: newName,
      role: newRole,
      password: newPassword, // 將密碼存入人員資料
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newName}`
    };

    onAddUser(newUser);
    setNewName('');
    setNewPassword(''); // 清空輸入框
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800">人員管理</h3>
      </div>
      
      {/* 新增表單 */}
      <form onSubmit={handleSubmit} className="mb-8 p-4 bg-slate-50 rounded-xl flex flex-wrap gap-4 items-end border border-slate-100">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">姓名</label>
          <input 
            value={newName} 
            onChange={e => setNewName(e.target.value)}
            className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition bg-white" 
            placeholder="請輸入姓名"
            required
          />
        </div>

        {/* 新增：4位數密碼輸入框 */}
        <div className="w-32">
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">4位數密碼</label>
          <input 
            type="password"
            maxLength={4}
            value={newPassword} 
            onChange={e => setNewPassword(e.target.value)}
            className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition bg-white" 
            placeholder="0000"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">角色</label>
          <select 
            value={newRole} 
            onChange={e => setNewRole(e.target.value as UserRole)}
            className="border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition bg-white"
          >
            <option value={UserRole.USER}>一般使用者</option>
            <option value={UserRole.ADMIN}>管理員</option>
          </select>
        </div>

        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-lg transition shadow-md whitespace-nowrap">
          <i className="fas fa-user-plus mr-2"></i>新增人員
        </button>
      </form>

      {/* 人員列表 */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 text-sm">
              <th className="py-3 font-semibold">人員</th>
              <th className="py-3 font-semibold">角色</th>
              <th className="py-3 font-semibold">密碼狀態</th>
              <th className="py-3 font-semibold text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map(u => (
              <tr key={u.id} className="group hover:bg-slate-50/50 transition">
                <td className="py-4">
                  <div className="flex items-center space-x-3">
                    <img src={u.avatar} className="w-10 h-10 rounded-full border border-slate-100" alt={u.name} />
                    <span className="font-medium text-slate-700">{u.name}</span>
                  </div>
                </td>
                <td className="py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    u.role === UserRole.ADMIN ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-4">
                  <span className="text-slate-400 text-xs">
                    {u.password ? '•••• (已設定)' : '未設定'}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <button 
                    onClick={() => onDeleteUser(u.id)}
                    className="text-slate-300 hover:text-red-500 p-2 transition"
                    title="刪除人員"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
