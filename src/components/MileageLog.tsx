import React, { useState } from 'react';
import { Schedule } from '../types';
import { storage } from '../services/storage'; // 改為頂部匯入

const MileageLog: React.FC<{ schedules: Schedule[], currentUser: any, onRefresh: any }> = ({ schedules, currentUser, onRefresh }) => {
  const [inputKms, setInputKms] = useState<{ [key: string]: { start: number, end: number } }>({});

  // 篩選本人且有選車、尚未填寫里程的行程
  const myPendingSchedules = schedules.filter(s => 
    s.userId === currentUser.id && s.vehicleId && !s.mileageCompleted
  );

  const handleUpdate = async (s: Schedule) => {
    const data = inputKms[s.id];
    if (!data || !data.start || !data.end || data.end <= data.start) {
      alert("請輸入正確的出發與結束里程！");
      return;
    }
    await storage.updateMileage(s.id, s.vehicleId!, data.start, data.end);
    alert("里程紀錄成功！");
    onRefresh();
  };

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm">
      <h3 className="text-xl font-bold mb-4">新增車輛里程數</h3>
      {myPendingSchedules.length === 0 ? (
        <div className="text-center py-10 text-slate-400 italic">目前沒有待填寫里程的行程</div>
      ) : (
        <div className="space-y-4">
          {myPendingSchedules.map(s => (
            <div key={s.id} className="border p-4 rounded-xl flex flex-wrap justify-between items-center gap-4">
              <div>
                <div className="font-bold">{s.date} - {s.destination}</div>
                <div className="text-xs text-indigo-600 font-bold">{s.vehicleName}</div>
              </div>
              <div className="flex items-center gap-2">
                <input type="number" placeholder="出發里程" className="border rounded p-2 w-28 text-sm" 
                       onChange={e => setInputKms({...inputKms, [s.id]: {...inputKms[s.id], start: parseInt(e.target.value)}})} />
                <span>→</span>
                <input type="number" placeholder="結束里程" className="border rounded p-2 w-28 text-sm" 
                       onChange={e => setInputKms({...inputKms, [s.id]: {...inputKms[s.id], end: parseInt(e.target.value)}})} />
                <button onClick={() => handleUpdate(s)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold">送出</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default MileageLog;
