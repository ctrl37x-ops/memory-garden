'use client';

import { useState } from 'react';
import Link from 'next/link';
import useMyWordsStore from '@/store/useMyWordsStore';

export default function MyWordsManager() {
  const { words, addWord, deleteWord, getAccuracy } = useMyWordsStore();
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [error, setError] = useState('');
  const [added, setAdded] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [suggesting, setSuggesting] = useState(false);

  const handleAdd = () => {
    if (!word.trim()) { setError('단어를 입력해주세요'); return; }
    if (!meaning.trim()) { setError('뜻/설명을 입력해주세요'); return; }

    const result = addWord(word, meaning);
    if (result === 'duplicate') {
      setError(`"${word.trim()}"은 이미 등록된 단어예요`);
      return;
    }
    setAdded(word.trim());
    setWord('');
    setMeaning('');
    setError('');
    setTimeout(() => setAdded(''), 2000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) handleAdd();
  };

  const handleSuggest = async () => {
    if (!word.trim()) { setError('먼저 단어를 입력해주세요'); return; }
    setSuggesting(true);
    setSuggestions([]);
    try {
      const res = await fetch(`/api/suggest-meaning?word=${encodeURIComponent(word.trim())}`);
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      if (data.suggestions.length === 0) { setError('추천 결과가 없어요. 직접 입력해주세요'); return; }
      setSuggestions(data.suggestions);
    } catch {
      setError('추천을 가져오지 못했어요');
    } finally {
      setSuggesting(false);
    }
  };

  const handlePickSuggestion = (s) => {
    setMeaning(s);
    setSuggestions([]);
    setError('');
  };

  return (
    <main className="max-w-lg mx-auto px-4 pt-8 pb-16">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/game" className="text-gray-400 hover:text-gray-600 text-2xl">←</Link>
          <h1 className="text-2xl font-bold text-gray-800">📚 나만의 단어장</h1>
        </div>
        {words.length >= 2 && (
          <Link
            href="/game/mywords/quiz"
            className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-xl text-sm hover:bg-teal-700 active:scale-95 transition-all"
          >
            퀴즈 풀기 →
          </Link>
        )}
      </div>

      {/* 단어 추가 폼 */}
      <div className="bg-white rounded-3xl border border-teal-100 shadow-sm p-5 mb-6">
        <p className="text-base font-semibold text-gray-700 mb-4">새 단어 추가</p>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-sm text-gray-500 mb-1 block">단어</label>
            <input
              type="text"
              value={word}
              onChange={(e) => { setWord(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
              placeholder="예) 어휘력, 사자성어, 영단어..."
              className="w-full text-lg border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-teal-400 transition-colors"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-gray-500">뜻 / 설명</label>
              <button
                type="button"
                onClick={handleSuggest}
                disabled={suggesting}
                className="flex items-center gap-1 text-xs text-teal-600 font-semibold hover:text-teal-700 disabled:opacity-50 transition-colors"
              >
                {suggesting ? (
                  <span className="inline-block w-3 h-3 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                ) : '✨'}
                {suggesting ? '검색 중…' : '자동 추천'}
              </button>
            </div>
            <input
              type="text"
              value={meaning}
              onChange={(e) => { setMeaning(e.target.value); setError(''); setSuggestions([]); }}
              onKeyDown={handleKeyDown}
              placeholder="직접 입력하거나 자동 추천을 눌러보세요"
              className="w-full text-lg border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-teal-400 transition-colors"
            />
            {/* 추천 결과 칩 */}
            {suggestions.length > 0 && (
              <div className="mt-2 flex flex-col gap-2">
                <p className="text-xs text-gray-400">아래 항목을 클릭하면 자동 입력돼요</p>
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handlePickSuggestion(s)}
                    className="text-left text-sm bg-teal-50 border border-teal-200 text-teal-800 rounded-xl px-4 py-2.5 hover:bg-teal-100 active:scale-95 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {added && <p className="text-green-600 text-sm font-semibold">✓ "{added}" 추가됐어요!</p>}

          <button
            onClick={handleAdd}
            className="w-full py-4 bg-teal-600 text-white text-lg font-bold rounded-2xl hover:bg-teal-700 active:scale-95 transition-all"
          >
            + 추가하기
          </button>
        </div>
      </div>

      {/* 단어 목록 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-base font-semibold text-gray-700">
            저장된 단어 <span className="text-teal-600">{words.length}개</span>
          </p>
          {words.length >= 2 && (
            <p className="text-xs text-gray-400">2개 이상이면 퀴즈 가능</p>
          )}
        </div>

        {words.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="text-6xl">📖</span>
            <p className="text-gray-400 text-lg">아직 단어가 없어요.<br />자주 잊어버리는 단어를 추가해보세요!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {words.map((w) => {
              const acc = getAccuracy(w.id);
              return (
                <div
                  key={w.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4 flex items-start gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-lg font-bold text-gray-800">{w.word}</p>
                      {acc !== null && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          acc >= 70 ? 'bg-green-100 text-green-700'
                          : acc >= 40 ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-600'
                        }`}>
                          정답률 {acc}%
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 mt-0.5 text-sm leading-snug">{w.meaning}</p>
                  </div>
                  <button
                    onClick={() => deleteWord(w.id)}
                    className="text-gray-300 hover:text-red-400 text-xl flex-shrink-0 transition-colors mt-0.5"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 하단 퀴즈 버튼 */}
      {words.length >= 2 && (
        <Link
          href="/game/mywords/quiz"
          className="block w-full mt-8 py-4 bg-teal-600 text-white text-xl font-bold rounded-2xl text-center hover:bg-teal-700 active:scale-95 transition-all shadow-lg"
        >
          퀴즈 풀기 🧠
        </Link>
      )}
    </main>
  );
}
