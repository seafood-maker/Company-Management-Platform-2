import React, { useState } from 'react';
import { User } from '../types';

const ProfileSettings: React.FC<{ user: User, onUpdate: (u: User) => void }> = ({ user, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar || '');

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <h3 className="text-xl font-bold mb-6">個人設定</h3>
      <div className="flex flex-col items-center mb-6">
        <img src={avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky'} className="w-24 h-24 rounded-full border-4 border-indigo-50 mb-4" />
        <p className="text-xs text-slate-400">目前頭像</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">顯示姓名</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full border p-2 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">頭像連結 (URL)</label>
          <input value={avatar} onChange={e => setAvatar(e.target.value)} className="w-full border p-2 rounded-lg" placeholder="https://..." />
        </div>
        <button onClick={() => onUpdate({...user, name, avatar})} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold">儲存修改</button>
      </div>
    </div>
  );
};

export default ProfileSettings;
