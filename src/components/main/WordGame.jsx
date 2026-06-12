'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import useGameStore from '@/store/useGameStore';
import AdaptiveLevelPicker from '@/components/main/AdaptiveLevelPicker';

// 단어 풀 (일상적이고 친숙한 단어)
const WORD_POOL = [
  '사과', '바나나', '포도', '수박', '딸기', '귤', '복숭아', '자두', '망고', '키위',
  '강아지', '고양이', '토끼', '거북이', '금붕어', '햄스터', '앵무새', '병아리',
  '학교', '병원', '도서관', '공원', '시장', '약국', '은행', '우체국',
  '봄비', '여름', '가을', '겨울', '태양', '달빛', '무지개', '구름',
  '행복', '감사', '사랑', '건강', '희망', '평화', '기쁨',
  '피아노', '기타', '바이올린', '노래', '춤', '그림', '독서',
];

const LEVELS = [
  { label: '쉬움', count: 4, showSec: 10 },
  { label: '보통', count: 6, showSec: 12 },
  { label: '어려움', count: 8, showSec: 15 },
];

const PHASE = {
  READY: 'ready',
  SHOW: 'show',
  INPUT: 'input',
  RESULT: 'result',
};

function pickRandom(pool, count) {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function WordGame() {
  const { addResult, getRecommendedLevel } = useGameStore();
  const recommendation = getRecommendedLevel('단어 연상');

  const [levelIdx, setLevelIdx] = useState(recommendation.level);
  const [phase, setPhase] = useState(PHASE.READY);
  const [words, setWords] = useState([]);
  const [inputWord, setInputWord] = useState('');
  const [answered, setAnswered] = useState([]);
  const [submitted, setSubmitted] = useState([]);
  const [countdown, setCountdown] = useState(0);

  const startGame = useCallback(() => {
    const level = LEVELS[levelIdx];
    const picked = pickRandom(WORD_POOL, level.count);
    setWords(picked);
    setAnswered([]);
    setSubmitted([]);
    setInputWord('');
    setCountdown(level.showSec);
    setPhase(PHASE.SHOW);
  }, [levelIdx]);

  // 카운트다운
  useEffect(() => {
    if (phase !== PHASE.SHOW) return;
    if (countdown <= 0) {
      setPhase(PHASE.INPUT);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  // 단어 제출
  const handleAddWord = () => {
    const trimmed = inputWord.trim();
    if (!trimmed || submitted.includes(trimmed)) return;
    const isCorrect = words.includes(trimmed);
    setSubmitted((prev) => [...prev, trimmed]);
    if (isCorrect) setAnswered((prev) => [...prev, trimmed]);
    setInputWord('');
  };

  const handleFinish = () => {
    const points = answered.length * LEVELS[levelIdx].count * 3;
    addResult('단어 연상', `${answered.length}/${words.length}`, points);
    setPhase(PHASE.RESULT);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAddWord();
  };

  return (
    <main className="max-w-lg mx-auto px-4 pt-8 pb-16">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/game" className="text-gray-400 hover:text-gray-600 text-2xl">←</Link>
        <h1 className="text-2xl font-bold text-gray-800">📝 단어 연상</h1>
      </div>

      {/* 준비 */}
      {phase === PHASE.READY && (
        <div className="flex flex-col items-center gap-6 mt-8">
          <div className="text-7xl">📝</div>
          <p className="text-xl font-semibold text-gray-700 text-center">
            단어들을 보여드릴게요.<br />기억했다가 최대한 많이 적어주세요!
          </p>
          <AdaptiveLevelPicker
            levels={LEVELS}
            levelIdx={levelIdx}
            onChange={setLevelIdx}
            recommendation={recommendation}
            themeColor="purple"
          />
          <p className="text-gray-400 text-sm">
            {LEVELS[levelIdx].count}개 단어 · {LEVELS[levelIdx].showSec}초 동안 표시
          </p>
          <button
            onClick={startGame}
            className="px-12 py-4 bg-purple-600 text-white text-xl font-bold rounded-2xl shadow-lg hover:bg-purple-700 active:scale-95 transition-all"
          >
            시작!
          </button>
        </div>
      )}

      {/* 단어 표시 */}
      {phase === PHASE.SHOW && (
        <div className="flex flex-col items-center gap-6 mt-4">
          <div className="flex justify-between items-center w-full">
            <p className="text-gray-500">잘 기억해두세요</p>
            <span className="text-2xl font-bold text-purple-600">{countdown}초</span>
          </div>
          <div className="w-full bg-purple-100 rounded-full h-3 mb-2">
            <div
              className="h-3 bg-purple-500 rounded-full transition-all duration-1000"
              style={{ width: `${(countdown / LEVELS[levelIdx].showSec) * 100}%` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 w-full">
            {words.map((word, i) => (
              <div
                key={i}
                className="bg-white border-2 border-purple-200 rounded-2xl py-4 text-center text-2xl font-bold text-purple-700 shadow-sm"
              >
                {word}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 입력 화면 */}
      {phase === PHASE.INPUT && (
        <div className="flex flex-col gap-5 mt-4">
          <p className="text-xl font-semibold text-gray-700">기억나는 단어를 입력해주세요</p>

          <div className="flex gap-2">
            <input
              type="text"
              value={inputWord}
              onChange={(e) => setInputWord(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              placeholder="단어 입력 후 Enter"
              className="flex-1 text-xl border-2 border-purple-300 rounded-xl px-4 py-3 outline-none focus:border-purple-500"
            />
            <button
              onClick={handleAddWord}
              className="px-5 py-3 bg-purple-600 text-white text-xl rounded-xl hover:bg-purple-700 active:scale-95 transition-all"
            >
              +
            </button>
          </div>

          {/* 입력된 단어 태그 */}
          {submitted.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {submitted.map((w, i) => {
                const ok = words.includes(w);
                return (
                  <span
                    key={i}
                    className={`px-4 py-2 rounded-full text-lg font-semibold ${
                      ok ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-50 text-red-400 border border-red-200 line-through'
                    }`}
                  >
                    {w}
                  </span>
                );
              })}
            </div>
          )}

          <p className="text-gray-400 text-sm">{answered.length}개 맞힘 · {LEVELS[levelIdx].count}개 중</p>

          <button
            onClick={handleFinish}
            className="w-full py-4 bg-purple-600 text-white text-xl font-bold rounded-2xl shadow hover:bg-purple-700 active:scale-95 transition-all mt-2"
          >
            제출하기
          </button>
        </div>
      )}

      {/* 결과 */}
      {phase === PHASE.RESULT && (
        <div className="flex flex-col items-center gap-6 mt-8">
          <div className="text-7xl">
            {answered.length === words.length ? '🏆' : answered.length >= words.length / 2 ? '👏' : '💪'}
          </div>
          <p className="text-3xl font-bold text-gray-800">훈련 완료!</p>

          <div className="bg-purple-50 rounded-3xl p-6 w-full">
            <p className="text-5xl font-bold text-purple-600 text-center mb-1">
              {answered.length}/{words.length}
            </p>
            <p className="text-gray-500 text-center">
              정답률 {Math.round((answered.length / words.length) * 100)}%
            </p>
            <p className="text-green-600 font-semibold text-center mt-3">
              +{answered.length * LEVELS[levelIdx].count * 3} 포인트 획득 🌱
            </p>

            {/* 정답 확인 */}
            <div className="mt-4 pt-4 border-t border-purple-200">
              <p className="text-sm text-gray-500 mb-2">전체 단어 목록</p>
              <div className="flex flex-wrap gap-2">
                {words.map((w, i) => (
                  <span
                    key={i}
                    className={`px-3 py-1 rounded-full text-base font-semibold ${
                      answered.includes(w)
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {answered.includes(w) ? '✓ ' : ''}{w}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={() => setPhase(PHASE.READY)}
              className="flex-1 py-4 bg-purple-100 text-purple-700 text-lg font-semibold rounded-2xl hover:bg-purple-200 transition-all"
            >
              다시 하기
            </button>
            <Link
              href="/game"
              className="flex-1 py-4 bg-purple-600 text-white text-lg font-semibold rounded-2xl text-center hover:bg-purple-700 transition-all"
            >
              다른 게임
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
