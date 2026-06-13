'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useMyWordsStore = create(
  persist(
    (set, get) => ({
      words: [], // { id, word, meaning, createdAt, correct, wrong }

      addWord: (word, meaning) => {
        const trimWord = word.trim();
        const trimMeaning = meaning.trim();
        if (!trimWord || !trimMeaning) return false;

        // 중복 단어 체크
        const exists = get().words.some(
          (w) => w.word === trimWord
        );
        if (exists) return 'duplicate';

        set((state) => ({
          words: [
            {
              id: Date.now().toString(),
              word: trimWord,
              meaning: trimMeaning,
              createdAt: new Date().toISOString(),
              correct: 0,
              wrong: 0,
            },
            ...state.words,
          ],
        }));
        return true;
      },

      deleteWord: (id) => {
        set((state) => ({
          words: state.words.filter((w) => w.id !== id),
        }));
      },

      // 퀴즈 결과 반영
      recordResult: (id, isCorrect) => {
        set((state) => ({
          words: state.words.map((w) =>
            w.id === id
              ? { ...w, correct: w.correct + (isCorrect ? 1 : 0), wrong: w.wrong + (isCorrect ? 0 : 1) }
              : w
          ),
        }));
      },

      // 정답률 낮은 단어를 앞으로 정렬한 퀴즈용 목록 (최대 count개)
      // 틀린 횟수가 많을수록 가중치 높음
      getQuizWords: (count = 10) => {
        const { words } = get();
        if (words.length < 2) return [];

        // 가중치: 한 번도 안 풀었으면 2, 틀린 비율이 높을수록 높음
        const weighted = words.map((w) => {
          const total = w.correct + w.wrong;
          const weight = total === 0 ? 2 : 1 + w.wrong / total;
          return { ...w, weight };
        });

        // 가중치 기반 셔플
        weighted.sort((a, b) => b.weight - a.weight + (Math.random() - 0.5) * 0.5);
        return weighted.slice(0, Math.min(count, weighted.length));
      },

      // 단어 정답률
      getAccuracy: (id) => {
        const w = get().words.find((w) => w.id === id);
        if (!w) return null;
        const total = w.correct + w.wrong;
        return total === 0 ? null : Math.round((w.correct / total) * 100);
      },
    }),
    { name: 'my-words-store' }
  )
);

export default useMyWordsStore;
