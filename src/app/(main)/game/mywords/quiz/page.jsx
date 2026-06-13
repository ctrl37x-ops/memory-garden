import { Suspense } from 'react';
import MyWordsQuiz from '@/components/main/MyWordsQuiz';

export const metadata = { title: '나만의 단어 퀴즈 — 기억의 정원' };

export default function MyWordsQuizPage() {
  return (
    <Suspense>
      <MyWordsQuiz />
    </Suspense>
  );
}
