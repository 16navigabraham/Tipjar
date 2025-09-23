'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getUserByUsername } from '@/services/user-service';
import { Header } from '@/components/layout/header';
import { CreatorTipJar } from '@/components/creator-tip-jar';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { XCircle } from 'lucide-react';

export default function CreatorTipPage() {
  const params = useParams();
  const username = params.username as string;

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['creator', username],
    queryFn: () => getUserByUsername(username),
    enabled: !!username,
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        {isLoading && (
          <div className="w-full max-w-md space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load creator data. Please try again later.
            </AlertDescription>
          </Alert>
        )}
        {user && <CreatorTipJar creator={user} />}
        {!user && !isLoading && !error && (
           <Alert>
            <XCircle className="h-4 w-4" />
            <AlertTitle>Creator Not Found</AlertTitle>
            <AlertDescription>
              The creator &quot;{username}&quot; does not exist.
            </AlertDescription>
          </Alert>
        )}
      </main>
    </div>
  );
}
