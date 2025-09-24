
'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DirectTipForm } from '@/components/direct-tip-form';
import { useApp } from '@/hooks/use-app';
import { ConnectWalletButton } from '@/components/connect-wallet-button';

export default function TipPage() {
  const { isConnected } = useApp();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 mt-8">
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Send a Direct Tip</CardTitle>
                <CardDescription>
                    Enter a wallet address, choose a token, and send your support directly.
                </CardDescription>
            </CardHeader>
            <CardContent>
               {isConnected ? (
                  <DirectTipForm />
               ) : (
                <div className="flex flex-col items-center justify-center space-y-4 p-8">
                    <p className="text-muted-foreground text-center">Please connect your wallet to send a tip.</p>
                    <ConnectWalletButton />
                </div>
               )}
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
