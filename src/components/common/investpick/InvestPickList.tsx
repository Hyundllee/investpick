import { useCallback, useEffect, useRef, useState } from 'react'
import { ReactSVG } from 'react-svg'

import { fetchInvestPickTopics } from './api'
import { INVEST_PICK_CAUTION } from './InvestPickVote'
import type { InvestPickTopicSummary } from './types'

import '../../../styles/common/components/investpick/index.scss'

const ICON_BASE = '/assets/images/kodex/common/investpick'

type InvestPickListProps = {
  /** 제목 */
  title?: string
  /** 페이지 당 행 개수 (목록 API default 6) */
  pageRows?: number
  /** 행 클릭 시 동작 */
  onSelect?: (topic: InvestPickTopicSummary) => void
  className?: string
}

function formatCount(value: number) {
  return value.toLocaleString('ko-KR')
}

export default function InvestPickList({
  title = '지난 설문 모아보기',
  pageRows = 6,
  onSelect,
  className = '',
}: InvestPickListProps) {
  const [rows, setRows] = useState<InvestPickTopicSummary[]>([])
  const [totalCnt, setTotalCnt] = useState(0)
  const [pageNo, setPageNo] = useState(1)
  const [loading, setLoading] = useState(false)
  const loadedRef = useRef(false)

  const load = useCallback(
    async (page: number, append: boolean) => {
      setLoading(true)

      try {
        const data = await fetchInvestPickTopics({ pageNo: page, pageRows })
        setTotalCnt(data.totalCnt)
        setRows((prev) => (append ? [...prev, ...data.list] : data.list))
        setPageNo(page)
      } catch (cause: unknown) {
        // 실패해도 화면에 영역을 만들지 않는다. 원인 파악용으로 콘솔에만 남긴다.
        console.error('[investpick] 목록 조회 실패', cause)
      } finally {
        setLoading(false)
      }
    },
    [pageRows],
  )

  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true
    void load(1, false)
  }, [load])

  const hasMore = rows.length > 0 && rows.length < totalCnt

  // 조회 실패 / 로딩 중 / 결과 없음 -> 영역 자체를 렌더링하지 않는다.
  if (rows.length === 0) return null

  return (
    <section className={`investpick-list ${className}`}>
      {/* head */}
      <div className="investpick-list__head">
        <h3 className="investpick-list__title">{title}</h3>
        <span className="investpick-list__total">총 {formatCount(totalCnt)}개</span>
      </div>

      {/* table head */}
      <div className="investpick-list__thead">
        <span className="investpick-list__col investpick-list__col--round">회차</span>
        <span className="investpick-list__col investpick-list__col--subject">설문 주제</span>
        <span className="investpick-list__col investpick-list__col--chart">답변 분포</span>
        <span className="investpick-list__col investpick-list__col--count">참여자</span>
      </div>

      {/* rows */}
      <ul className="investpick-list__rows">
        {rows.map((row) => {
          const isRunning = row.status === 'RUNNING'
          return (
            <li key={row.topicSeq}>
              <button type="button" className="investpick-list__row" onClick={() => onSelect?.(row)}>
                <span className="investpick-list__col investpick-list__col--round">
                  <em className={`investpick-list__badge ${isRunning ? 'is-running' : ''}`}>
                    {isRunning ? '진행 중' : row.roundNm}
                  </em>
                </span>
                <span className="investpick-list__col investpick-list__col--subject">
                  <strong>{row.title}</strong>
                </span>
                <span className="investpick-list__col investpick-list__col--chart">
                  <em className="investpick-list__pct is-a">{row.pctA}%</em>
                  <span className="investpick-list__bar" aria-hidden="true">
                    <i className="is-a" style={{ width: `${row.pctA}%` }} />
                    <i className="is-b" style={{ width: `${row.pctB}%` }} />
                  </span>
                  <em className="investpick-list__pct is-b">{row.pctB}%</em>
                </span>
                <span className="investpick-list__col investpick-list__col--count">
                  {formatCount(row.voteTotalCnt)}명
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {/* caution */}
      <p className="investpick-list__caution">
        <ReactSVG wrapper="span" className="investpick-list__caution-icon" src={`${ICON_BASE}/icon-caution.svg`} />
        <span>{INVEST_PICK_CAUTION}</span>
      </p>

      {/* more */}
      {hasMore && (
        <div className="investpick-list__more">
          <button type="button" onClick={() => void load(pageNo + 1, true)} disabled={loading}>
            더보기 <i aria-hidden="true">+</i>
          </button>
        </div>
      )}
    </section>
  )
}
