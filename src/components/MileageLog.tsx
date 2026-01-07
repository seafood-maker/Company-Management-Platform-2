import React, { useState } from 'react';
import { Schedule, storage } from '../types';

const MileageLog: React.FC<{ schedules: Schedule[], currentUser: any, onRefresh: any }> = ({ schedules, currentUser, onRefresh }) => {
  const [kms, setKms] = useState<{ [key: string]: { start: number, end: number } }>({});

  const mySchedules = schedules.filter(s => s.userId === currentUser.id && s.vehicleId);

  const handleUpdate = async (s: Schedule) => {
    const data = kms[s.id];
    if (data && data.end > data.start) {
      await storage.updateMileage(s.id, s.vehicleId!, data.start, data.end);
      alert("里程更新成功！");
      onRefresh();
    } else {
      alert("請輸入正確的里程數");
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <h3 className="text-lg font-bold mb-4">新增車輛里程數</h3>
      <div className="space-y-4">
        {mySchedules.map(s => (
          <div key={s.id} className="border p-4 rounded-xl flex justify-between items-center">
            <div>
              <div className="font-bold">{s.date} | {s.destination}</div>
              <div className="text-sm text-slate-500">{s.vehicleName}</div>
            </div>
            <div className="flex space-x-2 items-end">
              <input type="number" placeholder="出發里程" className="border rounded p-1 w-24" 
                     onChange={e => setKms({...kms, [s.id]: {...kms[s.id], start: parseInt(e.target.value)}})} />
              <input type="number" placeholder="結束里程" className="border rounded p-1 w-24" 
                     onChange={e => setKms({...kms, [s.id]: {...kms[s.id], end: parseInt(e.target.value)}})} />
              <button onClick={() => handleUpdate(s)} className="bg-indigo-600 text-white px-3 py-1 rounded">送出</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
