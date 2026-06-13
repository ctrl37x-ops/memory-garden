'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import useMyWordsStore from '@/store/useMyWordsStore';
import useGameStore from '@/store/useGameStore';

const PHASE = { READY: 'ready', QUIZ: 'quiz', ANSWER: 'answer', DONE: 'done' };

// 퀴즈 유형: 0 = 단어 보고 뜻 맞추기 / 1 = 뜻 보고 단어 맞추기
function buildQuestions(quizWords, allWords) {
  return quizWords.map((target) => {
    const type = Math.random() > 0.5 ? 0 : 1;

    // 오답 보기 3개 (전체 단어에서 랜덤)
    const others = allWords
      .filter((w) => w.id !== target.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    // 보기 4개 섞기
    const choices = [target, ...others].sort(() => Math.random() - 0.5);

    return { target, type, choices };
  });
}

export default function MyWordsQuiz() {
  const { words, getQuizWords, recordResult } = useMyWordsStore();
  const { addResult } = useGameStore();

  const quizWords = useMemo(() => getQuizWords(10), []);
  const questions = useMemo(() => buildQuestions(quizWords, words), [quizWords, words]);

  const [phase, setPhase] = useState(PHASE.READY);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [correct, setCorrect] = useState(0);

  const q = questions[qIdx];

  const handleSelect = (choice) => {
    if (selected) return;
    setSelected(choice);
    const isCorrect = choice.id === q.target.id;
    if (isCorrect) setCorrect((c) => c + 1);
    recordResult(q.target.id, isCorrect);
    setPhase(PHASE.ANSWER);
  };

  const handleNext = () => {
    if (qIdx + 1 >= questions.length) {
      const points = correct * 5;
      addResult('나만의 단어', `${correct}/${questions.length}`, points);
      setPhase(PHASE.DONE);
    } else {
      setQIdx((i) => i + 1);
      setSelected(null);
      setPhase(PHASE.QUIZ);
    }
  };

  const handleRestart = () => {
    setQIdx(0);
    setSelected(null);
    setCorrect(0);
    setPhase(PHASE.READY);
  };

  if (words.length < 2) {
    return (
      <main className="max-w-lg mx-auto px-4 pt-8 pb-16 flex flex-col items-center gap-6 mt-16 text-center">
        <span className="text-7xl">📖</span>
        <p className="text-xl font-semibold text-gray-700">단어가 2개 이상 있어야<br />퀴즈를 풀 수 있어요!</p>
        <Link href="/game/mywords" className="px-8 py-4 bg-teal-600 text-white font-bold text-lg rounded-2xl">
          단어 추가하러 가기
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-lg mx-auto px-4 pt-8 pb-16">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/game/mywords" className="text-gray-400 hover:text-gray-600 text-2xl">←</Link>
        <h1 className="text-2xl font-bold text-gray-800">🧠 나만의 단어 퀴즈</h1>
      </div>

      {/* 준비 화면 */}
      {phase === PHASE.READY && (
        <div className="flex flex-col items-center gap-6 mt-8">
          <div className="text-7xl">📚</div>
          <p className="text-xl font-semibold text-gray-700 text-center">
            저장한 단어로 퀴즈를 풀어요.<br />틀린 단어가 더 자주 나와요!
          </p>
          <div className="bg-teal-50 border border-teal-200 rounded-2xl px-6 py-4 w-full text-center">
            <p className="text-teal-700 font-semibold">총 {questions.length}문제</p>
            <p className="text-teal-500 text-sm mt-1">단어 → 뜻 / 뜻 → 단어 혼합 출제</p>
          </div>
          <button
            onClick={() => setPhase(PHASE.QUIZ)}
            className="px-12 py-4 bg-teal-600 text-white text-xl font-bold rounded-2xl shadow-lg hover:bg-teal-700 active:scale-95 transition-all"
          >
            시작!
          </button>
        </div>
      )}

      {/* 퀴즈 / 답변 화면 */}
      {(phase === PHASE.QUIZ || phase === PHASE.ANSWER) && q && (
        <div className="flex flex-col gap-5">
          {/* 진행 바 */}
          <div className="flex gap-1.5">
            {questions.map((_, i) => (
              <div key={i} className={`flex-1 h-2 rounded-full transition-all ${
                i < qIdx ? 'bg-teal-500'
                : i === qIdx ? 'bg-teal-300 ring-1 ring-teal-500'
                : 'bg-gray-200'
              }`} />
            ))}
          </div>
          <p className="text-gray-400 text-sm text-right">{qIdx + 1} / {questions.length}</p>

          {/* 문제 카드 */}
          <div className="bg-teal-50 border-2 border-teal-200 rounded-3xl p-6 text-center">
            <p className="text-xs text-teal-500 font-semibold uppercase tracking-widest mb-2">
              {q.type === 0 ? '이 단어의 뜻은?' : '이 뜻의 단어는?'}
            </p>
            <p className="text-3xl font-bold text-teal-800 leading-snug">
              {q.type === 0 ? q.target.word : q.target.meaning}
            </p>
          </div>

          {/* 보기 */}
          <div className="grid grid-cols-1 gap-3">
            {q.choices.map((choice) => {
              const isSelected = selected?.id === choice.id;
              const isAnswer = choice.id === q.target.id;
              let cls = 'bg-white border-2 border-gray-200 text-gray-800';
              if (phase === PHASE.ANSWER) {
                if (isAnswer) cls = 'bg-green-100 border-2 border-green-400 text-green-800 font-bold';
                else if (isSelected) cls = 'bg-red-100 border-2 border-red-300 text-red-600 line-through';
                else cls = 'bg-white border-2 border-gray-100 text-gray-300';
              }
              return (
                <button
                  key={choice.id}
                  onClick={() => handleSelect(choice)}
                  disabled={phase === PHASE.ANSWER}
                  className={`w-full text-left px-5 py-4 rounded-2xl text-base transition-all active:scale-95 ${cls}`}
                >
                  <span className="font-bold">
                    {q.type === 0 ? choice.meaning : choice.word}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 정답 피드백 + 다음 버튼 */}
          {phase === PHASE.ANSWER && (
            <div className="flex flex-col items-center gap-4 mt-2">
              <p className={`text-2xl font-bold ${selected?.id === q.target.id ? 'text-green-600' : 'text-red-500'}`}>
                {selected?.id === q.target.id ? '정답! 🎉' : `오답 — 정답: ${q.type === 0 ? q.target.meaning : q.target.word}`}
              </p>
              <button
                onClick={handleNext}
                className="w-full py-4 bg-teal-600 text-white text-lg font-bold rounded-2xl hover:bg-teal-700 active:scale-95 transition-all"
              >
                {qIdx + 1 >= questions.length ? '결과 보기' : '다음 문제 →'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* 최종 결과 */}
      {phase === PHASE.DONE && (
        <div className="flex flex-col items-center gap-6 mt-8">
          <div className="text-7xl">
            {correct === questions.length ? '🏆' : correct >= questions.length * 0.7 ? '👏' : '💪'}
          </div>
          <p className="text-3xl font-bold text-gray-800">퀴즈 완료!</p>

          <div className="bg-teal-50 rounded-3xl p-6 w-full text-center">
            <p className="text-5xl font-bold text-teal-600 mb-1">{correct}/{questions.length}</p>
            <p className="text-gray-500">정답률 {Math.round((correct / questions.length) * 100)}%</p>
            <p className="text-green-600 font-semibold mt-3">+{correct * 5} 포인트 획득 🌱</p>
          </div>

          {/* 틀린 단어 복습 */}
          {correct < questions.length && (
            <div className="w-full">
              <p className="text-sm text-gray-500 mb-3">다시 외워봐요</p>
              <div className="flex flex-col gap-2">
                {questions
                  .filter((q) => {
                    // 틀린 문제만
                    const w = words.find((w) => w.id === q.target.id);
                    return w && w.wrong > 0;
                  })
                  .slice(0, 5)
                  .map((q) => (
                    <div key={q.target.id} className="bg-white border border-red-100 rounded-2xl px-4 py-3">
                      <p className="font-bold text-gray-800">{q.target.word}</p>
                      <p className="text-gray-500 text-sm mt-0.5">{q.target.meaning}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 w-full">
            <button
              onClick={handleRestart}
              className="flex-1 py-4 bg-teal-100 text-teal-700 text-lg font-semibold rounded-2xl hover:bg-teal-200 transition-all"
            >
              다시 풀기
            </button>
            <Link
              href="/game/mywords"
              className="flex-1 py-4 bg-teal-600 text-white text-lg font-semibold rounded-2xl text-center hover:bg-teal-700 transition-all"
            >
              단어장으로
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
