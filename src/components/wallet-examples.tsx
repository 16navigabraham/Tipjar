/**
 * AppKit Wallet Integration Examples
 * 
 * This file demonstrates different approaches to using Reown AppKit
 * for wallet management in your React application.
 */

'use client';

import { useAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import { Button } from '@/components/ui/button';

// ==========================================
// APPROACH 1: Use AppKit's Built-in Components (RECOMMENDED)
// ==========================================

/**
 * The simplest approach - let AppKit handle everything!
 * These web components handle all wallet functionality automatically.
 */
export function UltimateSimpleWallet() {
  return (
    <div className="flex items-center gap-2">
      {/* Connect/disconnect, account management, transaction history */}
      <w3m-button />
      
      {/* Network/chain switching */}
      <w3m-network-button />
    </div>
  );
}

// ==========================================
// APPROACH 2: Hybrid - AppKit Components + Custom Logic
// ==========================================

/**
 * Use AppKit components but add some custom behavior
 */
export function HybridWallet() {
  const { isConnected, address } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <w3m-button />
        <w3m-network-button />
      </div>
      
      {/* Custom status display */}
      {isConnected && (
        <div className="text-sm text-muted-foreground">
          Connected: {address} on chain {chainId}
        </div>
      )}
    </div>
  );
}

// ==========================================
// APPROACH 3: Custom UI with AppKit Hooks
// ==========================================

/**
 * Build your own UI but use AppKit's state management
 */
export function CustomWalletUI() {
  const { open } = useAppKit();
  const { isConnected, address } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();

  const handleConnect = () => {
    open(); // Opens AppKit modal
  };

  const handleAccount = () => {
    open({ view: 'Account' }); // Opens account management
  };

  const handleNetworks = () => {
    open({ view: 'Networks' }); // Opens network selection
  };

  if (!isConnected) {
    return (
      <Button onClick={handleConnect}>
        Connect Wallet
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={handleAccount}>
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </Button>
      <Button variant="outline" size="sm" onClick={handleNetworks}>
        Chain: {chainId}
      </Button>
    </div>
  );
}

// ==========================================
// WHAT APPKIT PROVIDES OUT OF THE BOX:
// ==========================================

/**
 * Features included with AppKit:
 * 
 * 🔐 Wallet Connection
 *   - MetaMask, WalletConnect, Coinbase, Rainbow, etc.
 *   - QR code scanning for mobile wallets
 *   - Remember wallet preference
 * 
 * 👤 Account Management
 *   - View account details
 *   - Disconnect wallet
 *   - Switch accounts (if wallet supports)
 * 
 * 🌐 Network Management
 *   - Switch between configured networks
 *   - Add custom networks
 *   - Network status indicators
 * 
 * 💰 Transaction Features
 *   - Transaction history
 *   - Pending transaction status
 *   - Gas fee estimation
 * 
 * 🎨 Theming & Customization
 *   - Dark/light mode support
 *   - Custom colors and fonts
 *   - Responsive design
 * 
 * 🔄 Additional Features (when enabled)
 *   - On-ramp (buy crypto)
 *   - Token swaps
 *   - NFT gallery
 *   - DeFi positions
 */