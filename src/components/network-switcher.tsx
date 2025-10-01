
'use client';

import { useAccount, useSwitchChain } from 'wagmi';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import { ChevronDown, Check } from 'lucide-react';
import { wagmiConfig } from '@/lib/config';

export function NetworkSwitcher() {
  const { chain } = useAccount();
  const { chains, switchChain } = useSwitchChain();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <span>{chain?.name ?? 'Select Network'}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {chains.map((c) => (
          <DropdownMenuItem
            key={c.id}
            onClick={() => switchChain({ chainId: c.id })}
            className="flex items-center justify-between"
          >
            <span>{c.name}</span>
            {chain?.id === c.id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
