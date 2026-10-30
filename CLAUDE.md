@AGENTS.md

# Stack

- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- Storybook 10 (`@storybook/nextjs-vite`), Vitest + Playwright
- 아이콘: lucide-react (필 아이콘: @phosphor-icons/react)
- 폰트: Pretendard Variable (`app/fonts.ts`)
- 디자인 원본: `design.pen` (pencil MCP)

# Commands

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run storybook`
- `npx vitest --project storybook run`
- `npx tsc --noEmit`

# Structure

- `app/tokens.css`: 디자인 토큰
- `components/<name>/`: 컴포넌트 + `*.stories.tsx`
- `stories/foundations/`: 토큰·컬러·타이포·아이콘 스토리
- `lib/`: 공용 유틸 (`cn`, `useOverlay`)

# UI

- Storybook = SSOT
- UI 작업 전 `components/**/*.stories.tsx` 확인 후 기존 컴포넌트 재사용
- 신규 UI 생성 금지, 없으면 확인 후 추가
- 토큰: `app/tokens.css` 시맨틱 토큰만 사용
- 텍스트: `Text`, 아이콘: `Icon`
- 스타일: Tailwind, 클래스 결합은 `cn`
- 컴포넌트 추가·수정 시 스토리 함께 갱신
- 완료 전 `tsc`, `vitest` 통과 확인

# Supabase

- 모든 Supabase API는 Next.js BFF(Route Handler `app/api/**/route.ts`)를 통해서만 호출
- 클라이언트 컴포넌트·브라우저에서 Supabase 직접 호출 금지, 클라이언트는 BFF `fetch`만 사용
- Supabase 클라이언트·키는 서버 전용, `NEXT_PUBLIC_` 접두사로 노출 금지
- 인증(소셜 로그인 콜백·세션)도 BFF에서 처리

# Layout

- 컨테이너: `app/_components/layout.ts`만 사용
- `gridContainer`: 카드 그리드(메인·마이), 최대 1280, 여백 16 → 24(md) → 32(lg)
- `readingContainer`: 상세, 768
- `formContainer`: 폼·로그인, 576
- 메인 그리드: 1 → 2(sm) → 3(lg) → 4(xl)
- 마이 그리드: 2 → 3(md) → 4(lg)
- 1280 초과는 여백 처리, 헤더·FAB도 1280 기준 정렬
- 바텀 내비는 `lg` 미만만
