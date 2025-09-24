
'use client';

import { createWeb3Modal } from '@web3modal/wagmi/react';
import { type ReactNode, useEffect, useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig, projectId } from '@/lib/config';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { AppProvider } from '@/hooks/use-app-provider';

const queryClient = new QueryClient();

// Create modal instance outside to avoid re-creation on every render.
// We will call createWeb3Modal inside a useEffect to ensure it's only called on the client.
createWeb3Modal({
  wagmiConfig,
  projectId,
});

function Web3ModalProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();

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
