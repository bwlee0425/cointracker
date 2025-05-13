// src/App.tsx
import React from 'react';
import './styles/global.css';
import { AlertCircle, Sun, Moon } from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import useRealtimeData from './hooks/useRealtimeData';
import useHistoricalData from './hooks/useHistoricalData';
import { useRecoilState } from 'recoil';
import { selectedSymbolAtom } from './store/atoms';
import { useSymbols } from './hooks/useSymbols'; // ✅ 추가
import { PanelLayout } from './components/layout/PanelLayout';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import { Footer } from './components/layout/Footer';

const App: React.FC = () => {
  useSymbols(); // ✅ symbols 불러오기 (setSymbols은 useSymbols 내부에서 처리됨)

  const [selectedSymbol] = useRecoilState(selectedSymbolAtom);
  const { error } = useRealtimeData(selectedSymbol);
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
      {/* Header 영역 */}
      <Header />

      {/* 상단 바 - 타이틀 및 다크모드 토글 */}
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

      {/* 메인 영역 */}
      <div className="flex flex-grow overflow-hidden">
        <Sidebar />
        <main className="flex-grow overflow-auto p-4 space-y-4">
          <PanelLayout />
        </main>
      </div>

      {/* Footer 영역 */}
      <Footer />
    </div>
  );
};

export default App;
