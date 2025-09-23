'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAccount } from 'wagmi';
import { TipForm } from './tip-form';
import { TipHistory } from './tip-history';

export function TipJarCard() {
  const { isConnected } = useAccount();

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold font-headline">Send a Tip</CardTitle>
        <CardDescription>Show your appreciation for the creator.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {isConnected ? (
          <div className="space-y-8">
            <TipForm />
            <TipHistory />
          </div>
        ) : (
          <p className="text-center text-muted-foreground pt-8">
            Please connect your wallet to send a tip and view your history.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
