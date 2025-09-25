
'use client';

import { useMemo } from 'react';
import { type BrowserProvider, type JsonRpcSigner, ethers } from 'ethers';
import { usePublicClient, useConnectorClient } from 'wagmi';
import { type PublicClient, type WalletClient, type HttpTransport } from 'viem';
import { tipJarAbi } from '@/lib/abi/TipJar';
import { erc20Abi } from '@/lib/abi/erc20';
import { contractAddress as TIP_CONTRACT_ADDRESS } from '@/lib/config';

// Hook to get a viem PublicClient and WalletClient and convert them to ethers.js Provider and Signer
function publicClientToProvider(publicClient: PublicClient) {
  if (!publicClient || !publicClient.chain) return undefined;
  const { chain, transport } = publicClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  if (transport.type === 'fallback')
    return new ethers.FallbackProvider(
      (transport.transports as ReturnType<HttpTransport>[]).map(
        ({ value }) => new ethers.JsonRpcProvider(value?.url, network)
      )
    );
  return new ethers.JsonRpcProvider(transport.url, network);
}

function walletClientToSigner(walletClient: WalletClient) {
    if (!walletClient || !walletClient.chain) return undefined;
    const { account, chain, transport } = walletClient;
    const network = {
        chainId: chain.id,
        name: chain.name,
        ensAddress: chain.contracts?.ensRegistry?.address,
    };
    const provider = new ethers.BrowserProvider(transport, network);
    const signer = new ethers.JsonRpcSigner(provider, account.address);
    return signer;
}

export function useEthersAdapters() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useConnectorClient();

  const provider = useMemo(() => publicClientToProvider(publicClient as PublicClient), [publicClient]);
  const signer = useMemo(() => walletClientToSigner(walletClient as WalletClient), [walletClient]);

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

  const tipWithNative = async (recipientAddress: string, tipAmountEth: string): Promise<ethers.ContractTransactionResponse> => {
    if (!contract || !signer) throw new Error('Contract or signer not initialized');
    
    const validRecipientAddress = validateAddress(recipientAddress);
    const tipAmountWei = ethers.parseEther(tipAmountEth);
    
    const tx = await contract.tipWithNative(validRecipientAddress, {
      value: tipAmountWei
    });
    return tx;
  };

  const tipWithERC20Human = async (tokenAddress: string, recipientAddress: string, humanAmount: string, decimals: number): Promise<ethers.ContractTransactionResponse> => {
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
