'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TipForm } from './tip-form';
import { UserDocument } from '@/services/user-service';
import { useTip } from '@/hooks/use-tip';
import { useQuery } from '@tanstack/react-query';
import { getTipsByReceiver, getTopTippers } from '@/services/tip-service';
import { shortenAddress } from '@/lib/utils';
import { useEthPrice } from '@/hooks/use-eth-price';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Skeleton } from './ui/skeleton';
import { format } from 'date-fns';
import { Separator } from './ui/separator';
import { Crown } from 'lucide-react';
import Image from 'next/image';
import { useApp } from '@/hooks/use-app';

interface CreatorTipJarProps {
  creator: UserDocument;
}

function CreatorTipHistory({ creatorAddress }: { creatorAddress: string }) {
  const { data: tips, isLoading } = useQuery({
    queryKey: ['creator-tips', creatorAddress],
    queryFn: () => getTipsByReceiver(creatorAddress),
    enabled: !!creatorAddress,
  });

  const { price: ethPrice } = useEthPrice();

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'yyyy-MM-dd');
  };

  const getUsdValue = (ethAmount: string) => {
    if (!ethPrice || !ethAmount) return null;
    try {
      const amountInEth = parseFloat(ethAmount);
      return (amountInEth * ethPrice).toFixed(2);
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="space-y-4">
       <h3 className="text-lg font-semibold text-center">Recent Tips</h3>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>From</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Message</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </TableCell>
              </TableRow>
            ) : tips && tips.length > 0 ? (
              tips.map((tip) => (
                <TableRow key={tip.id}>
                  <TableCell>{shortenAddress(tip.sender)}</TableCell>
                  <TableCell className="font-medium">
                    <div>{tip.amount} {tip.token}</div>
                    <div className="text-xs text-muted-foreground">
                      {ethPrice && tip.token === 'ETH' && `$${getUsdValue(tip.amount)} USD`}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate" title={tip.message}>
                    {tip.message || '-'}
                  </TableCell>
                  <TableCell className="text-right">{formatDate(tip.timestamp)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  This creator hasn't received any tips yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function TopTippers({ creatorAddress }: { creatorAddress: string }) {
  const { data: topTippers, isLoading } = useQuery({
    queryKey: ['top-tippers', creatorAddress],
    queryFn: () => getTopTippers(creatorAddress),
    enabled: !!creatorAddress,
  });

  const getTrophyColor = (index: number) => {
    if (index === 0) return 'text-yellow-400';
    if (index === 1) return 'text-gray-400';
    if (index === 2) return 'text-yellow-600';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-center">Top Supporters (ETH)</h3>
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : topTippers && topTippers.length > 0 ? (
        <ul className="space-y-2">
          {topTippers.map((tipper, index) => (
            <li key={tipper.sender} className="flex items-center justify-between p-2 rounded-md bg-secondary/50">
              <div className="flex items-center gap-3">
                <Crown className={`w-5 h-5 ${getTrophyColor(index)}`} />
                <span className="font-medium">{shortenAddress(tipper.sender)}</span>
              </div>
              <span className="font-semibold">{tipper.totalAmount.toFixed(4)} ETH</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-muted-foreground text-sm">No supporters yet. Be the first!</p>
      )}
    </div>
  );
}


export function CreatorTipJar({ creator }: CreatorTipJarProps) {
  const { isConnected } = useApp();
  const { sendTip, isSending } = useTip(creator.walletAddress as `0x${string}`);
  
  const displayName = creator.displayName || (creator.username.startsWith('0x') ? shortenAddress(creator.username) : creator.username);

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <Image 
            src={creator.avatar || `https://picsum.photos/seed/${creator.walletAddress}/100`}
            alt={creator.username}
            width={100}
            height={100}
            className="rounded-full mx-auto mb-4 border-4 border-primary"
        />
        <CardTitle className="text-xl font-bold font-headline">Send a Tip to {displayName}</CardTitle>
        <CardDescription>{creator.bio || `Show your appreciation for ${displayName}`}</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
          <div className="space-y-8">
            {isConnected ? (
              <TipForm onSendTip={sendTip} isSending={isSending} isConfirming={false} />
            ) : (
              <p className="text-center text-muted-foreground pt-8">
                Please connect your wallet to send a tip.
              </p>
            )}
            <Separator />
            <TopTippers creatorAddress={creator.walletAddress} />
            <Separator />
            <CreatorTipHistory creatorAddress={creator.walletAddress} />
          </div>
      </CardContent>
    </Card>
  );
}
