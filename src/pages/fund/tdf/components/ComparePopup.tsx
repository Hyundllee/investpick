type LineupEntry = { label: string; note: string };

type ComparisonRow = {
  titleLines: [string, string];
  badge: string | null;
  launch: string;
  tags: string[];
  strategyLead: string;
  strategyRest: string;
  target: string;
  glidePath: string;
  riskAssets: string[];
  stableAssets: string[];
  hedge: string;
  lineup: LineupEntry[];
};

const tableHeaders = ["시리즈", "최초 출시", "특징", "운용 전략", "주요 투자대상", "Glide Path", "투자 자산", "환헤지", "라인업"];

const comparisonRows: ComparisonRow[] = [
  {
    titleLines: ["삼성 글로벌", "액티브 TDF"],
    badge: "업계최초 TDF",
    launch: "2016년 4월",
    tags: ["글로벌", "액티브펀드"],
    strategyLead: "리서치 기반",
    strategyRest: "Active 운용",
    target: "Active Fund + ETF",
    glidePath: "당사 Glide Path (글로벌)",
    riskAssets: ["글로벌 주식", "국내 주식"],
    stableAssets: ["글로벌 채권", "국내 채권"],
    hedge: "H / UH",
    lineup: [
      { label: "TDF H: 10종", note: "(TDF 2015~2060)" },
      { label: "TDF UH: 3종", note: "(TDF 2040/50/60)" },
    ],
  },
  {
    titleLines: ["삼성 글로벌", "EMP TDF"],
    badge: null,
    launch: "2020년 3월",
    tags: ["글로벌", "EMP펀드"],
    strategyLead: "퀀트모델 기반",
    strategyRest: "정량적 운용",
    target: "ETF",
    glidePath: "당사 Glide Path (글로벌)",
    riskAssets: ["글로벌 주식", "국내 주식", "대체자산"],
    stableAssets: ["글로벌 채권", "국내 채권"],
    hedge: "부분H",
    lineup: [{ label: "TDF 8종", note: "(TDF 2030~2060)" }],
  },
  {
    titleLines: ["삼성 코리아", "EMP TDF"],
    badge: "업계최초 국내 투자형 TDF",
    launch: "2026년 5월",
    tags: ["국내집중", "EMP펀드"],
    strategyLead: "모멘텀 기반",
    strategyRest: "정량적 운용",
    target: "국내 ETF",
    glidePath: "당사 Glide Path (코리아)",
    riskAssets: ["국내 주식"],
    stableAssets: ["국내 채권"],
    hedge: "-",
    lineup: [{ label: "TDF 1종", note: "(TDF 2060)" }],
  },
];

export default function ComparePopup() {
  return (
    <div className="compare-table">
      <div className="compare-table__head">{tableHeaders.map((item) => <b key={item}>{item}</b>)}</div>
      {comparisonRows.map((row, index) => (
        <div className={`compare-table__row row-${index + 1}`} key={row.titleLines.join(" ")}>
          <div className="compare-table__series">
            <strong>{row.titleLines[0]}<br />{row.titleLines[1]}</strong>
          </div>
          <div className="compare-table__launch">
            <span>{row.launch}</span>
            {row.badge && <span className="compare-table__badge">{row.badge}</span>}
          </div>
          <div className="compare-table__tags">
            {row.tags.map((tag) => <i key={tag}>#{tag}</i>)}
          </div>
          <div className="compare-table__strategy">
            <b>{row.strategyLead}</b>
            <span>{row.strategyRest}</span>
          </div>
          <span>{row.target}</span>
          <span>{row.glidePath}</span>
          <div className="compare-table__assets">
            <div className="risk"><b>위험자산</b><p>{row.riskAssets.join(" · ")}</p></div>
            <div className="stable"><b>안정자산</b><p>{row.stableAssets.join(" · ")}</p></div>
          </div>
          <span className="compare-table__hedge">{row.hedge}</span>
          <div className="compare-table__lineup">
            {row.lineup.map((entry) => (
              <div key={entry.label}>
                <strong>{entry.label}</strong>
                <small>{entry.note}</small>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
