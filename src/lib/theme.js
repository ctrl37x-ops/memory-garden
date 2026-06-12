/**
 * 테마 설정 파일
 * 디자인 시스템의 색상, 폰트, 간격 등을 상수로 관리합니다.
 * CSS 변수와 동기화하여 사용합니다.
 */

// ============================================
// 메인 페이지 테마 (공개 영역)
// ============================================
export const mainTheme = {
  colors: {
    bg: "var(--main-bg)",
    text: "var(--main-text)",
    textSub: "var(--main-text-sub)",
    primary: "var(--main-primary)",
    primaryHover: "var(--main-primary-hover)",
    border: "var(--main-border)",
    sectionBg: "var(--main-section-bg)",
  },
  layout: {
    maxWidth: "1024px",
    sectionPadding: "5rem 1.5rem",
    cardRadius: "0.75rem",
  },
};

// ============================================
// 관리자 테마 (대시보드 영역)
// ============================================
export const adminTheme = {
  colors: {
    sidebarBg: "var(--admin-sidebar-bg)",
    sidebarText: "var(--admin-sidebar-text)",
    contentBg: "var(--admin-content-bg)",
    cardBg: "var(--admin-card-bg)",
    text: "var(--admin-text)",
    primary: "var(--admin-primary)",
    success: "var(--admin-success)",
    warning: "var(--admin-warning)",
    danger: "var(--admin-danger)",
  },
  layout: {
    sidebarWidth: "240px",
    headerHeight: "64px",
    contentPadding: "1.5rem",
    cardRadius: "0.5rem",
  },
};

// ============================================
// 공통 설정
// ============================================
export const commonTheme = {
  font: {
    sans: '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
  },
  breakpoints: {
    mobile: "768px",
    tablet: "1024px",
    desktop: "1280px",
  },
  transition: {
    default: "all 200ms ease-in-out",
    fast: "all 100ms ease-in-out",
    slow: "all 300ms ease-in-out",
  },
  radius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    full: "9999px",
  },
};
