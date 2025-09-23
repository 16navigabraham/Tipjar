'use client';

import { useToast } from '@/hooks/use-toast';
import { useAccount, useWaitForTransactionReceipt, useWriteContract, useReadContract } from 'wagmi';
import { parseEther, parseUnits } from 'viem';
import { useEffect, useState } from 'react';
import { getTipsBySender, logTip } from '@/services/tip-service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Token } from '@/lib/tokens';
import { tipJarAbi } from '@/lib/abi/TipJar';
import { erc20Abi } from '@/lib/abi/erc20';
import { contractAddress } from '@/lib/config';

export function useTip(creatorAddress?: `0x${string}`) {
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  
  const { data: hash, error: tipError, isPending: isSending, writeContractAsync } = useWriteContract();
  const { data: approveHash, error: approveError, isPending: isApproving, writeContractAsync: approveAsync } = useWriteContract();

  const [tipData, setTipData] = useState<{ amount: string, token: Token, message?: string } | null>(null);

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    abi: erc20Abi,
    address: tipData?.token.address,
    functionName: 'allowance',
    args: [address!, contractAddress],
    query: {
      enabled: !!address && !!tipData?.token.address,
    }
  });

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  const { isLoading: isConfirmingApproval, isSuccess: isApproved } = useWaitForTransactionReceipt({ hash: approveHash });


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

    const tipAmount = parseUnits(amount, token.decimals);

    try {
        if (token.symbol === 'ETH') {
            await writeContractAsync({
                address: contractAddress,
                abi: tipJarAbi,
                functionName: 'tipWithNative',
                args: [creatorAddress],
                value: tipAmount,
            });
        } else {
            // ERC20 logic
            const needsApproval = allowance === undefined || allowance < tipAmount;
            if (needsApproval) {
                toast({ title: 'Approval Required', description: `Please approve the contract to spend your ${token.symbol}.` });
                await approveAsync({
                    address: token.address!,
                    abi: erc20Abi,
                    functionName: 'approve',
                    args: [contractAddress, tipAmount],
                });
            } else {
                await writeContractAsync({
                    address: contractAddress,
                    abi: tipJarAbi,
                    functionName: 'tipWithERC20',
                    args: [token.address!, creatorAddress, tipAmount],
                });
            }
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

  // Effect to handle post-approval tipping
  useEffect(() => {
    async function sendErc20Tip() {
      if (isApproved && tipData && creatorAddress) {
        toast({ title: 'Approval Successful', description: `Now sending your ${tipData.token.symbol} tip.` });
        const tipAmount = parseUnits(tipData.amount, tipData.token.decimals);
        try {
          await writeContractAsync({
              address: contractAddress,
              abi: tipJarAbi,
              functionName: 'tipWithERC20',
              args: [tipData.token.address!, creatorAddress, tipAmount],
          });
        } catch (e: any) {
          toast({
              title: 'Error',
              description: e.shortMessage || 'An unexpected error occurred while sending the tip.',
              variant: 'destructive',
          });
          setTipData(null);
        }
      }
    }
    sendErc20Tip();
  }, [isApproved]);


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
        if (tipData.token.address) {
            refetchAllowance();
        }
        setTipData(null);
      });
    }

    const error = tipError || approveError;
    if (error) {
      toast({
        title: 'Error',
        description: error.shortMessage || 'An unexpected error occurred.',
        variant: 'destructive',
      });
      setTipData(null);
    }
  }, [isConfirming, isConfirmed, tipError, approveError, toast, hash, address, queryClient, tipData, creatorAddress]);

  const isLoading = isSending || isConfirming || isApproving || isConfirmingApproval;

  return {
    sendTip,
    isSending: isLoading,
    isConfirming: isConfirming,
  };
}
