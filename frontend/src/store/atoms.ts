import { atom } from 'recoil';
import {
  HistoricalData,
  RealtimeData,
  TradeVolumeResponse,
  OrderbookResponse,
  FundingRateResponse,
  LiquidationItem
} from '@/types/api';

// 과거 데이터
export const historicalDataAtom = atom<any>({
  key: 'historicalDataAtom',
  default: {
    orderbook: [],
    fundingRate: [],
    tradeVolume: [],
    liquidation: [],
  },
});

// 실시간 데이터
export const realtimeDataAtom = atom<RealtimeData>({
  key: 'realtimeDataAtom',
  default: {
    orderbook: { b: [], a: [] },
    fundingRate: null,
    tradeVolume: { buy_volume: 0, sell_volume: 0, timestamp: '' },
    liquidation: { last_liquidation: null, historicalLiquidation: [] },
  },
});

export const orderbookDataAtom = atom<OrderbookResponse | null>({
  key: 'orderbookDataAtom',
  default: null,
});

export const fundingRateState = atom<FundingRateResponse | null>({
  key: 'fundingRateState',
  default: null,
});

export const tradeVolumeState = atom<TradeVolumeResponse | null>({
  key: 'tradeVolumeState',
  default: null,
});

export const liquidationDataAtom = atom<LiquidationItem | null>({
  key: 'liquidationDataAtom',
  default: null,
});

export const noLiquidationMessageAtom = atom({
  key: 'noLiquidationMessageAtom',
  default: '',
});

// ✅ 심볼 목록 (초기값을 빈 배열로 수정)
export const symbolsAtom = atom<string[]>({
  key: 'symbolsAtom',
  default: [], // 이전: ['BTCUSDT']
});

export const selectedSymbolAtom = atom<string>({
  key: 'selectedSymbolAtom',
  default: 'BTCUSDT',
});

export const visiblePanelsAtom = atom<string[]>({
  key: 'visiblePanelsAtom',
  default: ['symbolSelector', 'liquidation', 'tradeVolume', 'orderBook', 'fundingRate'],
});

export const themeAtom = atom<'light' | 'dark'>({
  key: 'themeAtom',
  default: 'light',
});
