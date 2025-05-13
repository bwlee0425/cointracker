// src/components/widgets/SymbolSelectorPanel.tsx
import React from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';
import { symbolsAtom, selectedSymbolAtom } from '@/store/atoms';

export const SymbolSelectorPanel: React.FC = () => {
  const symbols = useRecoilValue(symbolsAtom); // ✅ 심볼 목록 (구독만)
  const [selectedSymbol, setSelectedSymbol] = useRecoilState(selectedSymbolAtom); // 선택된 심볼 상태 관리

  const handleSymbolChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSymbol(event.target.value);
  };

  return (
    <div className="p-4 bg-[#2e3748] rounded-xl">
      <label className="text-white font-semibold">Select Symbol:</label>
      <select
        value={selectedSymbol}
        onChange={handleSymbolChange}
        className="mt-2 p-2 bg-[#121212] text-white rounded-lg w-full"
      >
        {symbols.map((symbol) => (
          <option key={symbol} value={symbol}>
            {symbol}
          </option>
        ))}
      </select>
    </div>
  );
};
