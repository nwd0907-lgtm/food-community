// 반응형 확장 규칙: 시안은 360 모바일 1종. 카드 그리드는 최대 1280까지 늘리고, 그 밖은 좌우 여백으로 처리한다.

/** 카드 그리드 화면(메인 · 마이페이지): 최대 1280, 좌우 여백 16 → 24(md) → 32(lg) */
export const gridContainer =
  "mx-auto w-full max-w-[1280px] px-[var(--spacing-16)] md:px-[var(--spacing-24)] lg:px-[var(--spacing-32)]";

/** 읽기 화면(상세): 본문 폭을 768로 고정하고 나머지는 여백 */
export const readingContainer = "mx-auto w-full max-w-3xl px-[var(--spacing-16)] md:px-[var(--spacing-24)]";

/** 폼 화면(등록 · 프로필 · 로그인 액션): 576 고정 */
export const formContainer = "mx-auto w-full max-w-xl px-[var(--spacing-16)] md:px-[var(--spacing-24)]";
