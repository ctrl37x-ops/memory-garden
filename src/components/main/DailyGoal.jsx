'use client';

import { useState } from 'react';
import useGameStore from '@/store/useGameStore';

const PRESETS = [20, 50, 100, 200];

export default function DailyGoal() {
  const { todayPoints, dailyGoal, setDailyGoal } = useGameStore();
  const [editing, setEditing] = useState(false);

  const progress = Math.min(100, Math.round((todayPoints / dailyGoal) * 100));
  const achieved = todayPoints >= dailyGoal;
  const remaining = Math.max(0, dailyGoal - todayPoints);

  return (
    <div className={`rounded-2xl border px-5 py-4 mt-4 ${
      achieved ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
    }`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{achieved ? '🎯' : '🎯'}</span>
          <p className="font-semibold text-gray-700">오늘의 목표</p>
        </div>
        <button
          onClick={() => setEditing((v) => !v)}
          className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
        >
          {editing ? '닫기' : '목표 변경'}
        </button>
      </div>

      {/* 진행 바 */}
      <div className="mb-2">
        <div className="flex justify-between text-sm mb-1">
          <span className={`font-bold ${achieved ? 'text-green-600' : 'text-gray-700'}`}>
            {todayPoints}점
            {achieved && ' ✓'}
          </span>
          <span className="text-gray-400">{dailyGoal}점 목표</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              achieved ? 'bg-green-500' : progress >= 70 ? 'bg-yellow-400' : 'bg-blue-400'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 상태 메시지 */}
      {achieved ? (
        <p className="text-green-600 text-sm font-semibold">🎉 오늘 목표 달성! 훌륭해요!</p>
      ) : (
        <p className="text-gray-400 text-sm">앞으로 <span className="text-gray-600 font-semibold">{remaining}점</span> 더 획득하면 목표 달성!</p>
      )}

      {/* 목표 변경 패널 */}
      {editing && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-3">하루 목표 포인트를 선택하세요</p>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => { setDailyGoal(p); setEditing(false); }}
                className={`py-2 rounded-xl text-sm font-bold transition-all ${
                  dailyGoal === p
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p}점
              </button>
            ))}
          </div>
          <CustomGoalInput current={dailyGoal} onSet={(v) => { setDailyGoal(v); setEditing(false); }} />
        </div>
      )}
    </div>
  );
}

function CustomGoalInput({ current, onSet }) {
  const [val, setVal] = useState('');
  const handleSubmit = () => {
    const n = parseInt(val);
    if (n >= 10 && n <= 500) onSet(n);
  };
  return (
    <div className="flex gap-2">
      <input
        type="number"
        min={10}
        max={500}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder="직접 입력 (10~500)"
        className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-blue-400 transition-colors"
      />
      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all"
      >
        설정
      </button>
    </div>
  );
}
