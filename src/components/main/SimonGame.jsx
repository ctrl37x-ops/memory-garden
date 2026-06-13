'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import useGameStore from '@/store/useGameStore';
import AdaptiveLevelPicker from '@/components/main/AdaptiveLevelPicker';

const COLORS = [
  { id: 0, label: '빨강', bg: 'bg-red-500',    active: 'bg-red-300',    shadow: 'shadow-red-400',    ring: 'ring-red-300'    },
  { id: 1, label: '파랑', bg: 'bg-blue-500',   active: 'bg-blue-300',   shadow: 'shadow-blue-400',   ring: 'ring-blue-300'   },
  { id: 2, label: '초록', bg: 'bg-green-500',  active: 'bg-green-300',  shadow: 'shadow-green-400',  ring: 'ring-green-300'  },
  { id: 3, label: '노랑', bg: 'bg-yellow-400', active: 'bg-yellow-200', shadow: 'shadow-yellow-300', ring: 'ring-yellow-200' },
];

const LEVELS = [
  { label: '쉬움',   flashMs: 800, startLen: 3 },
  { label: '보통',   flashMs: 600, startLen: 4 },
  { label: '어려움', flashMs: 400, startLen: 5 },
];

const PHASE = { READY: 'ready', SHOW: 'show', INPUT: 'input', WRONG: 'wrong', DONE: 'done' };

