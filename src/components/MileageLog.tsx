import React, { useState } from 'react';
import { Schedule } from '../types';
import { storage } from '../services/storage';

interface MileageLogProps {
  schedules: Schedule[];
  currentUser: any;
  onRefresh: () => void;
}

const MileageLog: React.FC<MileageLogProps> = ({ schedules, currentUser, onRefresh }) => {
  // 用於存放使用者輸入的「本次結束里程」以及勾選狀態
  const [inputData, setInputData] = useState<{ 
    [key: string]: { end?: number, gas?: boolean, wash?: boolean } 
  }>({});

  // 1. 篩選：我本人、有選車、且尚未完成填報的紀錄
  const myPendingSchedules = schedules.filter(s => 
    s.userId === currentUser.id && s.vehicleId && !s.mileageCompleted
  );

  const handleUpdate = async (s: Schedule, calculatedStart: number) => {
    const data = inputData[s.id] || {};
    const end = data.end ?? 0;

    // 邏輯驗證
    if (end <= calculatedStart) {
      alert(`結束里程 (${end}) 必須大於起始里程 (${calculatedStart})！`);
      return;
    }

    try {
      // 呼叫 storage，傳入：行程ID, 車輛ID, 起始(自動計算), 結束(使用者填寫), 加油, 洗車
      await storage.updateMileage(s.id, s.vehicleId!, calculatedStart, end, !!data.gas, !!data.wash);
      alert("里程填報成功！系統已更新車輛總行駛里程數。");
      onRefresh();
    } catch (error) {
      console.error("更新失敗:", error);
      alert("儲存失敗，請檢查網路連線。");
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm animate-in fade-in duration-500">
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
          {/* 按照日期/時間排序，舊的排在上面 */}
          {myPendingSchedules
            .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
            .map(s => {
              
              // 【核心邏輯 A】檢查該車是否有任何「更早」但「未填寫」的行程 (阻斷機制)
              const hasEarlierIncomplete = schedules.some(prev => 
                String(prev.vehicleId) === String(s.vehicleId) && 
                !prev.mileageCompleted && 
                (prev.date < s.date || (prev.date === s.date && prev.startTime < s.startTime))
              );

              // 【核心邏輯 B】找出該車「最後一筆已填寫」的結束里程 (帶入機制)
              const lastFinishedRecord = [...schedules]
                .filter(prev => String(prev.vehicleId) === String(s.vehicleId) && prev.mileageCompleted)
                .sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime))
                .reverse()[0]; // 取得最新的那筆

              const calculatedStart = lastFinishedRecord ? (lastFinishedRecord.endKm || 0) : 0;

              return (
                <div 
                  key={s.id} 
                  className={`border p-5 rounded-2xl flex flex-col lg:flex-row lg:items-center gap-5 transition-all ${
                    hasEarlierIncomplete ? 'bg-red-50 border-red-200' : 'bg-slate-50 hover:bg-white hover:shadow-md border-slate-100'
                  }`}
                >
                  {/* 左側：行程資訊 */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        {s.category}
                      </span>
                      <span className="text-xs font-bold text-slate-400">{s.date}</span>
                    </div>
                    <div className="font-bold text-slate-800 text-lg">{s.projectName}</div>
                    <div className="text-sm text-indigo-600 font-bold mt-1">
                      <i className="fas fa-car mr-1 text-indigo-400"></i> {s.vehicleName}
                    </div>
                  </div>

                  {/* 右側：操作區 */}
                  {hasEarlierIncomplete ? (
                    /* 阻斷狀態 UI */
                    <div className="flex items-center bg-white px-5 py-3 rounded-xl border border-red-200 text-red-600 shadow-sm animate-pulse">
                      <i className="fas fa-exclamation-triangle mr-3 text-red-500 text-lg"></i>
                      <div className="text-left">
                        <p className="text-sm font-bold">上次行車紀錄未填寫</p>
                        <p className="text-[11px] opacity-80">請先聯絡上一位使用者或管理員補齊資料</p>
                      </div>
                    </div>
                  ) : (
                    /* 正常填報 UI */
                    <div className="flex flex-wrap items-center gap-4">
                      
                      {/* 自動帶入的起點標籤 */}
                      <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                        <p className="text-[10px] font-bold text-blue-400 uppercase leading-none mb-1">
                          <i className="fas fa-play-circle mr-1"></i> 上次結束 (起點)
                        </p>
                        <p className="text-lg font-mono font-bold text-blue-700 leading-none">
                          {calculatedStart} <span className="text-xs">km</span>
                        </p>
                      </div>

                      <div className="text-slate-300 hidden xl:block">
                        <i className="fas fa-chevron-right"></i>
                      </div>

                      {/* 本次結束里程輸入 */}
                      <div className="relative">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">本次結束里程</p>
                        <div className="relative">
                          <i className="fas fa-flag-checkered absolute left-3 top-1/2 -translate-y-1/2 text-red-500 text-xs"></i>
                          <input
                            type="number"
                            placeholder="請填寫里程"
                            className="pl-8 pr-3 py-2.5 border border-slate-200 rounded-xl w-36 text-base font-bold outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            onChange={e => setInputData({...inputData, [s.id]: {...inputData[s.id], end: parseInt(e.target.value)}})}
                          />
                        </div>
                      </div>

                      {/* 加油、洗車勾選 */}
                      <div className="flex items-center space-x-4 px-2">
                        <label className="flex items-center space-x-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            className="w-5 h-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                            onChange={e => setInputData({...inputData, [s.id]: {...inputData[s.id], gas: e.target.checked}})}
                          />
                          <span className="text-sm font-bold text-slate-600 group-hover:text-orange-500 transition-colors">
                            <i className="fas fa-gas-pump mr-1 text-orange-500"></i> 加油
                          </span>
                        </label>

                        <label className="flex items-center space-x-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            className="w-5 h-5 rounded border-slate-300 text-sky-500 focus:ring-sky-500 cursor-pointer"
                            onChange={e => setInputData({...inputData, [s.id]: {...inputData[s.id], wash: e.target.checked}})}
                          />
                          <span className="text-sm font-bold text-slate-600 group-hover:text-sky-500 transition-colors">
                            <i className="fas fa-soap mr-1 text-sky-500"></i> 洗車
                          </span>
                        </label>
                      </div>

                      {/* 提交按鈕 */}
                      <button
                        onClick={() => handleUpdate(s, calculatedStart)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 transition-all active:scale-95"
                      >
                        確認送出
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default MileageLog;
