import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getTopTippers } from '@/services/tip-service';
import { getAllUsers } from '@/services/user-service';
import { shortenAddress } from '@/lib/utils';
import { Crown } from 'lucide-react';
import Image from 'next/image';

async function Leaderboard() {
    // Note: This is a simplified global leaderboard.
    // For a real app, you'd want to aggregate top tippers across all creators.
    // We are fetching all users and then getting top tippers for each.
    const users = await getAllUsers();
    const allTopTippers: { sender: string, totalAmount: number, receiver: string }[] = [];

    for (const user of users) {
        const tippers = await getTopTippers(user.walletAddress, 10);
        tippers.forEach(tipper => {
            allTopTippers.push({ ...tipper, receiver: user.username });
        });
    }

    const aggregatedTippers: { [sender: string]: number } = {};
    allTopTippers.forEach(tipper => {
        if(tipper.token === 'ETH') {
            const amount = parseFloat(tipper.totalAmount.toString());
            if (aggregatedTippers[tipper.sender]) {
                aggregatedTippers[tipper.sender] += amount;
            } else {
                aggregatedTippers[tipper.sender] = amount;
            }
        }
    });

    const sortedGlobalTippers = Object.entries(aggregatedTippers)
        .map(([sender, totalAmount]) => ({ sender, totalAmount }))
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 10);
    
    const userProfiles = await Promise.all(
      sortedGlobalTippers.map(async (tipper) => {
        const user = await getAllUsers().then(users => users.find(u => u.walletAddress.toLowerCase() === tipper.sender.toLowerCase()));
        return {
          ...tipper,
          username: user?.username,
          pfpUrl: user?.pfpUrl,
        };
      })
    );


    const getTrophyColor = (index: number) => {
        if (index === 0) return 'text-yellow-400';
        if (index === 1) return 'text-gray-400';
        if (index === 2) return 'text-yellow-600';
        return 'text-muted-foreground';
    };

    return (
        <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-center">Global Leaderboard (Top 10 ETH Supporters)</h3>
            {userProfiles.length > 0 ? (
                <ul className="space-y-3">
                {userProfiles.map((tipper, index) => (
                    <li key={tipper.sender} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-4">
                        <Crown className={`w-6 h-6 ${getTrophyColor(index)}`} />
                        <span className="text-lg font-bold">#{index + 1}</span>
                         <Image 
                            src={tipper.pfpUrl || `https://picsum.photos/seed/${tipper.sender}/40`}
                            alt={tipper.username || 'user profile picture'}
                            width={40}
                            height={40}
                            className="rounded-full"
                        />
                        <span className="font-medium text-lg">{tipper.username || shortenAddress(tipper.sender)}</span>
                    </div>
                    <span className="font-semibold text-lg">{tipper.totalAmount.toFixed(4)} ETH</span>
                    </li>
                ))}
                </ul>
            ) : (
                <p className="text-center text-muted-foreground text-lg">No tips have been sent yet. Be the first to appear on the leaderboard!</p>
            )}
        </div>
    );
}


export default function LeaderboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex items-start justify-center p-4 sm:p-6">
        <Card className="w-full max-w-4xl">
            <CardHeader>
                <CardTitle>Top Supporters</CardTitle>
                <CardDescription>The most generous tippers across the platform.</CardDescription>
            </CardHeader>
            <CardContent>
                <Leaderboard />
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
