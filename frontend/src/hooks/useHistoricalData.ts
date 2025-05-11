// src/hooks/useHistoricalData.ts
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRecoilState } from 'recoil';
import { historicalDataAtom } from '@/store/atoms'; // Make sure the correct atom is imported
import {
    HISTORICAL_ORDERBOOK_URL,
    HISTORICAL_FUNDING_RATE_URL,
    HISTORICAL_TRADE_VOLUME_URL,
    HISTORICAL_LIQUIDATION_URL,
} from '@/constants';
import {
  HistoricalOrderbookResponse,
  HistoricalFundingRateResponse,
  HistoricalTradeVolumeResponse,
  HistoricalLiquidationResponse
} from '@/types/api';

interface HistoricalDataState {
    loading: boolean;
    error: any;
}

const initialState: HistoricalDataState = {
    loading: true,
    error: null,
};

const useHistoricalData = () => {
    const [state, setState] = useState(initialState);
    const [historicalData, setHistoricalData] = useRecoilState(historicalDataAtom); // Use the correct atom here

    useEffect(() => {
        const fetchHistoricalData = async () => {
            setState(prevState => ({ ...prevState, loading: true, error: null }));
            try {
                const [orderbookRes, fundingRateRes, tradeVolumeRes, liquidationRes] = await Promise.all([
                    axios.get<HistoricalOrderbookResponse>(HISTORICAL_ORDERBOOK_URL),
                    axios.get<HistoricalFundingRateResponse>(HISTORICAL_FUNDING_RATE_URL),
                    axios.get<HistoricalTradeVolumeResponse>(HISTORICAL_TRADE_VOLUME_URL),
                    axios.get<HistoricalLiquidationResponse>(HISTORICAL_LIQUIDATION_URL),
                ]);

                setHistoricalData({
                    orderbook: orderbookRes.data.data,
                    fundingRate: fundingRateRes.data.data,
                    tradeVolume: tradeVolumeRes.data.data,
                    liquidation: liquidationRes.data.data,
                });

                setState({
                    loading: false,
                    error: null,
                });
            } catch (err: any) {
                console.error('과거 데이터 가져오기 오류:', err);
                setState(prevState => ({ ...prevState, loading: false, error: err }));
            }
        };

        fetchHistoricalData();
    }, [setHistoricalData]);

    return {
        historicalData,
        loading: state.loading,
        error: state.error,
    };
};

export default useHistoricalData;
