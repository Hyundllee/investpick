# 오늘의 투자픽 개발 가이드

> 작성 기준: 삼성자산운용_API_명세서(펀드)_v1.6_투자픽.xlsx + 화면 설계 시안
> 기술 환경: React 18 + TypeScript + SCSS + Webpack 5 / 기준 해상도 PC 1920px

---

## 1. 환경 구성

### 최초 1회

```powershell
cd C:\Users\cheol\OneDrive\Desktop\project\investpick
npm.cmd install
```

### 실행

```powershell
npm.cmd run dev          # http://localhost:3000
npm.cmd run typecheck    # tsc --noEmit
npm.cmd run build        # 운영 빌드 (dist/)
npx.cmd webpack --mode development   # 개발 컴파일 검사
```

### 데이터 소스 (중요)

백엔드 API 가 아직 열려 있지 않으므로, **개발 모드에서는 목 데이터로 동작**한다.
그래야 API 없이도 퍼블리싱 결과를 그대로 확인할 수 있다.

| 실행 | 데이터 소스 |
| --- | --- |
| `npm.cmd run dev` → `http://localhost:3000` | **목 데이터** (화면 확인용) |
| `http://localhost:3000/?mock=0` | **실 API** (devServer proxy 경유) |
| `npm.cmd run build` (운영 빌드) | **항상 실 API** — 목 코드는 번들에서 제거됨 |

데모 페이지 상단 띠에 현재 어느 쪽으로 동작 중인지 표시되고, 클릭으로 전환할 수 있다.

동작 원리는 `webpack.config.cjs` 의 `DefinePlugin` 이 주입하는 `__DEV__` 플래그다.
운영 빌드에서는 `__DEV__` 가 `false` 로 치환되어 `api.ts` 의 목 분기와
동적 import 된 `investPickMock.ts` 가 통째로 제거된다.

> API 연동이 끝나면 `investPickMock.ts` 와 `api.ts` 의 목 분기를 삭제하면 된다.

### API 프록시

`?mock=0` 으로 실 API 를 확인할 때, `/api` 요청은 devServer proxy 가 실 서버로 전달한다.
기본 타겟은 `https://www.samsungfund.com` 이며 환경변수로 변경할 수 있다.

```powershell
$env:API_PROXY_TARGET="https://개발서버주소"; npm.cmd run dev
```

운영 배포는 동일 도메인이므로 `api.ts` 의 `INVEST_PICK_API_BASE` 를 빈 문자열로 두면 된다.

---

## 2. API 명세 정리

모든 엔드포인트는 **GET** 이다.

### 2-1. 투자픽 목록 조회

```
GET /api/v1/kodex/insight/topics
```

| 파라미터 | 필수 | 설명 | 기본값 |
| --- | --- | --- | --- |
| `pageNo` | 선택 | 페이지 번호 | 1 |
| `pageRows` | 선택 | 페이지 당 행 개수 | 6 |

| 응답 필드 | 설명 |
| --- | --- |
| `totcnt` | 리스트 전체 개수 |
| `list[].topicSeq` | 투자픽 일련번호 |
| `list[].roundNm` | 주차정보 (ex. `8월2주차`) |
| `list[].title` | 타이틀 |
| `list[].pctA` / `pctB` | 답변 A/B 분포(%) |
| `list[].voteTotalCnt` | 전체 투표수 |
| `list[].status` | 진행상태 — `RUNNING`(진행중) / `ENDED`(종료) / `WAITING`(대기중) |

### 2-2. 투자픽 상세 조회

```
GET /api/v1/kodex/insight/topic/{topicSeq}.do
```

| 파라미터 | 필수 | 설명 |
| --- | --- | --- |
| `topicSeq` | 필수 | 투자픽 일련번호 (path) |

