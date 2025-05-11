import React, { useEffect, useState } from 'react';
import '../../styles/panel.css';
import '../../styles/hover.css';
import '../../styles/panelThemes.css';
import { useRecoilValue } from 'recoil';
import { fundingRateState } from '@/store/atoms';
import { Skeleton } from '@/components/ui/skeleton';
import { Panel } from '../panels/Panel';

export const FundingRate: React.FC = () => {
  const liveFundingData = useRecoilValue(fundingRateState);
  const [fundingRateData, setFundingRateData] = useState(liveFundingData);

  // 깜빡임 방지용 캐싱
  useEffect(() => {
    if (liveFundingData) {
      setFundingRateData(liveFundingData);
    }
  }, [liveFundingData]);

  return (
    <Panel title="Funding Rate">
      {!fundingRateData ? (
        <Skeleton className="w-full h-20" />
      ) : (
        <div className="space-y-2">
          <div className="flex items-end gap-2">
            <span className="text-lg font-bold text-white">Rate:</span>
            <span className="text-green-400 text-xl font-bold">
              {(Number(fundingRateData.fundingRate) * 100).toFixed(4)}%
            </span>
          </div>
          <div className="text-gray-400 text-sm">
            <span className="font-medium">Time:</span> {fundingRateData.fundingTime || 'N/A'}
          </div>
        </div>
      )}
    </Panel>
  );
};
