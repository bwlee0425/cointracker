import { selector } from 'recoil';
import { orderbookDataAtom, fundingRateState, tradeVolumeState, liquidationDataAtom } from './atoms';

export const orderbookBidsSelector = selector({
    key: 'orderbookBidsSelector',
    get: ({ get }) => get(orderbookDataAtom)?.b || [],
});

export const orderbookAsksSelector = selector({
    key: 'orderbookAsksSelector',
    get: ({ get }) => get(orderbookDataAtom)?.a || [],
});

export const fundingRateSelector = selector({
    key: 'fundingRateSelector',
    get: ({ get }) => get(fundingRateState)?.fundingRate,
});

export const fundingTimeSelector = selector({
    key: 'fundingTimeSelector',
    get: ({ get }) => get(fundingRateState)?.fundingTime,
});

export const tradeBuyVolumeSelector = selector({
    key: 'tradeBuyVolumeSelector',
    get: ({ get }) => get(tradeVolumeState)?.buy_volume,
});

export const tradeSellVolumeSelector = selector({
    key: 'tradeSellVolumeSelector',
    get: ({ get }) => get(tradeVolumeState)?.sell_volume,
});

export const lastLiquidationSelector = selector({
    key: 'lastLiquidationSelector',
    get: ({ get }) => get(liquidationDataAtom)?.last_liquidation,
});