'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import useGameStore from '@/store/useGameStore';
import AdaptiveLevelPicker from '@/components/main/AdaptiveLevelPicker';

const LEVELS = [
  { label: '쉬움',   timeLimit: 60, ops: ['+', '-'],      max: 10 },
  { label: '보통',   timeLimit: 60, ops: ['+', '-', '×'], max: 12 },
  { label: '어려움', timeLimit: 45, ops: ['+', '-', '×'], max: 20 },
];

const PHASE = { READY: 'ready', PLAYING: 'playing', DONE: 'done' };

function makeQuestion(level) {
  const op = level.ops[Math.floor(Math.random() * level.ops.length)];
  let a, b, answer;

  if (op === '+') {
    a = Math.floor(Math.random() * level.max) + 1;
    b = Math.floor(Math.random() * level.max) + 1;
    answer = a + b;
  } else if (op === '-') {
    a = Math.floor(Math.random() * level.max) + 2;
    b = Math.floor(Math.random() * (a - 1)) + 1;
    answer = a - b;
  } else {
    // 곱셈: 작은 숫자로 제한
    a = Math.floor(Math.random() * 9) + 2;
    b = Math.floor(Math.random() * 9) + 2;
    answer = a * b;
  }

  // 오답 보기 3개 생성 (정답 근처 랜덤)
  const wrongs = new Set();
  while (wrongs.size < 3) {
    const delta = Math.floor(Math.random() * 8) + 1;
    const w = Math.random() > 0.5 ? answer + delta : Math.max(0, answer - delta);
    if (w !== answer) wrongs.add(w);
  }

  const choices = [answer, ...wrongs].sort(() => Math.random() - 0.5);
  return { expr: `${a} ${op} ${b}`, answer, choices };
}

