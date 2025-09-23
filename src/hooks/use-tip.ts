'use client';

import { useToast } from '@/hooks/use-toast';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { creatorAddress } from '@/lib/config';
import { useEffect, useState } from 'react';
import { getTipsBySender, logTip } from '@/services/tip-service';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export function useTip() {
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();

  const { data: hash, error, isPending: isSending, sendTransaction } = useSendTransaction();
  const [tipData, setTipData] = useState<{ amount: string, message?: string } | null>(null);


  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const { data: tipHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['tips', address],
    queryFn: () => getTipsBySender(address!),
    enabled: !!address && isConnected,
  });

  const sendTip = async (amount: string, message?: string) => {
    if (!isConnected) {
      toast({ title: 'Error', description: 'Please connect your wallet first.', variant: 'destructive' });
      return;
    }
    setTipData({ amount, message });
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
    if (isConfirmed && hash && address && tipData) {
      toast({
        title: '🎉 Tip Sent!',
        description: 'Successfully sent tip. Thank you for your support!',
      });
      
      logTip({
        amount: tipData.amount,
        message: tipData.message,
        token: 'ETH',
        sender: address,
        txHash: hash,
        timestamp: new Date(),
      }).finally(() => {
        queryClient.invalidateQueries({ queryKey: ['tips', address] });
        setTipData(null);
      });
    }
    if (error) {
      toast({
        title: 'Error',
        description: error.shortMessage || 'An unexpected error occurred.',
        variant: 'destructive',
      });
      setTipData(null);
    }
  }, [isConfirming, isConfirmed, error, toast, hash, address, queryClient, tipData]);

  return {
    sendTip,
    isSending,
    isConfirming,
    tipHistory,
    isLoadingHistory,
  };
}
