// src/constants/panelConstants.ts

// 그리드 관련 상수
export const GRID_SIZE = 10; // 그리드 크기 (10px)
export const MAGNETIC_THRESHOLD = 20; // 마그네틱 효과 발동 거리 (px)

// 패널 크기 제한 상수
export const MIN_PANEL_WIDTH = 150; // 최소 패널 너비
export const MIN_PANEL_HEIGHT = 100; // 최소 패널 높이
export const MAX_PANEL_WIDTH = 600; // 최대 패널 너비
export const MAX_PANEL_HEIGHT = 400; // 최대 패널 높이
export const DEFAULT_PANEL_WIDTH = 200; // 기본 패널 너비
export const DEFAULT_PANEL_HEIGHT = 100; // 기본 패널 높이

// 패널 컴포넌트 매핑
import React from 'react';
import { Liquidation } from '../components/widgets/Liquidation';
import { TradeVolume } from '../components/widgets/TradeVolume';
import { OrderBook } from '../components/widgets/OrderBook';
import { FundingRate } from '../components/widgets/FundingRate';
import { SymbolSelectorPanel } from '../components/widgets/SymbolSelectorPanel';

export const PANEL_COMPONENTS: { [key: string]: React.ComponentType } = {
    liquidation: Liquidation,
    tradeVolume: TradeVolume,
    orderBook: OrderBook,
    symbolSelector: SymbolSelectorPanel,
    fundingRate: FundingRate,
};

// 패널 색상 설정 함수
export const getPanelColor = (id: string): string => {
    switch (id) {
        case 'fundingRate': return 'bg-fundingRate';
        case 'orderBook': return 'bg-orderBook';
        case 'tradeVolume': return 'bg-tradeVolume';
        case 'liquidation': return 'bg-liquidation';
        case 'symbolSelector': return 'bg-symbolSelector';
        default: return 'bg-gray-800';
    }
};