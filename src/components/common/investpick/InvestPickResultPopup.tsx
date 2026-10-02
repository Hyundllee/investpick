import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { ReactSVG } from 'react-svg'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperInstance } from 'swiper'

import 'swiper/css'

import CommonModal from '../CommonModal'
import { fetchInvestPickTopicDetail } from './api'
import InvestPickVote, { INVEST_PICK_CAUTION } from './InvestPickVote'
import { getInvestPickState, loadActiveTopic, subscribeInvestPick } from './investPickStore'
import type { InvestPickDaily, InvestPickTopicDetail } from './types'

import '../../../styles/common/components/investpick/index.scss'

const ICON_BASE = '/assets/images/kodex/common/investpick'

/** 일별 추이가 이 개수 이상이면 전체 나열 대신 화살표로 넘기는 슬라이드(Swiper) 형태로 전환한다. */
const TREND_SLIDER_THRESHOLD = 7
/** 슬라이드 모드에서 한 화면에 보이는 컬럼 수. 데이터가 이보다 적으면 뒤 날짜(? 아이콘)로 이 개수까지 채운다. */
const TREND_SLIDER_VISIBLE_COUNT = 5

/** voteYmd(예: "20260826") 에서 월/일만 뽑는다. 형식이 다르면 원본을 그대로 돌려준다. */
function extractMonthDay(voteYmd: string): { month: number; day: number } | null {
  const str = String(voteYmd)
  if (str.length !== 8) return null
  return { month: Number(str.slice(4, 6)), day: Number(str.slice(6, 8)) }
}

/** 일별 추이 라벨. ex) "8/27 (월)", "8/28 (금) 오늘" */
function formatDailyLabel(item: InvestPickDaily): string {
  const md = extractMonthDay(item.voteYmd)
  const datePart = md ? `${md.month}/${md.day} ` : ''
  return `${datePart}(${item.dayLabel})${item.today ? ' 오늘' : ''}`
}

/** voteYmd(예: "20260826") → "2026.08.26" */
function formatYmdDots(voteYmd: string | undefined): string {
  const str = String(voteYmd ?? '')
  if (str.length !== 8) return str
  return `${str.slice(0, 4)}.${str.slice(4, 6)}.${str.slice(6, 8)}`
}

/**
 * 상품명 등 텍스트에 HTML 엔티티(&amp; 등)가 그대로 내려오는 경우를 위한 안전한 디코딩.
 * <textarea> 는 innerHTML 을 넣어도 스크립트를 실행하지 않고 엔티티만 해석하므로 안전하다.
 */
function decodeHtmlEntities(text: string): string {
  if (typeof document === 'undefined') return text
  const el = document.createElement('textarea')
  el.innerHTML = text
  return el.value
}

/** 일별 추이 한 칸(막대 또는 데이터 없음 아이콘 + 라벨). 정적 나열/슬라이드 두 모드에서 공통으로 쓴다. */
function DailyChartColumn({ item, hasData, maxPct }: { item: InvestPickDaily; hasData: boolean; maxPct: number }) {
  return (
    <>
      {hasData ? (
        <div className="investpick-popup__chart-bars">
          <span className="investpick-popup__chart-bar is-a" style={{ height: `${(item.pctA / maxPct) * 100}%` }}>
            <em>{item.pctA}%</em>
          </span>
          <span className="investpick-popup__chart-bar is-b" style={{ height: `${(item.pctB / maxPct) * 100}%` }}>
            <em>{item.pctB}%</em>
          </span>
        </div>
      ) : (
        <div className="investpick-popup__chart-empty">
          <ReactSVG wrapper="span" src={`${ICON_BASE}/no-data-img.svg`} />
        </div>
      )}
      <span className="investpick-popup__chart-label">{formatDailyLabel(item)}</span>
    </>
  )
}

/**
 * ETF 상세 페이지 URL 규칙.
 * TODO: 실제 서비스 URL 규칙 확인 후 교체하거나 getProductUrl prop 으로 주입한다.
 */
export const buildInvestPickProductUrl = (fid: string) => `/ko/product/etf/${fid}`

type InvestPickResultPopupProps = {
  open: boolean
  topicSeq: string
  onClose: () => void
  /** 팝업 고정 헤드라인 */
  headline?: string
  /** 라벨 */
  label?: string
  /** 일별 추이 우측 보조 문구 (API 미제공 항목) */
  trendNote?: string
  /** 상품 상세 URL 생성기 */
  getProductUrl?: (fid: string, prodNm: string) => string
  /**
   * 팝업 안에서 바로 투표 가능 여부. (지난 설문 모아보기에서 진행중인 설문을 연 경우)
   * true 이고 아직 투표 전이면 결과 대신 투표 선택지(InvestPickVote)를 노출하고,
   * 투표하면 상세를 다시 조회해 기존 결과 화면으로 전환한다.
   */
  allowVote?: boolean
}

