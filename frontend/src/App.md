/**
 * BTCUSDT 시장 현황 대시보드
 * -----------------------------
 * 실시간 및 과거 BTCUSDT 시장 데이터를 시각화하고 분석하는 웹 애플리케이션입니다.
 *
 * 주요 기능:
 * -   실시간 데이터:
 * -   호가 (Order Book) Top 5
 * -   펀딩 비율 (Funding Rate)
 * -   거래량 (Trade Volume)
 * -   최근 청산 내역 (Recent Liquidation)
 * -   과거 데이터:
 * -   호가, 펀딩 비율, 거래량, 청산 내역 추이
 * -   데이터 시각화 (향후):
 * -   차트 및 그래프를 통한 데이터 시각화 (예정)
 *
 * 기술 스택:
 * -   React: 사용자 인터페이스 구축
 * -   TypeScript: 정적 타입 검사 및 코드 안정성 향상
 * -   Axios: API 통신
 * -   Tailwind CSS: 스타일링
 * -   Lucide React: 아이콘
 * -   Custom Hooks: 데이터 패칭 로직 분리 및 재사용성 향상
 *
 * 파일 구조:
 * -   src/
 * -   components/
 * -   data-card/DataCard.tsx: 데이터 카드 컴포넌트 (재사용 가능한 카드 UI)
 * -   order-book/OrderBook.tsx: 호가 컴포넌트
 * -   funding-rate/FundingRate.tsx: 펀딩 비율 컴포넌트
 * -   trade-volume/TradeVolume.tsx: 거래량 컴포넌트
 * -   liquidation/Liquidation.tsx: 청산 내역 컴포넌트
 * -   hooks/
 * -   useRealtimeData.ts: 실시간 데이터 패칭 커스텀 훅
 * -   useHistoricalData.ts: 과거 데이터 패칭 커스텀 훅
 * -   constants.ts: API 엔드포인트 및 기타 상수 정의
 * -   types/
 * -   api.ts: API 응답 데이터 타입 정의
 * -   App.tsx: 메인 애플리케이션 컴포넌트
 * -   index.tsx: 애플리케이션 진입점
 *
 * 개선 사항:
 * -   API 엔드포인트 관리: constants.ts 파일을 사용하여 API 엔드포인트를 중앙 관리
 * -   데이터 패칭 로직 분리: useRealtimeData, useHistoricalData 커스텀 훅을 사용하여 데이터 패칭 로직 분리
 * -   에러 처리 개선: 에러 발생 시 더 자세한 정보 표시
 * -   데이터 로깅 제거: 프로덕션 환경에서의 불필요한 로깅 제거 (필요시 별도 로깅 시스템 도입)
 * -   타입 정의: API 응답 데이터에 대한 타입 정의
 * -   과거 청산 데이터 표시 방식 개선: 과거 청산 데이터 표시 방식 개선 (향후 확장 고려)
 * -   반응형 디자인: 다양한 화면 크기 지원
 * -   접근성: 스크린 리더 및 키보드 탐색 지원 (향후 적용)
 * -   데이터 시각화: 차트 및 그래프를 통한 데이터 시각화 (향후 구현)
 */
