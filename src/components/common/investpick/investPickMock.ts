/* =========================================================================
 * 오늘의 투자픽 - 개발용 목 데이터
 *
 * 백엔드 API 가 준비되기 전에 퍼블리싱 확인을 하기 위한 파일이다.
 * 운영 빌드(`npm run build`)에서는 __DEV__ 가 false 로 치환되어
 * 이 모듈이 번들에 포함되지 않는다. (동적 import + dead code elimination)
 *
 * API 가 열리면 `?mock=0` 으로 실 API 를 붙여 확인하고,
 * 최종적으로는 이 파일과 api.ts 의 목 분기를 삭제하면 된다.
 * ========================================================================= */

import type {
  InvestPickActiveTopic,
  InvestPickChoice,
  InvestPickTopicDetail,
  InvestPickTopicsParams,
  InvestPickTopicsResponse,
  InvestPickVoteResponse,
} from './types'

/* 진행중인 투자픽 (화면 시안 기준) */
const TOPIC = {
  topicSeq: '1',
  roundNm: '8월2주차',
  title: '2026년 하반기 최종 승자가 될 증시는?',
  optionA: '실적 턴어라운드 코스피',
  optionB: '전고점 돌파 랠리 S&P500',
  prodNmA: 'KODEX 200',
  prodNmB: 'KODEX 미국S&P500',
  fidA: '2ETFW2',
  fidB: '2ETF01',
}

/* 세션 동안 유지되는 투표 상태 */
let choice: InvestPickChoice | null = null
let cntA = 767
let cntB = 255

function rates() {
  const voteTotalCnt = cntA + cntB
  const pctA = Math.round((cntA / voteTotalCnt) * 100)
  return { pctA, pctB: 100 - pctA, voteTotalCnt }
}

function delay<T>(value: T, ms = 180): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms)
  })
}

const LIST = [
  { topicSeq: '1', roundNm: '8월 2주차', title: '국장 vs 미장, 하반기 승자는?', pctA: 58, pctB: 42, voteTotalCnt: 12847, status: 'RUNNING' as const },
  { topicSeq: '2', roundNm: '7월 2주차', title: '반도체 대장주, 삼성전자 vs SK하이닉스?', pctA: 47, pctB: 53, voteTotalCnt: 9214, status: 'ENDED' as const },
  { topicSeq: '3', roundNm: '7월 1주차', title: '금리 인하 수혜, 리츠 vs 성장주?', pctA: 61, pctB: 39, voteTotalCnt: 7912, status: 'ENDED' as const },
  { topicSeq: '4', roundNm: '6월 4주차', title: '다음 주도주, 2차전지 vs 반도체?', pctA: 52, pctB: 48, voteTotalCnt: 7105, status: 'ENDED' as const },
  { topicSeq: '5', roundNm: '6월 3주차', title: '배당주 vs 커버드콜, 월배당 선택은?', pctA: 44, pctB: 56, voteTotalCnt: 6320, status: 'ENDED' as const },
  { topicSeq: '6', roundNm: '6월 2주차', title: '환헤지 vs 환노출, 미국 투자 방식은?', pctA: 39, pctB: 61, voteTotalCnt: 5877, status: 'ENDED' as const },
  { topicSeq: '7', roundNm: '6월 1주차', title: '채권 만기투자 vs 예금, 어디에?', pctA: 66, pctB: 34, voteTotalCnt: 5140, status: 'ENDED' as const },
  { topicSeq: '8', roundNm: '5월 4주차', title: 'AI 밸류체인, CPU vs GPU?', pctA: 35, pctB: 65, voteTotalCnt: 4980, status: 'ENDED' as const },
]

export const investPickMock = {
  activeTopic(): Promise<InvestPickActiveTopic> {
    return delay({
      topicSeq: TOPIC.topicSeq,
      roundNm: TOPIC.roundNm,
      title: TOPIC.title,
      optionA: TOPIC.optionA,
      optionB: TOPIC.optionB,
      cntA,
      cntB,
      ...rates(),
      canVote: choice === null,
      choice,
    })
  },

  topicDetail(topicSeq: string | number): Promise<InvestPickTopicDetail> {
    return delay({
      topicSeq: String(topicSeq),
      roundNm: TOPIC.roundNm,
      title: TOPIC.title,
      optionA: TOPIC.optionA,
      optionB: TOPIC.optionB,
      cntA,
      cntB,
      ...rates(),
      voteTodayCnt: 1248,
      prodNmA: TOPIC.prodNmA,
      prodNmB: TOPIC.prodNmB,
      fidA: TOPIC.fidA,
      fidB: TOPIC.fidB,
      choice: choice ?? 'A',
      daily: [
        { dayLabel: '월', cntA: 620, cntB: 480, pctA: 56, pctB: 44 },
        { dayLabel: '화', cntA: 700, cntB: 420, pctA: 62, pctB: 38 },
        { dayLabel: '수', cntA: 520, cntB: 560, pctA: 48, pctB: 52 },
        { dayLabel: '목', cntA: 640, cntB: 500, pctA: 56, pctB: 44 },
        { dayLabel: '금', cntA: 725, cntB: 523, pctA: 58, pctB: 42 },
      ],
    })
  },

  topics({ pageNo = 1, pageRows = 6 }: InvestPickTopicsParams = {}): Promise<InvestPickTopicsResponse> {
    const start = (pageNo - 1) * pageRows
    return delay({ totalCnt: 24, list: LIST.slice(start, start + pageRows) })
  },

  vote(topicSeq: string | number, picked: InvestPickChoice): Promise<InvestPickVoteResponse> {
    if (choice !== null) {
      return delay({
        success: false,
        message: '이미 투표하셨습니다. 47시간 57분 후 재투표 가능합니다.',
        topicSeq: String(topicSeq),
        cntA,
        cntB,
        ...rates(),
        choice,
      } as InvestPickVoteResponse)
    }

    if (picked !== 'A' && picked !== 'B') {
      return delay({
        success: false,
        message: '선택값이 올바르지 않습니다.',
        topicSeq: String(topicSeq),
        cntA,
        cntB,
        ...rates(),
        choice: 'A',
      } as InvestPickVoteResponse)
    }

    choice = picked
    if (picked === 'A') cntA += 1
    else cntB += 1

    return delay({
      success: true,
      message: null,
      topicSeq: String(topicSeq),
      cntA,
      cntB,
      ...rates(),
      choice: picked,
    })
  },

  /** 데모에서 투표 상태를 되돌릴 때 사용 */
  reset() {
    choice = null
    cntA = 767
    cntB = 255
  },
}
