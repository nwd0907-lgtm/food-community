# 결제 규칙 (SSOT)

결제·취소·웹훅·결제 내역은 이 문서를 따른다. 코드와 다르면 이 문서가 맞고, 규칙 변경은 이 문서부터 고친다.

- PortOne V2 (`@portone/browser-sdk/v2`, `@portone/server-sdk`)
- 포트원 코드 작성 전 포트원 MCP(`readPortoneV2FrontendCode`, `readPortoneV2BackendCode`, `readPortoneOpenapiSchema`)로 예시·스펙 확인
- 결제 API는 BFF(`app/api/payments/**/route.ts`)에서만 처리

## 1. 데이터

### 상품 `product`
- `status = 'Public'`만 판매·노출. 그 외는 목록·상세·결제 모두 404/409
- 가격·상품명·정원은 **결제 시점 DB 값만** 쓴다. 브라우저·웹훅이 보낸 값은 믿지 않는다

### 결제 원장 `payment` (insert-only)
| 컬럼 | 규칙 |
|---|---|
| `transaction_key` | 그룹 키 = 포트원 `paymentId`(uuid, 서버 `crypto.randomUUID()`). 웹훅의 `data.paymentId`와 같은 값 |
| `type` | `PAID` \| `CANCELLED` (check 제약) |
| `amount` | `PAID` **+**, `CANCELLED` **−** (check `payment_amount_sign`). `sum(amount) group by transaction_key` = 순결제액 |
| `product_id`, `user_id` | 결제한 상품·사용자 |
| `payment_snapshot_id` | 이 행과 함께 만든 스냅샷 |

- UPDATE·DELETE·TRUNCATE 금지 (service_role 포함, 트리거). 상태 변화는 새 행 추가
- `(transaction_key, type)` 유니크 → 결제 한 건에 `PAID` 1행, `CANCELLED` 1행까지
- 전액 취소만 지원: `CANCELLED.amount = −PAID.amount`. 부분 취소 도입 시 이 문서부터 고친다
- 참여 = 사용자·상품별 `PAID` 수 > `CANCELLED` 수. 인원은 `product_participant_counts(uuid[])` RPC

### 스냅샷 `payment_snaphost` (insert-only, 테이블명 오타 유지)
- 원장 행 하나당 스냅샷 하나. 스냅샷 없는 원장 행 금지
- `snapshot_payment`: 검증에 쓴 포트원 단건 조회 응답 전체
- `snapshot_product`: 그 시점 `product` 행 전체(`select *`)
- 결제 내역·영수증은 현재 `product`가 아니라 스냅샷으로 보여 준다

### 권한·기록
- anon·authenticated: 쓰기 권한 없음. 조회는 RLS로 본인 원장·스냅샷만
- 쓰기는 BFF에서 service_role(`lib/supabase/admin.ts`)로 `record_payment` RPC만. 테이블 직접 insert 금지. service_role은 결제 기록 외 용도 금지
- `record_payment(transaction_key, type, amount, product_id, user_id, snapshot_payment, snapshot_product)`
  - `transaction_key` 단위 advisory lock → 완료 페이지·웹훅 동시 도착을 직렬화
  - 같은 `(transaction_key, type)`이 있으면 기존 행 반환 (멱등)
  - `CANCELLED`는 같은 키의 `PAID`가 있고 금액 `−PAID.amount`, 상품·사용자 동일할 때만
  - 스냅샷 + 원장을 한 트랜잭션으로 기록

## 2. 중복 결제 방지
| 경우 | 막는 곳 |
|---|---|
| 같은 결제의 재기록 (새로고침·리다이렉트 재진입·웹훅 재시도·완료 페이지와 웹훅 동시) | `(transaction_key, type)` 유니크 + lock + 멱등 반환 |
| 이미 참여 중인 상품을 다시 결제 | prepare 409 "이미 참여 신청한 수업이에요." |
| 그래도 동시에 두 번 결제됨 (다른 paymentId) | 기록은 한다(돈이 나감). 기록 후 활성 결제 > 1이면 `duplicate`로 경고 로그 → **취소 대상** |
| 정원 초과 (동시 결제) | 기록은 한다. 넘친 건은 **취소 대상** |

