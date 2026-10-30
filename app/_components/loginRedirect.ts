// 로그인 쿠키가 아예 없으면 첫 페인트 전에 /login으로 보낸다.
// 로그인 화면 말고는 모두 로그인이 필요한데, 화면을 그린 뒤 BFF 401을 받고 나서야 이동하면 홈 → 로그인으로 화면이 한 번 더 바뀐다.
// Supabase 세션 쿠키(sb-<프로젝트>-auth-token, 길면 .0 .1로 나뉨)는 httpOnly가 아니라 여기서 읽을 수 있다.
// 쿠키는 있는데 세션이 만료된 경우는 지금처럼 BFF 401 처리(lib/bff)가 맡는다

export const loginRedirectScript = `try{if(location.pathname!=="/login"&&!/(?:^|;\\s*)sb-[^=;]+-auth-token(?:\\.\\d+)?=/.test(document.cookie))location.replace("/login")}catch(e){}`;
