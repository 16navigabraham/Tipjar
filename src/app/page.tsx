import { Header } from '@/components/layout/header';
import { CreatorLookup } from '@/components/creator-lookup';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <CreatorLookup />
      </main>
    </div>
  );
}
