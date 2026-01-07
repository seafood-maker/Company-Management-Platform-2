import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface Props {
  users: User[];
  onAddUser: (user: User) => void;
}

const UserManagement: React.FC<Props> = ({ users, onAddUser }) => {
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>(UserRole.USER);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: 'u' + Date.now(),
      username: 'user_' + Date.now(),
      name: newName,
      role: newRole,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newName}`
    };
    onAddUser(newUser);
    setNewName('');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-xl font-bold mb-6">人員管理</h3>
      
      {/* 新增表單 */}
      <form onSubmit={handleSubmit} className="mb-8 p-4 bg-slate-50 rounded-xl flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">姓名</label>
          <input 
            value={newName} 
            onChange={e => setNewName(e.target.value)}
            className="border p-2 rounded-lg" required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">角色</label>
          <select 
            value={newRole} 
            onChange={e => setNewRole(e.target.value as UserRole)}
            className="border p-2 rounded-lg"
          >
            <option value={UserRole.USER}>一般使用者</option>
            <option value={UserRole.ADMIN}>管理員</option>
          </select>
        </div>
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg">新增人員</button>
      </form>

      {/* 人員列表 */}
      <table className="w-full text-left">
        <thead>
          <tr className="border-b">
            <th className="py-2">頭像</th>
            <th>姓名</th>
            <th>角色</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-b">
              <td className="py-2"><img src={u.avatar} className="w-8 h-8 rounded-full" /></td>
              <td>{u.name}</td>
              <td>{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
