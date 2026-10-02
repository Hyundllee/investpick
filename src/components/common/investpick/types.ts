/* =========================================================================
 * 오늘의 투자픽 - API 타입 정의
 * 출처: 삼성자산운용_API_명세서(펀드)_v1.6_투자픽.xlsx
 *  - 투자픽 목록 API      GET /api/v1/kodex/insight/topics
 *  - 투자픽 상세 API      GET /api/v1/kodex/insight/topic/{topicSeq}.do
 *  - 진행중인 투자픽정보  GET /api/v1/kodex/insight/activeTopic
 *  - 투자픽 투표          GET /api/v1/kodex/insight/topic/{topicSeq}/vote.do?choice=A&gubun=M
 * ========================================================================= */

/** 답변 선택값. A or B 이외의 값은 서버에서 에러처리된다. */
export type InvestPickChoice = 'A' | 'B'

/** 진행상태. running: 진행중, ended: 종료, waiting: 대기중 (응답은 대문자로 내려온다) */
export type InvestPickStatus = 'RUNNING' | 'ENDED' | 'WAITING'

/** 투표 영역 노출 형태 */
export type InvestPickVariant = 'search' | 'main' | 'detail'

/** 투표 위치 구분값 (vote.do 의 gubun). M: 메인, S: 검색, P: 상품상세, R: 리스트 페이지 */
export type InvestPickGubun = 'M' | 'S' | 'P' | 'R'

/* ---------------------------------------------------------------- 투자픽 목록 */

/** GET /api/v1/kodex/insight/topics 요청 파라미터 */
export type InvestPickTopicsParams = {
  /** 페이지 번호 (선택, default 1) */
  pageNo?: number
  /** 페이지 당 행개수 (선택, default 6) */
  pageRows?: number
}

/** 목록 API 의 list[] 항목 */
export type InvestPickTopicSummary = {
  /** 투자픽 일련번호 */
  topicSeq: string
  /** 주차정보 (ex. 8월2주차) */
  roundNm: string
  /** 타이틀 */
  title: string
  /** 답변A 분포(%) */
  pctA: number
  /** 답변B 분포(%) */
  pctB: number
  /** 전체 투표수 */
  voteTotalCnt: number
  /** 진행상태 */
  status: InvestPickStatus
}

/** 목록 API 응답 */
export type InvestPickTopicsResponse = {
  /** 리스트 전체 개수 */
  totcnt: number
  list: InvestPickTopicSummary[]
}

/* ---------------------------------------------------------------- 투자픽 상세 */

/** 상세 API 의 daily[] 항목 (일자별 투표율) */
export type InvestPickDaily = {
  /** 요일라벨 (ex. 월) */
  dayLabel: string
  /** 답변A 투표수 */
  cntA: number
  /** 답변B 투표수 */
  cntB: number
  /** 답변A 퍼센트 */
  pctA: number
  /** 답변B 퍼센트 */
  pctB: number
  /** 오늘 여부 */
  today: boolean
  /** 차트 노출 여부. true: 차트 노출, false: 데이터 없음(? 아이콘) */
  available: boolean
  /** 투표 날짜 (ex. 20260826) */
  voteYmd: string
}

/** GET /api/v1/kodex/insight/topic/{topicSeq}.do 응답 */
export type InvestPickTopicDetail = {
  topicSeq: string
  /** 주차정보 */
  roundNm: string
  /** 타이틀 */
  title: string
  /** 답변A */
  optionA: string
  /** 답변B */
  optionB: string
  /** 답변A 투표수 */
  cntA: number
  /** 답변B 투표수 */
  cntB: number
  /** 답변A 퍼센트 */
  pctA: number
  /** 답변B 퍼센트 */
  pctB: number
  /** 총 참여수 */
  voteTotalCnt: number
  /** 오늘의 참여수 */
  voteTodayCnt: number
  /** 답변A 상품명 */
  prodNmA: string
  /** 답변B 상품명 */
  prodNmB: string
  /** 답변A 상품코드 */
  fidA: string
  /** 답변B 상품코드 */
  fidB: string
  /** 접속한 사람이 선택한 답변 (미투표 시 null) */
  choice: InvestPickChoice | null
  /** 투표가능여부. true: 가능, false: 불가능 */
  canVote: boolean
  /** 진행상태 */
  status: InvestPickStatus
  /** 일자별 투표율 */
  daily: InvestPickDaily[]
}

/* ------------------------------------------------------ 진행중인 투자픽정보 */

/** GET /api/v1/kodex/insight/activeTopic 응답 */
export type InvestPickActiveTopic = {
  topicSeq: string
  /** 주차정보 */
  roundNm: string
  /** 타이틀 */
  title: string
  /** 답변A */
  optionA: string
  /** 답변B */
  optionB: string
  /** 답변A 투표수 */
  cntA: number
  /** 답변B 투표수 */
  cntB: number
  /** 답변A 퍼센트 */
  pctA: number
  /** 답변B 퍼센트 */
  pctB: number
  /** 총 참여수 */
  voteTotalCnt: number
  /** 투표가능여부. true: 가능, false: 불가능 */
  canVote: boolean
  /** 접속한 사람이 선택한 답변 (미투표 시 null) */
  choice: InvestPickChoice | null
}

/* ---------------------------------------------------------------- 투자픽 투표 */

/** GET /api/v1/kodex/insight/topic/{topicSeq}/vote.do 응답 */
export type InvestPickVoteResponse = {
  /** 성공여부. true: 성공, fail: 실패 */
  success: boolean
  /** 에러메시지. fail 일 경우에만 내려온다. */
  message: string | null
  topicSeq: string
  cntA: number
  cntB: number
  pctA: number
  pctB: number
  voteTotalCnt: number
  choice: InvestPickChoice
}
