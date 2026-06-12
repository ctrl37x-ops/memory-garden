'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import useGameStore from '@/store/useGameStore';
import AdaptiveLevelPicker from '@/components/main/AdaptiveLevelPicker';

// 캐릭터 풀 — 이모지 + 배경색 + 이름 조합
const CHARACTER_POOL = [
  { id: 1,  emoji: '👨‍🦳', bg: '#FFE4B5', name: '김영수' },
  { id: 2,  emoji: '👩‍🦰', bg: '#FADADD', name: '이미영' },
  { id: 3,  emoji: '👨‍🦱', bg: '#B0E0E6', name: '박준호' },
  { id: 4,  emoji: '👩‍🦲', bg: '#C8F7C5', name: '최수진' },
  { id: 5,  emoji: '🧔',   bg: '#E8DAEF', name: '정민철' },
  { id: 6,  emoji: '👱‍♀️', bg: '#FFF9C4', name: '한지원' },
  { id: 7,  emoji: '👴',   bg: '#F5CBA7', name: '오태양' },
  { id: 8,  emoji: '👵',   bg: '#A9DFBF', name: '류정숙' },
  { id: 9,  emoji: '🧑‍🦰', bg: '#AED6F1', name: '신현우' },
  { id: 10, emoji: '👩‍🦱', bg: '#F9AABB', name: '강미래' },
  { id: 11, emoji: '👨',   bg: '#FDFD96', name: '윤성훈' },
  { id: 12, emoji: '👩',   bg: '#D2B4DE', name: '임세연' },
];

const LEVELS = [
  { label: '쉬움',   count: 3, showSec: 10 },
  { label: '보통',   count: 5, showSec: 15 },
  { label: '어려움', count: 7, showSec: 20 },
];

const PHASE = {
  READY:  'ready',
  SHOW:   'show',
  QUIZ:   'quiz',
  RESULT: 'result',
};

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// 4지선다 보기 생성 (정답 1 + 오답 3)
function makeChoices(correct, allChars) {
  const others = shuffle(allChars.filter((c) => c.id !== correct.id)).slice(0, 3);
  return shuffle([correct, ...others]);
}

