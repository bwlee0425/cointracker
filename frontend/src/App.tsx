// src/App.tsx
import React from 'react';
import './styles/global.css';
import { AlertCircle, Sun, Moon } from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import useRealtimeData from './hooks/useRealtimeData';
import useHistoricalData from './hooks/useHistoricalData';
import { useRecoilState, useRecoilValue } from 'recoil';
import { selectedSymbolsAtom, orderbookDataAtom } from './store/atoms'; // selectedSymbolsAtom 사용
import { useSymbols } from './hooks/useSymbols';
import { PanelLayout } from './components/layout/PanelLayout';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import { Footer } from './components/layout/Footer';

const App: React.FC = () => {
  useSymbols(); // 심볼 목록 로드

  const [selectedSymbols] = useRecoilState(selectedSymbolsAtom);
  const { realtimeData, error } = useRealtimeData(selectedSymbols);
  const orderbook = useRecoilValue(orderbookDataAtom); // 디버깅용
  useHistoricalData();

  const { theme, toggleTheme } = useTheme();

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground p-4 flex items-center justify-center">
        <div className="text-red-400 flex items-center space-x-2">
          <AlertCircle className="h-6 w-6" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container min-h-screen w-screen bg-background text-foreground flex flex-col">
      <Header />
      <div className="flex justify-between items-center p-4 border-b border-muted">
        <h1 className="text-xl font-bold">Crypto Info</h1>
        <button
          onClick={toggleTheme}
          className="border px-3 py-1 rounded flex items-center space-x-1 hover:bg-muted transition"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>
      <div className="flex flex-grow overflow-hidden">
        <Sidebar />
        <main className="flex-grow overflow-auto p-4 space-y-4">
          <pre className="text-sm bg-gray-800 p-4 rounded">
            Orderbook Data: {JSON.stringify(orderbook, null, 2)}
          </pre>
          <PanelLayout />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default App;