export default function MathGame() {
  const { addResult, getRecommendedLevel } = useGameStore();
  const recommendation = getRecommendedLevel('빠른 연산');

  const [levelIdx, setLevelIdx] = useState(recommendation?.level ?? 0);
  const [phase, setPhase]       = useState(PHASE.READY);
  const [question, setQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [correct, setCorrect]   = useState(0);
  const [total, setTotal]       = useState(0);
  const [flash, setFlash]       = useState(null); // 'correct' | 'wrong'

  const level    = LEVELS[levelIdx];
  const timerRef = useRef(null);

  const nextQuestion = useCallback(() => {
    setQuestion(makeQuestion(LEVELS[levelIdx]));
    setFlash(null);
  }, [levelIdx]);

  const handleStart = () => {
    setCorrect(0);
    setTotal(0);
    setTimeLeft(level.timeLimit);
    setPhase(PHASE.PLAYING);
    setQuestion(makeQuestion(level));
    setFlash(null);
  };

  // 타이머
  useEffect(() => {
    if (phase !== PHASE.PLAYING) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setPhase(PHASE.DONE);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // 결과 저장
  useEffect(() => {
    if (phase === PHASE.DONE && total > 0) {
      const pts = correct * 5;
      addResult('빠른 연산', `${correct}/${total}`, pts);
    }
  }, [phase]);

  const handleChoice = (choice) => {
    if (phase !== PHASE.PLAYING || flash) return;
    const isCorrect = choice === question.answer;
    setFlash(isCorrect ? 'correct' : 'wrong');
    setTotal((t) => t + 1);
    if (isCorrect) setCorrect((c) => c + 1);
    setTimeout(nextQuestion, 350);
  };

  const handleRestart = () => {
    clearInterval(timerRef.current);
    setPhase(PHASE.READY);
    setQuestion(null);
    setFlash(null);
  };

  // 타이머 색상
  const timerColor = timeLeft > 20 ? 'text-gray-700' : timeLeft > 10 ? 'text-yellow-500' : 'text-red-500';
  const timerBg    = timeLeft > 20 ? 'bg-gray-100'   : timeLeft > 10 ? 'bg-yellow-50'    : 'bg-red-50';

  return (
    <main className="max-w-lg mx-auto px-4 pt-8 pb-16">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/game" className="text-gray-400 hover:text-gray-600 text-2xl">←</Link>
        <h1 className="text-2xl font-bold text-gray-800">🧮 빠른 연산</h1>
      </div>

      {/* 준비 화면 */}
      {phase === PHASE.READY && (
        <div className="flex flex-col gap-6">
          <AdaptiveLevelPicker
            levels={LEVELS.map((l) => l.label)}
            levelIdx={levelIdx}
            onChange={setLevelIdx}
            recommendation={recommendation}
            themeColor="amber"
          />
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-center flex flex-col gap-2">
            <p className="text-gray-600 text-sm leading-relaxed">
              제한 시간 안에 최대한 많이 맞춰보세요!<br />
              4개 보기 중 정답을 골라주세요.
            </p>
            <p className="text-amber-600 font-semibold text-sm">
              {level.timeLimit}초 · 연산: {level.ops.join(' ')}
            </p>
          </div>
          <button
            onClick={handleStart}
            className="w-full py-5 bg-amber-500 text-white text-xl font-bold rounded-2xl shadow-lg hover:bg-amber-600 active:scale-95 transition-all"
          >
            시작!
          </button>
        </div>
      )}

      {/* 게임 화면 */}
      {phase === PHASE.PLAYING && question && (
        <div className="flex flex-col gap-6">
          {/* 상태 바 */}
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl ${timerBg}`}>
              <span className="text-lg">⏱️</span>
              <span className={`text-2xl font-bold tabular-nums ${timerColor}`}>{timeLeft}</span>
            </div>
            <div className="flex gap-3 text-center">
              <div className="bg-green-50 px-4 py-2 rounded-2xl">
                <p className="text-xs text-green-500">정답</p>
                <p className="text-xl font-bold text-green-600">{correct}</p>
              </div>
              <div className="bg-gray-50 px-4 py-2 rounded-2xl">
                <p className="text-xs text-gray-400">전체</p>
                <p className="text-xl font-bold text-gray-600">{total}</p>
              </div>
            </div>
          </div>

          {/* 타이머 진행 바 */}
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                timeLeft > 20 ? 'bg-amber-400' : timeLeft > 10 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ width: `${(timeLeft / level.timeLimit) * 100}%` }}
            />
          </div>

          {/* 문제 카드 */}
          <div className={`rounded-3xl p-8 text-center border-2 transition-all duration-200 ${
            flash === 'correct' ? 'bg-green-50 border-green-300' :
            flash === 'wrong'   ? 'bg-red-50 border-red-300' :
            'bg-amber-50 border-amber-200'
          }`}>
            {flash === 'correct' && <p className="text-green-500 font-bold text-sm mb-2">정답! ✓</p>}
            {flash === 'wrong'   && <p className="text-red-400 font-bold text-sm mb-2">오답 ✗</p>}
            <p className="text-5xl font-bold text-gray-800 tracking-wide">{question.expr} = ?</p>
          </div>

          {/* 보기 */}
          <div className="grid grid-cols-2 gap-3">
            {question.choices.map((c, i) => (
              <button
                key={i}
                onClick={() => handleChoice(c)}
                disabled={!!flash}
                className="py-5 bg-white border-2 border-gray-200 rounded-2xl text-2xl font-bold text-gray-800 hover:bg-amber-50 hover:border-amber-300 active:scale-95 transition-all disabled:opacity-60"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 결과 화면 */}
      {phase === PHASE.DONE && (
        <div className="flex flex-col items-center gap-6 mt-4">
          <div className="text-7xl">
            {correct >= 20 ? '🏆' : correct >= 12 ? '👏' : correct >= 6 ? '🙂' : '💪'}
          </div>
          <p className="text-3xl font-bold text-gray-800">시간 종료!</p>

          <div className="bg-amber-50 rounded-3xl p-6 w-full text-center">
            <p className="text-gray-500 text-sm mb-1">맞힌 문제</p>
            <p className="text-5xl font-bold text-amber-600 mb-1">
              {correct}<span className="text-2xl text-gray-400 ml-1">/ {total}문제</span>
            </p>
            {total > 0 && (
              <p className="text-gray-500 text-sm mt-1">
                정답률 {Math.round((correct / total) * 100)}%
              </p>
            )}
            <p className="text-green-600 font-semibold mt-3">+{correct * 5} 포인트 획득 🌱</p>
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={handleRestart}
              className="flex-1 py-4 bg-amber-100 text-amber-700 text-lg font-semibold rounded-2xl hover:bg-amber-200 transition-all"
            >
              다시 하기
            </button>
            <Link
              href="/game"
              className="flex-1 py-4 bg-amber-500 text-white text-lg font-semibold rounded-2xl text-center hover:bg-amber-600 transition-all"
            >
              훈련 목록
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
