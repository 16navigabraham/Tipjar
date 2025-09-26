'use server';

import { tokens } from '@/lib/tokens';

// A simple in-memory cache to avoid hitting the API too often
let cachedPrices: { [key: string]: number } = {};
let lastFetchTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const tokenIds: { [symbol: string]: string } = {
    'ETH': 'ethereum',
    'WETH': 'weth',
    'USDC': 'usd-coin',
    'DEGEN': 'degen-base',
};

/**
 * Fetches prices for all tokens supported in the application.
 * Prices are cached for 5 minutes to reduce API calls.
 * @returns A promise that resolves to an object mapping lowercase token symbols to their USD price.
 */
export async function getPrices(): Promise<{ [key: string]: number }> {
    const now = Date.now();
    if (now - lastFetchTimestamp < CACHE_DURATION && Object.keys(cachedPrices).length > 0) {
        return cachedPrices;
    }

    const ids = Object.values(tokenIds).join(',');
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch prices from CoinGecko, status: ${response.status}`);
        }
        const data = await response.json();

        const newPrices: { [key: string]: number } = {};
        for (const symbol in tokenIds) {
            const coingeckoId = tokenIds[symbol];
            if (data[coingeckoId]) {
                newPrices[symbol.toLowerCase()] = data[coingeckoId].usd;
            } else {
                 newPrices[symbol.toLowerCase()] = 0; // Default to 0 if not found
            }
        }
        
        // Always treat USDC as $1
        newPrices['usdc'] = 1;

        cachedPrices = newPrices;
        lastFetchTimestamp = now;

        return newPrices;

    } catch (error) {
        console.error("Error fetching token prices:", error);
        // On error, return the last known prices if available, otherwise an empty object
        return cachedPrices || {};
    }
}
