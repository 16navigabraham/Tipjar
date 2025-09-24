import { Header } from '@/components/layout/header';

export default function TipPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Find a Creator to Tip</h1>
            <p className="text-muted-foreground">
                You can tip a creator by visiting their profile page directly, e.g., `/tip/username`.
                <br />
                Discover creators on the <a href="/leaderboard" className="text-primary hover:underline">leaderboard</a>.
            </p>
        </div>
      </main>
    </div>
  );
}
