import { useState } from 'react'
import { ReactSVG } from 'react-svg'

import InvestPickResultPopup from './InvestPickResultPopup'
import { useInvestPick } from './useInvestPick'
import type { InvestPickChoice, InvestPickVariant } from './types'

import '../../../styles/common/components/investpick/index.scss'

const ICON_BASE = '/assets/images/kodex/common/investpick'

export const INVEST_PICK_CAUTION =
  '본 투자픽 결과는 홈페이지 이용자가 설문에 응답한 결과 데이터를 단순히 보여주는 것으로, 삼성자산운용의 제안 또는 투자권유 등에 해당하지 않습니다.'

type InvestPickVoteProps = {
  /**
   * 노출 형태
   * - search: 헤더 검색영역
   * - main  : 메인페이지 하단 1줄형
   * - detail: 상세페이지 카드형
   */
  variant?: InvestPickVariant
  /** 카테고리 라벨 (main 형태에서는 노출하지 않는다) */
  label?: string
  /** 라벨 노출 여부. 미지정 시 variant 기준으로 결정 */
  showLabel?: boolean
  /** 투표 완료 후 유의문구 노출 여부 */
  showCaution?: boolean
  /** '자세히 보기' 노출 여부 */
  showDetail?: boolean
  /** '자세히 보기' 동작 재정의. 미지정 시 결과 팝업을 연다. */
  onDetail?: (topicSeq: string) => void
  /** 공유하기 동작 재정의 */
  onShare?: (topicSeq: string) => void
  className?: string
}

function formatCount(value: number) {
  return value.toLocaleString('ko-KR')
}

export default function InvestPickVote({
  variant = 'main',
  label = '오늘의 투자픽',
  showLabel,
  showCaution = true,
  showDetail = true,
  onDetail,
  onShare,
  className = '',
}: InvestPickVoteProps) {
  const { phase, topic, voting, voteMessage, voted, vote, clearVoteMessage } = useInvestPick()
  const [popupOpen, setPopupOpen] = useState(false)

  const withLabel = showLabel ?? variant !== 'main'

  // 조회 실패 / 로딩 중에는 아무것도 렌더링하지 않는다.
  // (에러 문구나 스켈레톤 없이 영역 자체가 잡히지 않도록 한다)
  if (phase !== 'ready' || !topic) return null

  const options = [
    { key: 'A' as InvestPickChoice, text: topic.optionA, pct: topic.pctA },
    { key: 'B' as InvestPickChoice, text: topic.optionB, pct: topic.pctB },
  ]

  const handleVote = (choice: InvestPickChoice) => {
    if (voting || voted) return
    void vote(choice)
  }

  const handleShare = () => {
    if (onShare) {
      onShare(topic.topicSeq)
      return
    }

    const shareUrl = typeof window === 'undefined' ? '' : window.location.href

    if (typeof navigator !== 'undefined' && navigator.share) {
      void navigator.share({ title: topic.title, url: shareUrl }).catch(() => undefined)
      return
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(shareUrl).catch(() => undefined)
    }
  }

  const handleDetail = () => {
    if (onDetail) {
      onDetail(topic.topicSeq)
      return
    }
    setPopupOpen(true)
  }

  return (
    <>
      <section className={`investpick investpick--${variant} ${voted ? 'is-voted' : ''} ${className}`}>
        <div className="investpick__inner">
          {/* head */}
          <div className="investpick__head">
            {withLabel && <span className="investpick__label">{label}</span>}
            <h3 className="investpick__title">{topic.title}</h3>
          </div>

          {/* options */}
          <div className="investpick__options">
            {options.map(({ key, text, pct }) => {
              const isPicked = topic.choice === key
              const tone = voted ? (isPicked ? (key === 'A' ? 'blue' : 'red') : 'gray') : key === 'A' ? 'blue' : 'red'

              if (!voted) {
                return (
                  <button
                    key={key}
                    type="button"
                    className={`investpick__option investpick__option--${tone}`}
                    onClick={() => handleVote(key)}
                    disabled={voting || !topic.canVote}
                  >
                    <span className="investpick__option-text">{text}</span>
                    <ReactSVG
                      wrapper="span"
                      className="investpick__option-icon"
                      src={`${ICON_BASE}/${isPicked ? 'icon-pick-on' : 'icon-pick-off'}.svg`}
                    />
                  </button>
                )
              }

              return (
                <div
                  key={key}
                  className={`investpick__result investpick__result--${tone} ${isPicked ? 'is-picked' : ''}`}
                  role="img"
                  aria-label={`${text} ${pct}퍼센트${isPicked ? ' (내가 선택한 답변)' : ''}`}
                >
                  <span className="investpick__result-fill" style={{ width: `${pct}%` }} aria-hidden="true" />
                  <span className="investpick__result-line" aria-hidden="true">
                    <span className="investpick__result-text">{text}</span>
                    <span className="investpick__result-pct">{pct}%</span>
                  </span>
                  <span
                    className="investpick__result-line investpick__result-line--over"
                    style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
                    aria-hidden="true"
                  >
                    <span className="investpick__result-text">{text}</span>
                    <span className="investpick__result-pct">{pct}%</span>
                  </span>
                </div>
              )
            })}
          </div>

          {/* meta */}
          <div className="investpick__meta">
            <span className="investpick__count">{formatCount(topic.voteTotalCnt)}명 참여</span>
            <span className="investpick__bar" aria-hidden="true" />
            <button type="button" className="investpick__share" onClick={handleShare}>
              <ReactSVG wrapper="span" className="investpick__share-icon" src={`${ICON_BASE}/icon-share.svg`} />
              공유하기
            </button>
          </div>

          {/* detail */}
          {voted && showDetail && (
            <button type="button" className="investpick__detail" onClick={handleDetail}>
              자세히 보기
              <ReactSVG wrapper="span" className="investpick__detail-icon" src={`${ICON_BASE}/icon-detail-arrow.svg`} />
            </button>
          )}

          {/* caution */}
          {voted && showCaution && (
            <p className="investpick__caution">
              <ReactSVG wrapper="span" className="investpick__caution-icon" src={`${ICON_BASE}/icon-caution.svg`} />
              <span>{INVEST_PICK_CAUTION}</span>
            </p>
          )}

          {/* 투표 실패 메시지 */}
          {voteMessage && (
            <p className="investpick__notice" role="alert" onAnimationEnd={clearVoteMessage}>
              {voteMessage}
            </p>
          )}
        </div>
      </section>

      {!onDetail && (
        <InvestPickResultPopup open={popupOpen} topicSeq={topic.topicSeq} onClose={() => setPopupOpen(false)} />
      )}
    </>
  )
}
