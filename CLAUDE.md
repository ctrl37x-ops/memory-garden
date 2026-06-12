# 프로젝트 AI 작업 지침서

## 기본 원칙 (반드시 지킬 것)
- 이 프로젝트는 Next.js 15+ App Router 기반이다. Pages Router는 절대 사용하지 않는다.
- 13 이전 버전의 문법은 사용 금지. `getServerSideProps`, `getStaticProps` 등 구버전 API를 절대 쓰지 않는다.
- 모든 답변과 코드는 한국어 주석으로 작성한다.
- 코드 수정 시 기존 디자인 시스템(듀얼 구조)을 반드시 따른다.
- 새 패키지 설치 전 반드시 사용자에게 확인받는다.
- 이 프로젝트는 JavaScript(.js/.jsx)를 사용한다. TypeScript를 사용하지 않는다.

## 기술 스택
- **프레임워크**: Next.js 15+ (App Router only)
- **스타일링**: TailwindCSS v4 + shadcn/ui
- **데이터베이스**: Supabase (PostgreSQL)
- **상태관리**: Zustand
- **배포**: Vercel (기본), OCI (필요시)

## 프로젝트 구조
```
src/
├── app/                    # Next.js App Router 페이지
│   ├── (main)/            # 메인(공개) 페이지 그룹
│   ├── (admin)/           # 관리자 페이지 그룹
│   ├── api/               # API Routes
│   ├── layout.jsx         # 루트 레이아웃
│   └── page.jsx           # 홈페이지
├── components/
│   ├── ui/                # shadcn/ui 컴포넌트
│   ├── main/              # 메인 영역 전용 컴포넌트
│   └── admin/             # 관리자 영역 전용 컴포넌트
├── lib/
│   ├── supabase.js        # Supabase 클라이언트
│   └── utils.js           # 유틸리티 함수
├── store/                 # Zustand 스토어
│   └── useAppStore.js     # 전역 상태 스토어
└── styles/
    └── globals.css        # 글로벌 스타일 (TailwindCSS v4)
```

## 디자인 시스템 (듀얼 구조)
이 프로젝트는 **두 가지 디자인 방향**을 동시에 사용한다:

### 1. 메인 페이지 영역 `(main)`
- 미니멀, 깔끔, 중성적 디자인
- 고객/방문자가 보는 페이지
- 여백 충분히, 폰트 크기 크게, 심플한 레이아웃

### 2. 관리자 영역 `(admin)`
- 대시보드 스타일, 실용적 디자인
- 사이드바 + 헤더 + 콘텐츠 영역 레이아웃
- 데이터 테이블, 차트, 폼 중심

자세한 디자인 가이드는 `design.md` 참고.

## 코딩 컨벤션

### 컴포넌트 작성
- 함수형 컴포넌트만 사용 (클래스 컴포넌트 금지)
- `'use client'`는 꼭 필요한 경우에만 선언 (기본은 서버 컴포넌트)
- JavaScript(.js/.jsx)만 사용한다. TypeScript를 사용하지 않는다.

### 파일 네이밍
- 컴포넌트: `PascalCase.jsx` (예: `UserProfile.jsx`)
- 유틸/훅/스토어: `camelCase.js` (예: `useAppStore.js`)
- 페이지: `page.jsx`, `layout.jsx` (Next.js 컨벤션)

### 상태 관리
- 서버 상태: Supabase 직접 호출 (서버 컴포넌트에서)
- 클라이언트 전역 상태: Zustand
- 로컬 상태: useState / useReducer

### API 패턴
- Route Handlers (`app/api/`) 사용
- Supabase는 서버사이드에서만 service_role 키 사용
- 클라이언트에서는 anon 키만 사용, RLS로 보안 처리

### 에러 처리
- try-catch 블록 필수
- API 응답은 `{ success: boolean, data, error }` 형식 통일
- 사용자에게 보여주는 에러 메시지는 한국어

## 자주 사용하는 명령어
```bash
npm run dev          # 개발 서버 시작
npm run build        # 프로덕션 빌드
npx shadcn@latest add [component]  # shadcn/ui 컴포넌트 추가
```

## 주의사항
- `.env.local` 파일은 절대 커밋하지 않는다
- Supabase 키는 환경변수로만 관리한다
- `node_modules/`와 `.next/`는 gitignore 대상이다
- 이미지 최적화는 Next.js의 `<Image>` 컴포넌트를 사용한다
