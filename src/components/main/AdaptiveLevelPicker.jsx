'use client';

// 게임 시작 화면에서 난이도 선택 + 추천 배지를 표시하는 공통 컴포넌트
export default function AdaptiveLevelPicker({ levels, levelIdx, onChange, recommendation, themeColor }) {
  const colors = {
    blue:   { active: 'bg-blue-600 text-white shadow-md',   inactive: 'bg-blue-50 text-blue-600 border border-blue-200',   badge: 'bg-blue-100 text-blue-700',   bar: 'bg-blue-500' },
    purple: { active: 'bg-purple-600 text-white shadow-md', inactive: 'bg-purple-50 text-purple-600 border border-purple-200', badge: 'bg-purple-100 text-purple-700', bar: 'bg-purple-500' },
    orange: { active: 'bg-orange-500 text-white shadow-md', inactive: 'bg-orange-50 text-orange-600 border border-orange-200', badge: 'bg-orange-100 text-orange-700', bar: 'bg-orange-400' },
  };
  const c = colors[themeColor] ?? colors.blue;
  const { level: recLevel, reason, confidence, avgRate } = recommendation;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* 난이도 버튼 */}
      <div className="flex gap-3 justify-center">
        {levels.map((lv, i) => (
          <button
            key={lv.label}
            onClick={() => onChange(i)}
            className={`relative px-5 py-3 rounded-2xl text-base font-semibold transition-all ${
              levelIdx === i ? c.active : c.inactive
            }`}
          >
            {lv.label}
            {/* 추천 배지 */}
            {i === recLevel && (
              <span className="absolute -top-2 -right-2 text-xs bg-yellow-400 text-yellow-900 font-bold px-1.5 py-0.5 rounded-full leading-none">
                추천
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 추천 이유 카드 */}
      <div className={`rounded-2xl px-4 py-3 flex items-start gap-3 ${c.badge}`}>
        <span className="text-xl mt-0.5">{confidence === 'low' ? '🌱' : '🧠'}</span>
        <div className="flex-1">
          <p className="text-sm font-semibold">{reason}</p>
          {/* 최근 정답률 바 */}
          {confidence === 'high' && avgRate !== undefined && (
            <div className="mt-2">
              <div className="flex justify-between text-xs opacity-70 mb-1">
                <span>최근 평균 정답률</span>
                <span>{avgRate}%</span>
              </div>
              <div className="w-full bg-white/50 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-700 ${c.bar}`}
                  style={{ width: `${avgRate}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
