import React, { useState } from 'react';
import { User } from '../types';

interface Props {
  user: User;
  onUpdate: (u: User) => void;
}

const ProfileSettings: React.FC<Props> = ({ user, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [isUploading, setIsUploading] = useState(false);

  // 處理圖片上傳並轉為 Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("圖片太大了，請選擇小於 2MB 的照片");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result as string);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-xl font-bold mb-8 text-black flex items-center justify-center">
        <i className="fas fa-user-circle mr-2 text-indigo-500"></i> 個人資料設定
      </h3>
      
      <div className="flex flex-col items-center mb-8">
        <div className="relative group">
          <img 
            src={avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky'} 
            className="w-28 h-28 rounded-full border-4 border-white shadow-xl object-cover transition group-hover:opacity-75" 
            alt="Avatar"
          />
          <label className="absolute inset-0 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded-full">更換照片</div>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        </div>
        <p className="text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-widest">點擊圖片更換大頭貼</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase ml-1">顯示姓名</label>
          <input 
            value={name} 
            onChange={e => setName(e.target.value)} 
            className="w-full border border-slate-200 p-3 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
            placeholder="請輸入姓名"
          />
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            <i className="fas fa-info-circle mr-1"></i> 提示：大頭貼上傳後將儲存於雲端資料庫。建議使用正方形的照片效果最佳。
          </p>
        </div>

        <button 
          onClick={() => onUpdate({...user, name, avatar})} 
          disabled={isUploading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
        >
          {isUploading ? '處理中...' : '儲存個人設定'}
        </button>
      </div>
    </div>
  );
};

export default ProfileSettings;
