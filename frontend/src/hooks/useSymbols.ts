// src/hooks/useSymbols.ts
import { useState, useEffect } from 'react';

export const useSymbols = () => {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetch('/api/symbols') // 실제 API 호출 URL
      .then((res) => res.json())
      .then((data) => {
        setSymbols(data);
        setLoading(false);
      })
      .catch((error) => {
        setError('Error fetching symbols');
        setLoading(false);
      });
  }, []);

  return { symbols, loading, error };
};