## 3. 환경변수 (`.env.example`)
| 이름 | 노출 | 용도 |
|---|---|---|
| `NEXT_PUBLIC_PORTONE_STORE_ID` | 브라우저 | 결제창 `storeId`, 검증 시 `payment.storeId` 대조 |
| `NEXT_PUBLIC_PORTONE_CHANNEL_KEY` | 브라우저 | 결제창 `channelKey`, 검증 시 `payment.channel.key` 대조 |
| `PORTONE_API_SECRET` | 서버 | 단건 조회·취소 API |
| `PORTONE_WEBHOOK_SECRET` | 서버 | 웹훅 서명 검증 |
| `SUPABASE_SECRET_KEY` | 서버 | `record_payment` 호출 |

- 서버 값에 `NEXT_PUBLIC_` 금지. 키 값은 코드·문서·로그에 남기지 않는다
- 테스트 채널로 개발, 운영 전환은 채널 키·웹훅 시크릿 교체로만

## 4. 결제 요청 (상품 상세 → 결제 바텀시트)
1. `POST /api/payments/prepare { productId }` (로그인 필수)
   - 비공개 → 404 / 참여 중 → 409 "이미 참여 신청한 수업이에요." / 정원 참 → 409 "정원이 모두 찼어요."
   - 응답: `paymentId`(서버 uuid), `orderName`(DB), `totalAmount`(DB), `customData { productId, userId }`
2. 브라우저 `PortOne.requestPayment` (`lib/requestPayment.ts`)
   - prepare 응답 그대로 + env `storeId`·`channelKey`, `currency: "KRW"`, `payMethod: "CARD"`
   - `redirectUrl`: `{origin}/products/{productId}/complete` (모바일 리다이렉트, PC 반환값)
   - 반환값 `code` 있음 → 바텀시트에 문구 표시 후 머문다. 성공 → `/products/{productId}/complete?paymentId=...`
3. 1인 1상품 1자리 (`SEATS_PER_PERSON = 1`)

## 5. 결제 검증·기록 (`syncPaidPayment`, `lib/supabase/payment-sync.ts`)
완료 페이지와 웹훅이 같은 함수를 쓴다. 순서대로 확인하고 하나라도 틀리면 기록하지 않는다.
1. 포트원 단건 조회 `getPayment`. 없으면 404
2. `status === "PAID"`
3. `storeId`, `channel.key` = env
4. `customData.userId`가 uuid (완료 페이지는 로그인 사용자와 같아야 함, 다르면 403), `customData.productId`가 uuid
5. 상품 존재 + `status = 'Public'`
6. `orderName === product.name`, `amount.total === product.price`, `currency === "KRW"`
7. `record_payment(type='PAID', amount=+amount.total, 스냅샷=조회 응답 + 상품 행)`
8. 같은 사용자·상품 활성 결제 > 1이면 `duplicate` (취소 대상 로그)

실패 종류 (`SyncFailure.kind`)
| kind | 의미 | 완료 페이지 | 웹훅 |
|---|---|---|---|
| `RETRYABLE` | 포트원·DB 일시 오류 | 502/500 | 500 (포트원 재시도) |
| `REFUND` | 돈은 나갔는데 검증 실패 (금액·상품·customData) → **취소 대상** | 4xx | 200 + 경고 로그 |
| `IGNORE` | 미결제·다른 상점/채널 | 400 | 200 |
| `NOT_FOUND` | 포트원에 결제 없음 | 404 | 200 |
| `FORBIDDEN` | 남의 결제 | 403 | (해당 없음) |

- `POST /api/payments/complete { paymentId }` (로그인 필수): 성공한 결제만 "결제 완료", `?code` 있으면 실패 화면
- 취소 대상은 결제 취소 기능 전까지 운영자가 포트원 콘솔에서 취소한다

