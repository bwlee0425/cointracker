// src/hooks/useTheme.ts
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { themeAtom } from '@/store/atoms';

export const useTheme = () => {
  const [theme, setTheme] = useRecoilState(themeAtom);

  // HTML 루트 클래스 변경
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // 테마 토글 함수 제공
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return { theme, toggleTheme };
};
