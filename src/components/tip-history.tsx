import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from './ui/separator';

export function TipHistory() {
  // TODO: Fetch and display real tip history from Firebase for the connected wallet
  const tips = [
    { id: '1', amount: '0.01', token: 'ETH', date: '2024-07-29', tx: '0xabc...' },
    { id: '2', amount: '10.0', token: 'USDC', date: '2024-07-28', tx: '0xdef...' },
  ];

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
              {tips.length > 0 ? (
                tips.map((tip) => (
                  <TableRow key={tip.id}>
                    <TableCell className="font-medium">{tip.amount}</TableCell>
                    <TableCell>{tip.token}</TableCell>
                    <TableCell className="text-right">{tip.date}</TableCell>
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
