'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getUserByUsername, getUserByWalletAddress } from '@/services/user-service';
import { Header } from '@/components/layout/header';
import { CreatorTipJar } from '@/components/creator-tip-jar';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { XCircle } from 'lucide-react';
import { useEnsAddress } from 'wagmi';
import { mainnet } from 'viem/chains';
import { useEffect, useState } from 'react';
import { UserDocument } from '@/services/user-service';

export default function CreatorTipPage() {
  const params = useParams();
  const usernameOrAddress = params.username as string;
  const [creatorWalletAddress, setCreatorWalletAddress] = useState<`0x${string}` | undefined>();

  const isEnsName = usernameOrAddress.includes('.');

  const { data: ensAddress, isLoading: isLoadingEns } = useEnsAddress({
    name: usernameOrAddress,
    chainId: mainnet.id,
    enabled: isEnsName,
  });

  useEffect(() => {
    if (isEnsName) {
      if (ensAddress) {
        setCreatorWalletAddress(ensAddress);
      }
    } else {
      // It might be a direct address or a username
      if (usernameOrAddress.startsWith('0x')) {
        setCreatorWalletAddress(usernameOrAddress as `0x${string}`);
      }
    }
  }, [ensAddress, isEnsName, usernameOrAddress]);

  const { data: userByUsername, isLoading: isLoadingUserByUsername } = useQuery({
    queryKey: ['creatorByUsername', usernameOrAddress],
    queryFn: () => getUserByUsername(usernameOrAddress),
    enabled: !isEnsName && !usernameOrAddress.startsWith('0x'),
  });

  const { data: userByAddress, isLoading: isLoadingUserByAddress } = useQuery({
    queryKey: ['creatorByAddress', creatorWalletAddress],
    queryFn: () => getUserByWalletAddress(creatorWalletAddress!),
    enabled: !!creatorWalletAddress,
  });

  const isLoading = isLoadingEns || isLoadingUserByUsername || isLoadingUserByAddress;
  
  const user: UserDocument | null | undefined = userByAddress ?? userByUsername;
  const finalWalletAddress = creatorWalletAddress || user?.walletAddress;

  const effectiveUser: UserDocument | undefined = user || (finalWalletAddress ? {
      id: finalWalletAddress,
      username: usernameOrAddress,
      walletAddress: finalWalletAddress
  } : undefined);

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
        {!isLoading && effectiveUser && (
          <CreatorTipJar creator={effectiveUser} />
        )}
        {!isLoading && !effectiveUser && (
           <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Creator Not Found</AlertTitle>
            <AlertDescription>
              The creator &quot;{usernameOrAddress}&quot; could not be found.
            </AlertDescription>
          </Alert>
        )}
      </main>
    </div>
  );
}
