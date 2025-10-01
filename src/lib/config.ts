
import { defaultWagmiConfig } from '@web3modal/wagmi/react';
import { mainnet, polygon, arbitrum, base, celo } from 'wagmi/chains';

// 0. Your WalletConnect Cloud project ID
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'undefined';

if (projectId === 'undefined') {
  console.warn('Warning: WalletConnect Project ID is not defined in environment variables. Wallet connections will not work.');
}

// 1. Your creator wallet address
export const creatorAddress = '0x3525a342340576D4229415494848316239B27f12'; // This is now the owner of the contract

// 2. Your smart contract addresses
export const contractAddresses: Record<number, `0x${string}`> = {
  [base.id]: '0x6a5cD29381dF74ae705d317A3C93e3489a8eaFAb',
  [celo.id]: '0xf095C5919655879CaE18957d74a3F726E22aEd5d',
};

// 3. Create wagmiConfig
const metadata = {
  name: 'TipJar',
  description: 'A simple dApp to send tips to creators.',
  url: 'https://tipjar.app', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

const chains = [mainnet, polygon, arbitrum, base, celo] as const;
export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
});
