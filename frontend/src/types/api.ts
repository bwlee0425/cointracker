// src/types/api.ts

// 호가 데이터 타입
export interface OrderbookResponse {
    b?: [string, string][]; // 매수 호가
    a?: [string, string][]; // 매도 호가
}

// 펀딩 비율 데이터 타입
export interface FundingRateResponse {
    fundingRate: string; // 펀딩률 (예: "0.000037")
    fundingTime: string; // 타임스탬프 (예: "1697059200000")
}

// 거래량 데이터 타입
export interface TradeVolumeResponse {
    buy_volume: string | number; // 매수량
    sell_volume: string | number; // 매도량
    timestamp: string; // 타임스탬프
}

// 청산 내역 데이터 타입
export interface LiquidationResponse {
    status?: string;
    message?: string;
    last_liquidation?: {
        symbol: string; // "BTCUSDT"
        side: string; // "BUY"/"SELL"
        price: string | number;
        quantity: string | number;
        timestamp: string;
    };
    data?: {
        o: {
            S: string; // BUY/SELL
            p: string | number; // 가격
            q: string | number; // 수량
            T?: number; // 타임스탬프
        };
    };
}

// 청산 항목 타입
export interface LiquidationItem {
    side: string;
    price: number;
    quantity: number;
    timestamp: string;
}

// 과거 데이터 응답 타입 (공통)
export interface HistoricalDataResponse<T> {
    data: T[];
}

export type HistoricalOrderbookResponse = HistoricalDataResponse<OrderbookResponse>;
export type HistoricalFundingRateResponse = HistoricalDataResponse<FundingRateResponse>;
export type HistoricalTradeVolumeResponse = HistoricalDataResponse<TradeVolumeResponse>;
export type HistoricalLiquidationResponse = HistoricalDataResponse<LiquidationItem>;

// 실시간 데이터 타입
export interface RealtimeData {
    orderbook: {
        bids: [number, number][];
        asks: [number, number][];
    } | null;
    fundingRate: {
        fundingRate: number;
        fundingTime: string;
    } | null;
    tradeVolume: {
        buy_volume: number;
        sell_volume: number;
        timestamp: string;
    } | null;
    liquidation: {
        last_liquidation: LiquidationItem | null;
        historicalLiquidation: LiquidationItem[];
    } | null;
}