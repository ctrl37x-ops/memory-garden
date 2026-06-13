import Link from 'next/link';
import PlantProgress from '@/components/main/PlantProgress';
import StreakBanner from '@/components/main/StreakBanner';
import DailyGoal from '@/components/main/DailyGoal';

export const metadata = { title: '오늘의 훈련 — 기억의 정원' };

const GAMES = [
  {
    href: '/game/numbers',
    emoji: '🔢',
    title: '숫자 기억',
    desc: '숫자 순서를 기억하고 입력하세요',
    color: 'from-blue-50 to-blue-100',
    border: 'border-blue-200',
    badge: '집중력',
  },
  {
    href: '/game/words',
    emoji: '📝',
    title: '단어 연상',
    desc: '단어 목록을 외우고 떠올려보세요',
    color: 'from-purple-50 to-purple-100',
    border: 'border-purple-200',
    badge: '언어 기억',
  },
  {
    href: '/game/faces',
    emoji: '🧑',
    title: '얼굴-이름 매칭',
    desc: '얼굴과 이름을 기억하고 맞춰보세요',
    color: 'from-orange-50 to-orange-100',
    border: 'border-orange-200',
    badge: '사람 기억',
  },
  {
    href: '/game/simon',
    emoji: '🎮',
    title: '사이먼 게임',
    desc: '색상 순서를 기억하고 따라 눌러보세요',
    color: 'from-purple-50 to-purple-100',
    border: 'border-purple-200',
    badge: '순서 기억',
  },
  {
    href: '/game/tiles',
    emoji: '🟦',
    title: '타일 기억',
    desc: '빛난 타일 위치를 기억하고 눌러보세요',
    color: 'from-indigo-50 to-indigo-100',
    border: 'border-indigo-200',
    badge: '공간 기억',
  },
  {
    href: '/game/mywords',
    emoji: '📚',
    title: '나만의 단어장',
    desc: '자주 잊는 단어를 저장하고 퀴즈로 외워요',
    color: 'from-teal-50 to-teal-100',
    border: 'border-teal-200',
    badge: '어휘력',
  },
];

export default function GameDashboard() {
  return (
    <main className="max-w-lg mx-auto px-4 pt-8 pb-16">
      {/* 상단 헤더 */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/" className="text-gray-400 hover:text-gray-600 text-2xl">←</Link>
        <h1 className="text-2xl font-bold text-gray-800">🌱 오늘의 훈련</h1>
      </div>

      {/* 식물 진행도 */}
      <PlantProgress />

      {/* 연속 출석 스트릭 */}
      <StreakBanner />

      {/* 하루 목표 */}
      <DailyGoal />

      {/* 훈련 기록 링크 */}
      <Link
        href="/game/history"
        className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-5 py-3 mt-4 shadow-sm hover:shadow-md transition-all"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">📊</span>
          <span className="font-semibold text-gray-700">훈련 기록 보기</span>
        </div>
        <span className="text-gray-400 text-xl">›</span>
      </Link>

      {/* 게임 목록 */}
      <h2 className="text-xl font-bold text-gray-700 mt-8 mb-4">훈련 게임 선택</h2>
      <div className="flex flex-col gap-4">
        {GAMES.map((game) => (
          <Link
            key={game.href}
            href={game.href}
            className={`flex items-center gap-4 bg-gradient-to-r ${game.color} border ${game.border} rounded-2xl p-5 shadow-sm hover:shadow-md active:scale-95 transition-all duration-200`}
          >
            <span className="text-5xl">{game.emoji}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold text-gray-800">{game.title}</p>
                <span className="text-xs bg-white/70 text-gray-600 px-2 py-0.5 rounded-full">
                  {game.badge}
                </span>
              </div>
              <p className="text-gray-500 mt-0.5">{game.desc}</p>
            </div>
            <span className="text-gray-400 text-xl">›</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
