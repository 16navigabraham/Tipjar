
'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TipPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 mt-8">
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Find a Creator to Tip</CardTitle>
                <CardDescription>
                    You can tip a creator by visiting their profile page directly, e.g., `/tip/username`.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-center text-muted-foreground">
                    Discover creators on the <a href="/leaderboard" className="text-primary hover:underline">leaderboard</a>.
                </p>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
