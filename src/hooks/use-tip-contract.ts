'use client';

import { useMemo } from 'react';
import { useAccount, useClient } from 'wagmi';
import { BrowserProvider, JsonRpcSigner, ethers, type ContractTransactionResponse } from 'ethers';
import { type HttpTransport } from 'viem';
import { tipJarAbi } from '@/lib/abi/TipJar';
import { erc20Abi } from '@/lib/abi/erc20';
import { contractAddress as TIP_CONTRACT_ADDRESS } from '@/lib/config';

// Hook to get a viem PublicClient and WalletClient and convert them to ethers.js Provider and Signer
export function useEthersAdapters() {
    const client = useClient<HttpTransport>();
    const { chain, address } = useAccount();

    const provider = useMemo(() => {
        if (!client || !chain) return undefined;
        return new BrowserProvider(client, chain.id);
    }, [client, chain]);

    const signer = useMemo(() => {
        if (!provider || !address) return undefined;
        return new JsonRpcSigner(provider, address);
    }, [provider, address]);

    return { provider, signer };
}

// Main hook to be used in components
export function useTipContract() {
  const { signer } = useEthersAdapters();

  const contract = useMemo(() => {
    if (!signer) return undefined;
    return new ethers.Contract(TIP_CONTRACT_ADDRESS, tipJarAbi, signer);
  }, [signer]);

  const tipWithNative = async (recipientAddress: string, tipAmountEth: string): Promise<ContractTransactionResponse> => {
    if (!contract || !signer) throw new Error('Contract or signer not initialized');
    
    const validRecipientAddress = ethers.getAddress(recipientAddress);
    const tipAmountWei = ethers.parseEther(tipAmountEth);
    
    const tx = await contract.tipWithNative(validRecipientAddress, {
      value: tipAmountWei
    });
    return tx;
  };

  const tipWithERC20Human = async (tokenAddress: string, recipientAddress: string, humanAmount: string): Promise<ContractTransactionResponse> => {
    if (!contract || !signer) throw new Error('Contract or signer not initialized');
    
    const validTokenAddress = ethers.getAddress(tokenAddress);
    const validRecipientAddress = ethers.getAddress(recipientAddress);
    
    const tokenContract = new ethers.Contract(validTokenAddress, erc20Abi, signer);
    const decimals = await tokenContract.decimals();
    const tipAmount = ethers.parseUnits(humanAmount, decimals);

    const approveTx = await tokenContract.approve(TIP_CONTRACT_ADDRESS, tipAmount);
    await approveTx.wait(); 

    const tx = await contract.tipWithERC20(validTokenAddress, validRecipientAddress, tipAmount);
    return tx;
  };

  return { tipWithNative, tipWithERC20Human };
}
