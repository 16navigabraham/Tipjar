import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { base, mainnet } from 'wagmi/chains';

// 0. Your WalletConnect Cloud project ID
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) throw new Error('Project ID is not defined');

// 1. Your creator wallet address
export const creatorAddress = '0xYourCreatorWalletAddressHere'; // TODO: Replace with your actual address

// 2. Your smart contract address
export const contractAddress = '0xYourContractAddressHere'; // TODO: Replace with your deployed contract address
export const contractChain = base;

// 3. Create wagmiConfig
const metadata = {
  name: 'TipJar',
  description: 'A simple dApp to send tips to creators.',
  url: 'https://tipjar.app', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

const chains = [mainnet, base] as const;
export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
});