## 6. 결제 웹훅 `POST /api/payments/webhook` (구현됨: 결제 승인)
- 포트원 콘솔 웹훅 URL `https://<도메인>/api/payments/webhook`, 버전 `2024-04-25`
- 로그인 세션 없음. 사용자는 `customData.userId`
- 처리 순서
  1. `PORTONE_WEBHOOK_SECRET` 없으면 500
  2. 본문은 `request.text()` 원문 그대로 `Webhook.verify(secret, body, headers)`. `WebhookVerificationError` → 400
  3. `type`별 처리. 모르는 `type`·필드는 무시하고 200
  4. `data.paymentId`가 uuid가 아니면 200 (우리 결제 아님)
  5. 본문의 금액·상태는 믿지 않고 `paymentId`로 5장 검증 → 기록
- `Transaction.Paid` → `syncPaidPayment(paymentId)` (5장)
- 응답: 서명 실패 400, `RETRYABLE` 500, 그 외 모두 200 (재시도 폭주 방지)

## 7. 결제 취소 API `POST /api/payments/{paymentId}/cancel` (미구현)
- 로그인 사용자 본인 결제만
- 조건: 해당 키의 `PAID` 있고 `CANCELLED` 없음, 행사 시작(`event_at`) 전 (시작 전까지 전액 환불)
- `PaymentClient.cancelPayment`(전액) → 성공 후 재조회해 `status === "CANCELLED"` 확인
- `record_payment(type='CANCELLED', amount=−취소 금액, 스냅샷=취소 후 조회 응답 + 그 시점 상품 행)`. 기존 `PAID` 행은 그대로
- 포트원 취소 실패 시 원장에 쓰지 않고 오류 안내

## 8. 결제 취소 웹훅 (미구현, 6장 웹훅 라우트에 추가)
- `Transaction.Cancelled` → `syncCancelledPayment(paymentId)`
  1. 포트원 단건 조회, `status === "CANCELLED"` 아니면 200 무시
  2. `storeId`, `channel.key` = env
  3. 같은 `transaction_key`의 `PAID` 원장 행 조회. 없으면 200 + 로그 (기록된 결제 없음 → 원장 순액 0 유지)
  4. 취소 금액(`payment.amount.cancelled`) = `PAID.amount`인지 확인. 다르면 200 + 경고 로그
  5. `record_payment(type='CANCELLED', amount=−PAID.amount, product_id·user_id = PAID 행 값, 스냅샷 = 조회 응답 + 현재 상품 행)`
- 취소 API(7장)와 웹훅이 겹쳐도 `(transaction_key, 'CANCELLED')` 멱등으로 한 행
- `Transaction.PartialCancelled` → 지원 안 함. 200 + 경고 로그 (운영자 확인)
- `RETRYABLE`은 500, 그 외 200 (6장과 같음)

## 9. 화면·캐시
- 결제·취소 뒤 상품 상세 캐시는 서버 응답으로 덮고(`writeBff`), 목록은 `invalidateBff`
- 결제 내역(마이페이지)은 `GET /api/payments`(본인 원장 + 스냅샷). 현재 목업(`lib/payment-mock.ts`), 연동 시 삭제
- 화면 금액은 절댓값으로 `formatPrice`, 결제/취소 구분은 `type`. 일시는 `formatSchedule` (`lib/product.ts`)

## 10. 파일 지도
- 타입·상수: `lib/payment.ts` (`PAYMENT_TYPE`, `PAYMENT_CURRENCY`, `PAYMENT_PAY_METHOD`, `SEATS_PER_PERSON`)
- 결제창: `lib/requestPayment.ts`, `app/products/[id]/ProductPurchase.tsx`
- 완료 화면: `app/products/[id]/complete/PaymentComplete.tsx`
- BFF: `app/api/payments/{prepare,complete,webhook}/route.ts`
- 서버 유틸: `lib/portone.ts`, `lib/supabase/{admin,payment,payment-sync,product}.ts`
- DB: `supabase/migrations/20261106040742_payment_append_only_ledger.sql`, `20261110000000_payment_signed_amount.sql`
- 스키마 변경 시 마이그레이션 추가 + `lib/supabase/database.types.ts` 갱신
