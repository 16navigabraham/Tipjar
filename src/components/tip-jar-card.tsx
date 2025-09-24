
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAccount } from 'wagmi';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { Loader2, Search } from 'lucide-react';
import Link from 'next/link';

export function TipJarCard() {
  const { isConnected } = useAccount();
  const [recipient, setRecipient] = useState('');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = () => {
      if (recipient) {
        setIsLoading(true);
        router.push(`/tip/${recipient}`);
      }
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold font-headline">Send a Tip</CardTitle>
        <CardDescription>Know a creator's username, ENS, or wallet address? Look them up here.</CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="flex gap-2">
            <Input 
                id="recipient"
                placeholder="username, vitalik.eth, or 0x..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={!recipient || isLoading}>
                {isLoading ? <Loader2 className="animate-spin"/> : <Search />}
            </Button>
        </div>

        {!isConnected && (
            <p className="text-center text-muted-foreground pt-8">
                Please connect your wallet to send a tip.
            </p>
        )}
        <p className="text-center text-sm text-muted-foreground">
            Don't know any creators?{' '}
            <Link href="/leaderboard" className="text-primary hover:underline">
             Check out the leaderboard!
            </Link>
        </p>
      </CardContent>
    </Card>
  );
}
