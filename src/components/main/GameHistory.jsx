'use client';

import { useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import useGameStore from '@/store/useGameStore';

// 데모용 테스트 데이터 생성
function buildDemoHistory() {
  const games = [
    { game: '숫자 기억', scores: ['4/5', '3/5', '5/5'], base: 10 },
    { game: '단어 연상', scores: ['5/6', '4/6', '6/6'], base: 18 },
    { game: '얼굴-이름', scores: ['3/5', '4/5', '5/5'], base: 24 },
  ];
  const now = new Date();
  const entries = [];
  for (let day = 6; day >= 0; day--) {
    const d = new Date(now);
    d.setDate(d.getDate() - day);
    const count = day === 0 ? 3 : day % 2 === 0 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const g = games[i % 3];
      d.setHours(9 + i * 3, 20 + i * 7, 0, 0);
      entries.push({ game: g.game, score: g.scores[i % g.scores.length], points: g.base + i * 8, date: new Date(d).toISOString() });
    }
  }
  return entries.reverse();
}

const GAME_META = {
  '숫자 기억':     { emoji: '🔢', color: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-400' },
  '단어 연상':     { emoji: '📝', color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-400' },
  '얼굴-이름':     { emoji: '🧑', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-400' },
};

function getGameMeta(gameName) {
  return GAME_META[gameName] ?? { emoji: '🎮', color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400' };
}

// 날짜 문자열 포맷 (ISO → "6월 12일 (목)")
function formatDate(isoStr) {
  const d = new Date(isoStr);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

function formatTime(isoStr) {
  const d = new Date(isoStr);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

// ISO 날짜의 YYYY-MM-DD 부분만 추출
function dateKey(isoStr) {
  return isoStr.slice(0, 10);
}

// 최근 7일 날짜 배열 (오늘 포함, 오래된 순)
function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
}

export default function GameHistory() {
  const params = useSearchParams();
  const { gameHistory, totalPoints, streak, addResult } = useGameStore();

  // ?demo=1 파라미터가 있으면 테스트 데이터 주입
  useEffect(() => {
    if (params.get('demo') !== '1') return;
    if (gameHistory.length > 0) return;
    buildDemoHistory().forEach(({ game, score, points }) => addResult(game, score, points));
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  // 게임별 플레이 횟수
  const gameCount = useMemo(() => {
    const counts = {};
    gameHistory.forEach(({ game }) => {
      counts[game] = (counts[game] ?? 0) + 1;
    });
    return counts;
  }, [gameHistory]);

  // 날짜별 그룹핑
  const grouped = useMemo(() => {
    const map = {};
    gameHistory.forEach((entry) => {
      const key = dateKey(entry.date);
      if (!map[key]) map[key] = [];
      map[key].push(entry);
    });
    // 최신 날짜 순 정렬
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
  }, [gameHistory]);

  // 최근 7일 포인트 합산
  const weeklyPoints = useMemo(() => {
    const days = getLast7Days();
    const map = {};
    days.forEach((d) => { map[d] = 0; });
    gameHistory.forEach(({ points, date }) => {
      const key = dateKey(date);
      if (map[key] !== undefined) map[key] += points;
    });
    return days.map((d) => ({ date: d, points: map[d] }));
  }, [gameHistory]);

  const maxWeekly = Math.max(...weeklyPoints.map((d) => d.points), 1);

  // 요일 레이블
  const dayLabels = ['일', '월', '화', '수', '목', '금', '토'];
  const todayKey = new Date().toISOString().slice(0, 10);

  return (
    <main className="max-w-lg mx-auto px-4 pt-8 pb-16">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/game" className="text-gray-400 hover:text-gray-600 text-2xl">←</Link>
        <h1 className="text-2xl font-bold text-gray-800">📊 훈련 기록</h1>
      </div>

      {/* 요약 통계 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard value={totalPoints} label="총 포인트" color="text-green-600" />
        <StatCard value={gameHistory.length} label="총 게임 수" color="text-blue-600" />
        <StatCard value={streak} label="연속 🔥" color="text-amber-500" />
      </div>

      {/* 게임별 플레이 횟수 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <p className="text-base font-semibold text-gray-700 mb-4">게임별 플레이</p>
        <div className="flex flex-col gap-3">
          {Object.entries(GAME_META).map(([name, meta]) => {
            const count = gameCount[name] ?? 0;
            const pct = gameHistory.length > 0 ? (count / gameHistory.length) * 100 : 0;
            return (
              <div key={name} className="flex items-center gap-3">
                <span className="text-xl w-7">{meta.emoji}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium">{name}</span>
                    <span className="text-gray-400">{count}회</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-700 ${meta.dot}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 주간 포인트 바 차트 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <p className="text-base font-semibold text-gray-700 mb-4">최근 7일 포인트</p>
        <div className="flex items-end gap-2 h-28">
          {weeklyPoints.map(({ date, points }) => {
            const height = maxWeekly > 0 ? Math.max((points / maxWeekly) * 100, points > 0 ? 8 : 0) : 0;
            const isToday = date === todayKey;
            const d = new Date(date + 'T00:00:00');
            return (
              <div key={date} className="flex-1 flex flex-col items-center gap-1">
                {points > 0 && (
                  <span className="text-xs text-gray-400">{points}</span>
                )}
                <div className="w-full flex items-end" style={{ height: '80px' }}>
                  <div
                    className={`w-full rounded-t-lg transition-all duration-700 ${
                      isToday ? 'bg-green-500' : 'bg-green-200'
                    }`}
                    style={{ height: `${height}%`, minHeight: points > 0 ? '6px' : '0' }}
                  />
                </div>
                <span className={`text-xs font-medium ${isToday ? 'text-green-600' : 'text-gray-400'}`}>
                  {dayLabels[d.getDay()]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 게임 기록 목록 */}
      <div>
        <p className="text-base font-semibold text-gray-700 mb-4">전체 기록</p>

        {grouped.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <span className="text-6xl">🌱</span>
            <p className="text-lg text-gray-500">아직 게임 기록이 없어요.<br />첫 훈련을 시작해볼까요?</p>
            <Link
              href="/game"
              className="px-8 py-3 bg-green-600 text-white font-semibold rounded-2xl hover:bg-green-700 transition-all"
            >
              훈련 시작하기
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {grouped.map(([dateStr, entries]) => (
              <div key={dateStr}>
                {/* 날짜 구분선 */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm font-semibold text-gray-500">
                    {formatDate(entries[0].date)}
                  </span>
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400">
                    +{entries.reduce((s, e) => s + e.points, 0)}pt
                  </span>
                </div>

                {/* 해당 날짜 기록들 */}
                <div className="flex flex-col gap-2">
                  {entries.map((entry, i) => {
                    const meta = getGameMeta(entry.game);
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3"
                      >
                        <span className="text-2xl">{meta.emoji}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-800">{entry.game}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta.color}`}>
                              {entry.score}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">{formatTime(entry.date)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">+{entry.points}</p>
                          <p className="text-xs text-gray-400">포인트</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({ value, label, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </div>
  );
}
