'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import useGameStore from '@/store/useGameStore';
import AdaptiveLevelPicker from '@/components/main/AdaptiveLevelPicker';

const LEVELS = [
  { label: '쉬움',   cols: 3, startCount: 3, showMs: 1200 },
  { label: '보통',   cols: 4, startCount: 4, showMs: 900  },
  { label: '어려움', cols: 4, startCount: 5, showMs: 600  },
];

const PHASE = { READY: 'ready', SHOW: 'show', INPUT: 'input', CORRECT: 'correct', WRONG: 'wrong', DONE: 'done' };

// 격자에서 랜덤 n개 인덱스 추출
function pickRandom(total, n) {
  const all = Array.from({ length: total }, (_, i) => i);
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return new Set(all.slice(0, n));
}

export default function TilesGame() {
  const { addResult, getRecommendedLevel } = useGameStore();
  const recommendation = getRecommendedLevel('타일 기억');

  const [levelIdx, setLevelIdx]   = useState(recommendation?.level ?? 0);
  const [phase, setPhase]         = useState(PHASE.READY);
  const [targets, setTargets]     = useState(new Set()); // 빛나야 할 타일
  const [selected, setSelected]   = useState(new Set()); // 플레이어가 선택한 타일
  const [wrongTile, setWrongTile] = useState(null);      // 틀린 타일 인덱스
  const [round, setRound]         = useState(0);         // 현재 라운드
  const [score, setScore]         = useState(0);         // 클리어한 라운드 수

  const level   = LEVELS[levelIdx];
  const total   = level.cols * level.cols;
  const timerRef = useRef(null);

  const startRound = useCallback((roundNum) => {
    const count = level.startCount + roundNum;
    const newTargets = pickRandom(total, Math.min(count, total - 1));
    setTargets(newTargets);
    setSelected(new Set());
    setWrongTile(null);
    setPhase(PHASE.SHOW);

    timerRef.current = setTimeout(() => {
      setPhase(PHASE.INPUT);
    }, level.showMs);
  }, [level, total]);

  const handleStart = () => {
    clearTimeout(timerRef.current);
    setScore(0);
    setRound(0);
    startRound(0);
  };

  const handleTap = (idx) => {
    if (phase !== PHASE.INPUT) return;

    // 틀린 타일
    if (!targets.has(idx)) {
      setWrongTile(idx);
      setPhase(PHASE.WRONG);
      timerRef.current = setTimeout(() => {
        const pts = score * 10;
        addResult('타일 기억', `${score}/${round + 1}`, pts);
        setPhase(PHASE.DONE);
      }, 900);
      return;
    }

    // 맞는 타일
    const next = new Set(selected);
    next.add(idx);
    setSelected(next);

    // 전부 맞췄으면 라운드 클리어
    if (next.size === targets.size) {
      const newScore = score + 1;
      setScore(newScore);
      setPhase(PHASE.CORRECT);
      timerRef.current = setTimeout(() => {
        const nextRound = round + 1;
        setRound(nextRound);
        startRound(nextRound);
      }, 700);
    }
  };

  const handleRestart = () => {
    clearTimeout(timerRef.current);
    setPhase(PHASE.READY);
    setTargets(new Set());
    setSelected(new Set());
    setWrongTile(null);
    setRound(0);
    setScore(0);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const tileColor = (idx) => {
    if (phase === PHASE.SHOW && targets.has(idx))
      return 'bg-indigo-400 scale-95 shadow-lg shadow-indigo-300';
    if (phase === PHASE.CORRECT && (targets.has(idx) || selected.has(idx)))
      return 'bg-green-400 scale-95';
    if (phase === PHASE.WRONG) {
      if (idx === wrongTile) return 'bg-red-400 scale-95 ring-2 ring-red-300';
      if (targets.has(idx))  return 'bg-indigo-300 opacity-70';
    }
    if (selected.has(idx))
      return 'bg-indigo-300 scale-95';
    return 'bg-white border-2 border-gray-200 hover:bg-indigo-50 active:scale-90';
  };

  return (
    <main className="max-w-lg mx-auto px-4 pt-8 pb-16">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/game" className="text-gray-400 hover:text-gray-600 text-2xl">←</Link>
        <h1 className="text-2xl font-bold text-gray-800">🟦 타일 기억</h1>
      </div>

      {/* 준비 화면 */}
      {phase === PHASE.READY && (
        <div className="flex flex-col gap-6">
          <AdaptiveLevelPicker
            levels={LEVELS.map((l) => l.label)}
            levelIdx={levelIdx}
            onChange={setLevelIdx}
            recommendation={recommendation}
            themeColor="indigo"
          />
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 text-center flex flex-col gap-2">
            <p className="text-gray-600 text-sm leading-relaxed">
              빛나는 타일 위치를 기억하세요.<br />
              사라진 뒤 같은 위치를 눌러보세요!
            </p>
            <p className="text-indigo-600 font-semibold text-sm">
              {level.cols}×{level.cols} 격자 • 시작 {level.startCount}개 • {level.showMs}ms 표시
            </p>
          </div>
          <button
            onClick={handleStart}
            className="w-full py-5 bg-indigo-600 text-white text-xl font-bold rounded-2xl shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"
          >
            시작!
          </button>
        </div>
      )}

      {/* 게임 화면 */}
      {phase !== PHASE.READY && phase !== PHASE.DONE && (
        <div className="flex flex-col items-center gap-6">
          {/* 상태 표시 */}
          <div className="flex items-center gap-4 w-full justify-center">
            <div className="bg-indigo-100 rounded-2xl px-5 py-2 text-center">
              <p className="text-xs text-indigo-400 font-medium">라운드</p>
              <p className="text-2xl font-bold text-indigo-700">{round + 1}</p>
            </div>
            <div className="bg-gray-100 rounded-2xl px-5 py-2 text-center">
              <p className="text-xs text-gray-400 font-medium">클리어</p>
              <p className="text-2xl font-bold text-gray-700">{score}</p>
            </div>
            <div className="flex-1 text-center">
              {phase === PHASE.SHOW    && <p className="text-indigo-600 font-bold animate-pulse">위치를 기억하세요!</p>}
              {phase === PHASE.INPUT   && <p className="text-gray-700 font-semibold">{targets.size - selected.size}개 남음</p>}
              {phase === PHASE.CORRECT && <p className="text-green-600 font-bold text-lg">완벽해요! ✓</p>}
              {phase === PHASE.WRONG   && <p className="text-red-500 font-bold text-lg">틀렸어요!</p>}
            </div>
          </div>

          {/* 타일 격자 */}
          <div
            className="grid gap-2.5 w-full max-w-xs"
            style={{ gridTemplateColumns: `repeat(${level.cols}, 1fr)` }}
          >
            {Array.from({ length: total }, (_, i) => (
              <button
                key={i}
                onClick={() => handleTap(i)}
                disabled={phase !== PHASE.INPUT}
                className={`aspect-square rounded-2xl transition-all duration-150 shadow-sm ${tileColor(i)}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* 결과 화면 */}
      {phase === PHASE.DONE && (
        <div className="flex flex-col items-center gap-6 mt-4">
          <div className="text-7xl">
            {score >= 10 ? '🏆' : score >= 6 ? '👏' : score >= 3 ? '🙂' : '💪'}
          </div>
          <p className="text-3xl font-bold text-gray-800">게임 오버!</p>

          <div className="bg-indigo-50 rounded-3xl p-6 w-full text-center">
            <p className="text-gray-500 text-sm mb-1">클리어한 라운드</p>
            <p className="text-5xl font-bold text-indigo-600 mb-1">
              {score}<span className="text-2xl text-gray-400 ml-1">라운드</span>
            </p>
            <p className="text-green-600 font-semibold mt-3">+{score * 10} 포인트 획득 🌱</p>
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={handleRestart}
              className="flex-1 py-4 bg-indigo-100 text-indigo-700 text-lg font-semibold rounded-2xl hover:bg-indigo-200 transition-all"
            >
              다시 하기
            </button>
            <Link
              href="/game"
              className="flex-1 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-2xl text-center hover:bg-indigo-700 transition-all"
            >
              훈련 목록
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
