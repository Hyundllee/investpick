/* =========================================================================
 * 오늘의 투자픽 - API 호출 레이어
 * 모든 엔드포인트는 명세서(v1.6) 기준이며 전부 GET 이다.
 *
 * [목 모드]
 * 백엔드 API 가 준비되기 전 퍼블리싱 확인을 위해 개발 모드에서는 목 데이터를
 * 사용한다. 운영 빌드(__DEV__ === false)에서는 목 분기 자체가 제거된다.
 *   - npm run dev                     → 목 데이터 (화면 확인용)
 *   - http://localhost:3000/?mock=0   → 실 API 호출 (devServer proxy 경유)
 *   - npm run build                   → 항상 실 API
 * ========================================================================= */

import type {
  InvestPickActiveTopic,
  InvestPickChoice,
  InvestPickTopicDetail,
  InvestPickTopicsParams,
  InvestPickTopicsResponse,
  InvestPickVoteResponse,
} from './types'

/**
 * API 기본 경로.
 * 운영 배포 시에는 동일 도메인이므로 빈 문자열이면 된다.
 * 로컬 개발은 webpack devServer proxy(/api → API_PROXY_TARGET)가 처리한다.
 */
export const INVEST_PICK_API_BASE = ''

const ENDPOINT = {
  /** 투자픽 목록 조회 */
  topics: () => `${INVEST_PICK_API_BASE}/api/v1/kodex/insight/topics`,
  /** 투자픽 상세 조회 */
  topic: (topicSeq: string | number) =>
    `${INVEST_PICK_API_BASE}/api/v1/kodex/insight/topic/${encodeURIComponent(String(topicSeq))}.do`,
  /** 진행중인 투자픽 정보 */
  activeTopic: () => `${INVEST_PICK_API_BASE}/api/v1/kodex/insight/activeTopic`,
  /** 투자픽 투표 저장 */
  vote: (topicSeq: string | number) =>
    `${INVEST_PICK_API_BASE}/api/v1/kodex/insight/topic/${encodeURIComponent(String(topicSeq))}/vote.do`,
} as const

export class InvestPickApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'InvestPickApiError'
    this.status = status
  }
}

/* ------------------------------------------------------------------ 목 모드 */

/** 현재 목 데이터로 동작 중인지 여부 (개발 모드 + `?mock=0` 이 아닐 때) */
export function isInvestPickMockEnabled(): boolean {
  if (!__DEV__) return false
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('mock') !== '0'
}

async function mockApi() {
  const module = await import('./investPickMock')
  return module.investPickMock
}

/* ------------------------------------------------------------------ 공통 */

function withQuery(url: string, query: Record<string, string | number | undefined>) {
  const search = new URLSearchParams()

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    search.set(key, String(value))
  })

  const queryString = search.toString()
  return queryString ? `${url}?${queryString}` : url
}

async function requestJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
    signal,
  })

  if (!response.ok) {
    throw new InvestPickApiError(`요청에 실패했습니다. (${response.status})`, response.status)
  }

  return (await response.json()) as T
}

/* ------------------------------------------------------------------ 엔드포인트 */

/** 투자픽 목록 조회 */
export async function fetchInvestPickTopics(
  params: InvestPickTopicsParams = {},
  signal?: AbortSignal,
): Promise<InvestPickTopicsResponse> {
  if (isInvestPickMockEnabled()) return (await mockApi()).topics(params)

  const { pageNo = 1, pageRows = 6 } = params
  return requestJson<InvestPickTopicsResponse>(withQuery(ENDPOINT.topics(), { pageNo, pageRows }), signal)
}

/** 투자픽 상세 조회 */
export async function fetchInvestPickTopicDetail(
  topicSeq: string | number,
  signal?: AbortSignal,
): Promise<InvestPickTopicDetail> {
  if (isInvestPickMockEnabled()) return (await mockApi()).topicDetail(topicSeq)

  return requestJson<InvestPickTopicDetail>(ENDPOINT.topic(topicSeq), signal)
}

/** 진행중인 투자픽 정보 조회 */
export async function fetchInvestPickActiveTopic(signal?: AbortSignal): Promise<InvestPickActiveTopic> {
  if (isInvestPickMockEnabled()) return (await mockApi()).activeTopic()

  return requestJson<InvestPickActiveTopic>(ENDPOINT.activeTopic(), signal)
}

/** 투자픽 투표 저장 */
export async function requestInvestPickVote(
  topicSeq: string | number,
  choice: InvestPickChoice,
  signal?: AbortSignal,
): Promise<InvestPickVoteResponse> {
  if (isInvestPickMockEnabled()) return (await mockApi()).vote(topicSeq, choice)

  return requestJson<InvestPickVoteResponse>(withQuery(ENDPOINT.vote(topicSeq), { choice }), signal)
}

export { ENDPOINT as INVEST_PICK_ENDPOINT }
