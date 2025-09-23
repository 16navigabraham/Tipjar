'use client';

import { useToast } from '@/hooks/use-toast';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { parseEther, parseUnits } from 'viem';
import { useEffect, useState } from 'react';
import { getTipsBySender, logTip } from '@/services/tip-service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Token } from '@/lib/tokens';
import { erc20Abi } from '@/lib/abi/erc20';

export function useTip(creatorAddress: `0x${string}`) {
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  const { writeContractAsync } = useWriteContract();

  const { data: hash, error, isPending: isSending, sendTransaction } = useSendTransaction();
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
    setTipData({ amount, token, message });

    try {
        if (token.symbol === 'ETH') {
            sendTransaction({
              to: creatorAddress,
              value: parseEther(amount),
            });
        } else {
            const txHash = await writeContractAsync({
                abi: erc20Abi,
                address: token.address as `0x${string}`,
                functionName: 'transfer',
                args: [creatorAddress, parseUnits(amount, token.decimals)],
            });
            // We don't get the hash immediately like with sendTransaction, so we can't rely on the outer hash state.
            // For now, let's just show a submitted toast and log it optimistically.
             toast({
                title: 'Transaction Submitted',
                description: `Sending ${amount} ${token.symbol}...`,
            });
            await logTip({
                receiver: creatorAddress,
                amount: amount,
                message: message,
                token: token.symbol,
                sender: address!,
                txHash: txHash,
                timestamp: new Date(),
              });
            queryClient.invalidateQueries({ queryKey: ['tips', address] });
            queryClient.invalidateQueries({ queryKey: ['creator-tips', creatorAddress] });
            setTipData(null);
        }
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
    if (isConfirmed && hash && address && tipData && tipData.token.symbol === 'ETH') {
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
