import { CSSProperties, useEffect, useState } from "react";
import { ReactSVG } from "react-svg";

import CommonModal from "../../../components/common/CommonModal";
import ComparePopup from "./components/ComparePopup";
import "../../../styles/utility/index.scss";
import "../../../styles/pages/fund/tdf/index.scss";

type ModalType = "compare" | "performance" | null;

type BarStyle = CSSProperties & {
  "--bar-height": string;
  "--bar-color-start": string;
  "--bar-color-end": string;
};

type HistoryPoint = {
  year: string;
  title: string;
  lines: string[];
  left: number;
  lineHeight: number;
  note?: string;
  subNote?: string;
};

const assetPath = "/assets/images/fund/tdf";

const navigation = ["연금투자", "펀드 상품", "인사이트", "고객라운지", "회사소개"];

const scrollNavigation = [
  { label: "TDF란?", target: "section-연금투자" },
  { label: "글로벌 액티브 TDF", target: "section-펀드 상품" },
  { label: "글로벌 EMP TDF", target: "section-인사이트" },
  { label: "코리아 EMP TDF", target: "section-고객라운지" },
  { label: "글라이드패스", target: "section-glide" },
  { label: "Q&A", target: "section-faq" },
];

const introCards = [
  {
    key: "rebalance",
    title: <><em>주기적인 리밸런싱</em>으로<br />최적의 자산 비중 유지</>,
    description: <>시장 변화에 맞춰 자산 비중을 조정해<br />장기적인 투자 효율을 높입니다.</>,
  },
  {
    key: "global",
    title: <><em>글로벌 자산배분</em>으로<br />상대적으로 위험은 낮추고<br />기회는 넓게</>,
    description: <>다양한 국가와 자산에 분산 투자해<br />위험을 관리하고 투자 기회를 확대합니다.</>,
  },
  {
    key: "glide",
    title: <>생애주기에 맞춰<br />자산 비중을 자동<br />조정하는 <em>Glide Path</em></>,
    description: <>투자 시기에 맞춰 위험자산 비중을<br />점진적으로 조정합니다.</>,
  },
];

const historyPoints: HistoryPoint[] = [
  { year: "2016.4", title: "한국형 TDF", lines: ["2045 H", "2040 H", "2040 UH", "2035 H", "2030 H", "2025 H", "2020 H"], left: 0, lineHeight: 249, note: "* 2025.9  한국형 TDF 2040 UH" },
  { year: "2016.10", title: "한국형 TDF", lines: ["2015 H"], left: 214, lineHeight: 100 },
  { year: "2019.2", title: "한국형 TDF", lines: ["2050 H"], left: 421, lineHeight: 131, note: "* 2019.2  한국형 TDF 2050 UH" },
  { year: "2019.12", title: "한국형 TDF", lines: ["2055 H"], left: 677, lineHeight: 100 },
  { year: "2024.8", title: "한국형 TDF", lines: ["2060 H"], left: 881, lineHeight: 152, note: "* 2024.8  한국형 TDF 2060 UH", subNote: "2026.4  글로벌 액티브 적격 TDF 리브랜딩" },
];

const allocationTabs = [
  { year: "2060", stock: 79, activeStock: 61.2, coreStock: 17.8, bond: 21, point: "은퇴 35년 전" },
  { year: "2055", stock: 78, activeStock: 60.5, coreStock: 17.5, bond: 22, point: "은퇴 30년 전" },
  { year: "2050", stock: 73.4, activeStock: 56.9, coreStock: 16.5, bond: 26.6, point: "은퇴 25년 전" },
  { year: "2045", stock: 69, activeStock: 53.5, coreStock: 15.5, bond: 31, point: "은퇴 20년 전" },
  { year: "2040", stock: 64, activeStock: 49.6, coreStock: 14.4, bond: 36, point: "은퇴 15년 전" },
  { year: "2035", stock: 59, activeStock: 45.7, coreStock: 13.3, bond: 41, point: "은퇴 10년 전" },
  { year: "2030", stock: 52, activeStock: 40.3, coreStock: 11.7, bond: 48, point: "은퇴 5년 전" },
  { year: "2025", stock: 35, activeStock: 27.1, coreStock: 7.9, bond: 65, point: "은퇴" },
  { year: "2020", stock: 32, activeStock: 24.8, coreStock: 7.2, bond: 68, point: "은퇴 5년 후" },
  { year: "2015", stock: 30, activeStock: 23.2, coreStock: 6.8, bond: 70, point: "은퇴 10년 후" },
];

