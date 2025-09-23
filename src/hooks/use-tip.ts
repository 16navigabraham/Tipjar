'use client';

import { useToast } from '@/hooks/use-toast';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { parseEther, parseUnits } from 'viem';
import { useEffect, useState } from 'react';
import { getTipsBySender, logTip } from '@/services/tip-service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Token } from '@/lib/tokens';
import { tipJarAbi } from '@/lib/abi/TipJar';
import { contractAddress, contractChain } from '@/lib/config';

export function useTip(creatorAddress?: `0x${string}`) {
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  
  const { data: hash, error, isPending: isSending, writeContract } = useWriteContract();

  const [tipData, setTipData] = useState<{ amount: string, token: Token, message?: string } | null>(null);

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const { data: tipHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['tips', address],
    queryFn: () => getTipsBySender(address!),
    enabled: !!address && isConnected,
  });

  const sendTip = async (amount: string, token: Token, message?: string) => {
    if (!isConnected) {
      toast({ title: 'Error', description: 'Please connect your wallet first.', variant: 'destructive' });
      return;
    }
    if (!creatorAddress) {
      toast({ title: 'Error', description: 'Creator address not found.', variant: 'destructive' });
      return;
    }

    setTipData({ amount, token, message });

    try {
        writeContract({
            address: contractAddress,
            abi: tipJarAbi,
            functionName: 'tip',
            value: parseEther(amount),
            chainId: contractChain.id
        });
    } catch(e: any) {
        toast({
            title: 'Error',
            description: e.shortMessage || 'An unexpected error occurred.',
            variant: 'destructive',
        });
        setTipData(null);
    }
  };

  useEffect(() => {
    if (isConfirming) {
      toast({
        title: 'Transaction Submitted',
        description: 'Sending tip... Please wait for confirmation.',
      });
    }
    if (isConfirmed && hash && address && tipData && creatorAddress) {
      toast({
        title: '🎉 Tip Sent!',
        description: 'Successfully sent tip. Thank you for your support!',
      });
      
      logTip({
        receiver: creatorAddress,
        amount: tipData.amount,
        message: tipData.message,
        token: tipData.token.symbol,
        sender: address,
        txHash: hash,
        timestamp: new Date(),
      }).finally(() => {
        queryClient.invalidateQueries({ queryKey: ['tips', address] });
        queryClient.invalidateQueries({ queryKey: ['creator-tips', creatorAddress] });
        queryClient.invalidateQueries({ queryKey: ['top-tippers', creatorAddress] });
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
  }, [isConfirming, isConfirmed, error, toast, hash, address, queryClient, tipData, creatorAddress]);

  return {
    sendTip,
    isSending,
    isConfirming,
    tipHistory,
    isLoadingHistory,
  };
}
