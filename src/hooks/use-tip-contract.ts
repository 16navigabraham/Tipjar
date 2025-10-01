
'use client';

import { useMemo } from 'react';
import { type BrowserProvider, type JsonRpcSigner, ethers } from 'ethers';
import { usePublicClient, useConnectorClient, useAccount } from 'wagmi';
import { type PublicClient, type WalletClient, type HttpTransport } from 'viem';
import { tipJarAbi } from '@/lib/abi/TipJar';
import { erc20Abi } from '@/lib/abi/erc20';
import { contractAddresses } from '@/lib/config';

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
    if (!walletClient || !walletClient.chain || !walletClient.account) return undefined;
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

  const provider = useMemo(() => {
    if(!publicClient) return undefined;
    return publicClientToProvider(publicClient as PublicClient)
  }, [publicClient]);

  const signer = useMemo(() => {
    if(!walletClient) return undefined;
    return walletClientToSigner(walletClient as WalletClient)
  }, [walletClient]);

  return { provider, signer };
}

// Main hook to be used in components
export function useTipContract() {
  const { signer } = useEthersAdapters();
  const { chain } = useAccount();

  const contract = useMemo(() => {
    if (!signer || !chain || !contractAddresses[chain.id]) return undefined;
    const contractAddress = contractAddresses[chain.id];
    return new ethers.Contract(contractAddress, tipJarAbi, signer);
  }, [signer, chain]);

  const tipWithNative = async (recipientAddress: string, tipAmountEth: string): Promise<ethers.ContractTransactionResponse> => {
    if (!contract || !signer) throw new Error('Contract or signer not initialized');
    
    const validRecipientAddress = ethers.getAddress(recipientAddress);
    const tipAmountWei = ethers.parseEther(tipAmountEth);
    
    const tx = await contract.tipWithNative(validRecipientAddress, {
      value: tipAmountWei
    });
    return tx;
  };

  const tipWithERC20Human = async (tokenAddress: string, recipientAddress: string, humanAmount: string, decimals: number): Promise<ethers.ContractTransactionResponse> => {
    if (!contract || !signer || !chain || !contractAddresses[chain.id]) {
      throw new Error('Contract or signer not initialized for the current chain.');
    }
    if (tokenAddress === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' || !tokenAddress) {
      throw new Error("Cannot use tipWithERC20 for native currency. Use tipWithNative instead.");
    }
    
    const validTokenAddress = ethers.getAddress(tokenAddress);
    const validRecipientAddress = ethers.getAddress(recipientAddress);
    const contractAddress = contractAddresses[chain.id];
    
    const tokenContract = new ethers.Contract(validTokenAddress, erc20Abi, signer);
    const tipAmount = ethers.parseUnits(humanAmount, decimals);

    const signerAddress = await signer.getAddress();
    const currentAllowance = await tokenContract.allowance(signerAddress, contractAddress);

    if (currentAllowance < tipAmount) {
        console.log('Approving tokens...');
        const approveTx = await tokenContract.approve(contractAddress, tipAmount);
        await approveTx.wait(); // Wait for approval to be confirmed
        console.log('Approval confirmed');
    }

    const tx = await contract.tipWithERC20(validTokenAddress, validRecipientAddress, tipAmount);
    return tx;
  };

  return { tipWithNative, tipWithERC20Human };
}