export default function FaceGame() {
  const { addResult, getRecommendedLevel } = useGameStore();
  const recommendation = getRecommendedLevel('얼굴-이름');

  const [levelIdx, setLevelIdx]     = useState(recommendation.level);
  const [phase, setPhase]           = useState(PHASE.READY);
  const [characters, setCharacters] = useState([]);
  const [countdown, setCountdown]   = useState(0);
  const [quizIdx, setQuizIdx]       = useState(0);
  const [choices, setChoices]       = useState([]);
  const [selected, setSelected]     = useState(null);
  const [correct, setCorrect]       = useState(0);
  const [answeredCorrect, setAnsweredCorrect] = useState(null);

  const level = LEVELS[levelIdx];

  // 게임 시작
  const startGame = useCallback(() => {
    const picked = shuffle(CHARACTER_POOL).slice(0, LEVELS[levelIdx].count);
    setCharacters(picked);
    setCorrect(0);
    setQuizIdx(0);
    setSelected(null);
    setAnsweredCorrect(null);
    setCountdown(LEVELS[levelIdx].showSec);
    setPhase(PHASE.SHOW);
  }, [levelIdx]);

  // 카운트다운
  useEffect(() => {
    if (phase !== PHASE.SHOW) return;
    if (countdown <= 0) {
      // 퀴즈 첫 문제 세팅
      setChoices(makeChoices(characters[0], characters));
      setPhase(PHASE.QUIZ);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown, characters]);

  // 보기 선택
  const handleSelect = (choice) => {
    if (selected) return; // 이미 선택함
    setSelected(choice);
    const isCorrect = choice.id === characters[quizIdx].id;
    setAnsweredCorrect(isCorrect);
    if (isCorrect) setCorrect((c) => c + 1);

    setTimeout(() => {
      const nextIdx = quizIdx + 1;
      if (nextIdx >= characters.length) {
        // 게임 종료
        const finalCorrect = isCorrect ? correct + 1 : correct;
        const points = finalCorrect * level.count * 4;
        addResult('얼굴-이름', `${finalCorrect}/${characters.length}`, points);
        setPhase(PHASE.RESULT);
      } else {
        setQuizIdx(nextIdx);
        setChoices(makeChoices(characters[nextIdx], characters));
        setSelected(null);
        setAnsweredCorrect(null);
      }
    }, 1200);
  };

  const handleRestart = () => {
    setPhase(PHASE.READY);
    setCorrect(0);
    setQuizIdx(0);
    setSelected(null);
  };

  // 최종 정답 수 (result 단계에서)
  const finalCorrect = phase === PHASE.RESULT ? correct : 0;

  return (
    <main className="max-w-lg mx-auto px-4 pt-8 pb-16">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/game" className="text-gray-400 hover:text-gray-600 text-2xl">←</Link>
        <h1 className="text-2xl font-bold text-gray-800">🧑 얼굴-이름 매칭</h1>
      </div>

      {/* ── 준비 화면 ── */}
      {phase === PHASE.READY && (
        <div className="flex flex-col items-center gap-6 mt-8">
          <div className="text-7xl">🧑</div>
          <p className="text-xl font-semibold text-gray-700 text-center">
            사람들의 얼굴과 이름을 기억해두세요.<br />나중에 이름을 맞혀야 해요!
          </p>
          <AdaptiveLevelPicker
            levels={LEVELS}
            levelIdx={levelIdx}
            onChange={setLevelIdx}
            recommendation={recommendation}
            themeColor="orange"
          />
          <p className="text-gray-400 text-sm">
            {LEVELS[levelIdx].count}명 · {LEVELS[levelIdx].showSec}초 동안 표시
          </p>
          <button
            onClick={startGame}
            className="px-12 py-4 bg-orange-500 text-white text-xl font-bold rounded-2xl shadow-lg hover:bg-orange-600 active:scale-95 transition-all"
          >
            시작!
          </button>
        </div>
      )}

      {/* ── 얼굴+이름 표시 ── */}
      {phase === PHASE.SHOW && (
        <div className="flex flex-col gap-5">
          <div className="flex justify-between items-center">
            <p className="text-gray-600 font-semibold text-lg">잘 기억해두세요!</p>
            <span className="text-2xl font-bold text-orange-500">{countdown}초</span>
          </div>
          <div className="w-full bg-orange-100 rounded-full h-3 mb-1">
            <div
              className="h-3 bg-orange-400 rounded-full transition-all duration-1000"
              style={{ width: `${(countdown / level.showSec) * 100}%` }}
            />
          </div>

          {/* 캐릭터 카드 그리드 */}
          <div className={`grid gap-3 ${characters.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {characters.map((char) => (
              <FaceCard key={char.id} char={char} showName />
            ))}
          </div>
        </div>
      )}

      {/* ── 퀴즈 ── */}
      {phase === PHASE.QUIZ && characters[quizIdx] && (
        <div className="flex flex-col items-center gap-6">
          {/* 진행 바 */}
          <div className="w-full flex gap-1.5">
            {characters.map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full transition-all ${
                  i < quizIdx ? 'bg-orange-400' : i === quizIdx ? 'bg-orange-300 ring-1 ring-orange-400' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          <p className="text-gray-500 text-base">
            {quizIdx + 1} / {characters.length} — 이 사람의 이름은?
          </p>

          {/* 퀴즈 얼굴 */}
          <FaceCard char={characters[quizIdx]} showName={false} large />

          {/* 정답/오답 피드백 오버레이 */}
          {selected && (
            <p className={`text-2xl font-bold ${answeredCorrect ? 'text-green-600' : 'text-red-500'}`}>
              {answeredCorrect ? '정답! 🎉' : `아쉬워요 — ${characters[quizIdx].name}`}
            </p>
          )}

          {/* 4지선다 */}
          <div className="grid grid-cols-2 gap-3 w-full">
            {choices.map((choice) => {
              const isSelected = selected?.id === choice.id;
              const isAnswer   = choice.id === characters[quizIdx].id;
              let btnClass = 'bg-white border-2 border-gray-200 text-gray-800';
              if (selected) {
                if (isAnswer) btnClass = 'bg-green-100 border-2 border-green-400 text-green-800 font-bold';
                else if (isSelected) btnClass = 'bg-red-100 border-2 border-red-300 text-red-600 line-through';
                else btnClass = 'bg-white border-2 border-gray-200 text-gray-400 opacity-60';
              }
              return (
                <button
                  key={choice.id}
                  onClick={() => handleSelect(choice)}
                  disabled={!!selected}
                  className={`py-4 rounded-2xl text-xl font-semibold transition-all active:scale-95 ${btnClass}`}
                >
                  {choice.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 최종 결과 ── */}
      {phase === PHASE.RESULT && (
        <div className="flex flex-col items-center gap-6 mt-8">
          <div className="text-7xl">
            {finalCorrect === characters.length ? '🏆' : finalCorrect >= characters.length / 2 ? '👏' : '💪'}
          </div>
          <p className="text-3xl font-bold text-gray-800">훈련 완료!</p>

          <div className="bg-orange-50 rounded-3xl p-6 w-full text-center">
            <p className="text-5xl font-bold text-orange-500 mb-1">
              {finalCorrect}/{characters.length}
            </p>
            <p className="text-gray-500">
              정답률 {Math.round((finalCorrect / characters.length) * 100)}%
            </p>
            <p className="text-green-600 font-semibold mt-3">
              +{finalCorrect * level.count * 4} 포인트 획득 🌱
            </p>
          </div>

          {/* 정답 복습 */}
          <div className="w-full">
            <p className="text-gray-500 text-sm mb-3">오늘 만난 사람들</p>
            <div className={`grid gap-3 ${characters.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {characters.map((char) => (
                <FaceCard key={char.id} char={char} showName />
              ))}
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={handleRestart}
              className="flex-1 py-4 bg-orange-100 text-orange-700 text-lg font-semibold rounded-2xl hover:bg-orange-200 transition-all"
            >
              다시 하기
            </button>
            <Link
              href="/game"
              className="flex-1 py-4 bg-orange-500 text-white text-lg font-semibold rounded-2xl text-center hover:bg-orange-600 transition-all"
            >
              다른 게임
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

// 얼굴 카드 컴포넌트
function FaceCard({ char, showName, large = false }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`rounded-full flex items-center justify-center shadow-md select-none ${
          large ? 'w-36 h-36 text-7xl' : 'w-20 h-20 text-4xl'
        }`}
        style={{ backgroundColor: char.bg }}
      >
        {char.emoji}
      </div>
      {showName && (
        <p className={`font-bold text-gray-800 ${large ? 'text-2xl' : 'text-base'}`}>
          {char.name}
        </p>
      )}
    </div>
  );
}
