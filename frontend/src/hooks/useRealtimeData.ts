// src/hooks/useRealtimeData.ts
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRecoilState, useSetRecoilState, useRecoilValue } from 'recoil';
import {
    realtimeDataAtom,
    tradeVolumeState,
    orderbookDataAtom,
    fundingRateState,
    liquidationDataAtom,
} from '@/store/atoms';
import {
    REALTIME_ORDERBOOK_URL,
    REALTIME_FUNDING_RATE_URL,
    REALTIME_TRADE_VOLUME_URL,
    REALTIME_LIQUIDATION_URL,
} from '@/constants';
import {
    OrderbookResponse,
    FundingRateResponse,
    TradeVolumeResponse,
    LiquidationResponse,
} from '@/types/api';

interface RealtimeDataState {
    loading: boolean;
    error: string | null;
    noLiquidationMessage: string;
}

const initialState: RealtimeDataState = {
    loading: true,
    error: null,
    noLiquidationMessage: '',
};

const useRealtimeData = (symbol: string = 'BTCUSDT') => {
    const [state, setState] = useState(initialState);
    const setRealtimeData = useSetRecoilState(realtimeDataAtom);
    const setTradeVolume = useSetRecoilState(tradeVolumeState);
    const setOrderbook = useSetRecoilState(orderbookDataAtom);
    const setFundingRate = useSetRecoilState(fundingRateState);
    const setLiquidation = useSetRecoilState(liquidationDataAtom);

    useEffect(() => {
        const fetchRealtimeData = async () => {
            setState(prev => ({ ...prev, loading: true, error: null }));
            try {
                const [orderbookRes, fundingRateRes, tradeVolumeRes, liquidationRes] = await Promise.all([
                    axios.get<OrderbookResponse>(`${REALTIME_ORDERBOOK_URL}?symbol=${symbol}`, { timeout: 5000 }),
                    axios.get<FundingRateResponse>(`${REALTIME_FUNDING_RATE_URL}?symbol=${symbol}`, { timeout: 5000 }),
                    axios.get<TradeVolumeResponse>(`${REALTIME_TRADE_VOLUME_URL}?symbol=${symbol}`, { timeout: 5000 }),
                    axios.get<LiquidationResponse>(`${REALTIME_LIQUIDATION_URL}?symbol=${symbol}`, { timeout: 5000 }),
                ]);

                // 디버깅 로그
                // console.log('Orderbook Response:', JSON.stringify(orderbookRes.data, null, 2));
                // console.log('FundingRate Response:', JSON.stringify(fundingRateRes.data, null, 2));
                // console.log('TradeVolume Response:', JSON.stringify(tradeVolumeRes.data, null, 2));
                // console.log('Liquidation Response:', JSON.stringify(liquidationRes.data, null, 2));

                const liquidationData = liquidationRes.data.last_liquidation
                    ? {
                          side: liquidationRes.data.last_liquidation.side || 'N/A',
                          price: parseFloat(liquidationRes.data.last_liquidation.price || '0'),
                          quantity: parseFloat(liquidationRes.data.last_liquidation.quantity || '0'),
                          timestamp: liquidationRes.data.last_liquidation.timestamp || 'N/A',
                      }
                    : null;

                const newRealtimeData = {
                    orderbook: {
                        b: (orderbookRes.data.b || []).map(([price, quantity]) => [
                            parseFloat(price || '0'),
                            parseFloat(quantity || '0'),
                        ]),
                        a: (orderbookRes.data.a || []).map(([price, quantity]) => [
                            parseFloat(price || '0'),
                            parseFloat(quantity || '0'),
                        ]),
                    },
                    fundingRate: fundingRateRes.data
                        ? {
                              fundingRate: parseFloat(fundingRateRes.data.fundingRate || '0'),
                              fundingTime: fundingRateRes.data.fundingTime || 'N/A',
                          }
                        : null,
                    tradeVolume: tradeVolumeRes.data
                        ? {
                              buy_volume: parseFloat(tradeVolumeRes.data.buy_volume || '0'),
                              sell_volume: parseFloat(tradeVolumeRes.data.sell_volume || '0'),
                              timestamp: tradeVolumeRes.data.timestamp || '',
                          }
                        : null,
                    liquidation: liquidationData
                        ? { last_liquidation: liquidationData, historicalLiquidation: [] }
                        : { last_liquidation: null, historicalLiquidation: [] },
                };

                //console.log('New Realtime Data:', JSON.stringify(newRealtimeData, null, 2));

                setRealtimeData(newRealtimeData);
                setTradeVolume(newRealtimeData.tradeVolume);
                setOrderbook(newRealtimeData.orderbook);
                setFundingRate(newRealtimeData.fundingRate);
                setLiquidation(newRealtimeData.liquidation);

                setState({
                    loading: false,
                    error: null,
                    noLiquidationMessage: liquidationData ? '' : '실시간 청산 데이터가 없습니다.',
                });
            } catch (err: any) {
                console.error('실시간 데이터 가져오기 오류:', {
                    message: err.message,
                    code: err.code,
                    response: err.response?.data,
                    url: err.config?.url,
                });
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: `데이터 가져오기 실패: ${err.message}`,
                }));
            }
        };

        fetchRealtimeData();
        const interval = setInterval(fetchRealtimeData, 5000);
        return () => clearInterval(interval);
    }, [symbol, setRealtimeData, setTradeVolume, setOrderbook, setFundingRate, setLiquidation]);

    return {
        realtimeData: useRecoilValue(realtimeDataAtom),
        loading: state.loading,
        error: state.error,
        noLiquidationMessage: state.noLiquidationMessage,
    };
};

export default useRealtimeData;