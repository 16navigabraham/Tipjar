'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAccount } from 'wagmi';
import { TipForm } from './tip-form';
import { UserDocument } from '@/services/user-service';
import { useTip } from '@/hooks/use-tip';
import { useQuery } from '@tanstack/react-query';
import { getTipsByReceiver } from '@/services/tip-service';
import { shortenAddress } from '@/lib/utils';
import { useEthPrice } from '@/hooks/use-eth-price';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Skeleton } from './ui/skeleton';
import { format } from 'date-fns';
import { Separator } from './ui/separator';

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
    const date = timestamp.toDate ? timestamp.toDate() : timestamp;
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
                    <div>{tip.amount} ETH</div>
                    <div className="text-xs text-muted-foreground">
                      {ethPrice && `$${getUsdValue(tip.amount)} USD`}
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


export function CreatorTipJar({ creator }: CreatorTipJarProps) {
  const { isConnected } = useAccount();
  const { sendTip, isSending, isConfirming } = useTip(creator.walletAddress);

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold font-headline">Send a Tip to {creator.username}</CardTitle>
        <CardDescription>Show your appreciation for {creator.username}.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
          <div className="space-y-8">
            {isConnected ? (
              <TipForm onSendTip={sendTip} isSending={isSending} isConfirming={isConfirming} />
            ) : (
              <p className="text-center text-muted-foreground pt-8">
                Please connect your wallet to send a tip.
              </p>
            )}
            <Separator />
            <CreatorTipHistory creatorAddress={creator.walletAddress} />
          </div>
      </CardContent>
    </Card>
  );
}