| 응답 필드 | 설명 |
| --- | --- |
| `topicSeq` / `roundNm` / `title` | 일련번호 / 주차정보 / 타이틀 |
| `optionA` / `optionB` | 답변 A / B |
| `cntA` / `cntB` | 답변 A/B 투표수 |
| `pctA` / `pctB` | 답변 A/B 퍼센트 |
| `voteTotalCnt` | 총 참여수 |
| `voteTodayCnt` | 오늘의 참여수 |
| `prodNmA` / `prodNmB` | 답변 A/B 상품명 |
| `fidA` / `fidB` | 답변 A/B 상품코드 |
| `choice` | 접속한 사람이 선택한 답변 (`A` / `B` / `null`) |
| `daily[].dayLabel` | 요일라벨 |
| `daily[].cntA` / `cntB` / `pctA` / `pctB` | 일자별 투표수·투표율 |

### 2-3. 진행중인 투자픽 정보

```
GET /api/v1/kodex/insight/activeTopic
```

파라미터 없음.

| 응답 필드 | 설명 |
| --- | --- |
| `topicSeq` / `roundNm` / `title` | 일련번호 / 주차정보 / 타이틀 |
| `optionA` / `optionB` | 답변 A / B |
| `cntA` / `cntB` / `pctA` / `pctB` | 투표수 / 퍼센트 |
| `voteTotalCnt` | 총 참여수 |
| `canVote` | 투표가능여부 (`true` 가능 / `false` 불가능) |
| `choice` | 접속한 사람이 선택한 답변 |

### 2-4. 투자픽 투표 저장

```
GET /api/v1/kodex/insight/topic/{topicSeq}/vote.do?choice=A&gubun=M
```

| 파라미터 | 필수 | 설명 | 비고 |
| --- | --- | --- | --- |
| `topicSeq` | 필수 | 투자픽 일련번호 (path) | |
| `choice` | 필수 | 답변 선택값 | 기본값 `A`. `A`/`B` 이외는 에러 처리 |
| `gubun` | 선택 | 투표 위치 | 기본값 `M`. `M` 메인 / `S` 검색 / `P` 상품상세 / `R` 리스트 페이지 |

| 응답 필드 | 설명 |
| --- | --- |
| `success` | 성공여부 (`true` 성공 / `false` 실패) |
| `message` | 실패 시 에러 메시지 (ex. `이미 투표하셨습니다. 47시간 57분 후 재투표 가능합니다.`) |
| `topicSeq` / `cntA` / `cntB` / `pctA` / `pctB` / `voteTotalCnt` | 갱신된 집계값 |
| `choice` | 선택 답변값 |

### 화면 ↔ API 매핑

| 화면 | 사용 API |
| --- | --- |
| 헤더 검색영역 / 메인 하단 / 상세페이지 투표 영역 | `activeTopic` → 투표 시 `vote.do` |
| 투표 완료 후 '민심 확인하기' 팝업 | `topic/{topicSeq}.do` |
| 지난 설문 모아보기 목록 | `topics` |

---

## 3. 파일 구조

```text
src/
├─ components/common/investpick/
│  ├─ index.ts                     # 모듈 진입점 (외부에서는 여기서 import)
│  ├─ types.ts                     # API 타입 정의
│  ├─ api.ts                       # fetch 래퍼 (엔드포인트 4종) + 개발용 목 분기
│  ├─ investPickMock.ts            # 개발용 목 데이터 (운영 빌드에서 제거됨)
│  ├─ investPickStore.ts           # 전역 스토어 (구독/알림)
│  ├─ useInvestPick.ts             # 공통 훅
│  ├─ InvestPickVote.tsx           # 투표 영역 (search / main / detail)
│  ├─ InvestPickResultPopup.tsx    # 결과 팝업
│  └─ InvestPickList.tsx           # 지난 설문 모아보기 목록
├─ pages/kodex/investpick/index.tsx        # 데모 페이지
├─ styles/common/components/investpick/index.scss   # 컴포넌트 SCSS
└─ assets/images/kodex/common/investpick/*.svg      # 아이콘
```

---

## 4. 사용법

### 4-1. 투표 영역

```tsx
import { InvestPickVote } from '@/components/common/investpick'

// 헤더 검색영역
<InvestPickVote variant="search" />

// 메인페이지 하단 (1줄형, 라벨 미노출)
<InvestPickVote variant="main" />

// 상세페이지 카드
<InvestPickVote variant="detail" />
```

| prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `variant` | `'search' \| 'main' \| 'detail'` | `'main'` | 노출 형태 |
| `gubun` | `'M' \| 'S' \| 'P' \| 'R'` | variant 기준 | 투표 위치. 투표 API `gubun` / GA `data-gtm-click-location` 에 사용 (`main`→`M`, `search`→`S`, `detail`→`P`) |
| `label` | `string` | `'오늘의 투자픽'` | 상단 라벨 |
| `showLabel` | `boolean` | variant 기준 | 라벨 노출 여부 (`main` 은 기본 미노출) |
| `showCaution` | `boolean` | `true` | 투표 후 유의문구 노출 |
| `showDetail` | `boolean` | `true` | '민심 확인하기' 노출 |
| `onDetail` | `(topicSeq) => void` | 결과 팝업 오픈 | '민심 확인하기' 동작 재정의 |
| `onShare` | `(topicSeq) => void` | Web Share / 클립보드 복사 | 공유 동작 재정의 |

#### 투표 위치(gubun) / GA

| 위치 | 사용 예 | 투표 API `gubun` | GA `data-gtm-click-location` |
| --- | --- | --- | --- |
| 메인 | `<InvestPickVote variant="main" />` | `M` | 메인 |
| 검색 | `<InvestPickVote variant="search" />` | `S` | 검색 |
| 상품상세 | `<InvestPickVote variant="detail" />` | `P` | 상품상세 |
| 리스트(라운지) | `<InvestPickList />` 팝업 안 투표 | `R` | 라운지 |

variant 와 실제 페이지가 다르면 `gubun` 을 직접 넘긴다. (ex. 라운지 페이지의 detail 카드: `<InvestPickVote variant="detail" gubun="R" />`)

'민심 확인하기'(`a.investpick__detail`)에는 아래 GA 속성이 붙는다.

```html
data-gtm-event-name="button_click" data-gtm-event-category="투자픽" data-gtm-event-action="투자픽상세팝업"
data-gtm-event-label="민심확인하기" data-gtm-click-location="{메인|검색|상품상세|라운지}"
```

### 4-2. 여러 페이지 동시 연동

`InvestPickVote` 는 모듈 단위 전역 스토어(`investPickStore.ts`)를 구독한다.

- `activeTopic` 은 화면당 **1회만** 호출된다. (여러 개를 붙여도 중복 호출 없음)
- 한 곳에서 투표하면 같은 화면의 **모든 투표 영역이 동시에 결과 화면으로 전환**된다.
- 별도의 Provider 로 감쌀 필요가 없다.

### 4-3. 결과 팝업 단독 사용

```tsx
import { InvestPickResultPopup } from '@/components/common/investpick'

<InvestPickResultPopup
  open={open}
  topicSeq="1"
  trendNote="수요일 CPI 발표 후 미장 지지 반등"   // API 미제공 항목 (선택)
  getProductUrl={(fid) => `/ko/product/etf/${fid}`}
  onClose={() => setOpen(false)}
/>
```

### 4-4. 목록

```tsx
import { InvestPickList } from '@/components/common/investpick'

<InvestPickList pageRows={4} />
```

행을 클릭하면 기본적으로 해당 `topicSeq`의 결과 팝업(`InvestPickResultPopup`)이 열린다.
`onSelect`를 넘기면 그 동작을 대체한다 (팝업을 직접 열고 싶지 않을 때, 예: 상세 페이지로 이동).

```tsx
<InvestPickList pageRows={4} onSelect={(row) => console.log(row.topicSeq)} />
```

---

## 5. UI 규칙

### 색상

| 용도 | 값 |
| --- | --- |
| 답변 A (선택) | `#1454ff` / 트랙 `#e8f0ff` / 투표 전 배경 `#eef4ff` |
| 답변 B (선택) | `#e8342a` / 트랙 `#fdeeed` / 투표 전 배경 `#fdf1f0` |
| 미선택(패배) 답변 | `#a5a9b3` / 트랙 `#ededef` |
| 본문 / 보조 텍스트 | `#111111` / `#333333` / `#888888` |

