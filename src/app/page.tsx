'use client';

import { Header } from '@/components/layout/header';
import { ConnectWalletButton } from '@/components/connect-wallet-button';
import { Button } from '@/components/ui/button';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { Send } from 'lucide-react';

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center text-center p-4 sm:p-6 space-y-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline text-primary tracking-tight">
          Welcome to TipJar
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          The simplest way to show your appreciation for creators on the Base network. Connect your wallet, pick a token, and send a tip in seconds.
        </p>
        
        {isConnected ? (
          <div className="flex flex-col items-center space-y-4">
            <p className="font-semibold">You're connected!</p>
            <Button asChild size="lg">
              <Link href="/tip">
                <Send className="mr-2 h-4 w-4" />
                Send a Tip Now
              </Link>
            </Button>
          </div>
        ) : (
          <ConnectWalletButton />
        )}
      </main>
    </div>
  );
}
