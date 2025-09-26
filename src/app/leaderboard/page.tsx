
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getGlobalTopTippers } from '@/services/tip-service';
import { getUserProfile } from '@/services/user-service';
import { shortenAddress } from '@/lib/utils';
import { Crown } from 'lucide-react';
import Image from 'next/image';

async function Leaderboard() {
    const topTippers = await getGlobalTopTippers(10);
    
    const userProfiles = await Promise.all(
      topTippers.map(async (tipper) => {
        const user = await getUserProfile(tipper.sender);
        return {
          ...tipper,
          username: user?.username,
          avatar: user?.avatar,
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
            <h3 className="text-2xl font-semibold text-center">Global Champions (Top 10 Supporters)</h3>
            {userProfiles.length > 0 ? (
                <ul className="space-y-3">
                {userProfiles.map((tipper, index) => (
                    <li key={tipper.sender} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-4">
                        <Crown className={`w-6 h-6 ${getTrophyColor(index)}`} />
                        <span className="text-lg font-bold">#{index + 1}</span>
                         <Image 
                            src={tipper.avatar || `https://picsum.photos/seed/${tipper.sender}/40`}
                            alt={tipper.username || 'user profile picture'}
                            width={40}
                            height={40}
                            className="rounded-full"
                        />
                        <span className="font-medium text-lg">{tipper.username || shortenAddress(tipper.sender)}</span>
                    </div>
                    <span className="font-semibold text-lg">${tipper.totalAmount.toFixed(2)} USD</span>
                    </li>
                ))}
                </ul>
            ) : (
                <p className="text-center text-muted-foreground text-lg">The leaderboard is waiting for its first hero. Send a tip to claim your spot!</p>
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
                <CardTitle>Hall of Fame</CardTitle>
                <CardDescription>Celebrating the most generous supporters on TipJar.</CardDescription>
            </CardHeader>
            <CardContent>
                <Leaderboard />
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
