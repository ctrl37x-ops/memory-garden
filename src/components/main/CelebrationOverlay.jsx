'use client';

import { useEffect, useState, useCallback } from 'react';
import useGameStore from '@/store/useGameStore';

// 컨페티 이모지 풀
const CONFETTI_EMOJIS = ['🌸', '⭐', '✨', '🎉', '🌟', '💫', '🎊', '🌺', '🍀', '🌈'];

// 컨페티 조각 생성 (위치/지연/크기 랜덤)
function generateConfetti(count = 30) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    emoji: CONFETTI_EMOJIS[i % CONFETTI_EMOJIS.length],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 1.8}s`,
    duration: `${2.2 + Math.random() * 1.5}s`,
    size: `${1.2 + Math.random() * 1.4}rem`,
  }));
}

const STAGE_MESSAGES = [
  '',
  '새싹이 돋아났어요! 잘 하고 있어요 🌿',
  '꽃봉오리가 맺혔어요! 거의 다 왔어요 🌸',
  '꽃이 활짝 피었어요! 정말 대단해요 🌺',
  '멋진 나무로 자랐어요! 완벽해요 🌳',
];

export default function CelebrationOverlay() {
  const { celebratingStage, clearCelebration } = useGameStore();
  const [confetti] = useState(() => generateConfetti(30));
  const [closing, setClosing] = useState(false);

  const dismiss = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      clearCelebration();
    }, 400);
  }, [clearCelebration]);

  // 3초 후 자동 닫힘
  useEffect(() => {
    if (!celebratingStage) return;
    setClosing(false);
    const t = setTimeout(dismiss, 3200);
    return () => clearTimeout(t);
  }, [celebratingStage, dismiss]);

  if (!celebratingStage) return null;

  const { name, emoji, stage } = celebratingStage;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ animation: 'overlay-fade-in 0.25s ease forwards' }}
      onClick={dismiss}
    >
      {/* 반투명 배경 */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* 컨페티 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {confetti.map((c) => (
          <span
            key={c.id}
            className="absolute select-none"
            style={{
              left: c.left,
              top: '-5%',
              fontSize: c.size,
              animation: `confetti-fall ${c.duration} ${c.delay} ease-in forwards`,
            }}
          >
            {c.emoji}
          </span>
        ))}
      </div>

      {/* 메인 카드 */}
      <div
        className="relative bg-white rounded-3xl px-10 py-10 flex flex-col items-center gap-4 shadow-2xl mx-6"
        style={{
          animation: closing
            ? 'celebration-out 0.4s ease forwards'
            : 'celebration-in 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 식물 이모지 */}
        <div
          className="text-8xl select-none"
          style={{ animation: 'plant-bounce 1s ease 0.3s both' }}
        >
          {emoji}
        </div>

        {/* 단계 이름 */}
        <div className="text-center">
          <p className="text-sm font-semibold text-green-500 uppercase tracking-widest mb-1">
            식물이 성장했어요!
          </p>
          <p className="text-4xl font-bold text-gray-800">{name}</p>
        </div>

        {/* 메시지 */}
        <p className="text-gray-500 text-center text-base leading-relaxed">
          {STAGE_MESSAGES[stage] || '대단해요!'}
        </p>

        {/* 단계 점 인디케이터 */}
        <div className="flex gap-2 mt-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`rounded-full transition-all ${
                i <= stage
                  ? 'w-3 h-3 bg-green-500'
                  : 'w-2 h-2 bg-gray-200 self-center'
              }`}
            />
          ))}
        </div>

        {/* 닫기 */}
        <button
          onClick={dismiss}
          className="mt-2 px-8 py-3 bg-green-600 text-white font-bold text-lg rounded-2xl hover:bg-green-700 active:scale-95 transition-all"
        >
          계속하기 🌱
        </button>

        <p className="text-xs text-gray-300">화면을 탭하면 닫혀요</p>
      </div>
    </div>
  );
}
