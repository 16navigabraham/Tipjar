'use client';

import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { BrowserProvider, JsonRpcSigner, ethers } from 'ethers';
import { type HttpTransport } from 'viem';
import { useClient } from 'wagmi';

// The ABI from the user's provided class
const TIP_CONTRACT_ADDRESS = '0x6a5cD29381dF74ae705d317A3C93e3489a8eaFAb';
const TIP_CONTRACT_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"TipSent","type":"event"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenAddress","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"tipWithERC20","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"tipWithNative","outputs":[],"stateMutability":"payable","type":"function"}];
const ERC20_ABI = ["function approve(address spender, uint256 amount) external returns (bool)","function allowance(address owner, address spender) external view returns (uint256)","function balanceOf(address account) external view returns (uint256)","function decimals() external view returns (uint8)"];


// The user-provided class, adapted for use in the hook
export class TipContract {
  private contract: ethers.Contract;
  private signer: ethers.Signer;

  constructor(provider: ethers.Provider, signer: ethers.Signer) {
    this.signer = signer;
    this.contract = new ethers.Contract(TIP_CONTRACT_ADDRESS, TIP_CONTRACT_ABI, signer);
  }

  async tipWithNative(recipientAddress: string, tipAmountEth: string): Promise<ethers.ContractTransactionResponse> {
    const tipAmountWei = ethers.parseEther(tipAmountEth);
    const tx = await this.contract.tipWithNative(recipientAddress, {
      value: tipAmountWei
    });
    return tx;
  }

  async tipWithERC20(
    tokenAddress: string, 
    recipientAddress: string, 
    amount: string
  ): Promise<ethers.ContractTransactionResponse> {
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.signer);
      const signerAddress = await this.signer.getAddress();
      const currentAllowance = await tokenContract.allowance(signerAddress, TIP_CONTRACT_ADDRESS);
      const tipAmount = BigInt(amount);
      
      if (currentAllowance < tipAmount) {
        const approveTx = await tokenContract.approve(TIP_CONTRACT_ADDRESS, tipAmount);
        await approveTx.wait(); // Wait for approval to be confirmed
      }
      
      const tx = await this.contract.tipWithERC20(tokenAddress, recipientAddress, tipAmount);
      return tx;
  }

  async tipWithERC20Human(
    tokenAddress: string, 
    recipientAddress: string, 
    humanAmount: string
  ): Promise<ethers.ContractTransactionResponse> {
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.signer);
      const decimals = await tokenContract.decimals();
      const amount = ethers.parseUnits(humanAmount, decimals);
      
      return await this.tipWithERC20(tokenAddress, recipientAddress, amount.toString());
  }

  async getOwner(): Promise<string> {
    return await this.contract.owner();
  }
}

// Hook to get a viem PublicClient and WalletClient
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
  const { provider, signer } = useEthersAdapters();

  const tipContract = useMemo(() => {
    if (!provider || !signer) return undefined;
    return new TipContract(provider, signer);
  }, [provider, signer]);

  return tipContract;
}
