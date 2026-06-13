'use client';

import { useEffect, useState } from 'react';
import useGameStore from '@/store/useGameStore';

const MILESTONES = [3, 7, 14, 30, 60, 100];

function getMilestoneLabel(streak) {
  const next = MILESTONES.find((m) => m > streak);
  const reached = [...MILESTONES].reverse().find((m) => m <= streak);
  return { next, reached };
}

export default function StreakBanner() {
  const { streak, lastPlayDate, checkDailyReset } = useGameStore();
  const [playedToday, setPlayedToday] = useState(false);

  useEffect(() => {
    checkDailyReset();
    setPlayedToday(lastPlayDate === new Date().toDateString());
  }, [lastPlayDate, checkDailyReset]);

  const { next, reached } = getMilestoneLabel(streak);

  if (streak === 0) return null;

  return (
    <div className={`rounded-2xl px-5 py-4 mt-4 border ${
      playedToday
        ? 'bg-orange-50 border-orange-200'
        : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-center justify-between">
        {/* 왼쪽: 스트릭 수 */}
        <div className="flex items-center gap-3">
          <span className={`text-4xl ${playedToday ? '' : 'grayscale opacity-60'}`}>
            🔥
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {streak}일 연속
            </p>
            <p className={`text-xs font-medium ${playedToday ? 'text-orange-500' : 'text-gray-400'}`}>
              {playedToday ? '오늘 훈련 완료! 스트릭 유지 중' : '오늘 훈련하면 스트릭이 이어져요'}
            </p>
          </div>
        </div>

        {/* 오른쪽: 달성 뱃지 또는 다음 목표 */}
        <div className="text-right">
          {reached && (
            <span className="inline-block bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full mb-1">
              🏅 {reached}일 달성!
            </span>
          )}
          {next && (
            <p className="text-xs text-gray-400">다음 목표: {next}일</p>
          )}
        </div>
      </div>

      {/* 마일스톤 진행 바 */}
      {next && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{reached ?? 0}일</span>
            <span>{next}일</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.round(((streak - (reached ?? 0)) / (next - (reached ?? 0))) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
