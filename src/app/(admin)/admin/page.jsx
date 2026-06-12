/**
 * 관리자 대시보드 메인 페이지
 * 통계 카드 + 데이터 테이블 예시
 */
export default function AdminDashboard() {
  // 샘플 데이터 (실제로는 Supabase에서 가져옴)
  const stats = [
    { label: "총 사용자", value: "1,234", change: "+12%", color: "text-admin-primary" },
    { label: "오늘 방문", value: "56", change: "+5%", color: "text-admin-success" },
    { label: "신규 가입", value: "8", change: "-2%", color: "text-admin-warning" },
    { label: "문의", value: "3", change: "0%", color: "text-admin-danger" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-admin-text">대시보드</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="admin-card">
            <p className="text-sm text-main-text-sub">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>
              {stat.value}
            </p>
            <p className="text-xs text-main-text-sub mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* 샘플 테이블 */}
      <div className="admin-card">
        <h2 className="text-lg font-semibold mb-4">최근 활동</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-main-border text-left">
              <th className="pb-3 font-medium text-main-text-sub">이름</th>
              <th className="pb-3 font-medium text-main-text-sub">활동</th>
              <th className="pb-3 font-medium text-main-text-sub">시간</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-main-border/50 hover:bg-admin-content-bg transition-colors">
              <td className="py-3">홍길동</td>
              <td className="py-3">로그인</td>
              <td className="py-3 text-main-text-sub">5분 전</td>
            </tr>
            <tr className="border-b border-main-border/50 hover:bg-admin-content-bg transition-colors">
              <td className="py-3">김철수</td>
              <td className="py-3">회원가입</td>
              <td className="py-3 text-main-text-sub">15분 전</td>
            </tr>
            <tr className="hover:bg-admin-content-bg transition-colors">
              <td className="py-3">이영희</td>
              <td className="py-3">문의 등록</td>
              <td className="py-3 text-main-text-sub">1시간 전</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
