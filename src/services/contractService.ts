'use server';
import { ethers } from 'ethers';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { TipContract } from '@/hooks/use-tip-contract';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;

export class ContractService {
  private tipContract: TipContract;
  private signer: ethers.Signer;

  constructor(signer: ethers.Signer, provider: ethers.Provider) {
    this.signer = signer;
    this.tipContract = new TipContract(provider, signer);
  }

  async tipWithNative(recipientAddress: string, amount: string, message?: string): Promise<string> {
    const tx = await this.tipContract.tipWithNative(recipientAddress, amount);
    
    // Store in Firestore
    await this.storeTipTransaction({
      fromAddress: await this.signer.getAddress(),
      toAddress: recipientAddress,
      amount: amount,
      tokenAddress: '0x0000000000000000000000000000000000000000', // Native token
      tokenSymbol: 'ETH',
      txHash: tx.hash,
      message
    });

    return tx.hash;
  }

   async tipWithERC20(tokenAddress: string, recipientAddress: string, amount: string, tokenSymbol: string, message?: string): Promise<string> {
    const tx = await this.tipContract.tipWithERC20Human(tokenAddress, recipientAddress, amount);
    
    // Store in Firestore
    await this.storeTipTransaction({
      fromAddress: await this.signer.getAddress(),
      toAddress: recipientAddress,
      amount: amount,
      tokenAddress: tokenAddress,
      tokenSymbol: tokenSymbol,
      txHash: tx.hash,
      message
    });

    return tx.hash;
  }


  private async storeTipTransaction(tipData: any): Promise<void> {
    await addDoc(collection(db, 'tips'), {
      ...tipData,
      timestamp: new Date()
    });
  }
}