**선택한 답변만 색상(A=블루, B=레드)으로 채워지고 나머지는 회색으로 표시된다.**

### 결과 바 2중 레이어

퍼센트 경계에서 글자색이 흰색 → 진한색으로 바뀌는 시안을 그대로 구현하기 위해
같은 텍스트를 2개 레이어로 겹쳐 놓고 위쪽 레이어를 `clip-path: inset(0 (100-pct)% 0 0)` 로 잘라낸다.

```text
.investpick__result            position: relative / overflow: hidden  (트랙)
 ├ .investpick__result-fill    width: {pct}%                          (채움 색)
 ├ .investpick__result-line    진한 글자 (기본 레이어)
 └ .investpick__result-line--over  흰 글자 + clip-path                (덮개 레이어)
```

> ⚠️ `.investpick__result` 컨테이너에는 `padding` 을 주면 안 된다.
> 절대배치된 `--over` 레이어와 기본 레이어의 좌표 기준이 어긋난다.
> 좌우 여백은 `.investpick__result-line` 의 `padding` 으로 준다.

### SCSS 규칙 준수 사항

- `@import "../../../utility/function.scss";` 로 `__vw()` 를 불러온다.
- 크기·간격·폰트 크기·테두리 두께는 모두 `__vw()` 사용.
- CSS Grid 미사용, Flexbox 만 사용.
- `font-weight` 는 400 / 500 / 600 / 700 만 사용.
- 색상은 Sass 변수 없이 hex 값 직접 작성.

### 아이콘

`react-svg` 의 `ReactSVG` 로 렌더링하며 경로는 `/assets/images/kodex/common/investpick/...svg` 를 직접 지정한다.
`<p>` 안에 들어가는 경우가 있어 모두 `wrapper="span"` 을 지정했다.

| 파일 | 용도 |
| --- | --- |
| `icon-pick-off.svg` / `icon-pick-on.svg` | 투표 전 라디오 (미선택 / 선택) |
| `icon-share.svg` | 공유하기 |
| `icon-detail-arrow.svg` | 민심 확인하기 화살표 (흰색 stroke, 흰 버튼에서는 SCSS 로 `#111` 처리) |
| `icon-caution.svg` | 유의문구 ⓘ |

---

## 6. 확인 필요 / 미확정 항목

| 항목 | 현재 처리 | 필요한 확인 |
| --- | --- | --- |
| ETF 상세 페이지 URL | `buildInvestPickProductUrl(fid)` → `/ko/product/etf/{fid}` | 실제 URL 규칙 확인 후 교체 (또는 `getProductUrl` prop 주입) |
| 팝업 일별 추이 보조 문구 | `trendNote` prop (선택) | API 제공 여부 확인. 미제공 시 운영 입력값 필요 |
| 팝업 헤드라인 `지금, 개미들의 민심은?` | `headline` prop 기본값 (고정 문구) | 회차별 문구 변경 필요 여부 확인 |
| 다수파 / 소수파 판정 | 내가 고른 답변의 퍼센트 ≥ 50% | 동률(50:50) 처리 기준 확인 |
| 확성기 아이콘 | 이모지 `📢` | 전용 SVG 제공 시 교체 |
| `success` 필드 타입 | `boolean` 로 처리 | 명세 비고에 `fail : 실패` 로 적혀 있어 문자열 응답 가능성 확인 |

---

## 7. 작업 완료 체크리스트

- [x] `npm.cmd run typecheck` 통과
- [x] `npx.cmd webpack --mode development` 통과
- [x] 컴파일 결과에 미처리된 `__vw(` 없음
- [x] CSS Grid 미사용
- [x] SCSS 선택자 부모 블록 중첩
- [x] PNG/JPG 는 SCSS 배경, SVG 는 `ReactSVG` + `/assets/...` 직접 경로
- [x] 헤더/메인/상세 투표 영역이 전역 스토어로 동시 연동
- [x] 투표 전 → 투표 후 → 민심 확인하기 팝업 흐름 동작 확인
