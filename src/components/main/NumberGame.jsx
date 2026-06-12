'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import useGameStore from '@/store/useGameStore';
import AdaptiveLevelPicker from '@/components/main/AdaptiveLevelPicker';

// 난이도별 숫자 길이
const LEVELS = [
  { label: '쉬움', length: 3, showSec: 3 },
  { label: '보통', length: 5, showSec: 4 },
  { label: '어려움', length: 7, showSec: 5 },
];

function generateSequence(length) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}

// 게임 단계
const PHASE = {
  READY: 'ready',       // 시작 전
  SHOW: 'show',         // 숫자 표시 중
  INPUT: 'input',       // 사용자 입력
  RESULT: 'result',     // 결과 표시
  DONE: 'done',         // 게임 종료
};

export default function NumberGame() {
  const { addResult, getRecommendedLevel } = useGameStore();
  const recommendation = getRecommendedLevel('숫자 기억');

  const [levelIdx, setLevelIdx] = useState(recommendation.level);
  const [phase, setPhase] = useState(PHASE.READY);
  const [sequence, setSequence] = useState('');
  const [userInput, setUserInput] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [round, setRound] = useState(1);
  const [correct, setCorrect] = useState(0);
  const [isCorrect, setIsCorrect] = useState(null);
  const TOTAL_ROUNDS = 5;

  // 라운드 시작
  const startRound = useCallback(() => {
    const level = LEVELS[levelIdx];
    const seq = generateSequence(level.length);
    setSequence(seq);
    setUserInput('');
    setIsCorrect(null);
    setCountdown(level.showSec);
    setPhase(PHASE.SHOW);
  }, [levelIdx]);

  // 카운트다운 타이머
  useEffect(() => {
    if (phase !== PHASE.SHOW) return;
    if (countdown <= 0) {
      setPhase(PHASE.INPUT);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, countdown]);

  // 입력 확인
  const handleSubmit = () => {
    const ok = userInput === sequence;
    setIsCorrect(ok);
    if (ok) setCorrect((c) => c + 1);
    setPhase(PHASE.RESULT);

    // 마지막 라운드면 게임 종료
    if (round >= TOTAL_ROUNDS) {
      setTimeout(() => {
        const finalCorrect = ok ? correct + 1 : correct;
        const points = finalCorrect * LEVELS[levelIdx].length * 2;
        addResult('숫자 기억', `${finalCorrect}/${TOTAL_ROUNDS}`, points);
        setPhase(PHASE.DONE);
      }, 1500);
    } else {
      setTimeout(() => {
        setRound((r) => r + 1);
        startRound();
      }, 1500);
    }
  };

  const handleRestart = () => {
    setRound(1);
    setCorrect(0);
    setPhase(PHASE.READY);
  };

  return (
    <main className="max-w-lg mx-auto px-4 pt-8 pb-16">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/game" className="text-gray-400 hover:text-gray-600 text-2xl">←</Link>
        <h1 className="text-2xl font-bold text-gray-800">🔢 숫자 기억</h1>
      </div>

      {/* 준비 화면 */}
      {phase === PHASE.READY && (
        <div className="flex flex-col items-center gap-6 mt-8">
          <div className="text-7xl">🔢</div>
          <p className="text-xl font-semibold text-gray-700 text-center">
            숫자를 보여드릴게요.<br />잘 기억했다가 입력해주세요!
          </p>
          {/* 적응형 난이도 선택 */}
          <AdaptiveLevelPicker
            levels={LEVELS}
            levelIdx={levelIdx}
            onChange={setLevelIdx}
            recommendation={recommendation}
            themeColor="blue"
          />
          <p className="text-gray-400 text-sm">
            {LEVELS[levelIdx].length}자리 숫자 · {TOTAL_ROUNDS}라운드
          </p>
          <button
            onClick={startRound}
            className="px-12 py-4 bg-blue-600 text-white text-xl font-bold rounded-2xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
          >
            시작!
          </button>
        </div>
      )}

      {/* 숫자 표시 */}
      {phase === PHASE.SHOW && (
        <div className="flex flex-col items-center gap-6 mt-8">
          <p className="text-gray-500 text-lg">잘 기억해두세요</p>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl px-10 py-8 text-6xl font-bold tracking-[0.3em] text-blue-700 select-none">
            {sequence}
          </div>
          <div className="text-4xl font-bold text-blue-500">{countdown}초</div>
          <div className="w-full bg-blue-100 rounded-full h-3">
            <div
              className="h-3 bg-blue-500 rounded-full transition-all duration-1000"
              style={{ width: `${(countdown / LEVELS[levelIdx].showSec) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* 입력 화면 */}
      {phase === PHASE.INPUT && (
        <div className="flex flex-col items-center gap-6 mt-8">
          <p className="text-gray-700 text-xl font-semibold">방금 본 숫자를 입력해주세요</p>
          <input
            type="tel"
            inputMode="numeric"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value.replace(/\D/g, ''))}
            maxLength={LEVELS[levelIdx].length + 2}
            autoFocus
            placeholder="숫자 입력..."
            className="text-center text-4xl font-bold tracking-widest border-b-4 border-blue-400 bg-transparent outline-none py-3 w-64 text-gray-800"
          />
          <button
            onClick={handleSubmit}
            disabled={!userInput}
            className="px-12 py-4 bg-blue-600 text-white text-xl font-bold rounded-2xl shadow disabled:opacity-40 hover:bg-blue-700 active:scale-95 transition-all"
          >
            확인
          </button>
          {/* 라운드 표시 */}
          <div className="flex gap-2">
            {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${i < round - 1 ? 'bg-blue-500' : i === round - 1 ? 'bg-blue-300 ring-2 ring-blue-400' : 'bg-gray-200'}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* 라운드 결과 */}
      {phase === PHASE.RESULT && (
        <div className="flex flex-col items-center gap-4 mt-8">
          <div className="text-7xl">{isCorrect ? '🎉' : '😅'}</div>
          <p className={`text-3xl font-bold ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
            {isCorrect ? '정답!' : '아쉬워요'}
          </p>
          {!isCorrect && (
            <p className="text-gray-500 text-lg">
              정답: <span className="font-bold text-gray-700 tracking-widest">{sequence}</span>
            </p>
          )}
        </div>
      )}

      {/* 최종 결과 */}
      {phase === PHASE.DONE && (
        <div className="flex flex-col items-center gap-6 mt-8">
          <div className="text-7xl">
            {correct >= 4 ? '🏆' : correct >= 2 ? '👏' : '💪'}
          </div>
          <p className="text-3xl font-bold text-gray-800">훈련 완료!</p>
          <div className="bg-blue-50 rounded-3xl p-6 w-full text-center">
            <p className="text-5xl font-bold text-blue-600 mb-1">{correct}/{TOTAL_ROUNDS}</p>
            <p className="text-gray-500">정답률 {Math.round((correct / TOTAL_ROUNDS) * 100)}%</p>
            <p className="text-green-600 font-semibold mt-3">
              +{correct * LEVELS[levelIdx].length * 2} 포인트 획득 🌱
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={handleRestart}
              className="flex-1 py-4 bg-blue-100 text-blue-700 text-lg font-semibold rounded-2xl hover:bg-blue-200 transition-all"
            >
              다시 하기
            </button>
            <Link
              href="/game"
              className="flex-1 py-4 bg-blue-600 text-white text-lg font-semibold rounded-2xl text-center hover:bg-blue-700 transition-all"
            >
              다른 게임
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
