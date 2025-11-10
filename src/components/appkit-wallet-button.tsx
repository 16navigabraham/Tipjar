'use client';

import { useAppKitAccount } from '@reown/appkit/react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { User } from 'lucide-react';
import Link from 'next/link';

export function AppKitWalletButton() {
  const { isConnected } = useAppKitAccount();

  return (
    <div className="flex items-center gap-2">
      {/* AppKit's built-in button handles everything */}
      <w3m-button />
      
      {/* Optional: Add profile link when connected */}
      {isConnected && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className="p-2 hover:bg-gray-100 rounded-md dark:hover:bg-gray-800"
              aria-label="User profile menu"
              title="Profile menu"
            >
              <User className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center w-full">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}