'use client';

import { useState, useEffect } from 'react';

export function useEthPrice() {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPrice() {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        if (!response.ok) {
          throw new Error('Failed to fetch ETH price');
        }
        const data = await response.json();
        setPrice(data.ethereum.usd);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPrice();
    // Refresh price every minute
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  return { price, loading, error };
}
