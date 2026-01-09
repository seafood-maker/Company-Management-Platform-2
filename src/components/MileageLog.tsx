import React, { useState } from 'react';
import { Schedule } from '../types';
import { storage } from '../services/storage';

interface MileageLogProps {
  schedules: Schedule[];
  currentUser: any;
  onRefresh: () => void;
}

const MileageLog: React.FC<MileageLogProps> = ({ schedules, currentUser, onRefresh }) => {
  // 用來存放每一筆行程的輸入資料
  const [inputData, setInputData] = useState<{ 
    [key: string]: { start?: number, end?: number, gas?: boolean, wash?: boolean } 
  }>({});

  // 篩選：本人行程、有選車、且尚未完成里程填寫的紀錄
  const myPendingSchedules = schedules.filter(s => 
    s.userId === currentUser.id && s.vehicleId && !s.mileageCompleted
  );

  const handleUpdate = async (s: Schedule) => {
    const data = inputData[s.id] || {};
    
    // 取得輸入值，支援 0，若未輸入則預設為 0
    const start = data.start ?? 0;
    const end = data.end ?? 0;
    const gas = !!data.gas;
    const wash = !!data.wash;

    // 邏輯驗證
    if (end < start) {
      alert("結束里程不能小於出發里程！");
      return;
    }

    try {
      // 呼叫 storage.ts 的累加里程邏輯 (傳入 6 個參數)
      await storage.updateMileage(s.id, s.vehicleId!, start, end, gas, wash);
      alert("紀錄成功！系統已累計至該車輛的總行駛里程數。");
      onRefresh(); // 重新整理父組件資料
    } catch (error) {
      console.error("更新失敗:", error);
      alert("儲存失敗，請檢查網路連線。");
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm animate-in fade-in duration-500">
      {/* 標題與黑色字體 */}
      <h3 className="text-xl font-bold mb-6 flex items-center text-black">
        <i className="fas fa-tachometer-alt mr-2 text-indigo-500"></i>
        車輛里程填報
      </h3>

      {myPendingSchedules.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <i className="fas fa-clipboard-check text-slate-300 text-4xl mb-3 block"></i>
          <p className="text-slate-400 italic">目前沒有待填寫里程的行程</p>
        </div>
      ) : (
        <div className="space-y-4">
          {myPendingSchedules.map(s => (
            <div key={s.id} className="border border-slate-100 p-5 rounded-2xl bg-slate-50 flex flex-col lg:flex-row lg:items-center gap-4 transition-all hover:bg-white hover:shadow-md">
              
              {/* 行程資訊區 (保留您原本的顯示格式) */}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{s.category}</span>
                </div>
                <div className="font-bold text-slate-800 text-base">
                  {s.date} | {s.projectName}
                </div>
                <div className="text-xs text-indigo-600 font-bold mt-1">
                  <i className="fas fa-car mr-1 text-indigo-400"></i> {s.vehicleName}
                </div>
              </div>

              {/* 輸入操作區 (彩色小圖案版本) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:flex items-center gap-4">
                
                {/* 里程數輸入 */}
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <i className="fas fa-play text-[10px] text-blue-500 absolute left-3 top-1/2 -translate-y-1/2"></i>
                    <input
                      type="number"
                      placeholder="出發"
                      className="pl-7 pr-3 py-2 border border-slate-200 rounded-xl w-28 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      onChange={e => setInputData({...inputData, [s.id]: {...inputData[s.id], start: parseInt(e.target.value) || 0}})}
                    />
                  </div>
                  <span className="text-slate-300">→</span>
                  <div className="relative">
                    <i className="fas fa-stop text-[10px] text-red-500 absolute left-3 top-1/2 -translate-y-1/2"></i>
                    <input
                      type="number"
                      placeholder="結束"
                      className="pl-7 pr-3 py-2 border border-slate-200 rounded-xl w-28 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      onChange={e => setInputData({...inputData, [s.id]: {...inputData[s.id], end: parseInt(e.target.value) || 0}})}
                    />
                  </div>
                </div>

                {/* 加油/洗車 勾選 (彩色小圖案) */}
                <div className="flex items-center space-x-4 px-2">
                  <label className="flex items-center space-x-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                      onChange={e => setInputData({...inputData, [s.id]: {...inputData[s.id], gas: e.target.checked}})}
                    />
                    <span className="text-sm font-bold text-slate-600 group-hover:text-orange-500 transition-colors">
                      <i className="fas fa-gas-pump mr-1 text-orange-500"></i> 加油
                    </span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500 cursor-pointer"
                      onChange={e => setInputData({...inputData, [s.id]: {...inputData[s.id], wash: e.target.checked}})}
                    />
                    <span className="text-sm font-bold text-slate-600 group-hover:text-sky-500 transition-colors">
                      <i className="fas fa-soap mr-1 text-sky-500"></i> 洗車
                    </span>
                  </label>
                </div>

                {/* 確認按鈕 */}
                <button
                  onClick={() => handleUpdate(s)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
                >
                  確認送出
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MileageLog;
