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

import axios from 'axios'

import type {
  InvestPickActiveTopic,
  InvestPickChoice,
  InvestPickGubun,
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
  topics: '/api/v1/kodex/insight/topics',
  /** 투자픽 상세 조회 */
  topic: (topicSeq: string | number) => `/api/v1/kodex/insight/topic/${encodeURIComponent(String(topicSeq))}.do`,
  /** 진행중인 투자픽 정보 */
  activeTopic: '/api/v1/kodex/insight/activeTopic',
  /** 투자픽 투표 저장 */
  vote: (topicSeq: string | number) => `/api/v1/kodex/insight/topic/${encodeURIComponent(String(topicSeq))}/vote.do`,
} as const

export class InvestPickApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'InvestPickApiError'
    this.status = status
  }
}

/** 공용 axios 인스턴스. baseURL/인증/헤더를 한 곳에서 관리한다. */
const client = axios.create({
  baseURL: INVEST_PICK_API_BASE,
  withCredentials: true,
  headers: { Accept: 'application/json' },
})

/** 모든 요청 실패를 InvestPickApiError 하나로 통일한다. (각 함수에서 개별 try/catch 불필요) */
client.interceptors.response.use(undefined, (error: unknown) => {
  const status = axios.isAxiosError(error) ? (error.response?.status ?? 0) : 0
  return Promise.reject(new InvestPickApiError(`요청에 실패했습니다. (${status})`, status))
})

/* ------------------------------------------------------------------ 목 모드 */

/**
 * 현재 목 데이터로 동작 중인지 여부.
 *
 * `__DEV__`는 webpack DefinePlugin(webpack.config.cjs)이 주입하는 값이다.
 * - `__DEV__`가 주입되는 빌드: 개발 모드(true)에서 기본 ON, `?mock=0`으로 끌 수 있다.
 *   운영 빌드(false)에서는 아래 로직이 상수 false로 치환되어 목 코드가 번들에서 제거된다.
 * - `__DEV__` 자체가 없는 빌드(DefinePlugin 없이 다른 프로젝트에 컴포넌트만 옮긴 경우):
 *   기본은 실 API 시도(OFF)이고, `?mock=1`을 붙였을 때만 화면 확인용으로 강제 ON 한다.
 *   (운영 배포본에서 `?mock=1`로 가짜 데이터를 띄우는 사고를 막기 위해, 이 강제 옵션은
 *   `__DEV__`가 명시적으로 false인 정상 운영 빌드에서는 동작하지 않는다.)
 */
export function isInvestPickMockEnabled(): boolean {
  if (typeof window === 'undefined') return false

  const mock = new URLSearchParams(window.location.search).get('mock')

  if (typeof __DEV__ === 'undefined') return mock === '1'

  if (!__DEV__) return false
  return mock !== '0'
}

async function mockApi() {
  const module = await import('./investPickMock')
  return module.investPickMock
}

/* ------------------------------------------------------------------ 엔드포인트 */

/** 투자픽 목록 조회 */
export async function fetchInvestPickTopics(
  params: InvestPickTopicsParams = {},
  signal?: AbortSignal,
): Promise<InvestPickTopicsResponse> {
  if (isInvestPickMockEnabled()) return (await mockApi()).topics(params)

  const { pageNo = 1, pageRows = 6 } = params
  const { data } = await client.get<InvestPickTopicsResponse>(ENDPOINT.topics, {
    params: { pageNo, pageRows },
    signal,
  })
  return data
}

/** 투자픽 상세 조회 */
export async function fetchInvestPickTopicDetail(
  topicSeq: string | number,
  signal?: AbortSignal,
): Promise<InvestPickTopicDetail> {
  if (isInvestPickMockEnabled()) return (await mockApi()).topicDetail(topicSeq)

  const { data } = await client.get<InvestPickTopicDetail>(ENDPOINT.topic(topicSeq), { signal })
  return data
}

/** 진행중인 투자픽 정보 조회 */
export async function fetchInvestPickActiveTopic(signal?: AbortSignal): Promise<InvestPickActiveTopic> {
  if (isInvestPickMockEnabled()) return (await mockApi()).activeTopic()

  const { data } = await client.get<InvestPickActiveTopic>(ENDPOINT.activeTopic, { signal })
  return data
}

/** 투자픽 투표 저장. gubun: 투표 위치 (default M) */
export async function requestInvestPickVote(
  topicSeq: string | number,
  choice: InvestPickChoice,
  gubun: InvestPickGubun = 'M',
  signal?: AbortSignal,
): Promise<InvestPickVoteResponse> {
  if (isInvestPickMockEnabled()) return (await mockApi()).vote(topicSeq, choice)

  const { data } = await client.get<InvestPickVoteResponse>(ENDPOINT.vote(topicSeq), {
    params: { choice, gubun },
    signal,
  })
  return data
}

export { ENDPOINT as INVEST_PICK_ENDPOINT }
