// src/components/widgets/TradeVolume.tsx
import React, { useState, useEffect } from 'react';
import '../../styles/panel.css';
import '../../styles/hover.css';
import '../../styles/panelThemes.css';
import { useRecoilValue } from 'recoil';
import { tradeVolumeState, selectedSymbolsAtom } from '@/store/atoms'; // selectedSymbolAtom → selectedSymbolsAtom
import { Panel } from '../panels/Panel';

export const TradeVolume: React.FC = () => {
  const tradeVolumeData = useRecoilValue(tradeVolumeState);
  const selectedSymbols = useRecoilValue(selectedSymbolsAtom); // 다중 심볼 배열로 변경

  // 각 심볼별 상태 관리 (다중 심볼을 위해 객체로 변경)
  const [volumes, setVolumes] = useState<Record<string, { buyVolume: number | null; sellVolume: number | null; timestamp: string | null }>>({});

  useEffect(() => {
    // 선택된 심볼들에 대해 거래량 데이터 업데이트
    const updatedVolumes: Record<string, { buyVolume: number | null; sellVolume: number | null; timestamp: string | null }> = {};

    selectedSymbols.forEach((symbol) => {
      if (tradeVolumeData && tradeVolumeData[symbol]) {
        updatedVolumes[symbol] = {
          buyVolume: tradeVolumeData[symbol]?.buy_volume ?? null,
          sellVolume: tradeVolumeData[symbol]?.sell_volume ?? null,
          timestamp: tradeVolumeData[symbol]?.timestamp ?? null,
        };
      } else {
        updatedVolumes[symbol] = {
          buyVolume: null,
          sellVolume: null,
          timestamp: null,
        };
      }
    });

    setVolumes(updatedVolumes);
  }, [tradeVolumeData, selectedSymbols]);

  return (
    <Panel title="Trade Volume">
      {selectedSymbols.length === 0 ? (
        <div className="text-gray-400 text-base">No symbols selected.</div>
      ) : (
        selectedSymbols.map((symbol) => (
          <div key={symbol} className="mb-4 last:mb-0">
            <h4 className="text-white font-semibold mb-2">{symbol}</h4>
            {!tradeVolumeData || !tradeVolumeData[symbol] ? (
              <div className="text-gray-400 text-base">No trade volume data for {symbol}</div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-end gap-2">
                  <span className="text-green-400 font-bold text-lg">Buy:</span>
                  <span className="text-xl font-bold">
                    {volumes[symbol]?.buyVolume !== null ? volumes[symbol].buyVolume.toFixed(4) : 'N/A'}
                  </span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-red-400 font-bold text-lg">Sell:</span>
                  <span className="text-xl font-bold">
                    {volumes[symbol]?.sellVolume !== null ? volumes[symbol].sellVolume.toFixed(4) : 'N/A'}
                  </span>
                </div>
                {volumes[symbol]?.timestamp && (
                  <div className="text-gray-400 text-sm">
                    <span className="font-medium">Time:</span> {volumes[symbol].timestamp}
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </Panel>
  );
};