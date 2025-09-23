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
    // Add more tokens on the Base network here
];
