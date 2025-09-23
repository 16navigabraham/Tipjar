'use client';

import { createWeb3Modal } from '@web3modal/wagmi/react';
import { type ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig, projectId } from '@/lib/config';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';

const queryClient = new QueryClient();

createWeb3Modal({
  wagmiConfig,
  projectId,
});

function Web3ModalProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
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

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Web3ModalProvider>{children}</Web3ModalProvider>
    </NextThemesProvider>
  );
}
