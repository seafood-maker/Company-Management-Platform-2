import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface Props {
  users: User[];
  onAddUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
}

const UserManagement: React.FC<Props> = ({ users, onAddUser, onDeleteUser }) => {
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>(UserRole.USER);
  
  // 編輯狀態
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length !== 4) return alert("請設定 4 位數密碼");
    
    const newUser: User = {
      id: 'u' + Date.now(),
      username: 'user_' + Date.now(),
      name: newName,
      role: newRole,
      password: newPassword,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newName}`
    };

    onAddUser(newUser);
    setNewName('');
    setNewPassword('');
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      if (editingUser.password && editingUser.password.length !== 4) {
        return alert("密碼必須為 4 位數");
      }
      onAddUser(editingUser); // 使用 saveUser 邏輯覆蓋更新
      setEditingUser(null);
      alert("人員資料已更新");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-black flex items-center">
          <i className="fas fa-users-cog mr-2 text-indigo-500"></i> 人員管理
        </h3>
      </div>
      
      {/* 新增人員表單 */}
      <form onSubmit={handleSubmit} className="mb-8 p-5 bg-slate-50 rounded-2xl flex flex-wrap gap-4 items-end border border-slate-100">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">姓名</label>
          <input 
            value={newName} 
            onChange={e => setNewName(e.target.value)} 
            className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white" 
            placeholder="輸入姓名" 
            required 
          />
        </div>
        <div className="w-full sm:w-28">
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">4位數密碼</label>
          <input 
            type="password" 
            maxLength={4} 
            value={newPassword} 
            onChange={e => setNewPassword(e.target.value)} 
            className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white" 
            placeholder="0000" 
            required 
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">角色</label>
          <select 
            value={newRole} 
            onChange={e => setNewRole(e.target.value as UserRole)} 
            className="border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value={UserRole.USER}>一般使用者</option>
            <option value={UserRole.ADMIN}>管理員</option>
          </select>
        </div>
        <button 
          type="submit" 
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-md whitespace-nowrap active:scale-95"
        >
          <i className="fas fa-plus mr-2"></i>新增人員
        </button>
      </form>

      {/* 【修正重點】表格外層加上橫向捲軸控制 div，解決手機跑版問題 */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <table className="w-full text-left text-sm min-w-[500px]">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400">
              <th className="py-3 font-semibold px-2">同仁</th>
              <th className="py-3 font-semibold">角色</th>
              <th className="py-3 font-semibold">登入密碼</th>
              <th className="py-3 font-semibold text-right px-2">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map(u => (
              <tr key={u.id} className="group hover:bg-slate-50/50 transition">
                <td className="py-4 px-2">
                  <div className="flex items-center space-x-3">
                    <img src={u.avatar} className="w-9 h-9 rounded-full border border-slate-100 object-cover" alt="" />
                    <span className="font-bold text-slate-700">{u.name}</span>
                  </div>
                </td>
                <td className="py-4">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${u.role === UserRole.ADMIN ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-100 text-slate-500'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-4 font-mono text-indigo-600 font-bold tracking-widest">
                  {u.password || "0000"}
                </td>
                <td className="py-4 text-right px-2 space-x-1">
                  <button 
                    onClick={() => setEditingUser(u)} 
                    className="text-slate-400 hover:text-indigo-600 p-2 transition"
                    title="編輯資料"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button 
                    onClick={() => onDeleteUser(u.id)} 
                    className="text-slate-300 hover:text-red-500 p-2 transition"
                    title="刪除同仁"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 編輯人員彈窗 (Modal) - 完整保留 */}
      {editingUser && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in duration-200">
            <h4 className="text-lg font-bold mb-5 text-black flex items-center border-b pb-3">
              <i className="fas fa-user-edit mr-2 text-indigo-500"></i> 修改人員資料
            </h4>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">姓名</label>
                <input 
                  value={editingUser.name} 
                  onChange={e => setEditingUser({...editingUser, name: e.target.value})} 
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">登入密碼 (4位數)</label>
                <input 
                  type="text" 
                  maxLength={4} 
                  value={editingUser.password || ''} 
                  onChange={e => setEditingUser({...editingUser, password: e.target.value})} 
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-500" 
                  placeholder="0000" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">角色權限</label>
                <select 
                  value={editingUser.role} 
                  onChange={e => setEditingUser({...editingUser, role: e.target.value as UserRole})} 
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value={UserRole.USER}>一般使用者</option>
                  <option value={UserRole.ADMIN}>管理員</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4 border-t">
                <button 
                  type="button" 
                  onClick={() => setEditingUser(null)} 
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50"
                >
                  取消
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 transition active:scale-95"
                >
                  儲存修改
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
