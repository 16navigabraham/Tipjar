
import { defaultWagmiConfig } from '@reown/app-kit/react';
import { mainnet, polygon, arbitrum, base } from 'wagmi/chains';

// 0. Your WalletConnect Cloud project ID
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) throw new Error('Project ID is not defined in environment variables.');

// 1. Your creator wallet address
export const creatorAddress = '0x3525a342340576D4229415494848316239B27f12'; // This is now the owner of the contract

// 2. Your smart contract address
export const contractAddress = '0x6a5cD29381dF74ae705d317A3C93e3489a8eaFAb';
export const contractChain = base;

// 3. Create wagmiConfig
const metadata = {
  name: 'TipJar',
  description: 'A simple dApp to send tips to creators.',
  url: 'https://tipjar.app', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

const chains = [mainnet, polygon, arbitrum, base] as const;
export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
});
