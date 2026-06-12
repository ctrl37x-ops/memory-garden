import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * TailwindCSS 클래스 병합 유틸리티
 * shadcn/ui에서 사용하는 표준 패턴입니다.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * API 응답 포맷 생성 유틸리티
 */
export function apiResponse(data) {
  return { success: true, data };
}

export function apiError(error, status = 400) {
  return Response.json({ success: false, error }, { status });
}
