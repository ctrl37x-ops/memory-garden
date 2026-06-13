'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 식물 성장 단계: 씨앗(0) → 새싹(1) → 꽃봉오리(2) → 꽃(3) → 나무(4)
const GROWTH_THRESHOLDS = [0, 30, 80, 150, 250];

const PLANT_STAGES = [
  { name: '씨앗', emoji: '🌱', description: '시작이 반이에요!' },
  { name: '새싹', emoji: '🌿', description: '잘 자라고 있어요!' },
  { name: '꽃봉오리', emoji: '🌸', description: '거의 다 왔어요!' },
  { name: '꽃', emoji: '🌺', description: '아름답게 피었어요!' },
  { name: '나무', emoji: '🌳', description: '완전히 자랐어요!' },
];

const useGameStore = create(
  persist(
    (set, get) => ({
      totalPoints: 0,
      todayPoints: 0,
      lastPlayDate: null,
      gameHistory: [], // { game, score, points, date }
      streak: 0,
      celebratingStage: null, // 단계 상승 시 { stage, name, emoji } 세팅
      dailyGoal: 50, // 하루 목표 포인트
      goalAchievedDate: null, // 목표 달성한 날짜 (중복 알림 방지)

      // 오늘 날짜 확인 후 포인트 리셋
      checkDailyReset: () => {
        const today = new Date().toDateString();
        const { lastPlayDate } = get();
        if (lastPlayDate !== today) {
          set({ todayPoints: 0 });
        }
      },

      // 게임 결과 저장 및 포인트 추가
      addResult: (game, score, points) => {
        const today = new Date().toDateString();
        const { lastPlayDate, streak, totalPoints } = get();

        // 포인트 추가 전 단계 계산
        const stageOf = (pts) => {
          let s = 0;
          for (let i = GROWTH_THRESHOLDS.length - 1; i >= 0; i--) {
            if (pts >= GROWTH_THRESHOLDS[i]) { s = i; break; }
          }
          return s;
        };
        const oldStage = stageOf(totalPoints);
        const newStage = stageOf(totalPoints + points);

        // 연속 플레이 계산 (오늘 이미 플레이했으면 유지, 어제면 +1, 그 외 리셋)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const newStreak =
          lastPlayDate === today ? streak
          : lastPlayDate === yesterday.toDateString() ? streak + 1
          : 1;

        set((state) => ({
          totalPoints: state.totalPoints + points,
          todayPoints: state.todayPoints + points,
          lastPlayDate: today,
          streak: newStreak,
          gameHistory: [
            { game, score, points, date: new Date().toISOString() },
            ...state.gameHistory.slice(0, 49),
          ],
          // 단계 상승 시 축하 상태 세팅
          celebratingStage: newStage > oldStage ? PLANT_STAGES[newStage] : state.celebratingStage,
        }));
      },

      clearCelebration: () => set({ celebratingStage: null }),

      setDailyGoal: (goal) => set({ dailyGoal: goal }),

      // 오늘 목표 달성 여부
      isGoalAchievedToday: () => {
        const { todayPoints, dailyGoal, goalAchievedDate } = get();
        return todayPoints >= dailyGoal;
      },

      // 현재 식물 단계 조회
      getPlantStage: () => {
        const { totalPoints } = get();
        let stage = 0;
        for (let i = GROWTH_THRESHOLDS.length - 1; i >= 0; i--) {
          if (totalPoints >= GROWTH_THRESHOLDS[i]) {
            stage = i;
            break;
          }
        }
        return { ...PLANT_STAGES[stage], stage, thresholds: GROWTH_THRESHOLDS };
      },

      // 게임별 추천 난이도 반환 (0=쉬움, 1=보통, 2=어려움)
      // 최근 5판 정답률 기준: >75% → 올림, <45% → 내림
      getRecommendedLevel: (gameName) => {
        const { gameHistory } = get();
        const recent = gameHistory
          .filter((e) => e.game === gameName)
          .slice(0, 5);

        if (recent.length < 2) {
          // 데이터 부족 → 쉬움 추천
          return { level: 0, reason: '처음 시작이에요! 쉬움으로 시작해봐요', confidence: 'low' };
        }

        // "정답/전체" 형식 파싱해서 정답률 계산
        const rates = recent.map((e) => {
          const [correct, total] = e.score.split('/').map(Number);
          return isNaN(correct) || isNaN(total) || total === 0 ? 0.5 : correct / total;
        });
        const avgRate = rates.reduce((s, r) => s + r, 0) / rates.length;

        // 현재 사용한 난이도 추정 (가장 최근 기록의 전체 수로 역추산)
        const lastTotal = Number(recent[0].score.split('/')[1]);
        // 숫자 기억: 3→0, 5→1, 7→2 / 단어 연상: 4→0, 6→1, 8→2 / 얼굴: 3→0, 5→1, 7→2
        const totalToLevel = { 3: 0, 4: 0, 5: 1, 6: 1, 7: 2, 8: 2 };
        const currentLevel = totalToLevel[lastTotal] ?? 1;

        let newLevel = currentLevel;
        let reason = '';
        const pct = Math.round(avgRate * 100);

        if (avgRate > 0.75 && currentLevel < 2) {
          newLevel = currentLevel + 1;
          reason = `최근 정답률 ${pct}% — 한 단계 올려봐요!`;
        } else if (avgRate < 0.45 && currentLevel > 0) {
          newLevel = currentLevel - 1;
          reason = `최근 정답률 ${pct}% — 한 단계 내려볼게요`;
        } else if (avgRate > 0.75 && currentLevel === 2) {
          reason = `최근 정답률 ${pct}% — 최고 난이도 유지 중 🏆`;
        } else {
          reason = `최근 정답률 ${pct}% — 현재 난이도가 딱 맞아요`;
        }

        return { level: newLevel, reason, confidence: 'high', avgRate: pct };
      },

      // 다음 단계까지 진행률 (0~100)
      getGrowthProgress: () => {
        const { totalPoints } = get();
        const maxStage = GROWTH_THRESHOLDS.length - 1;
        let stage = 0;
        for (let i = maxStage; i >= 0; i--) {
          if (totalPoints >= GROWTH_THRESHOLDS[i]) {
            stage = i;
            break;
          }
        }
        if (stage >= maxStage) return 100;
        const current = GROWTH_THRESHOLDS[stage];
        const next = GROWTH_THRESHOLDS[stage + 1];
        return Math.round(((totalPoints - current) / (next - current)) * 100);
      },
    }),
    { name: 'memory-garden-store' }
  )
);

export default useGameStore;
