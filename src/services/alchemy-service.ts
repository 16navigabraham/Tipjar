'use server';

const ALCHEMY_URL = process.env.NEXT_PUBLIC_ALCHEMY_BASE_URL;

export async function getTokenBalance(walletAddress: `0x${string}`, tokenAddress: `0x${string}`): Promise<string> {
  if (!ALCHEMY_URL) {
    throw new Error('Alchemy URL is not configured. Please set NEXT_PUBLIC_ALCHEMY_BASE_URL.');
  }

  try {
    const response = await fetch(ALCHEMY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: 1,
        jsonrpc: '2.0',
        method: 'alchemy_getTokenBalances',
        params: [walletAddress, [tokenAddress]],
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`Alchemy API Error: ${data.error.message}`);
    }
    
    const balanceData = data.result.tokenBalances[0];

    return balanceData.tokenBalance || '0x0';
  } catch (error) {
    console.error('Error fetching token balance from Alchemy:', error);
    return '0x0';
  }
}