const activeFeatures = [
  {
    title: <>한국인의 생애주기에 최적화된<br /><em>한국형 Glide Path 설계</em>와<br />정기 점검</>,
    bullets: ["생애주기별 비중 조절 외에도 시장 상황을 고려한 리밸런싱으로 운용 성과 최적화 추구", "한국인 소득주기, 은퇴 시점 등 생애주기 특성을 충분히 반영한 맞춤형 글라이드 패스 설계"],
    icon: "icon-list02-01.svg",
  },
  {
    title: <>전세계 우량 펀드를 선별하는<br />‘오픈 아키텍처 구조‘의<br /><em>글로벌 분산투자</em></>,
    bullets: ["글로벌 Top-tier 액티브 펀드 및 우수 ETF를 발굴하여 투자할 수 있는 오픈 아키텍처 구조", "글로벌 초우량 운용사 포트폴리오 매니저들을 활용한 시장 알파 추구"],
    icon: "icon-list02-02.svg",
  },
  {
    title: <><em>전사 역량이 집약</em>된<br />삼성자산운용의 대표<br />연금 펀드</>,
    bullets: ["삼성자산운용 리서치센터 하우스 뷰(House View)에 기반한 원칙 중심의 일관된 운용", "리서치와 운용 간 치열한 논의, 상호 검증 과정을 거쳐 각 자산군별 합리적 투자 비중 결정"],
    icon: "icon-list02-03.svg",
  },
];

const empFeatures = [
  {
    title: <><em>한국인의 특성</em>에 적합한<br />생애주기별 자동 자산배분 솔루션,<br />TDF</>,
    bullets: ["한국인 소득주기, 은퇴 시점 등 생애주기 특성을 충분히 반영한 맞춤형 글라이드 패스 설계", "생애주기별 비중 조절 외에도 시장 상황을 고려한 리밸런싱으로 운용 성과 최적화 추구"],
    icon: "icon-list03-01.svg",
  },
  {
    title: <><em>글로벌 대표 ETF</em>로 완성하는<br />‘초분산 + 저비용 포트폴리오 추구‘</>,
    bullets: ["검증된 국내외 우수 ETF를 편입하여 운용 보수 절감 및 비용 효율성 추구", "글로벌 주식과 차별화된 대체자산 배분으로 투자 기회를 넓히고, 물가상승을 고려한 국내 채권 투자까지"],
    icon: "icon-list03-02.svg",
  },
  {
    title: <><em>퀸트.AI 기반</em>의 고도화된<br />운용 전략 :<br />‘알파추구‘ 와 리스크 모니터링</>,
    bullets: ["정량적 데이터 기반의 퀸트 알고리즘 분석을 통해 시장 + 알파 창출 기회 적극 모색 추구", "고도화된 AI 활용한 시장 모니터링으로 변동, 하락 시그널 감지 및 선제적 대응 추구"],
    icon: "icon-list03-03.svg",
  },
];

const koreaFeatures = [
  {
    title: <><em>한국인의 특성</em>에 적합한<br />생애주기별 자동 자산배분 솔루션,<br />TDF</>,
    bullets: ["한국인 소득주기, 은퇴 시점 등 생애주기 특성을 충분히 반영한 맞춤형 글라이드 패스 설계", "한국인 소득주기, 은퇴 시점 등 생애주기 특성을 충분히 반영한 맞춤형 글라이드 패스 설계"],
    icon: "icon-list04-01.svg",
  },
  {
    title: <><em>국내 투자 대표 ETF</em>를 통한<br />‘초분산 + 저비용 포트폴리오 추구‘</>,
    bullets: ["국내 주식, 채권, 대체 등을 포함하는 국내 자산배분 포트폴리오를 구축", "장기적으로 투자 비용을 낮추면서 안정적인 자산배분 추구"],
    icon: "icon-list04-02.svg",
  },
  {
    title: <><em>Core & Satellite</em><br />전략을 통한 알파 추구</>,
    bullets: ["주식은 대표지수 투자 ETF를 Core로 50% 하고, 나머지는 상대모멘텀을 활용하여 최근 성과가 우수한 종목에 투자하여 알파성과 추구", "채권은 기준금리예측모형을 바탕으로 경기국면에 따른 타겟 듀레이션을 Core로 하고, 시장의 단기 변동성에 대응하여 단기적 듀레이션 전략 추구"],
    icon: "icon-list04-03.svg",
  },
];

