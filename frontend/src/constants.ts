// src/constants.ts
export const API_BASE_URL = '/api'; // 프록시로 인해 상대 경로 사용

// 실시간 데이터 API 엔드포인트
export const REALTIME_ORDERBOOK_URL = `${API_BASE_URL}/realtime/orderbook/`;
export const REALTIME_FUNDING_RATE_URL = `${API_BASE_URL}/realtime/funding_rate/`;
export const REALTIME_TRADE_VOLUME_URL = `${API_BASE_URL}/realtime/trade_volume/`;
export const REALTIME_LIQUIDATION_URL = `${API_BASE_URL}/realtime/liquidation/`;

// 과거 데이터 API 엔드포인트
export const HISTORICAL_ORDERBOOK_URL = `${API_BASE_URL}/historical/orderbook/`;
export const HISTORICAL_FUNDING_RATE_URL = `${API_BASE_URL}/historical/funding_rate/`;
export const HISTORICAL_TRADE_VOLUME_URL = `${API_BASE_URL}/historical/trade_volume/`;
export const HISTORICAL_LIQUIDATION_URL = `${API_BASE_URL}/historical/liquidation/`;