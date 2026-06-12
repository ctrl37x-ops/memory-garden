"use client";

import { useAppStore } from "@/store/useAppStore";

/**
 * 관리자 영역 레이아웃
 * 사이드바 + 헤더 + 콘텐츠 구조
 */
export default function AdminLayout({ children }) {
  const { sidebarOpen, toggleSidebar } = useAppStore();

  return (
    <div className="flex h-screen bg-admin-content-bg">
      {/* 사이드바 */}
      <aside
        className={`${
          sidebarOpen ? "w-60" : "w-0 overflow-hidden"
        } bg-admin-sidebar-bg text-admin-sidebar-text transition-all duration-200 flex-shrink-0 admin-scrollbar relative`}
      >
        <div className="p-6">
          <h2 className="text-lg font-bold text-white">내 서비스</h2>
        </div>
        <nav className="px-4 space-y-1">
          {[
            { label: "대시보드", href: "/admin" },
            { label: "데이터 관리", href: "/admin" },
            { label: "설정", href: "/admin" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="block px-4 py-2.5 rounded-md hover:bg-white/10 transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <a
            href="/"
            className="block px-4 py-2.5 text-sm text-admin-sidebar-text/60 hover:text-admin-sidebar-text transition-colors"
          >
            메인으로 돌아가기
          </a>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 헤더 */}
        <header className="h-16 bg-admin-card-bg border-b border-main-border flex items-center justify-between px-6 flex-shrink-0">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-admin-content-bg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-main-text-sub">관리자</span>
          </div>
        </header>

        {/* 콘텐츠 영역 */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