const koreaPathCards = [
  {
    tone: "active",
    title: "코리아 글라이드 패스",
    badge: true,
    rows: [
      { label: "투자 대상", icon: "icon-emp-01-on.svg", lines: ["국내 주식 및 채권 중심"] },
      { label: "초기 전략", icon: "icon-emp-02-on.svg", lines: ["위험자산 비중↑ · 수익성 극대화 추구"] },
      { label: "은퇴시점 전략", icon: "icon-emp-03-on.svg", lines: ["자산보호를 위해 위험자산 감소폭을 가파르게 설계"] },
      { label: "이런 투자자에게", icon: "icon-emp-04-on.svg", lines: ["국내 경제에 맞는 자산 축적을 원하는 투자자", "자산 형성기에는 적극 성장, 은퇴기에는 자산 보존을", "추구하는 투자자"] },
    ],
  },
  {
    tone: "global",
    title: "글로벌 글라이드 패스",
    badge: false,
    rows: [
      { label: "투자 대상", icon: "icon-emp-01.svg", lines: ["전세계 주식 · 채권 · 대체자산 등"] },
      { label: "초기 전략", icon: "icon-emp-02.svg", lines: ["글로벌 분산 · 안정적 성장 추구"] },
      { label: "은퇴시점 전략", icon: "icon-emp-03.svg", lines: ["완만한 경사로 안정자산 비중 확대"] },
      { label: "이런 투자자에게", icon: "icon-emp-04.svg", lines: ["글로벌 자산 분산을 통해 단일 국가 리스크를", "헤지하고자 하는 투자자", "전세계 시장의 성장을 추구하는 투자자"] },
    ],
  },
];

const glideBars = [
  { year: "2060", period: "35년 전", value: 79, height: 213, color: "#0042f3", endColor: "rgba(0, 66, 243, 0.5)", customer: "20대" },
  { year: "2055", period: "30년 전", value: 78, height: 208, color: "#1454ff", endColor: "rgba(20, 84, 255, 0.5)", customer: "20-30대" },
  { year: "2050", period: "25년 전", value: 73, height: 194, color: "#2c67ed", endColor: "rgba(44, 103, 237, 0.5)", customer: "30대" },
  { year: "2045", period: "20년 전", value: 69, height: 184, color: "#467dd1", endColor: "rgba(70, 125, 209, 0.5)", customer: "30-40대" },
  { year: "2040", period: "15년 전", value: 64, height: 172, color: "#6697af", endColor: "rgba(102, 151, 175, 0.5)", customer: "40대" },
  { year: "2035", period: "10년 전", value: 59, height: 158, color: "#7daa97", endColor: "rgba(125, 170, 151, 0.5)", customer: "40-50대" },
  { year: "2030", period: "5년 전", value: 52, height: 142, color: "#82ae92", endColor: "rgba(130, 174, 146, 0.5)", customer: "50대 이상" },
  { year: "2025", period: "은퇴", value: 35, height: 95, color: "#98c178", endColor: "rgba(152, 193, 120, 0.5)", customer: "은퇴이후" },
  { year: "2020", period: "5년 후", value: 32, height: 87, color: "#aed361", endColor: "rgba(174, 211, 97, 0.5)", customer: "은퇴이후" },
  { year: "2015", period: "10년 후", value: 30, height: 80, color: "#bee149", endColor: "rgba(190, 225, 73, 0.5)", customer: "은퇴이후" },
];

