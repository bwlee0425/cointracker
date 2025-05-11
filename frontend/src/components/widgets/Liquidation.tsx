import React, { useEffect, useState } from 'react';
import '../../styles/panel.css';
import '../../styles/hover.css';
import '../../styles/panelThemes.css';
import { useRecoilValue } from 'recoil';
import { liquidationDataAtom } from '@/store/atoms';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Panel } from '../panels/Panel';

dayjs.extend(relativeTime);

export const Liquidation: React.FC = () => {
  const recoilData = useRecoilValue(liquidationDataAtom);
  const [data, setData] = useState(recoilData);

  useEffect(() => {
    if (recoilData) {
      setData(recoilData);
    }
  }, [recoilData]);

  return (
    <Panel title="Recent Liquidation">
      {!data ? (
        <div className="text-gray-400 text-base">No liquidation data</div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-end gap-2">
            <span className="text-lg font-semibold">Side:</span>
            <span className={data.side === 'BUY' ? 'text-green-400 font-bold text-xl' : 'text-red-400 font-bold text-xl'}>
              {data.side}
            </span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-lg font-semibold">Price:</span>
            <span className="text-xl font-bold">{data.price?.toFixed(2) ?? 'N/A'}</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-lg font-semibold">Quantity:</span>
            <span className="text-xl font-bold">{data.quantity?.toFixed(4) ?? 'N/A'}</span>
          </div>
          <div className="text-gray-400 text-sm">
            <span className="font-medium">Time:</span> {dayjs(data.timestamp).fromNow()}
          </div>
        </div>
      )}
    </Panel>
  );
};
