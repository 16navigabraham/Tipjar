
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useEnsAddress } from 'wagmi';
import { mainnet } from 'viem/chains';
import { UserDocument, getUserByUsername, getUserProfile } from '@/services/user-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, XCircle } from 'lucide-react';
import { CreatorTipJar } from './creator-tip-jar';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const searchSchema = z.object({
  query: z.string().min(3, 'Please enter at least 3 characters.'),
});

export function FindCreatorForm() {
  const [searchQuery, setSearchQuery] = useState('');
  const [creatorWalletAddress, setCreatorWalletAddress] = useState<`0x${string}` | undefined>();

  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: { query: '' },
  });

  const onSubmit = (values: z.infer<typeof searchSchema>) => {
    setSearchQuery(values.query);
    const isEns = values.query.includes('.');
    const isAddress = values.query.startsWith('0x');

    if (isEns || isAddress) {
      setCreatorWalletAddress(values.query as `0x${string}`);
    } else {
        setCreatorWalletAddress(undefined);
    }
  };

  const isEnsName = searchQuery.includes('.');
  const isAddress = searchQuery.startsWith('0x');
  const isUsername = !isEnsName && !isAddress;

  const { data: ensAddress, isLoading: isLoadingEns } = useEnsAddress({
    name: searchQuery,
    chainId: mainnet.id,
    enabled: isEnsName && !!searchQuery,
  });
  
  const effectiveAddress = isAddress ? searchQuery as `0x${string}` : ensAddress;

  const { data: userByAddress, isLoading: isLoadingUserByAddress } = useQuery({
    queryKey: ['creatorByAddress', effectiveAddress],
    queryFn: () => getUserProfile(effectiveAddress!),
    enabled: !!effectiveAddress,
  });

  const { data: userByUsername, isLoading: isLoadingUserByUsername } = useQuery({
    queryKey: ['creatorByUsername', searchQuery],
    queryFn: () => getUserByUsername(searchQuery),
    enabled: isUsername && !!searchQuery,
  });

  const isLoading = isLoadingEns || isLoadingUserByAddress || isLoadingUserByUsername;
  const user = userByAddress ?? userByUsername;

  const finalWalletAddress = effectiveAddress || user?.walletAddress;
  const effectiveUser: UserDocument | undefined = user ? { ...user } : (finalWalletAddress ? {
      id: finalWalletAddress,
      username: searchQuery,
      walletAddress: finalWalletAddress,
      displayName: '',
      bio: '',
      avatar: '',
      createdAt: new Date(),
      totalTipsReceived: 0,
      totalTipsSent: 0,
      isVerified: false,
  } : undefined);
  
  return (
    <div className="w-full max-w-md space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Find a Creator to Tip</CardTitle>
          <CardDescription>
            Enter a username, ENS name, or wallet address to send a tip.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-2">
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel className="sr-only">Search</FormLabel>
                    <FormControl>
                      <Input placeholder="username, vitalik.eth, or 0x..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
                <span className="sr-only">Search</span>
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {searchQuery && (
        <div className="mt-8">
          {isLoading && (
            <div className="w-full max-w-md space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          )}
          {!isLoading && effectiveUser && <CreatorTipJar creator={effectiveUser} />}
          {!isLoading && !effectiveUser && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Creator Not Found</AlertTitle>
              <AlertDescription>
                The creator &quot;{searchQuery}&quot; could not be found.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {!searchQuery && (
         <div className="text-center text-muted-foreground pt-8">
            <p>Don&apos;t know any creators? <a href="/leaderboard" className="text-primary hover:underline">Check out the leaderboard!</a></p>
         </div>
      )}
    </div>
  );
}
