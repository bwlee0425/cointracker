// src/hooks/useRealtimeData.ts
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { realtimeDataAtom } from '../store/atoms';
import { useWebSocket } from './useWebSocket';

interface RealtimeData {
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
    last_liquidation: any;
    historicalLiquidation: any[];
  } | null;
}

export default function useRealtimeData(selectedSymbols: string[]) {
  const [realtimeData, setRealtimeData] = useRecoilState(realtimeDataAtom);
  const [error, setError] = useState<string | null>(null);

  const subscribeTopics = selectedSymbols.map((symbol) => `realtime_${symbol.toLowerCase()}`);
  const { isConnected, messages } = useWebSocket('ws://localhost:8000/ws/realtime/', {
    reconnectInterval: 3000,
    pingInterval: 10000,
    subscribeTopics,
  });

  // WebSocket 메시지 처리
  useEffect(() => {
    if (!isConnected) return;

    messages.forEach((message) => {
      const symbol = message.s;
      if (!selectedSymbols.includes(symbol)) return;

      setRealtimeData((prev: Record<string, RealtimeData>) => {
        const updatedData = { ...prev[symbol] } || {
          orderbook: null,
          fundingRate: null,
          tradeVolume: null,
          liquidation: null,
        };

        if (message.e === 'depthUpdate' && message.orderbook) {
          updatedData.orderbook = {
            bids: message.orderbook.b?.map(([price, qty]: [string, string]) => [parseFloat(price), parseFloat(qty)]) || [],
            asks: message.orderbook.a?.map(([price, qty]: [string, string]) => [parseFloat(price), parseFloat(qty)]) || [],
          };
        }

        if (message.e === 'trade' && message.tradeVolume) {
          const currentTradeVolume = updatedData.tradeVolume || {
            buy_volume: 0,
            sell_volume: 0,
            timestamp: message.tradeVolume.timestamp,
          };
          updatedData.tradeVolume = {
            buy_volume: currentTradeVolume.buy_volume + parseFloat(message.tradeVolume.buy_volume || 0),
            sell_volume: currentTradeVolume.sell_volume + parseFloat(message.tradeVolume.sell_volume || 0),
            timestamp: message.tradeVolume.timestamp,
          };
          console.log(`Updated tradeVolume for ${symbol}:`, updatedData.tradeVolume); // 디버깅 로그
        }

        if (message.e === 'forceOrder' && message.liquidation) {
          updatedData.liquidation = {
            last_liquidation: message.liquidation.last_liquidation,
            historicalLiquidation: message.liquidation.historicalLiquidation || [],
          };
        }

        return {
          ...prev,
          [symbol]: updatedData,
        };
      });
    });
  }, [messages, isConnected, selectedSymbols, setRealtimeData]);

  // 추가 데이터 (WebSocket에서 제공되지 않는 데이터만 API로 가져오기)
  useEffect(() => {
    const fetchAdditionalData = async () => {
      try {
        for (const symbol of selectedSymbols) {
          const [fundingRes, liquidationRes, tradeVolumeRes] = await Promise.all([
            fetch(`http://localhost:8000/api/realtime/funding_rate/?symbol=${symbol}`),
            fetch(`http://localhost:8000/api/realtime/liquidation/?symbol=${symbol}`),
            fetch(`http://localhost:8000/api/realtime/trade_volume/?symbol=${symbol}`),
          ]);

          const fundingData = await fundingRes.json();
          const liquidationData = await liquidationRes.json();
          const tradeVolumeData = await tradeVolumeRes.json();

          setRealtimeData((prev: Record<string, RealtimeData>) => ({
            ...prev,
            [symbol]: {
              ...prev[symbol],
              fundingRate: fundingData?.fundingRate
                ? {
                    fundingRate: parseFloat(fundingData.fundingRate),
                    fundingTime: fundingData.fundingTime,
                  }
                : prev[symbol]?.fundingRate || null,
              liquidation: liquidationData?.last_liquidation
                ? {
                    last_liquidation: liquidationData.last_liquidation,
                    historicalLiquidation: liquidationData.historicalLiquidation || [],
                  }
                : prev[symbol]?.liquidation || null,
              tradeVolume: tradeVolumeData?.buy_volume
                ? {
                    buy_volume: parseFloat(tradeVolumeData.buy_volume),
                    sell_volume: parseFloat(tradeVolumeData.sell_volume),
                    timestamp: tradeVolumeData.timestamp,
                  }
                : prev[symbol]?.tradeVolume || null,
            },
          }));
        }
      } catch (err) {
        setError('Failed to fetch additional real-time data');
        console.error('Fetch error:', err);
      }
    };

    fetchAdditionalData();
    const interval = setInterval(fetchAdditionalData, 10000);
    return () => clearInterval(interval);
  }, [selectedSymbols, setRealtimeData]);

  return { realtimeData, error };
}