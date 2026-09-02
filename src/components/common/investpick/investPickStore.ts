/* =========================================================================
 * 오늘의 투자픽 - 전역 스토어
 *
 * 헤더 검색영역 / 메인 하단 / 상세페이지 등 한 화면에 투표 영역이 여러 개
 * 존재할 수 있으므로, 진행중인 투자픽 정보는 모듈 단위로 한 번만 조회하고
 * 모든 인스턴스가 같은 상태를 구독한다. (한 곳에서 투표하면 전부 갱신)
 * ========================================================================= */

import { fetchInvestPickActiveTopic, requestInvestPickVote } from './api'
import type { InvestPickActiveTopic, InvestPickChoice } from './types'

/**
 * 새로고침 후 activeTopic 을 다시 조회하면 canVote 는 false 로 잘 내려오는데
 * choice 는 null 로 내려오는 경우가 있어(백엔드가 "이미 투표함"만 기억하고
 * "무엇을 골랐는지"는 세션에 안 실어주는 케이스), 화면에서 내가 고른 답이
 * 사라져 보이는 문제가 있다. 투표 성공 시 topicSeq 별로 choice 를 로컬에
 * 남겨뒀다가, 서버가 choice 를 못 내려줄 때 이걸로 보완한다.
 */
const CHOICE_STORAGE_PREFIX = 'investpick:choice:'

function saveLocalChoice(topicSeq: string, choice: InvestPickChoice) {
  try {
    window.localStorage.setItem(`${CHOICE_STORAGE_PREFIX}${topicSeq}`, choice)
  } catch {
    // 시크릿 모드 등 localStorage 사용 불가 환경 - 무시
  }
}

function readLocalChoice(topicSeq: string): InvestPickChoice | null {
  try {
    const value = window.localStorage.getItem(`${CHOICE_STORAGE_PREFIX}${topicSeq}`)
    return value === 'A' || value === 'B' ? value : null
  } catch {
    return null
  }
}

export type InvestPickPhase = 'idle' | 'loading' | 'ready' | 'error'

export type InvestPickState = {
  phase: InvestPickPhase
  topic: InvestPickActiveTopic | null
  /** 조회 실패 메시지 */
  error: string | null
  /** 투표 요청 진행중 여부 */
  voting: boolean
  /** 투표 실패 시 서버가 내려준 메시지 (ex. 이미 투표하셨습니다.) */
  voteMessage: string | null
}

const initialState: InvestPickState = {
  phase: 'idle',
  topic: null,
  error: null,
  voting: false,
  voteMessage: null,
}

let state: InvestPickState = initialState
const listeners = new Set<() => void>()
let inflight: Promise<void> | null = null

function setState(patch: Partial<InvestPickState>) {
  state = { ...state, ...patch }
  listeners.forEach((listener) => listener())
}

export function subscribeInvestPick(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getInvestPickState(): InvestPickState {
  return state
}

/** 진행중인 투자픽 정보 조회. 이미 조회했거나 조회중이면 재요청하지 않는다. */
export function loadActiveTopic(force = false): Promise<void> {
  if (!force && (state.phase === 'ready' || state.phase === 'loading')) {
    return inflight ?? Promise.resolve()
  }

  setState({ phase: 'loading', error: null })

  inflight = fetchInvestPickActiveTopic()
    .then((topic) => {
      const choice = topic.choice ?? (topic.canVote === false ? readLocalChoice(topic.topicSeq) : null)
      setState({ phase: 'ready', topic: { ...topic, choice }, error: null })
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : '투자픽 정보를 불러오지 못했습니다.'
      setState({ phase: 'error', error: message })
    })
    .finally(() => {
      inflight = null
    })

  return inflight
}

/** 투표 저장. 성공 시 스토어의 집계값을 응답으로 갱신한다. */
export async function submitVote(choice: InvestPickChoice): Promise<boolean> {
  const current = state.topic
  if (!current || state.voting) return false

  setState({ voting: true, voteMessage: null })

  try {
    const result = await requestInvestPickVote(current.topicSeq, choice)

    if (!result.success) {
      setState({ voting: false, voteMessage: result.message ?? '투표에 실패했습니다.' })
      return false
    }

    saveLocalChoice(current.topicSeq, result.choice)

    setState({
      voting: false,
      voteMessage: null,
      topic: {
        ...current,
        cntA: result.cntA,
        cntB: result.cntB,
        pctA: result.pctA,
        pctB: result.pctB,
        voteTotalCnt: result.voteTotalCnt,
        choice: result.choice,
        canVote: false,
      },
    })
    return true
  } catch {
    setState({ voting: false, voteMessage: null })
    return false
  }
}

/** 투표 실패 메시지 닫기 */
export function clearVoteMessage() {
  if (state.voteMessage === null) return
  setState({ voteMessage: null })
}

/** 테스트/스토리북 등에서 상태 초기화가 필요할 때 사용 */
export function resetInvestPickStore() {
  inflight = null
  setState(initialState)
}
