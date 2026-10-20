import { useEffect, useState } from 'react'
import { ReactSVG } from 'react-svg'

import CommonModal from '../CommonModal'
import { fetchInvestPickTopicDetail } from './api'
import { INVEST_PICK_CAUTION } from './InvestPickVote'
import type { InvestPickTopicDetail } from './types'

import '../../../styles/common/components/investpick/index.scss'

const ICON_BASE = '/assets/images/kodex/common/investpick'

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

  useEffect(() => {
    if (!open || !topicSeq) return undefined

    const controller = new AbortController()

    fetchInvestPickTopicDetail(topicSeq, controller.signal)
      .then((data) => setDetail(data))
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return
        // 실패 시 팝업 자체를 띄우지 않는다.
        setDetail(null)
        console.error('[investpick] 상세 조회 실패', cause)
      })

    return () => controller.abort()
  }, [open, topicSeq])

  const daily = detail?.daily ?? []
  const maxPct = daily.reduce((max, item) => Math.max(max, item.pctA, item.pctB), 0) || 100
  const lastIndex = daily.length - 1

  const pickedPct = detail ? (detail.choice === 'B' ? detail.pctB : detail.pctA) : 0
  const isMajority = detail ? pickedPct >= 50 : true

  // 조회 실패 / 로딩 중에는 모달을 렌더링하지 않는다.
  if (!detail) return null

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
            <ul className="investpick-popup__chart">
              {daily.map((item, index) => {
                const isToday = index === lastIndex
                return (
                  <li key={`${item.dayLabel}-${index}`} className={isToday ? 'is-today' : ''}>
                    <div className="investpick-popup__chart-bars">
                      <span className="investpick-popup__chart-bar is-a" style={{ height: `${(item.pctA / maxPct) * 100}%` }}>
                        {isToday && <em>{item.pctA}%</em>}
                      </span>
                      <span className="investpick-popup__chart-bar is-b" style={{ height: `${(item.pctB / maxPct) * 100}%` }}>
                        {isToday && <em>{item.pctB}%</em>}
                      </span>
                    </div>
                    <span className="investpick-popup__chart-label">
                      {isToday ? `${item.dayLabel}(오늘)` : item.dayLabel}
                    </span>
                  </li>
                )
              })}
            </ul>
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
      </div>
    </CommonModal>
  )
}
