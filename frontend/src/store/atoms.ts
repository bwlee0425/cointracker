// src/store/atoms.ts
import { atom } from 'recoil';
import {
  HistoricalData,
  RealtimeData,
  TradeVolumeResponse,
  OrderbookResponse,
  FundingRateResponse,
  LiquidationItem,
} from '@/types/api';

// 과거 데이터 (변동 없음)
export const historicalDataAtom = atom<any>({
  key: 'historicalDataAtom',
  default: {
    orderbook: [],
    fundingRate: [],
    tradeVolume: [],
    liquidation: [],
  },
});

// ✅ 실시간 데이터 (Record 형태로 변경)
export const realtimeDataAtom = atom<Record<string, RealtimeData>>({
  key: 'realtimeDataAtom',
  default: {},
});

// ✅ 개별 Orderbook 데이터 (Record 형태로 변경)
export const orderbookDataAtom = atom<Record<string, RealtimeData['orderbook'] | null>>({
  key: 'orderbookDataAtom',
  default: {},
});

// ✅ 개별 Funding Rate 데이터 (Record 형태로 변경)
export const fundingRateState = atom<Record<string, RealtimeData['fundingRate'] | null>>({
  key: 'fundingRateState',
  default: {},
});

// ✅ 개별 Trade Volume 데이터 (Record 형태로 변경)
export const tradeVolumeState = atom<Record<string, RealtimeData['tradeVolume'] | null>>({
  key: 'tradeVolumeState',
  default: {},
});

// ✅ 개별 Liquidation 데이터 (Record 형태로 변경)
export const liquidationDataAtom = atom<Record<string, RealtimeData['liquidation'] | null>>({
  key: 'liquidationDataAtom',
  default: {},
});

export const noLiquidationMessageAtom = atom({
  key: 'noLiquidationMessageAtom',
  default: '',
});

// ✅ 심볼 목록 (유지)
export const symbolsAtom = atom<string[]>({
  key: 'symbolsAtom',
  default: [],
});

// ✅ 단일 심볼 → 다중 심볼 배열로 변경
export const selectedSymbolsAtom = atom<string[]>({
  key: 'selectedSymbolsAtom',
  default: ['BTCUSDT'],
});

export const visiblePanelsAtom = atom<string[]>({
  key: 'visiblePanelsAtom',
  default: ['symbolSelector', 'liquidation', 'tradeVolume', 'orderBook', 'fundingRate'],
});

export const themeAtom = atom<'light' | 'dark'>({
  key: 'themeAtom',
  default: 'light',
});