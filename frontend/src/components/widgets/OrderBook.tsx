import React, { useEffect, useState } from 'react';
import '../../styles/panel.css';
import '../../styles/hover.css';
import '../../styles/panelThemes.css';
import { useRecoilValue } from 'recoil';
import { orderbookBidsSelector, orderbookAsksSelector } from '@/store/selectors';
import { Panel } from '../panels/Panel';

export const OrderBook: React.FC = () => {
  const recoilBids = useRecoilValue(orderbookBidsSelector);
  const recoilAsks = useRecoilValue(orderbookAsksSelector);
  const [bids, setBids] = useState(recoilBids);
  const [asks, setAsks] = useState(recoilAsks);

  useEffect(() => {
    setBids(recoilBids);
  }, [recoilBids]);

  useEffect(() => {
    setAsks(recoilAsks);
  }, [recoilAsks]);

  return (
    <Panel title="Order Book Top 5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-green-400 font-bold mb-2 text-base">Bids</div>
          <div className="space-y-1">
            {bids.slice(0, 5).map(([price, quantity], idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="font-bold text-base">{price.toFixed(2)}</span>
                <span className="text-gray-400 text-base">({quantity.toFixed(2)})</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-red-400 font-bold mb-2 text-base">Asks</div>
          <div className="space-y-1">
            {asks.slice(0, 5).map(([price, quantity], idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="font-bold text-base">{price.toFixed(2)}</span>
                <span className="text-gray-400 text-base">({quantity.toFixed(2)})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
};
