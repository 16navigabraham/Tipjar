'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAccount } from 'wagmi';
import { TipForm } from './tip-form';
import { TipHistory } from './tip-history';
import { useTip } from '@/hooks/use-tip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { isAddress } from 'viem';
import { useEnsAddress } from 'wagmi';
import { mainnet } from 'viem/chains';

export function TipJarCard() {
  const { isConnected } = useAccount();
  const [recipient, setRecipient] = useState('');
  const [debouncedRecipient, setDebouncedRecipient] = useState('');
  const [finalRecipientAddress, setFinalRecipientAddress] = useState<`0x${string}` | undefined>();

  const isENS = debouncedRecipient.includes('.');
  const isDirectAddress = isAddress(debouncedRecipient);

  const { data: ensAddress, isLoading: ensLoading } = useEnsAddress({
    name: debouncedRecipient,
    chainId: mainnet.id,
    query: {
      enabled: isENS,
    },
  });

  useState(() => {
    const handler = setTimeout(() => {
      setDebouncedRecipient(recipient);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [recipient]);

  useState(() => {
    if (isENS) {
      setFinalRecipientAddress(ensAddress ?? undefined);
    } else if (isDirectAddress) {
      setFinalRecipientAddress(debouncedRecipient as `0x${string}`);
    } else {
      setFinalRecipientAddress(undefined);
    }
  }, [debouncedRecipient, ensAddress, isENS, isDirectAddress]);
  
  const { sendTip, isSending, isConfirming } = useTip(finalRecipientAddress);
  
  const isValidRecipient = finalRecipientAddress && isAddress(finalRecipientAddress);

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold font-headline">Send a Tip</CardTitle>
        <CardDescription>Show your appreciation for a creator.</CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2">
            <Label htmlFor="recipient">Recipient's Wallet Address or ENS</Label>
            <Input 
                id="recipient"
                placeholder="0x... or vitalik.eth"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
            />
            {recipient && !isValidRecipient && !ensLoading && <p className="text-xs text-destructive">Please enter a valid address or ENS name.</p>}
            {ensLoading && <p className="text-xs text-muted-foreground">Resolving ENS name...</p>}
        </div>

        {isConnected ? (
          <div className="space-y-8">
            <div className={!isValidRecipient ? 'opacity-50 pointer-events-none' : ''}>
                <TipForm onSendTip={sendTip} isSending={isSending} isConfirming={isConfirming} />
            </div>
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
