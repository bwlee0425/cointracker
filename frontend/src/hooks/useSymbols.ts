// hooks/useSymbols.ts
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { symbolsAtom } from '../store/atoms';

export function useSymbols() {
  const [symbols, setSymbols] = useRecoilState(symbolsAtom);

  useEffect(() => {
    async function fetchSymbols() {
      try {
        const res = await fetch('http://localhost:8000/api/symbols/');
        const data = await res.json();
        setSymbols(data);
      } catch (err) {
        console.error('Failed to fetch symbols:', err);
      }
    }
    fetchSymbols();
  }, [setSymbols]);

  return symbols;
}