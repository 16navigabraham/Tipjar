'use client';

import { createAppKit } from '@reown/appkit/react';
import { type ReactNode, useEffect, useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiAdapter, projectId } from '@/lib/config';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { AppProvider } from '@/hooks/use-app-provider';
import { mainnet, polygon, arbitrum, base, celo } from 'wagmi/chains';

const queryClient = new QueryClient();

// Create modal instance outside to avoid re-creation on every render.
if (!projectId) {
    throw new Error('WalletConnect Project ID is not defined. Please check your environment variables.');
}

// 1. Set up the metadata
const metadata = {
  name: 'TipJar',
  description: 'A simple dApp to send tips to creators.',
  url: 'https://tipjar.app', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

// 2. Create the modal
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, polygon, arbitrum, base, celo],
  metadata,
  features: {
    analytics: true, // Enable analytics
    email: false, // Disable email login for Web3-only experience
    socials: [], // Remove social logins for Web3-only experience
    emailShowWallets: false, // Web3-only
    onramp: true, // Enable on-ramp for buying crypto
    swaps: true, // Enable token swaps
  },
  themeMode: 'light', // Will be overridden by CSS variables
  themeVariables: {
    '--w3m-font-family': 'inherit',
    '--w3m-border-radius-master': '8px',
  },
});

function AppKitProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
            {children}
        </AppProvider>
        {/* AppKit theme styling */}
        <div
          style={{
            ['--w3m-theme-mode' as string]: theme,
            ['--w3m-color-mix' as string]: 'hsl(var(--background))',
            ['--w3m-accent' as string]: 'hsl(var(--primary))',
          }}
        />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function ClientSideProviders({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // You can return a loader here if you want
    return null;
  }

  return <AppKitProvider>{children}</AppKitProvider>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ClientSideProviders>{children}</ClientSideProviders>
    </NextThemesProvider>
  );
}
