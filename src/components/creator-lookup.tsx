'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import Link from 'next/link';

export function CreatorLookup() {
  const [username, setUsername] = useState('');
  const router = useRouter();

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      router.push(`/tip/${username.trim()}`);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold font-headline">Find a Creator</CardTitle>
        <CardDescription>Enter a creator&apos;s username to send them a tip.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleLookup} className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="e.g., vitalik"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon" aria-label="Search">
            <Search />
          </Button>
        </form>
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>Don&apos;t know any creators? </p>
          <p>Check out <Link href="/tip/creator" className="text-primary underline">our default creator</Link>.</p>
        </div>
      </CardContent>
    </Card>
  );
}
