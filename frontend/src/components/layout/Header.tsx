// src/components/layout/Header.tsx
import React from 'react';
import { Sun, Moon, Search, Bell, Globe, User } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme'; // useTheme 훅 경로에 맞게 수정

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-4 px-6 flex items-center justify-between sticky top-0 z-10">
      {/* 로고 */}
      <div className="flex items-center">
        <div className="font-bold text-xl md:text-2xl text-gray-800 dark:text-white">Crypto Dashboard</div>
      </div>

      {/* 가운데 메뉴 (데스크탑) */}
      <nav className="hidden md:flex space-x-4 lg:space-x-6">
        <a href="#" className="hover:text-primary dark:hover:text-primary transition-colors text-gray-600 dark:text-gray-300">Home</a>
        <a href="#" className="hover:text-primary dark:hover:text-primary transition-colors text-gray-600 dark:text-gray-300">Markets</a>
        <a href="#" className="hover:text-primary dark:hover:text-primary transition-colors text-gray-600 dark:text-gray-300">Portfolio</a>
        <a href="#" className="hover:text-primary dark:hover:text-primary transition-colors text-gray-600 dark:text-gray-300">Learn</a>
      </nav>

      {/* 오른쪽 아이콘 및 설정 */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* 검색 (데스크탑) */}
        <div className="hidden md:block">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Cryptocurrencies..."
              className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-1.5 pl-8 pr-3 text-sm focus-within:border-primary text-gray-700 dark:text-gray-300"
            />
            <Search className="absolute left-2 top-1.5 h-4 w-4 text-gray-400 dark:text-gray-600" />
          </div>
        </div>

        {/* 아이콘 그룹 */}
        <div className="flex items-center space-x-2">
          {/* 다크 모드 토글 */}
          <button onClick={toggleTheme} className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            {theme === 'dark' ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-gray-500" />}
          </button>

          {/* 알림 (아이콘) */}
          <button className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>

          {/* 언어/통화 설정 (아이콘) */}
          <div className="relative">
            <button className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <Globe className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
            {/* 드롭다운 메뉴 (구현 필요) */}
          </div>

          {/* 사용자 메뉴 (아이콘) */}
          <button className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* 모바일 메뉴 토글 (구현 필요) */}
        <div className="md:hidden">
          <button className="outline-none focus:outline-none">
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current text-gray-500 dark:text-gray-400">
              <path fillRule="evenodd" d="M4 5h16a1 1 0 010 2H4a1 1 0 010-2zm0 6h16a1 1 0 010 2H4a1 1 0 010-2zm0 6h16a1 1 0 010 2H4a1 1 0 010-2z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;