export default function SimonGame() {
  const { addResult, getRecommendedLevel } = useGameStore();
  const recommendation = getRecommendedLevel('사이먼');

  const [levelIdx, setLevelIdx] = useState(recommendation?.level ?? 0);
  const [phase, setPhase]       = useState(PHASE.READY);
  const [sequence, setSequence] = useState([]);
  const [inputIdx, setInputIdx] = useState(0);
  const [lit, setLit]           = useState(null); // 현재 빛나는 색 id
  const [round, setRound]       = useState(0);    // 현재 라운드 (=sequence.length)
  const [best, setBest]         = useState(0);

  const level = LEVELS[levelIdx];
  const timerRef = useRef(null);

  // 시퀀스 재생
  const playSequence = useCallback((seq) => {
    setPhase(PHASE.SHOW);
    setLit(null);
    let i = 0;
    const flash = () => {
      if (i >= seq.length) {
        setLit(null);
        setInputIdx(0);
        setPhase(PHASE.INPUT);
        return;
      }
      setLit(seq[i]);
      timerRef.current = setTimeout(() => {
        setLit(null);
        timerRef.current = setTimeout(() => {
          i++;
          flash();
        }, level.flashMs * 0.35);
      }, level.flashMs);
    };
    timerRef.current = setTimeout(flash, 500);
  }, [level.flashMs]);

  // 새 라운드 시작
  const nextRound = useCallback((prevSeq) => {
    const next = [...prevSeq, Math.floor(Math.random() * 4)];
    setSequence(next);
    setRound(next.length);
    playSequence(next);
  }, [playSequence]);

  const handleStart = () => {
    const initial = [];
    for (let i = 0; i < level.startLen; i++) initial.push(Math.floor(Math.random() * 4));
    setSequence(initial);
    setRound(initial.length);
    setBest(0);
    setInputIdx(0);
    playSequence(initial);
  };

  const handlePress = (colorId) => {
    if (phase !== PHASE.INPUT) return;

    // 틀림
    if (colorId !== sequence[inputIdx]) {
      setLit(colorId);
      setPhase(PHASE.WRONG);
      const reached = sequence.length - 1; // 이번 라운드 실패 전까지
      const pts = Math.max(0, reached) * 10;
      setBest(reached);
      setTimeout(() => {
        addResult('사이먼', `${reached}단계`, pts);
        setLit(null);
        setPhase(PHASE.DONE);
      }, 800);
      return;
    }

    // 맞음
    setLit(colorId);
    setTimeout(() => setLit(null), 200);

    const nextIdx = inputIdx + 1;
    if (nextIdx >= sequence.length) {
      // 라운드 클리어
      setBest(sequence.length);
      setTimeout(() => nextRound(sequence), 700);
    } else {
      setInputIdx(nextIdx);
    }
  };

  const handleRestart = () => {
    clearTimeout(timerRef.current);
    setPhase(PHASE.READY);
    setSequence([]);
    setRound(0);
    setLit(null);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <main className="max-w-lg mx-auto px-4 pt-8 pb-16">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/game" className="text-gray-400 hover:text-gray-600 text-2xl">←</Link>
        <h1 className="text-2xl font-bold text-gray-800">🎮 사이먼 게임</h1>
      </div>

      {/* 준비 화면 */}
      {phase === PHASE.READY && (
        <div className="flex flex-col gap-6">
          <AdaptiveLevelPicker
            levels={LEVELS.map((l) => l.label)}
            levelIdx={levelIdx}
            onChange={setLevelIdx}
            recommendation={recommendation}
            themeColor="purple"
          />
          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 text-center flex flex-col gap-2">
            <p className="text-gray-600 text-sm leading-relaxed">
              색상이 순서대로 빛납니다.<br />
              같은 순서로 눌러보세요. 틀리면 끝!
            </p>
            <p className="text-purple-600 font-semibold text-sm">시작 길이: {level.startLen}개 • 속도: {level.label}</p>
          </div>
          <button
            onClick={handleStart}
            className="w-full py-5 bg-purple-600 text-white text-xl font-bold rounded-2xl shadow-lg hover:bg-purple-700 active:scale-95 transition-all"
          >
            시작!
          </button>
        </div>
      )}

      {/* 게임 화면 */}
      {(phase === PHASE.SHOW || phase === PHASE.INPUT || phase === PHASE.WRONG) && (
        <div className="flex flex-col items-center gap-8">
          {/* 상태 표시 */}
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 rounded-2xl px-5 py-2 text-center">
              <p className="text-xs text-purple-500 font-medium">현재 단계</p>
              <p className="text-2xl font-bold text-purple-700">{round}</p>
            </div>
            {phase === PHASE.SHOW && (
              <p className="text-gray-500 font-semibold animate-pulse">순서를 기억하세요…</p>
            )}
            {phase === PHASE.INPUT && (
              <p className="text-gray-700 font-semibold">{inputIdx + 1} / {sequence.length} 번째</p>
            )}
            {phase === PHASE.WRONG && (
              <p className="text-red-500 font-bold text-lg">틀렸어요!</p>
            )}
          </div>

          {/* 4색 버튼 그리드 */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            {COLORS.map((c) => {
              const isLit = lit === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => handlePress(c.id)}
                  disabled={phase !== PHASE.INPUT}
                  className={`
                    aspect-square rounded-3xl transition-all duration-150
                    ${isLit
                      ? `${c.active} scale-95 shadow-lg ${c.shadow} ring-4 ${c.ring}`
                      : `${c.bg} opacity-${phase === PHASE.INPUT ? '100' : '70'}`
                    }
                    ${phase === PHASE.INPUT ? 'active:scale-90 cursor-pointer' : 'cursor-default'}
                  `}
                />
              );
            })}
          </div>

          {/* 색상 레이블 */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs text-center">
            {COLORS.map((c) => (
              <p key={c.id} className="text-xs text-gray-400 font-medium">{c.label}</p>
            ))}
          </div>
        </div>
      )}

      {/* 결과 화면 */}
      {phase === PHASE.DONE && (
        <div className="flex flex-col items-center gap-6 mt-4">
          <div className="text-7xl">
            {best >= 10 ? '🏆' : best >= 7 ? '👏' : best >= 5 ? '🙂' : '💪'}
          </div>
          <p className="text-3xl font-bold text-gray-800">게임 오버!</p>

          <div className="bg-purple-50 rounded-3xl p-6 w-full text-center">
            <p className="text-gray-500 text-sm mb-1">최종 기록</p>
            <p className="text-5xl font-bold text-purple-600 mb-1">{best}<span className="text-2xl text-gray-400 ml-1">단계</span></p>
            <p className="text-green-600 font-semibold mt-3">+{best * 10} 포인트 획득 🌱</p>
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={handleRestart}
              className="flex-1 py-4 bg-purple-100 text-purple-700 text-lg font-semibold rounded-2xl hover:bg-purple-200 transition-all"
            >
              다시 하기
            </button>
            <Link
              href="/game"
              className="flex-1 py-4 bg-purple-600 text-white text-lg font-semibold rounded-2xl text-center hover:bg-purple-700 transition-all"
            >
              훈련 목록
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
