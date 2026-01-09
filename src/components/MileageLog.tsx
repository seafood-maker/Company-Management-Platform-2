import React, { useState } from 'react';
import { Schedule } from '../types';
import { storage } from '../services/storage';

const MileageLog: React.FC<{ schedules: Schedule[], currentUser: any, onRefresh: any }> = ({ schedules, currentUser, onRefresh }) => {
  const [inputData, setInputData] = useState<{ [key: string]: any }>({});

  const myPendingSchedules = schedules.filter(s => 
    s.userId === currentUser.id && s.vehicleId && !s.mileageCompleted
  );

  const handleUpdate = async (s: Schedule) => {
    const data = inputData[s.id] || {};
    const start = data.start ?? 0;
    const end = data.end ?? 0;
    
    if (end < start) {
      alert("結束里程不能小於出發里程！");
      return;
    }

    await storage.updateMileage(s.id, s.vehicleId!, start, end, !!data.gas, !!data.wash);
    alert("紀錄成功！");
    onRefresh();
  };

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm">
      <h3 className="text-xl font-bold mb-4 flex items-center text-black">
        <i className="fas fa-tachometer-alt mr-2 text-indigo-500"></i>車輛里程填報
      </h3>
      {myPendingSchedules.length === 0 ? (
        <div className="text-center py-10 text-slate-400 italic">目前沒有待填寫里程的行程</div>
      ) : (
        <div className="space-y-4">
          {myPendingSchedules.map(s => (
            <div key={s.id} className="border border-slate-100 p-5 rounded-2xl bg-slate-50 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <div className="font-bold text-slate-800">{s.date} | {s.projectName}</div>
                <div className="text-sm text-indigo-600 font-bold">{s.vehicleName}</div>
              </div>
              
              <div className="grid grid-cols-2 sm:flex items-center gap-3">
                <input type="number" placeholder="出發里程" className="border rounded-xl p-2 w-24 text-sm" 
                       onChange={e => setInputData({...inputData, [s.id]: {...inputData[s.id], start: parseInt(e.target.value)}})} />
                <span className="hidden sm:block">→</span>
                <input type="number" placeholder="結束里程" className="border rounded-xl p-2 w-24 text-sm" 
                       onChange={e => setInputData({...inputData, [s.id]: {...inputData[s.id], end: parseInt(e.target.value)}})} />
                
                <label className="flex items-center space-x-1 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-indigo-600" onChange={e => setInputData({...inputData, [s.id]: {...inputData[s.id], gas: e.target.checked}})} />
                  <span className="text-xs font-bold text-slate-600">加油</span>
                </label>

                <label className="flex items-center space-x-1 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-indigo-600" onChange={e => setInputData({...inputData, [s.id]: {...inputData[s.id], wash: e.target.checked}})} />
                  <span className="text-xs font-bold text-slate-600">洗車</span>
                </label>

                <button onClick={() => handleUpdate(s)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 transition">送出</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default MileageLog;
};
export default MileageLog;
