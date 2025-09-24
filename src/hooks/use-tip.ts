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
    toast({
      title: 'Sending Tip...',
      description: 'Please check your wallet to approve the transaction.',
    });

    try {
      let tx;
      if (token.symbol === 'ETH') {
        tx = await tipWithNative(creatorAddress, amount);
      } else {
        if (!token.address) {
          throw new Error('Token address is not defined for ERC20 tip.');
        }
        tx = await tipWithERC20Human(token.address, creatorAddress, amount);
      }

      toast({
        title: 'Transaction Submitted',
        description: 'Waiting for confirmation...',
      });

      const receipt = await tx.wait();
      
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
      toast({
        title: 'Transaction Error',
        description: e.reason || e.message || 'The transaction was cancelled or failed.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
      queryClient.invalidateQueries({ queryKey: ['tips', address] });
      queryClient.invalidateQueries({ queryKey: ['creator-tips', creatorAddress] });
      queryClient.invalidateQueries({ queryKey: ['top-tippers', creatorAddress] });
      queryClient.invalidateQueries({ queryKey: ['userProfile', address] });
      queryClient.invalidateQueries({ queryKey: ['userProfile', creatorAddress] });
    }
  };

  return {
    sendTip,
    isSending,
    isConfirming: false,
    tipHistory,
    isLoadingHistory,
  };
}
