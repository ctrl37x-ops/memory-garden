import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get('word')?.trim();

  if (!word) {
    return NextResponse.json({ error: '단어를 입력해주세요' }, { status: 400 });
  }

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'API 키가 설정되지 않았습니다' }, { status: 500 });
  }

  try {
    // 네이버 백과사전 검색으로 단어 뜻 추천
    const res = await fetch(
      `https://openapi.naver.com/v1/search/encyc.json?query=${encodeURIComponent(word)}&display=5`,
      {
        headers: {
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Naver API error: ${res.status}`);
    }

    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ suggestions: [] });
    }

    // HTML 태그 제거 + 뜻만 추출
    const strip = (str) => str.replace(/<[^>]+>/g, '').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&quot;/g,'"').trim();

    const suggestions = data.items
      .map((item) => ({
        title: strip(item.title),
        meaning: strip(item.description),
      }))
      .filter((item) => item.meaning.length > 5)
      .slice(0, 3)
      .map((item) => item.meaning.length > 80 ? item.meaning.slice(0, 80) + '…' : item.meaning);

    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error('suggest-meaning error:', err);
    return NextResponse.json({ error: '추천을 가져오지 못했어요' }, { status: 500 });
  }
}
