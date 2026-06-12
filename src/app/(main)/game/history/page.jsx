import { Suspense } from 'react';
import GameHistory from '@/components/main/GameHistory';

export const metadata = { title: '훈련 기록 — 기억의 정원' };

export default function HistoryPage() {
  return (
    <Suspense>
      <GameHistory />
    </Suspense>
  );
}
