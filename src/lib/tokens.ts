
import { base, celo } from 'wagmi/chains';

export interface Token {
    symbol: string;
    name: string;
    address?: `0x${string}`;
    decimals: number;
    chain: { id: number; name: string };
}

export const tokens: Token[] = [
    // Base Tokens
    {
        symbol: 'ETH',
        name: 'Ether',
        decimals: 18,
        chain: base,
    },
    {
        symbol: 'WETH',
        name: 'Wrapped Ether',
        address: '0x4200000000000000000000000000000000000006',
        decimals: 18,
        chain: base,
    },
    {
        symbol: 'USDC',
        name: 'USD Coin',
        address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bda02913',
        decimals: 6,
        chain: base,
    },
    {
        symbol: 'DEGEN',
        name: 'Degen',
        address: '0x4ed4E862860beD51a9570b96d89AF5E1B0Aef585',
        decimals: 18,
        chain: base,
    },
    // Celo Tokens
    {
        symbol: 'CELO',
        name: 'Celo',
        decimals: 18,
        chain: celo,
    },
    {
        symbol: 'cUSD',
        name: 'Celo Dollar',
        address: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
        decimals: 18,
        chain: celo,
    },
];

export const getTokensByChain = (chainId: number): Token[] => {
    return tokens.filter(t => t.chain.id === chainId);
}
