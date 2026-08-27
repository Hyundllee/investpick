import { useEffect, useRef, useState } from 'react'
import { ReactSVG } from 'react-svg'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperInstance } from 'swiper'

import 'swiper/css'

import CommonModal from '../CommonModal'
import { fetchInvestPickTopicDetail } from './api'
import { INVEST_PICK_CAUTION } from './InvestPickVote'
import type { InvestPickDaily, InvestPickTopicDetail } from './types'

import '../../../styles/common/components/investpick/index.scss'

const ICON_BASE = '/assets/images/kodex/common/investpick'

/** 일별 추이가 이 개수 이상이면 전체 나열 대신 화살표로 넘기는 슬라이드(Swiper) 형태로 전환한다. */
const TREND_SLIDER_THRESHOLD = 7
/** 슬라이드 모드에서 한 화면에 보이는 컬럼 수. */
const TREND_SLIDER_VISIBLE_COUNT = 5

/** 일별 추이 한 칸(막대 또는 데이터 없음 아이콘 + 라벨). 정적 나열/슬라이드 두 모드에서 공통으로 쓴다. */
function DailyChartColumn({ item, isToday, hasData, maxPct }: { item: InvestPickDaily; isToday: boolean; hasData: boolean; maxPct: number }) {
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
      <span className="investpick-popup__chart-label">{isToday ? `${item.dayLabel}(오늘)` : item.dayLabel}</span>
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
}

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
}: InvestPickResultPopupProps) {
  const [detail, setDetail] = useState<InvestPickTopicDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [canSlidePrev, setCanSlidePrev] = useState(false)
  const [canSlideNext, setCanSlideNext] = useState(false)
  const swiperRef = useRef<SwiperInstance | null>(null)

  useEffect(() => {
    if (!open || !topicSeq) return undefined

    const controller = new AbortController()
    setLoading(true)
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
  }, [open, topicSeq])

  const daily = detail?.daily ?? []
  const todayIndex = daily.findIndex((item) => item.today)
  const dataDaily = daily.slice(0, todayIndex + 1)
  const maxPct = dataDaily.reduce((max, item) => Math.max(max, item.pctA, item.pctB), 0) || 100

  const isTrendSlider = daily.length >= TREND_SLIDER_THRESHOLD

  const pickedPct = detail ? (detail.choice === 'B' ? detail.pctB : detail.pctA) : 0
  const isMajority = detail ? pickedPct >= 50 : true

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
        {loading && <p className="investpick-popup__state">불러오는 중입니다.</p>}
        {!loading && error && (
          <p className="investpick-popup__state" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && detail && (
          <>
            {/* head */}
            <div className="investpick-popup__head">
              <span className="investpick-popup__label">{label}</span>
              <h3 className="investpick-popup__title">{headline}</h3>
              <p className="investpick-popup__summary">
                <span className="investpick-popup__summary-item">
                  이번 주 설문 <b>{`${detail.optionA} vs ${detail.optionB}`}</b>
                </span>
                <span className="investpick-popup__summary-bar" aria-hidden="true" />
                <span className="investpick-popup__summary-item is-point">
                  오늘 {formatCount(detail.voteTodayCnt)}명 참여
                </span>
                <span className="investpick-popup__summary-bar" aria-hidden="true" />
                <span className="investpick-popup__summary-item">매일 1회 투표 가능</span>
              </p>
            </div>

            {/* total */}
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

            {/* callout */}
            {detail.choice && (
              <p className="investpick-popup__callout">
                <span className="investpick-popup__callout-icon" aria-hidden="true">
                  📢
                </span>
                <b>{isMajority ? '당신은 다수파!' : '당신은 소수파!'}</b>
                <span>
                  {isMajority
                    ? `오늘 투표한 개미 ${pickedPct}%가 같은 픽을 골랐어요`
                    : `오늘 투표한 개미 ${pickedPct}%만 같은 픽을 골랐어요`}
                </span>
              </p>
            )}

            {/* trend */}
            {daily.length > 0 && (
              <div className="investpick-popup__trend">
                <div className="investpick-popup__trend-head">
                  <h4>이번 주 민심 추이 (일별)</h4>
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

                    <Swiper
                      key={detail.topicSeq}
                      className="investpick-popup__chart-swiper"
                      slidesPerView={TREND_SLIDER_VISIBLE_COUNT}
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
                      {daily.map((item, index) => (
                        <SwiperSlide key={`${item.dayLabel}-${index}`} className={index === todayIndex ? 'is-today' : ''}>
                          <DailyChartColumn item={item} isToday={index === todayIndex} hasData={index <= todayIndex} maxPct={maxPct} />
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
                        <DailyChartColumn item={item} isToday={index === todayIndex} hasData={index <= todayIndex} maxPct={maxPct} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* caution */}
            <p className="investpick-popup__caution">
              <ReactSVG wrapper="span" className="investpick-popup__caution-icon" src={`${ICON_BASE}/icon-caution.svg`} />
              <span>{INVEST_PICK_CAUTION}</span>
            </p>

            {/* links */}
            <div className="investpick-popup__links">
              <a className="investpick-popup__link is-primary" href={getProductUrl(detail.fidA, detail.prodNmA)}>
                {detail.prodNmA} 상세보기
              </a>
              <a className="investpick-popup__link" href={getProductUrl(detail.fidB, detail.prodNmB)}>
                {detail.prodNmB} 상세보기
              </a>
            </div>
          </>
        )}
      </div>
    </CommonModal>
  )
}
