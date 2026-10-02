/* =========================================================================
 * 오늘의 투자픽 - 공통 훅
 * 전역 스토어를 구독하고, 마운트 시 진행중인 투자픽 정보를 1회 조회한다.
 * ========================================================================= */

import { useCallback, useEffect, useSyncExternalStore } from 'react'

import {
  clearVoteMessage,
  getInvestPickState,
  loadActiveTopic,
  submitVote,
  subscribeInvestPick,
} from './investPickStore'
import type { InvestPickChoice, InvestPickGubun } from './types'

export function useInvestPick() {
  const state = useSyncExternalStore(subscribeInvestPick, getInvestPickState, getInvestPickState)

  useEffect(() => {
    void loadActiveTopic()
  }, [])

  const vote = useCallback((choice: InvestPickChoice, gubun?: InvestPickGubun) => submitVote(choice, gubun), [])
  const reload = useCallback(() => loadActiveTopic(true), [])

  const { topic } = state

  /** 투표 완료 여부: 선택값이 있거나 서버가 투표 불가로 내려준 경우 */
  const voted = Boolean(topic?.choice) || topic?.canVote === false

  return {
    ...state,
    voted,
    vote,
    reload,
    clearVoteMessage,
  }
}