const faqs = [
  { question: "삼성자산운용의 대표 연금 상품인 '삼성 TDF'란 무엇인가요?", answer: "투자자의 은퇴 시점을 목표로 생애주기에 맞춰 자산 비중을 자동으로 조정하는 자산배분 펀드입니다." },
  { question: "내 은퇴 연도에 맞는 '삼성TDF' 상품 라인업은 어떻게 선택하나요?", answer: "예상 은퇴 연도와 가장 가까운 숫자의 TDF 빈티지를 선택하는 방식으로 살펴볼 수 있습니다." },
  { question: "TDF 투자에서 가장 중요한 '글라이드 패스(Glide Path)'의 역할은 무엇인가요?", answer: "은퇴 시점이 가까워질수록 위험자산 비중을 낮춰 장기 투자 위험을 관리하도록 돕습니다." },
  { question: "왜 많은 투자자들이 연금 자산으로 삼성 TDF를 선택하고 신뢰하나요?", answer: "오랜 운용 경험과 글로벌 분산투자, 체계적인 리서치 기반의 자산배분 역량을 결합했기 때문입니다." },
];

const fundCards = Array.from({ length: 4 }, (_, index) => ({
  rank: String(index + 1).padStart(2, "0"),
  title: "삼성글로벌액티브적격TDF 2060증권투자신탁UH",
  category: "[주식혼합-재간접형]_Cpe(수수료미징구-온라인-퇴직연금)",
  returnRate: "+7.2%",
  price: "14,988원",
  assets: "312 억원",
}));

function SectionTitle({ number, label, title }: { number: number; label: string; title: string }) {
  return (
    <div className="section-title">
      <div className="section-title__eyebrow"><i>{number}</i><b>{label}</b></div>
      <h2>{title}</h2>
    </div>
  );
}

