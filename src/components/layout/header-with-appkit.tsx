import { AppKitWalletButton } from '@/components/appkit-wallet-button';
import { ThemeToggle } from '../theme-toggle';
import Link from 'next/link';
import { NetworkSwitcher } from '../network-switcher';

export function HeaderWithAppKit() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-auto flex">
          <a className="mr-6 flex items-center space-x-2" href="/">
            <span className="font-bold sm:inline-block font-headline text-primary">
              TipJar
            </span>
          </a>
           <nav className="flex items-center gap-4 text-sm font-medium">
             <Link href="/leaderboard" className="text-muted-foreground transition-colors hover:text-foreground">
                Leaderboard
             </Link>
             <Link href="/tip" className="text-muted-foreground transition-colors hover:text-foreground">
                Tip
             </Link>
             <Link href="/profile" className="text-muted-foreground transition-colors hover:text-foreground">
                Profile
             </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end gap-2">
          <NetworkSwitcher />
          <AppKitWalletButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}