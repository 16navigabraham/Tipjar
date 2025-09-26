
'use client';

import { useToast } from '@/hooks/use-toast';
import { useAccount } from 'wagmi';
import { useState } from 'react';
import { getTipsBySender, logTip } from '@/services/tip-service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Token } from '@/lib/tokens';
import { useTipContract } from './use-tip-contract';

export function useTip(creatorAddress?: `0x${string}`) {
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  const { tipWithNative, tipWithERC20Human } = useTipContract();

  const [isSending, setIsSending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const { data: tipHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['tips', address],
    queryFn: () => getTipsBySender(address!),
    enabled: !!address && isConnected,
  });

  const sendTip = async (amount: string, token: Token, message?: string) => {
    if (!isConnected || !address) {
      toast({ title: 'Error', description: 'Please connect your wallet first.', variant: 'destructive' });
      return;
    }
    if (!creatorAddress) {
      toast({ title: 'Error', description: 'Creator address not found.', variant: 'destructive' });
      return;
    }

    setIsSending(true);
    setIsConfirming(false);

    try {
      let tx;
      toast({
        title: 'Preparing Transaction...',
        description: 'Please check your wallet to approve and send.',
      });

      if (token.symbol === 'ETH' || !token.address) {
        tx = await tipWithNative(creatorAddress, amount);
      } else {
        if (!token.decimals || !token.address) {
          throw new Error('Token details are not defined for ERC20 tip.');
        }
        tx = await tipWithERC20Human(token.address, creatorAddress, amount, token.decimals);
      }
      
      setIsSending(false);
      setIsConfirming(true);

      toast({
        title: 'Transaction Submitted',
        description: 'Waiting for blockchain confirmation...',
      });

      await tx.wait();
      
      toast({
        title: '🎉 Tip Sent!',
        description: 'Thank you for your support!',
      });
      
      await logTip({
        receiver: creatorAddress,
        amount: amount,
        message: message,
        token: token.symbol,
        sender: address,
        txHash: tx.hash,
        timestamp: new Date(),
      });

    } catch (e: any) {
      console.error("Tipping failed:", e);
      // ethers errors often have a `reason` property
      const errorMessage = e.reason || (e.info?.error?.message) || e.message || 'The transaction was cancelled or failed.';
      toast({
        title: 'Transaction Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
      setIsConfirming(false);
      queryClient.invalidateQueries({ queryKey: ['tips', address] });
      queryClient.invalidateQueries({ queryKey: ['creator-tips', creatorAddress] });
      queryClient.invalidateQueries({ queryKey: ['top-tippers', creatorAddress] });
      queryClient.invalidateQueries({ queryKey: ['userProfile', address] });
      queryClient.invalidateQueries({ queryKey: ['userProfile', creatorAddress] });
      queryClient.invalidateQueries({ queryKey: ['globalTopTippers'] });
    }
  };

  return {
    sendTip,
    isSending,
    isConfirming,
    tipHistory,
    isLoadingHistory,
  };
}