function FeatureCards({ items }: { items: typeof activeFeatures | typeof empFeatures | typeof koreaFeatures }) {
  return (
    <div className="feature-cards">
      {items.map((item, index) => (
        <article className="feature-card" key={index}>
          <div>
            <h3>{item.title}</h3>
            <ul>{item.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
          </div>
          <ReactSVG className="feature-card__icon" src={`${assetPath}/${item.icon}`} />
        </article>
      ))}
    </div>
  );
}

export default function TdfPage() {
  const [activeTdf, setActiveTdf] = useState(2);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [modal, setModal] = useState<ModalType>(null);
  const [scrollNav, setScrollNav] = useState({ visible: false, active: 0, progress: 0 });
  const selectedTdf = allocationTabs[activeTdf];

  useEffect(() => {
    let ticking = false;

    const updateScrollNavigation = () => {
      const sections = scrollNavigation
        .map(({ target }) => document.getElementById(target))
        .filter((section): section is HTMLElement => Boolean(section));

      if (!sections.length) return;

      const navHeight = 90;
      const scrollTop = window.scrollY;
      const positions = sections.map((section) => section.getBoundingClientRect().top + scrollTop);
      const visible = scrollTop >= positions[0] - navHeight;
      let active = 0;

      positions.forEach((position, index) => {
        if (scrollTop >= position - navHeight - 1) active = index;
      });

      const start = positions[active] - navHeight;
      const end = active < positions.length - 1
        ? positions[active + 1] - navHeight
        : positions[active] + sections[active].offsetHeight - navHeight;
      const progress = Math.max(0, Math.min(1, (scrollTop - start) / Math.max(1, end - start)));

      setScrollNav((previous) => {
        if (
          previous.visible === visible
          && previous.active === active
          && Math.abs(previous.progress - progress) < 0.005
        ) return previous;

        return { visible, active, progress };
      });
    };

    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        updateScrollNavigation();
        ticking = false;
      });
    };

    updateScrollNavigation();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  const moveToSection = (target: string) => {
    const section = document.getElementById(target);
    if (!section) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = section.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <div className="tdf-page">
      {/* header */}
      <header className="header">
        <div className="header__brand">
          <ReactSVG className="header__logo" src={`${assetPath}/logo.svg`} />
          <div className="header__toggle"><span>KODEX ETF</span><b>삼성자산운용</b></div>
        </div>
        <nav className="header__nav" aria-label="주요 메뉴">
          {navigation.map((item) => <a href={`#section-${item}`} key={item}>{item}</a>)}
        </nav>
        <div className="header__actions">
          <button className="header__language" type="button">KR <span>⌄</span></button>
          <button type="button" aria-label="마이페이지"><ReactSVG src={`${assetPath}/user.svg`} /></button>
          <button type="button" aria-label="검색"><ReactSVG src={`${assetPath}/search.svg`} /></button>
          <button className="header__menu" type="button" aria-label="전체 메뉴"><i /><i /><i /></button>
        </div>
      </header>

      <nav className={`scroll-navigation ${scrollNav.visible ? "visible" : ""}`} aria-label="TDF 섹션 메뉴">
        <div className="scroll-navigation__scroller">
          <div className="scroll-navigation__items">
            {scrollNavigation.map((item, index) => {
              const active = index === scrollNav.active;
              const style = active
                ? ({ "--section-progress": `${scrollNav.progress * 100}%` } as CSSProperties)
                : undefined;

              return (
                <button
                  className={active ? "active" : ""}
                  type="button"
                  style={style}
                  aria-current={active ? "location" : undefined}
                  onClick={() => moveToSection(item.target)}
                  key={item.target}
                >
                  <span className="scroll-navigation__label">{item.label}</span>
                  {active && <span className="scroll-navigation__progress-label" aria-hidden><i>{item.label}</i></span>}
                </button>
              );
            })}
          </div>
        </div>
        <div className="scroll-navigation__actions">
          <button className="compare" type="button" onClick={() => setModal("compare")}>TDF 3종 비교해 보기 →</button>
          <button className="performance" type="button" onClick={() => setModal("performance")}>삼성 TDF 대표 펀드 수익률 →</button>
        </div>
      </nav>

      {/* hero-section */}
      <section className="hero-section">
        <div className="hero-section__main">
          <div className="hero-section__copy">
            <h1>은퇴 시점에 맞춰 달라지는 투자,<br /><mark><span className="hero-mark__samsung">삼성</span><span> TDF</span></mark>로 시작하세요</h1>
            <p>생애주기에 따라 자산 비중을 자동으로 조정하는<br />삼성 TDF로 장기 투자를 시작해 보세요.</p>
          </div>
        </div>
        <div className="hero-section__banners">
          <button className="hero-banner compare" type="button" onClick={() => setModal("compare")}>
            <span className="hero-banner__plus" aria-hidden>+</span>
            <strong>삼성자산운용 TDF<br />3개 상품을 한 눈에<br />비교해보세요.</strong>
            <span className="hero-banner__tags"><i className="active">삼성 글로벌 액티브</i><i className="emp">삼성 글로벌 EMP</i><i className="korea">삼성 코리아 EMP</i></span>
          </button>
          <button className="hero-banner performance" type="button" onClick={() => setModal("performance")}>
            <span className="hero-banner__plus" aria-hidden>+</span>
            <strong>펀드별 수익률 및<br />투자성과를 확인해 보세요.</strong>
          </button>
        </div>
      </section>

      <main className="tdf-content">
        {/* section1 */}
        <section className="section1" id="section-연금투자">
          <SectionTitle number={1} label="TDF란?" title="TDF, 어떻게 투자할까요?" />
          <p className="section1__description">TDF(Target Date Fund)는 현재 미국에서 가장 각광받는 은퇴준비 상품으로 투자자의 은퇴시점을 목표로 하여<br />생애주기에 따라 적극적인 투자에서 안정적인 투자로 포트폴리오를 알아서 조정하는 자산배분 펀드입니다.</p>
          <div className="intro-cards">
            {introCards.map((card) => (
              <article className={`intro-card ${card.key}`} key={card.key}>
                <div><h3>{card.title}</h3><p>{card.description}</p></div>
                <span className="intro-card__image" aria-hidden />
              </article>
            ))}
          </div>
        </section>

        {/* section2 */}
        <section className="section2" id="section-펀드 상품">
          <SectionTitle number={2} label="글로벌 액티브 TDF" title="오랜 경험으로 든든하게, 세계에 나눠 담는 내 자산" />
          <div className="history">
            <h3>글로벌액티브 적격TDF의 역사</h3>
            <div className="history__panel">
              <div className="history__track">
                <ReactSVG className="history__arrow" src={`${assetPath}/history-arrow.svg`} />
                {historyPoints.map((point, index) => (
                  <div className="history__point" key={point.year} style={{ "--point-left": `calc(${point.left} / 1920 * 100vw)`, "--line-height": `calc(${point.lineHeight} / 1920 * 100vw)` } as CSSProperties}>
                    <ReactSVG className="history__dot" src={`${assetPath}/history-dot-0${index + 1}.svg`} />
                    <b>{point.year}</b><strong>{point.title}</strong>
                    {point.lines.map((line) => line === "2040 UH" ? (
                      <span className="history__highlight" key={line}><em>{line}</em><i>←</i><mark>2025.9</mark></span>
                    ) : <span key={line}>{line}</span>)}
                    {point.note && <small>{point.note}</small>}
                    {point.subNote && <small>{point.subNote}</small>}
                  </div>
                ))}
              </div>
              <p>은퇴자산의 적립부터 분배까지 아우르는 Total Solution 제공<br /><a href="#section-glide">‘연속성’ 그리고 ‘다양성’</a></p>
            </div>
          </div>

          <div className="allocation">
            <h3>생애주기에 따른 자산&amp;스타일 배분</h3>
            <div className="allocation__chart" style={{ "--focus-start": `${activeTdf * 10}%`, "--focus-end": `${(activeTdf + 1) * 10}%` } as CSSProperties}>
              <span className="allocation__graph-image" aria-hidden />
              <span className="allocation__shade before" />
              <span className="allocation__focus" />
              <span className="allocation__shade after" />
              <ReactSVG className={`allocation__retire-line ${activeTdf === 7 ? "hidden" : ""}`} src={`${assetPath}/graph_border.svg`} />
              <div className="allocation__axis"><span>100(%)</span><span>80</span><span>60</span><span>40</span><span>20</span><span>0</span></div>
            </div>
            <div className="allocation__tabs">
              {allocationTabs.map((item, index) => (
                <button className={index === activeTdf ? "active" : ""} type="button" onClick={() => setActiveTdf(index)} key={item.year}>
                  <span>{index === 0 ? item.point : item.point.replace("은퇴 ", "")}</span>
                </button>
              ))}
            </div>
            <p className="allocation__guide">원하는 은퇴 시점을 선택하면 해당 시기의 자산 비중을 볼 수 있습니다.</p>
            <div className="allocation__result">
              <div className="allocation__copy"><p>나의 <b>{selectedTdf.point}</b></p><strong>생애주기에 맞는 자산 비중은 <small>*자산비중 예시</small></strong></div>
              <div className="allocation__stock">
                <span><i /><b>주식</b></span><strong>{selectedTdf.stock}%</strong>
                <dl><div><dt>액티브 주식</dt><dd>{selectedTdf.activeStock}%</dd></div><div><dt>코어 주식</dt><dd>{selectedTdf.coreStock}%</dd></div></dl>
              </div>
              <div className="allocation__bond"><span><i /><b>채권</b></span><strong>{selectedTdf.bond}%</strong></div>
            </div>
          </div>
          <FeatureCards items={activeFeatures} />
        </section>

        {/* section3 */}
        <section className="section3" id="section-인사이트">
          <SectionTitle number={3} label="글로벌 EMP TDF" title="전 세계 분산투자! 글로벌 대표 ETF로 완성!" />
          <div className="quotes">
            <article>
              <span className="quotes__portrait buffett" />
              <div className="quotes__bubble">
                <ReactSVG className="quotes__tail" src={`${assetPath}/quote-tail.svg`} />
                <blockquote>
                  <div className="quotes__lines">
                    <p>“저비용 인덱스 펀드는 대다수 투자자들에게 가장 합리적인 주식 투자 방법 입니다.</p>
                    <p>나의 스승 벤자민 그레이엄도 오래 전부터 그러한 입장이었고,</p>
                    <p>그 이후에 본 모든 사실을 통해서도 나는 이 말이 옳다고 확신합니다.”</p>
                  </div>
                  <cite>워렌 버핏, 2006</cite>
                </blockquote>
              </div>
            </article>
            <article>
              <div className="quotes__bubble right">
                <blockquote>
                  <div className="quotes__lines">
                    <p>존 보글이 평생 옹호한 것은 바로 그 단순함, ‘상식(common sense)’ 이다.</p>
                    <p>그는 말한다. “시장을 이기려 하지 말고, 시장 전체를 소유하라.”</p>
                    <p>수수료·세금·거래비용이 누적되면 장기적으로 불리할 수 있다.</p>
                  </div>
                  <cite>존 보글, &lt;모든 주식을 소유하라&gt;</cite>
                </blockquote>
                <ReactSVG className="quotes__tail" src={`${assetPath}/quote-tail.svg`} />
              </div>
              <span className="quotes__portrait bogle" />
            </article>
          </div>
          <FeatureCards items={empFeatures} />
        </section>

        {/* section4 */}
        <section className="section4" id="section-고객라운지">
          <SectionTitle number={4} label="코리아 EMP TDF" title="국내 자산배분으로 한국인의 생애주기에 최적화된 TDF" />
          <div className="korea-strategy">
            <h3>한국 투자자의 특수성과 국내 자산의 효율성 극대화 추구를 위한 한국형 전략</h3>
            <div className="korea-strategy__summary">
              <span>공통 위험자산 비중 구조 <small>*자산비중 예시</small></span>
              <div>
                <b>초기 <em>79%</em></b>
                <ReactSVG src={`${assetPath}/icon-diagram-01.svg`} />
                <b>은퇴시점 <em>35.6%</em></b>
                <ReactSVG src={`${assetPath}/icon-diagram-02.svg`} />
                <b>생애말 <em>23%</em></b>
              </div>
            </div>
            <div className="korea-strategy__comparison">
              <h4>코리아 글라이드 패스와 글로벌 글라이드 패스 비교</h4>
              <div className="korea-path-cards">
                {koreaPathCards.map((card) => (
                  <article className={`korea-path-card ${card.tone}`} key={card.title}>
                    <header>
                      <h5>{card.title}</h5>
                      {card.badge && <span><ReactSVG src={`${assetPath}/icon-korea.svg`} />한국형 전략</span>}
                    </header>
                    <div className="korea-path-card__body">
                      {card.rows.map((row) => (
                        <div className="korea-path-card__row" key={row.label}>
                          <ReactSVG className="korea-path-card__icon" src={`${assetPath}/${row.icon}`} />
                          <div>
                            <em>{row.label}</em>
                            {row.lines.map((line) => <p key={line}>{line}</p>)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
          <FeatureCards items={koreaFeatures} />
        </section>

        {/* section5 */}
        <section className="section5" id="section-glide">
          <SectionTitle number={5} label="글로벌 액티브/EMP TDF 글라이드 패스" title="시간이 지나면 내 자산은 어떻게 변할까요?" />
          <div className="glide-path">
            <div className="glide-path__heading"><h3>글로벌 액티브/EMP TDF 글라이드 패스 개요<em>*</em></h3><span>※ 투자 시 매니저가 자산배분을 해줍니다.</span></div>
            <div className="bar-chart">
              <div className="bar-chart__labels"><span className="period">은퇴까지<em>**</em></span><span className="stock">주식 비중<br />(%)</span><span className="fund">펀드명</span><span className="customer">대상고객<em>***</em></span></div>
              <div className="bar-chart__items">
                {glideBars.map((bar) => (
                  <div key={bar.year} style={{ "--bar-height": `calc(${bar.height} / 1920 * 100vw)`, "--bar-color-start": bar.color, "--bar-color-end": bar.endColor } as BarStyle}>
                    <span className="bar-chart__period">{bar.period}</span>
                    <i><b>{bar.value}%</b></i>
                    <strong>TDF {bar.year}</strong>
                    <small>{bar.customer}</small>
                  </div>
                ))}
              </div>
            </div>
            <div className="glide-path__notes"><p><em>*</em> 글라이드 패스 관련 내용은 단순 참고자료이며, 분기 단위 점검 등 필요시 수시로 조정될 수 있습니다.</p><p><em>**</em> 2026년 12월 말 기준</p><p><em>***</em> 55-60세 은퇴 기준</p></div>
          </div>
        </section>

        {/* section6 */}
        <section className="section6" id="section-faq">
          <SectionTitle number={6} label="Q&A" title="삼성자산운용 TDF 한 눈에 보기" />
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <article className={openFaq === index ? "open" : ""} key={faq.question}>
                <button
                  id={`faq-question-${index}`}
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  aria-expanded={openFaq === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span>Q{index + 1}</span>
                  <strong>{faq.question}</strong>
                  <ReactSVG className="faq-list__icon" src={`${assetPath}/btn-more.svg`} aria-hidden />
                </button>
                <div
                  className="faq-list__answer"
                  id={`faq-answer-${index}`}
                  role="region"
                  aria-labelledby={`faq-question-${index}`}
                  aria-hidden={openFaq !== index}
                >
                  <div><p>{faq.answer}</p></div>
                </div>
              </article>
            ))}
          </div>
          <button className="section6__more" type="button">+ 더보기</button>
        </section>
      </main>

      {/* footer */}
      <footer className="footer">
        <div className="footer__top">
          <nav>{["스튜어드십코드", "개인정보처리방침(고객)", "신용정보활용체제", "영상정보처리기기 운영·관리방침", "고객권리 안내문", "금융사기 관련 유의사항"].map((item) => <a href="#" key={item}>{item}</a>)}</nav>
          <div><button type="button">패밀리사이트 및 유관기관⌃</button><button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>TOP ↑</button></div>
        </div>
        <div className="footer__bottom">
          <div><ReactSVG className="footer__logo" src={`${assetPath}/footer-logo.svg`} /><p>06220 서울특별시 서초구 서초대로 74길 11 삼성자산운용(16~18층)<br />콜센터 080-377-4777 (상담시간 : 평일 오전 9:00~오후 5:00)</p><small>Copyright(C) 2019 SAMSUNG ASSET MANAGEMENT CO. LTD. ALL RIGHTS RESERVED.</small></div>
          <div className="footer__social">{["blog.svg", "naver-post.svg", "youtube.svg", "social-bg.svg"].map((icon) => <button type="button" key={icon} aria-label="SNS"><ReactSVG src={`${assetPath}/${icon}`} /></button>)}<button className="chat" type="button"><ReactSVG src={`${assetPath}/kakao.svg`} />상담하기</button></div>
        </div>
      </footer>

      <CommonModal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        width={modal === "compare" ? 1358 : 1576}
        panelClassName={modal ?? undefined}
        ariaLabel={modal === "compare" ? "TDF 상품 비교" : "펀드별 수익률 및 투자성과"}
        title={modal === "compare"
          ? <>삼성자산운용 TDF 3개 상품을<br />한 눈에 비교해보세요.</>
          : <>펀드별 수익률 및 투자성과를<br />확인해 보세요.</>}
      >
        {modal === "compare" ? (
          <ComparePopup />
        ) : (
          <div className="fund-list">
            {fundCards.map((fund) => (
              <article className="fund-card" key={fund.rank}>
                <div className="fund-card__rank"><span>{fund.rank}</span><button type="button" aria-label="관심상품">♡</button></div>
                <div className="fund-card__mark" />
                <h3>{fund.title}</h3><p>{fund.category}</p>
                <div className="fund-card__return"><span>수익률<small>*1개월 기준</small></span><b>{fund.returnRate}</b></div>
                <dl><div><dt>기준가</dt><dd>{fund.price}</dd></div><div><dt>순자산</dt><dd>{fund.assets}</dd></div></dl>
              </article>
            ))}
            <p className="fund-list__note">* 테마 상품 중 최근 1개월 기준 수익률이 높은 상품 순으로 최대 4개까지 확인 가능합니다.</p>
          </div>
        )}
      </CommonModal>
    </div>
  );
}
