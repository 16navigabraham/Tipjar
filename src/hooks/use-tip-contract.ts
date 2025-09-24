
'use client';

import { useMemo } from 'react';
import { BrowserProvider, JsonRpcSigner, ethers, type ContractTransactionResponse } from 'ethers';
import { useAccount, useClient } from 'wagmi';
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

// Helper function to safely validate and checksum addresses
function validateAddress(address: string): string {
    try {
      return ethers.getAddress(address);
    } catch (error) {
        console.warn(`Invalid address checksum: ${address}, attempting to correct.`);
        try {
            // If that fails, try with lowercase (some addresses need this)
            return ethers.getAddress(address.toLowerCase());
        } catch (secondError) {
            throw new Error(`Invalid address format: ${address}`);
        }
    }
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
    
    const validRecipientAddress = validateAddress(recipientAddress);
    const tipAmountWei = ethers.parseEther(tipAmountEth);
    
    const tx = await contract.tipWithNative(validRecipientAddress, {
      value: tipAmountWei
    });
    return tx;
  };

  const tipWithERC20Human = async (tokenAddress: string, recipientAddress: string, humanAmount: string, decimals: number): Promise<ContractTransactionResponse> => {
    if (!contract || !signer) throw new Error('Contract or signer not initialized');
    
    const validTokenAddress = validateAddress(tokenAddress);
    const validRecipientAddress = validateAddress(recipientAddress);
    
    const tokenContract = new ethers.Contract(validTokenAddress, erc20Abi, signer);
    const tipAmount = ethers.parseUnits(humanAmount, decimals);

    const signerAddress = await signer.getAddress();
    const currentAllowance = await tokenContract.allowance(signerAddress, TIP_CONTRACT_ADDRESS);

    if (currentAllowance < tipAmount) {
        const approveTx = await tokenContract.approve(TIP_CONTRACT_ADDRESS, tipAmount);
        await approveTx.wait(); // Wait for approval to be confirmed
    }

    const tx = await contract.tipWithERC20(validTokenAddress, validRecipientAddress, tipAmount);
    return tx;
  };

  return { tipWithNative, tipWithERC20Human };
}
