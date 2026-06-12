import Link from 'next/link';

export const metadata = {
  title: '기억의 정원 — 매일 5분 두뇌 훈련',
  description: '중장년층을 위한 인지 훈련 앱. 매일 짧은 게임으로 기억력을 키워보세요.',
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-6 py-5 max-w-2xl mx-auto">
        <span className="text-2xl font-bold text-green-700">🌱 기억의 정원</span>
      </header>

      {/* 히어로 */}
      <section className="flex flex-col items-center text-center px-6 pt-12 pb-16 max-w-xl mx-auto gap-6">
        <div className="text-8xl animate-bounce">🌳</div>
        <h1 className="text-4xl font-bold text-gray-800 leading-snug">
          매일 5분,<br />
          <span className="text-green-600">기억력을 키워요</span>
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed">
          숫자 기억, 단어 연상 등 재미있는 게임으로<br />
          두뇌를 건강하게 유지하세요.
        </p>
        <Link
          href="/game"
          className="mt-2 px-10 py-4 bg-green-600 text-white text-xl font-semibold rounded-2xl shadow-lg hover:bg-green-700 active:scale-95 transition-all duration-200"
        >
          오늘 훈련 시작하기 →
        </Link>
      </section>

      {/* 기능 소개 */}
      <section className="max-w-xl mx-auto px-6 pb-20 grid grid-cols-1 gap-4">
        {[
          { emoji: '🔢', title: '숫자 기억', desc: '순서대로 기억하고 맞춰보세요' },
          { emoji: '📝', title: '단어 연상', desc: '단어 목록을 기억하고 떠올려보세요' },
          { emoji: '🌱', title: '식물 키우기', desc: '훈련할수록 정원이 자라요' },
        ].map((item) => (
          <div
            key={item.title}
            className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-sm border border-green-100"
          >
            <span className="text-4xl">{item.emoji}</span>
            <div>
              <p className="text-lg font-semibold text-gray-800">{item.title}</p>
              <p className="text-gray-500">{item.desc}</p>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