const noop = () => undefined

function formatCount(value: number) {
  return value.toLocaleString('ko-KR')
}

export default function InvestPickResultPopup({
  open,
  topicSeq,
  onClose,
  headline = '지금, 개미들의 민심은?',
  label = '오늘의 투자픽',
  trendNote,
  getProductUrl = buildInvestPickProductUrl,
  allowVote = false,
}: InvestPickResultPopupProps) {
  const [detail, setDetail] = useState<InvestPickTopicDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [canSlidePrev, setCanSlidePrev] = useState(false)
  const [canSlideNext, setCanSlideNext] = useState(false)
  const swiperRef = useRef<SwiperInstance | null>(null)
  /** 투표 직후 재조회는 '불러오는 중' 으로 화면을 비우지 않고 조용히 갱신한다. */
  const silentReloadRef = useRef(false)

  // 팝업 안 투표는 InvestPickVote(전역 스토어)가 처리하므로 진행중인 투자픽 상태를 같이 구독한다.
  const investPick = useSyncExternalStore(subscribeInvestPick, getInvestPickState, getInvestPickState)

  useEffect(() => {
    if (open && allowVote) void loadActiveTopic()
  }, [open, allowVote])

  useEffect(() => {
    if (!open || !topicSeq) return undefined

    const controller = new AbortController()
    const silent = silentReloadRef.current
    silentReloadRef.current = false
    if (!silent) setLoading(true)
    setError(null)

    fetchInvestPickTopicDetail(topicSeq, controller.signal)
      .then((data) => setDetail(data))
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return
        setError(cause instanceof Error ? cause.message : '투자픽 정보를 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [open, topicSeq, reloadKey])

  useEffect(() => {
    if (error) onClose()
  }, [error, onClose])

  const daily = detail?.daily ?? []
  const todayIndex = daily.findIndex((item) => item.today)
  const availableDaily = daily.filter((item) => item.available)
  const maxPct = availableDaily.reduce((max, item) => Math.max(max, item.pctA, item.pctB), 0) || 100

  const isTrendSlider = daily.length >= TREND_SLIDER_THRESHOLD
  // 슬라이드는 데이터가 있는(available) 마지막 날까지만 그려 맨 오른쪽 칸이 막대 그래프가 되게 하고,
  // 그 개수가 한 화면보다 적을 때만 뒤 날짜(? 아이콘)로 채워 한 화면을 맞춘다.
  // ex) 데이터 2일 → 막대 2 + ? 3 / 데이터 3일 → 막대 3 + ? 2 / 데이터 7일 → 막대 7 (첫 화면은 최근 5일)
  // (findLastIndex 는 ES2023 이라 reduce 로 구한다.)
  const dataEndIndex = daily.reduce((end, item, index) => (item.available ? index + 1 : end), 0)
  const trendSlides = daily.slice(0, Math.max(dataEndIndex, TREND_SLIDER_VISIBLE_COUNT))
  // 첫 노출은 최근 데이터가 맨 오른쪽에 오도록 끝에 맞춘다. 이전 날짜로 넘겼을 때만 다음(오른쪽) 화살표가 활성화된다.
  const initialSlideIndex = Math.max(0, trendSlides.length - TREND_SLIDER_VISIBLE_COUNT)

  // 응답은 대문자로 내려온다(InvestPickStatus)고 하나, 표기 방어를 위해 대소문자 무관하게 비교한다.
  const isEnded = (detail?.status ?? '').toString().toUpperCase() === 'ENDED'

  const pickedPct = detail ? (detail.choice === 'B' ? detail.pctB : detail.pctA) : 0
  const isMajority = detail ? pickedPct >= 50 : true

  // 투표 화면은 스토어의 진행중 투자픽과 같은 설문일 때만 노출한다. (다른 설문에 투표되는 것 방지)
  const isActiveTopic = Boolean(detail) && investPick.topic?.topicSeq === detail?.topicSeq
  const wantsVote = allowVote && !isEnded && Boolean(detail?.canVote)
  const waitingActiveTopic = wantsVote && (investPick.phase === 'idle' || investPick.phase === 'loading')
  const isVoteMode = wantsVote && isActiveTopic

  // 팝업 안에서 투표가 끝나면 상세를 다시 조회해 기존 결과 화면(현황/일일 추이)으로 전환한다.
  const votedInPopup = isVoteMode && investPick.justVoted
  useEffect(() => {
    if (!votedInPopup) return
    silentReloadRef.current = true
    setReloadKey((key) => key + 1)
  }, [votedInPopup])

  return (
    <CommonModal
      open={open}
      onClose={onClose}
      width={960}
      ariaLabel={headline}
      panelClassName="investpick-popup__panel"
      contentClassName="investpick-popup__body"
    >
      <div className="investpick-popup">
        {(loading || waitingActiveTopic) && <p className="investpick-popup__state">불러오는 중입니다.</p>}

        {!loading && !waitingActiveTopic && !error && detail && (
          <>
            {/* head */}
            <div className="investpick-popup__head">
              <div className="investpick-popup__label-row">
                <span className="investpick-popup__label">{label}</span>
                {isEnded && (
                  <>
                    <span className="investpick-popup__badge">{detail.roundNm}</span>
                    <span className="investpick-popup__badge is-ended">종료</span>
                  </>
                )}
              </div>
              <h3 className="investpick-popup__title">{isVoteMode ? detail.title : headline}</h3>
              <p className="investpick-popup__summary">
                {isEnded ? (
                  <>
                    <span className="investpick-popup__summary-item">
                      설문주제 <b>{`${detail.optionA} vs ${detail.optionB}`}</b>
                    </span>
                    <span className="investpick-popup__summary-bar" aria-hidden="true" />
                    <span className="investpick-popup__summary-item is-point">
                      최종 {formatCount(detail.voteTotalCnt)}명
                    </span>
                    <span className="investpick-popup__summary-bar" aria-hidden="true" />
                    <span className="investpick-popup__summary-item">
                      {formatYmdDots(daily[0]?.voteYmd)} ~ {formatYmdDots(daily[daily.length - 1]?.voteYmd)}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="investpick-popup__summary-item">
                      이번 주 설문 <b>{`${detail.optionA} vs ${detail.optionB}`}</b>
                    </span>
                    <span className="investpick-popup__summary-bar" aria-hidden="true" />
                    <span className="investpick-popup__summary-item is-point">
                      오늘 {formatCount(detail.voteTodayCnt)}명 참여
                    </span>
                    <span className="investpick-popup__summary-bar" aria-hidden="true" />
                    <span className="investpick-popup__summary-item">매일 1회 투표 가능</span>
                  </>
                )}
              </p>
            </div>

            {/* vote: 미투표 상태로 진행중 설문을 연 경우, 현황 대신 투표 선택지를 노출한다 */}
            {isVoteMode && (
              <>
                {/* 헤드/메타는 팝업이 그리므로 CSS 로 숨기고 선택지만 사용한다. onDetail 로 중첩 팝업 방지 */}
                <InvestPickVote
                  variant="detail"
                  showLabel={false}
                  showCaution={false}
                  showDetail={false}
                  onDetail={noop}
                  className="investpick-popup__vote"
                />

                <div className="investpick-popup__trend">
                  <div className="investpick-popup__trend-head">
                    <h4>일일 민심 추이</h4>
                  </div>
                  <div className="investpick-popup__trend-locked">
                    <span className="investpick-popup__trend-locked-icon" aria-hidden="true">
                      ?
                    </span>
                    <p>투표 시 일별 민심 추이를 볼 수 있어요</p>
                  </div>
                </div>
              </>
            )}

            {/* total */}
            {!isVoteMode && (
              <div className="investpick-popup__total">
                <div className="investpick-popup__total-head">
                  <span className="investpick-popup__total-side">
                    <em>{detail.optionA}</em>
                    <strong>{detail.pctA}%</strong>
                  </span>
                  <span className="investpick-popup__total-side is-right">
                    <strong>{detail.pctB}%</strong>
                    <em>{detail.optionB}</em>
                  </span>
                </div>
                <div
                  className="investpick-popup__total-bar"
                  role="img"
                  aria-label={`${detail.optionA} ${detail.pctA}퍼센트, ${detail.optionB} ${detail.pctB}퍼센트`}
                >
                  <span className="investpick-popup__total-a" style={{ width: `${detail.pctA}%` }} />
                  <span className="investpick-popup__total-b" style={{ width: `${detail.pctB}%` }} />
                </div>
              </div>
            )}

            {/* callout: 종료된 설문은 투표 참여 여지가 없으므로 노출하지 않는다 */}
            {!isEnded &&
              !isVoteMode &&
              (detail.canVote ? (
                <div className="investpick-popup__cta">
                  <span>설문 참여 후 내 민심을 확인 해보세요</span>
                  <button type="button" className="investpick-popup__cta-button" onClick={onClose}>
                    설문 참여하기
                    <ReactSVG wrapper="span" src={`${ICON_BASE}/icon-detail-arrow.svg`} />
                  </button>
                </div>
              ) : (
                detail.choice && (
                  <p className="investpick-popup__callout">
                    <span className="investpick-popup__callout-icon" aria-hidden="true">
                      <ReactSVG wrapper="span" src={`${ICON_BASE}/icon-speaker-${isMajority ? 'blue' : 'red'}.svg`} />
                    </span>
                    <b>{isMajority ? '당신은 다수파!' : '당신은 소수파!'}</b>
                    <span>
                      {isMajority
                        ? `오늘 투표한 개미 ${pickedPct}%가 같은 픽을 골랐어요`
                        : `오늘 투표한 개미 ${pickedPct}%만 같은 픽을 골랐어요`}
                    </span>
                  </p>
                )
              ))}

            {/* trend */}
            {!isVoteMode && daily.length > 0 && (
              <div className="investpick-popup__trend">
                <div className="investpick-popup__trend-head">
                  <h4>일일 민심 추이</h4>
                  {trendNote && <p>{trendNote}</p>}
                </div>

                {isTrendSlider ? (
                  <div className="investpick-popup__chart-wrap">
                    <button
                      type="button"
                      className="investpick-popup__chart-arrow is-prev"
                      onClick={() => swiperRef.current?.slidePrev()}
                      disabled={!canSlidePrev}
                      aria-label="이전 날짜"
                    >
                      <ReactSVG wrapper="span" src={`${ICON_BASE}/icon-slide-left.svg`} />
                    </button>

                    {/* initialSlide 는 생성 시점에만 적용되므로, 슬라이드 개수가 바뀌면 다시 만들어 최근 날짜로 맞춘다 */}
                    <Swiper
                      key={`${detail.topicSeq}-${trendSlides.length}`}
                      className="investpick-popup__chart-swiper"
                      slidesPerView={TREND_SLIDER_VISIBLE_COUNT}
                      initialSlide={initialSlideIndex}
                      onSwiper={(swiper) => {
                        swiperRef.current = swiper
                        setCanSlidePrev(!swiper.isBeginning)
                        setCanSlideNext(!swiper.isEnd)
                      }}
                      onSlideChange={(swiper) => {
                        setCanSlidePrev(!swiper.isBeginning)
                        setCanSlideNext(!swiper.isEnd)
                      }}
                    >
                      {trendSlides.map((item, index) => (
                        <SwiperSlide key={`${item.dayLabel}-${index}`} className={index === todayIndex ? 'is-today' : ''}>
                          <DailyChartColumn item={item} hasData={item.available} maxPct={maxPct} />
                        </SwiperSlide>
                      ))}
                    </Swiper>

                    <button
                      type="button"
                      className="investpick-popup__chart-arrow is-next"
                      onClick={() => swiperRef.current?.slideNext()}
                      disabled={!canSlideNext}
                      aria-label="다음 날짜"
                    >
                      <ReactSVG wrapper="span" src={`${ICON_BASE}/icon-slide-right.svg`} />
                    </button>
                  </div>
                ) : (
                  <ul className="investpick-popup__chart">
                    {daily.map((item, index) => (
                      <li key={`${item.dayLabel}-${index}`} className={index === todayIndex ? 'is-today' : ''}>
                        <DailyChartColumn item={item} hasData={item.available} maxPct={maxPct} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* caution: 투표 화면에는 결과가 없으므로 노출하지 않는다 */}
            {!isVoteMode && (
              <p className="investpick-popup__caution">
                <ReactSVG wrapper="span" className="investpick-popup__caution-icon" src={`${ICON_BASE}/icon-caution.svg`} />
                <span>{INVEST_PICK_CAUTION}</span>
              </p>
            )}

            {/* links */}
            <div className="investpick-popup__links">
              <a className="investpick-popup__link is-primary" href={getProductUrl(detail.fidA, detail.prodNmA)}>
                {decodeHtmlEntities(detail.prodNmA)} 상세보기
              </a>
              <a className="investpick-popup__link" href={getProductUrl(detail.fidB, detail.prodNmB)}>
                {decodeHtmlEntities(detail.prodNmB)} 상세보기
              </a>
            </div>
          </>
        )}
      </div>
    </CommonModal>
  )
}
