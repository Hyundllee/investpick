import { useState } from 'react'

import {
  InvestPickList,
  InvestPickResultPopup,
  InvestPickVote,
  isInvestPickMockEnabled,
} from '../../../components/common/investpick'

import '../../../styles/pages/kodex/investpick/index.scss'

/**
 * 오늘의 투자픽 데모 페이지
 * 실제 서비스에서는 각 페이지에서 <InvestPickVote variant="..." /> 만 가져다 쓰면 된다.
 * 한 화면에 여러 개를 붙여도 전역 스토어를 공유하므로 한 곳에서 투표하면 전부 갱신된다.
 */
export default function InvestPickDemoPage() {
  const [popupOpen, setPopupOpen] = useState(false)
  const isMock = isInvestPickMockEnabled()

  return (
    <div className="investpick-demo">
      {/* 데이터 소스 안내 (데모 전용) */}
      <div className={`investpick-demo__banner ${isMock ? 'is-mock' : 'is-real'}`}>
        {isMock ? (
          <>
            <b>목 데이터로 표시 중</b>
            <span>백엔드 API 연동 확인은</span>
            <a href="?mock=0">?mock=0 으로 전환</a>
          </>
        ) : (
          <>
            <b>실 API 호출 중</b>
            <span>API 응답이 없으면 화면이 비어 보입니다.</span>
            <a href="?">목 데이터로 전환</a>
          </>
        )}
      </div>

      {/* section1 : 헤더 검색영역 */}
      <section className="investpick-demo__section section1">
        <div className="investpick-demo__caption">
          <h2>1. 헤더 검색영역</h2>
          <p>{'<InvestPickVote variant="search" />'}</p>
        </div>
        <div className="investpick-demo__stage is-search">
          <div className="investpick-demo__search-box">
            <InvestPickVote variant="search" />
          </div>
        </div>
      </section>

      {/* section2 : 메인페이지 하단 */}
      <section className="investpick-demo__section section2">
        <div className="investpick-demo__caption">
          <h2>2. 메인페이지 하단</h2>
          <p>{'<InvestPickVote variant="main" />'}</p>
        </div>
        <div className="investpick-demo__stage is-main">
          <InvestPickVote variant="main" />
        </div>
      </section>

      {/* section3 : 상세페이지 */}
      <section className="investpick-demo__section section3">
        <div className="investpick-demo__caption">
          <h2>3. 상세페이지</h2>
          <p>{'<InvestPickVote variant="detail" />'}</p>
        </div>
        <div className="investpick-demo__stage is-detail">
          <InvestPickVote variant="detail" />
        </div>
      </section>

      {/* section4 : 결과 팝업 */}
      <section className="investpick-demo__section section4">
        <div className="investpick-demo__caption">
          <h2>4. 투표 결과 팝업</h2>
          <p>{'<InvestPickResultPopup topicSeq="1" />'}</p>
        </div>
        <div className="investpick-demo__stage is-popup">
          <button type="button" className="investpick-demo__button" onClick={() => setPopupOpen(true)}>
            결과 팝업 열기
          </button>
          <InvestPickResultPopup
            open={popupOpen}
            topicSeq="1"
            trendNote="수요일 CPI 발표 후 미장 지지 반등"
            onClose={() => setPopupOpen(false)}
          />
        </div>
      </section>

      {/* section5 : 지난 설문 모아보기 */}
      <section className="investpick-demo__section section5">
        <div className="investpick-demo__caption">
          <h2>5. 지난 설문 모아보기</h2>
          <p>{'<InvestPickList />'}</p>
        </div>
        <div className="investpick-demo__stage is-list">
          <InvestPickList />
        </div>
      </section>
    </div>
  )
}
