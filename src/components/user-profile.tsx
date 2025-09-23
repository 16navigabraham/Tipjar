'use client';

import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConnectWalletButton } from './connect-wallet-button';
import { ProfileForm } from './profile-form';
import { useQuery } from '@tanstack/react-query';
import { getUserByWalletAddress } from '@/services/user-service';
import { Skeleton } from './ui/skeleton';
import { CheckCircle } from 'lucide-react';

export function UserProfile() {
  const { address, isConnected } = useAccount();
  const { data: user, isLoading } = useQuery({
    queryKey: ['userProfile', address],
    queryFn: () => getUserByWalletAddress(address!),
    enabled: !!address,
  });

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>View Your Profile</CardTitle>
          <CardDescription>Connect your wallet to create or manage your TipJar profile.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 p-8">
            <p className="text-muted-foreground">Please connect your wallet.</p>
            <ConnectWalletButton />
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
      return (
          <Card className="w-full max-w-md">
              <CardHeader>
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
              </CardContent>
          </Card>
      )
  }

  if (user) {
    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold font-headline">Welcome, {user.username}</CardTitle>
                <CardDescription>This is your TipJar profile.</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle />
                    <p className="font-semibold">Your profile is active!</p>
                </div>
                <p className="text-muted-foreground">
                    Others can now find you and tip you at: <br />
                    <a href={`/tip/${user.username}`} className="text-primary hover:underline">{`/tip/${user.username}`}</a>
                </p>
                <div className="text-sm text-muted-foreground break-all">
                    <p className="font-medium">Your Wallet Address:</p>
                    <p>{user.walletAddress}</p>
                </div>
            </CardContent>
        </Card>
    );
  }


  return <ProfileForm />;
}
