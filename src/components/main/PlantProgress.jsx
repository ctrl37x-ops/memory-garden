'use client';

import { useEffect } from 'react';
import useGameStore from '@/store/useGameStore';

export default function PlantProgress() {
  const { totalPoints, todayPoints, streak, checkDailyReset, getPlantStage, getGrowthProgress } =
    useGameStore();

  useEffect(() => {
    checkDailyReset();
  }, [checkDailyReset]);

  const plant = getPlantStage();
  const progress = getGrowthProgress();
  const nextPoints =
    plant.thresholds[Math.min(plant.stage + 1, plant.thresholds.length - 1)];

  return (
    <div className="bg-white rounded-3xl shadow-md border border-green-100 p-6 flex flex-col items-center gap-4">
      {/* 식물 이모지 */}
      <div className="text-8xl select-none" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}>
        {plant.emoji}
      </div>

      <div className="text-center">
        <p className="text-2xl font-bold text-green-700">{plant.name}</p>
        <p className="text-gray-500 mt-1">{plant.description}</p>
      </div>

      {/* 성장 바 */}
      {plant.stage < 4 && (
        <div className="w-full">
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>성장 중</span>
            <span>{totalPoints} / {nextPoints}점</span>
          </div>
          <div className="w-full bg-green-100 rounded-full h-4 overflow-hidden">
            <div
              className="h-4 bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* 통계 */}
      <div className="flex gap-6 text-center mt-2">
        <div>
          <p className="text-2xl font-bold text-gray-800">{totalPoints}</p>
          <p className="text-xs text-gray-400">총 포인트</p>
        </div>
        <div className="w-px bg-gray-200" />
        <div>
          <p className="text-2xl font-bold text-amber-500">{streak}</p>
          <p className="text-xs text-gray-400">연속 🔥</p>
        </div>
        <div className="w-px bg-gray-200" />
        <div>
          <p className="text-2xl font-bold text-blue-500">+{todayPoints}</p>
          <p className="text-xs text-gray-400">오늘 획득</p>
        </div>
      </div>
    </div>
  );
}
