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
    
    const checkedRecipient = ethers.getAddress(recipientAddress);
    const tipAmountWei = ethers.parseEther(tipAmountEth);
    
    const tx = await contract.tipWithNative(checkedRecipient, {
      value: tipAmountWei
    });
    return tx;
  };

  const tipWithERC20 = async (tokenAddress: string, recipientAddress: string, amount: string): Promise<ContractTransactionResponse> => {
    if (!contract || !signer) throw new Error('Contract or signer not initialized');

    const checkedTokenAddress = ethers.getAddress(tokenAddress);
    const checkedRecipientAddress = ethers.getAddress(recipientAddress);
    
    const tokenContract = new ethers.Contract(checkedTokenAddress, erc20Abi, signer);
    const signerAddress = await signer.getAddress();
    const currentAllowance = await tokenContract.allowance(signerAddress, TIP_CONTRACT_ADDRESS);
    const tipAmount = BigInt(amount);

    if (currentAllowance < tipAmount) {
      const approveTx = await tokenContract.approve(TIP_CONTRACT_ADDRESS, tipAmount);
      await approveTx.wait(); 
    }

    const tx = await contract.tipWithERC20(checkedTokenAddress, checkedRecipientAddress, tipAmount);
    return tx;
  };
  
  const tipWithERC20Human = async (tokenAddress: string, recipientAddress: string, humanAmount: string): Promise<ContractTransactionResponse> => {
    if (!signer) throw new Error('Signer not initialized');
    
    const checkedTokenAddress = ethers.getAddress(tokenAddress);
    const tokenContract = new ethers.Contract(checkedTokenAddress, erc20Abi, signer);
    const decimals = await tokenContract.decimals();
    const amount = ethers.parseUnits(humanAmount, decimals);
    
    return await tipERC20(tokenAddress, recipientAddress, amount.toString());
  };

  return { tipWithNative, tipWithERC20Human };
}
