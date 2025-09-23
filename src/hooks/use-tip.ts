'use client';

import { useToast } from '@/hooks/use-toast';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { creatorAddress } from '@/lib/config';
import { useEffect } from 'react';
import { getTipsBySender, logTip } from '@/services/tip-service';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export function useTip() {
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();

  const { data: hash, error, isPending: isSending, sendTransaction } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const { data: tipHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['tips', address],
    queryFn: () => getTipsBySender(address!),
    enabled: !!address && isConnected,
  });

  const sendTip = async (amount: string) => {
    if (!isConnected) {
      toast({ title: 'Error', description: 'Please connect your wallet first.', variant: 'destructive' });
      return;
    }
    sendTransaction({
      to: creatorAddress as `0x${string}`,
      value: parseEther(amount),
    });
  };

  useEffect(() => {
    if (isConfirming) {
      toast({
        title: 'Transaction Submitted',
        description: 'Sending tip... Please wait for confirmation.',
      });
    }
    if (isConfirmed && hash && address) {
      toast({
        title: '🎉 Tip Sent!',
        description: 'Successfully sent tip. Thank you for your support!',
      });
      const amount = (parseEther as any).reverse(hash)?.value?.toString() ?? '0';
      logTip({
        amount,
        token: 'ETH',
        sender: address,
        txHash: hash,
        timestamp: new Date(),
      }).finally(() => {
        queryClient.invalidateQueries({ queryKey: ['tips', address] });
      });
    }
    if (error) {
      toast({
        title: 'Error',
        description: error.shortMessage || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  }, [isConfirming, isConfirmed, error, toast, hash, address, queryClient]);

  return {
    sendTip,
    isSending,
    isConfirming,
    tipHistory,
    isLoadingHistory,
  };
}
