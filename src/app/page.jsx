import Link from 'next/link';

export const metadata = {
  title: '기억의 정원 — 매일 5분 두뇌 훈련',
  description: '중장년층을 위한 인지 훈련 앱. 매일 짧은 게임으로 기억력을 키워보세요.',
};

const GAMES = [
  { emoji: '🔢', title: '숫자 기억', desc: '숫자 순서를 기억하고 입력하세요', badge: '집중력' },
  { emoji: '📝', title: '단어 연상', desc: '단어 목록을 외우고 떠올려보세요', badge: '언어 기억' },
  { emoji: '🧑', title: '얼굴-이름 매칭', desc: '얼굴과 이름을 기억하고 맞춰보세요', badge: '사람 기억' },
  { emoji: '📚', title: '나만의 단어장', desc: '자주 잊는 단어를 저장하고 퀴즈로 외워요', badge: '어휘력' },
  { emoji: '🎮', title: '사이먼 게임', desc: '색상 순서를 기억하고 따라 눌러보세요', badge: '순서 기억' },
  { emoji: '🟦', title: '타일 기억', desc: '빛난 타일 위치를 기억하고 눌러보세요', badge: '공간 기억' },
  { emoji: '🧮', title: '빠른 연산', desc: '제한 시간 안에 최대한 많이 맞춰보세요', badge: '계산력' },
];

const HOW_TO = [
  { step: '01', title: '훈련 게임 선택', desc: '숫자 기억, 단어 연상, 얼굴 매칭, 단어장 중 원하는 게임을 고르세요.' },
  { step: '02', title: '매일 조금씩 플레이', desc: '하루 5분이면 충분해요. 꾸준히 할수록 효과가 높아집니다.' },
  { step: '03', title: '식물을 키워요', desc: '훈련할수록 포인트가 쌓이고, 씨앗이 자라 커다란 나무가 돼요.' },
  { step: '04', title: '기록으로 성장 확인', desc: '훈련 기록 페이지에서 날짜별 점수와 정답률을 확인하세요.' },
];

const BENEFITS = [
  { emoji: '🧠', title: '작업 기억 향상', desc: '숫자·단어 게임이 단기 기억 저장 능력을 높여줍니다.' },
  { emoji: '👁️', title: '시각적 집중력', desc: '얼굴 매칭 게임이 사람 얼굴·이름 기억력을 강화합니다.' },
  { emoji: '📖', title: '어휘력 유지', desc: '나만의 단어장으로 잊기 쉬운 어휘를 반복 학습합니다.' },
  { emoji: '🔄', title: '난이도 자동 조정', desc: '실력에 따라 난이도가 자동으로 맞춰져 항상 적절한 자극이 됩니다.' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">

      {/* 헤더 */}
      <header className="flex items-center justify-between px-6 py-5 max-w-2xl mx-auto">
        <span className="text-2xl font-bold text-green-700">🌱 기억의 정원</span>
        <Link
          href="/game"
          className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-all"
        >
          훈련 시작 →
        </Link>
      </header>

      {/* 히어로 */}
      <section className="flex flex-col items-center text-center px-6 pt-10 pb-16 max-w-xl mx-auto gap-6">
        <div className="text-8xl animate-bounce">🌳</div>
        <h1 className="text-4xl font-bold text-gray-800 leading-snug">
          매일 5분,<br />
          <span className="text-green-600">기억력을 키워요</span>
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed">
          중장년층을 위해 만든 두뇌 훈련 앱이에요.<br />
          재미있는 게임으로 기억력을 건강하게 유지하세요.
        </p>
        <Link
          href="/game"
          className="mt-2 px-10 py-4 bg-green-600 text-white text-xl font-semibold rounded-2xl shadow-lg hover:bg-green-700 active:scale-95 transition-all duration-200"
        >
          오늘 훈련 시작하기 →
        </Link>
      </section>

      {/* 훈련 게임 소개 */}
      <section className="max-w-xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">훈련 게임</h2>
        <p className="text-gray-500 mb-6">4가지 게임으로 다양한 기억력을 단련해요.</p>
        <div className="grid grid-cols-1 gap-3">
          {GAMES.map((g) => (
            <div
              key={g.title}
              className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-sm border border-green-100"
            >
              <span className="text-4xl">{g.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold text-gray-800">{g.title}</p>
                  <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">{g.badge}</span>
                </div>
                <p className="text-gray-500 text-sm mt-0.5">{g.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 사용법 */}
      <section className="max-w-xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">이렇게 사용해요</h2>
        <p className="text-gray-500 mb-6">누구나 쉽게 시작할 수 있어요.</p>
        <div className="flex flex-col gap-4">
          {HOW_TO.map((h) => (
            <div key={h.step} className="flex gap-4 items-start">
              <span className="flex-shrink-0 w-10 h-10 rounded-full bg-green-600 text-white text-sm font-bold flex items-center justify-center">
                {h.step}
              </span>
              <div className="pt-1">
                <p className="font-semibold text-gray-800">{h.title}</p>
                <p className="text-gray-500 text-sm mt-0.5 leading-relaxed">{h.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 앱 효과 소개 */}
      <section className="max-w-xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">왜 기억의 정원인가요?</h2>
        <p className="text-gray-500 mb-6">꾸준한 인지 훈련은 기억력 유지에 실질적인 도움이 됩니다.</p>
        <div className="grid grid-cols-2 gap-3">
          {BENEFITS.map((b) => (
            <div key={b.title} className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
              <div className="text-3xl mb-3">{b.emoji}</div>
              <p className="font-semibold text-gray-800 text-sm">{b.title}</p>
              <p className="text-gray-500 text-xs mt-1 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 하단 CTA */}
      <section className="max-w-xl mx-auto px-6 pb-20 text-center">
        <div className="bg-green-600 rounded-3xl px-8 py-10 flex flex-col items-center gap-4">
          <div className="text-5xl">🌱</div>
          <p className="text-2xl font-bold text-white">지금 바로 시작해볼까요?</p>
          <p className="text-green-100 text-sm">오늘 첫 훈련을 완료하면 씨앗이 싹을 틔워요!</p>
          <Link
            href="/game"
            className="mt-2 px-10 py-4 bg-white text-green-700 text-lg font-bold rounded-2xl hover:bg-green-50 active:scale-95 transition-all"
          >
            훈련 시작하기 →
          </Link>
        </div>
      </section>

    </main>
  );
}
