# 오늘의 투자픽 가이드

이 문서는 # 오늘의 투자픽 가이드 프로젝트 전용 가이드다.

## 1. 작업 기준

- 기본 해상도: PC 1920px
- 기본 폰트: Pretendard
- 기술 환경: React + TypeScript + SCSS + Webpack


관련 설정 파일:

```text
webpack.config.cjs
tsconfig.json
package.json
index.html
src/main.tsx
```

## 3. React 작성 규칙

- 데이터 연동이 없는 정적 페이지이므로 기본적으로 별도 컴포넌트로 분리하지 않는다.
- `src/pages/fund/tdf/index.tsx` 안에서 섹션 순서대로 작성한다.
- 반복 데이터와 UI 상태는 페이지 상단의 배열과 `useState`로 관리할 수 있다.
- 섹션 클래스는 `.section1`부터 `.section6`까지 명확히 구분한다.
- 의미가 있는 버튼에는 `type="button"`을 지정한다.
- 아이콘 전용 버튼에는 `aria-label`을 지정한다.

## 4. 이미지 사용 규칙

PNG/JPG 같은 일반 이미지는 TSX에서 import하지 않고 SCSS의 `background-image`로 사용한다.

```scss
.hero-section {
  &__image {
    background: url("../../../../assets/images/fund/tdf/bg-img-01.png")
      center / cover no-repeat;
  }
}
```

SVG는 `react-svg`의 `ReactSVG`로 렌더링한다.

```tsx
import { ReactSVG } from "react-svg";

<ReactSVG
  className="icon"
  src="/assets/images/fund/tdf/icon-list01-01.svg"
/>
```

- SVG 경로는 `/assets/images/fund/tdf/...svg` 형식으로 `src`에 직접 입력한다.
- SVG마다 별도의 import 변수를 만들지 않는다.
- Webpack은 `src/assets`를 빌드 결과의 `/assets`로 복사한다.

## 5. SCSS 작성 규칙

### 기본 규칙

- 색상용 Sass 변수는 만들지 않고 디자인의 색상값을 직접 작성한다.
- CSS Grid는 사용하지 않고 Flexbox를 사용한다.
- 크기, 간격, 폰트 크기, 테두리 두께 등 디자인 규격에는 `__vw()`를 사용한다.
- `font-weight`는 다음 값만 사용한다.
  - `400`: Regular
  - `500`: Medium
  - `600`: SemiBold
  - `700`: Bold
- 공통 스타일은 파일 상단의 `/* common */` 아래에 작성한다.
- 각 영역은 `/* header */`, `/* hero-section */`, `/* section1 */`처럼 주석으로 구분한다.

### SCSS 중첩 규칙

같은 부모 클래스의 element, modifier, 상태 및 내부 태그는 부모 블록 안에 중첩한다.

```scss
.allocation {
  margin-top: __vw(100);

  &__tabs {
    display: flex;

    button {
      display: flex;

      span {
        font-size: __vw(13);
        font-weight: 400;
      }

      b {
        font-size: __vw(16);
        font-weight: 600;
      }

      &.active {
        color: #fff;
        background: #1454ff;
      }
    }
  }
}
```

Modifier도 부모 클래스 안에서 `&`로 작성한다.

```scss
.hero-banner {
  &.compare {
    height: __vw(322);
    background: #cdf058;
  }

  &.performance {
    height: __vw(332);
    background: #94d0ff;
  }
}
```

## 6. `__vw()` 사용 주의사항

`function.scss`의 함수명이 `__vw`로 시작해 Sass 모듈에서는 private 함수로 취급된다. 페이지 SCSS에서는 기존 프로젝트 방식대로 다음과 같이 불러온다.

```scss
@import "../../../utility/function.scss";
```

정상적으로 컴파일되면 결과 CSS에 `__vw(` 문자열이 남아 있지 않아야 한다.

검사 명령:

```powershell
npx.cmd sass src/styles/pages/fund/tdf/index.scss $env:TEMP\tdf-check.css --no-source-map
rg "__vw\(" $env:TEMP\tdf-check.css
```

검색 결과가 없어야 정상이다.

## 7. 그래프 인터랙션

글로벌 액티브 TDF 그래프는 연도 탭을 클릭하면 다음 항목이 함께 변경되어야 한다.

- 선택 버튼의 `.active` 상태
- 선택 구간 위의 반투명 배경 및 테두리
- 선택 상품명
- 주식 비중
- 채권 등 비중
- 주요 대상 고객

현재 데이터 구조:

```ts
{
  year: "2050",
  stock: 73,
  bond: 27,
  customer: "30대",
  point: "은퇴 25년 전",
}
```

선택 인덱스는 `activeTdf` 상태로 관리한다.

## 8. 페이지 섹션 구성

1. Hero
2. TDF란?
3. 글로벌 액티브 TDF
4. 글로벌 EMP TDF
5. 코리아 EMP TDF
6. 글로벌 액티브/EMP TDF 글라이드 패스
7. Q&A

Q&A는 선택 항목을 다시 누르면 닫히도록 `openFaq` 상태로 관리한다.

## 9. Webpack 실행 방법

PowerShell 실행 정책 때문에 `npm` 대신 `npm.cmd`를 사용하는 것이 안전하다.

개발 서버:

```powershell
cd C:\Users\cheol\OneDrive\Desktop\project\tdf-new-page
npm.cmd run dev
```

접속 주소:

```text
http://localhost:3000
```

타입 검사:

```powershell
npm.cmd run typecheck
```

Webpack 개발 컴파일 검사:

```powershell
npx.cmd webpack --mode development
```

브라우저에 이전 CSS가 남아 있으면 개발 서버를 재시작하고 `Ctrl + Shift + R`로 강력 새로고침한다.

## 10. 작업 완료 전 확인 목록

- [ ] Figma PC 시안과 1920px 화면을 비교했는가?
- [ ] PNG/JPG가 SCSS 배경 이미지로 처리됐는가?
- [ ] SVG가 `ReactSVG`와 `/assets/...` 직접 경로를 사용하는가?
- [ ] SCSS 선택자가 부모 블록 안에 중첩됐는가?
- [ ] 섹션별 주석과 클래스가 명확한가?
- [ ] CSS Grid를 사용하지 않았는가?
- [ ] 디자인 규격에 `__vw()`가 적용됐는가?
- [ ] 컴파일 결과에 미처리된 `__vw(`가 남지 않았는가?
- [ ] 그래프 탭의 active 상태와 하단 데이터가 함께 변경되는가?
- [ ] `npm.cmd run typecheck`가 통과하는가?
- [ ] Webpack 개발 컴파일이 통과하는가?
