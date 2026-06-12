import { create } from "zustand";

/**
 * 전역 앱 상태 스토어
 * Zustand를 사용한 클라이언트 전역 상태 관리
 */
export const useAppStore = create((set) => ({
  // 사이드바
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // 로딩
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
}));
