
'use client';

import { createWeb3Modal } from '@web3modal/wagmi/react';
import { type ReactNode, useEffect, useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig, projectId } from '@/lib/config';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { AppProvider } from '@/hooks/use-app-provider';

const queryClient = new QueryClient();

// It's important to create the modal inside a component so it doesn't run on the server
// This will prevent the "WalletConnect Core is already initialized" error
function Web3ModalProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();

  // Create modal instance only once
  createWeb3Modal({
    wagmiConfig,
    projectId,
  });

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
            {children}
        </AppProvider>
        {/* Hack to update web3modal theme */}
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

  return <Web3ModalProvider>{children}</Web3ModalProvider>;
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
