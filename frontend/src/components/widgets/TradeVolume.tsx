import React, { useState, useEffect } from 'react';
import '../../styles/panel.css';
import '../../styles/hover.css';
import '../../styles/panelThemes.css';
import { useRecoilValue } from 'recoil';
import { tradeVolumeState } from '@/store/atoms';
import { Panel } from '../panels/Panel';

export const TradeVolume: React.FC = () => {
  const tradeVolumeData = useRecoilValue(tradeVolumeState);
  const [buyVolume, setBuyVolume] = useState(0);
  const [sellVolume, setSellVolume] = useState(0);
  const [timestamp, setTimestamp] = useState<string | null>(null);

  useEffect(() => {
    if (tradeVolumeData) {
      setBuyVolume(tradeVolumeData.buy_volume);
      setSellVolume(tradeVolumeData.sell_volume);
      setTimestamp(tradeVolumeData.timestamp);
    }
  }, [tradeVolumeData]);

  return (
    <Panel title="Trade Volume">
      {!tradeVolumeData ? (
        <div className="text-gray-400 text-base">No trade volume data</div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-end gap-2">
            <span className="text-green-400 font-bold text-lg">Buy:</span>
            <span className="text-xl font-bold">{buyVolume.toFixed(4)}</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-red-400 font-bold text-lg">Sell:</span>
            <span className="text-xl font-bold">{sellVolume.toFixed(4)}</span>
          </div>
          {timestamp && (
            <div className="text-gray-400 text-sm">
              <span className="font-medium">Time:</span> {timestamp}
            </div>
          )}
        </div>
      )}
    </Panel>
  );
};
