// src/components/widgets/SymbolSelectorPanel.tsx
import React, { useState } from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';
import { symbolsAtom, selectedSymbolsAtom } from '@/store/atoms';

export const SymbolSelectorPanel: React.FC = () => {
  const symbols = useRecoilValue(symbolsAtom); // 심볼 목록
  const [selectedSymbols, setSelectedSymbols] = useRecoilState(selectedSymbolsAtom); // 선택된 심볼 배열
  const [search, setSearch] = useState(''); // 검색어 상태

  // 검색어로 필터링된 심볼 목록
  const filteredSymbols = symbols.filter((symbol) =>
    symbol.toLowerCase().includes(search.toLowerCase())
  );

  const handleSymbolToggle = (symbol: string) => {
    if (selectedSymbols.includes(symbol)) {
      setSelectedSymbols(selectedSymbols.filter((s) => s !== symbol));
    } else if (selectedSymbols.length < 10) {
      setSelectedSymbols([...selectedSymbols, symbol]);
    }
  };

  return (
    <div className="p-4 bg-[#2e3748] rounded-xl">
      <label className="text-white font-semibold">Select Symbols (Max 10):</label>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search symbols..."
        className="mt-2 p-2 bg-[#121212] text-white rounded-lg w-full"
      />
      <div className="mt-2 max-h-40 overflow-y-auto">
        {filteredSymbols.map((symbol) => (
          <div key={symbol} className="flex items-center space-x-2 mb-1">
            <input
              type="checkbox"
              checked={selectedSymbols.includes(symbol)}
              onChange={() => handleSymbolToggle(symbol)}
              disabled={!selectedSymbols.includes(symbol) && selectedSymbols.length >= 10}
            />
            <label className="text-white">{symbol}</label>
          </div>
        ))}
      </div>
      <p className="text-white mt-2">Selected: {selectedSymbols.join(', ')}</p>
    </div>
  );
};