import React, { useState } from 'react';
import { Project } from '../types';

interface Props {
  projects: Project[];
  onSave: (p: Project) => void;
  onDelete: (id: string) => void;
}

const ProjectManagement: React.FC<Props> = ({ projects, onSave, onDelete }) => {
  const [newName, setNewName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onSave({ id: 'p' + Date.now(), name: newName });
    setNewName('');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6">
      <h3 className="text-xl font-bold mb-6">計畫管理</h3>
      <form onSubmit={handleSubmit} className="mb-8 flex gap-4">
        <input 
          value={newName} onChange={e => setNewName(e.target.value)}
          placeholder="輸入新計畫名稱 (例如: 2024 前瞻計畫)"
          className="flex-1 border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button type="submit" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold">新增計畫</button>
      </form>
      <div className="space-y-2">
        {projects.map(p => (
          <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="font-medium text-slate-700">{p.name}</span>
            <button onClick={() => onDelete(p.id)} className="text-slate-300 hover:text-red-500"><i className="fas fa-trash-alt"></i></button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ProjectManagement;
