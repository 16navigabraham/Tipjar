import { base } from 'wagmi/chains';

export interface Token {
    symbol: string;
    name: string;
    address?: `0x${string}`;
    decimals: number;
    chain: typeof base;
}

export const tokens: Token[] = [
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
];
