'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from './ui/separator';
import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { getTipsBySender, TipDocument } from '@/services/tip-service';
import { Skeleton } from './ui/skeleton';
import { format } from 'date-fns';

export function TipHistory() {
  const { address, isConnected } = useAccount();

  const { data: tips, isLoading } = useQuery({
    queryKey: ['tips', address],
    queryFn: () => getTipsBySender(address!),
    enabled: !!address && isConnected,
  });

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    // Firestore Timestamps have toMillis(), but we might get a Date object
    const date = timestamp.toDate ? timestamp.toDate() : timestamp;
    return format(date, 'yyyy-MM-dd');
  };

  return (
    <div className="space-y-4">
      <Separator />
      <h3 className="text-lg font-semibold text-center">Your Tip History</h3>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Amount</TableHead>
              <TableHead>Token</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3}>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </TableCell>
              </TableRow>
            ) : tips && tips.length > 0 ? (
              tips.map((tip: TipDocument) => (
                <TableRow key={tip.id}>
                  <TableCell className="font-medium">{tip.amount}</TableCell>
                  <TableCell>{tip.token}</TableCell>
                  <TableCell className="text-right">{formatDate(tip.timestamp)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No tips sent yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
