'use server';

import { db } from '@/lib/firebase';
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, where, Timestamp, getDocsFromCache } from 'firebase/firestore';
import { getPrices } from './price-service';

export interface Tip {
  receiver: string;
  amount: string;
  token: string;
  sender: string;
  txHash: string;
  timestamp: Date | Timestamp;
  message?: string;
}

export interface TipLog extends Omit<Tip, 'timestamp'> {
  timestamp: Date,
}

export interface TipDocument extends Omit<Tip, 'timestamp'> {
  id: string;
  timestamp: Timestamp;
}

export interface TopTipper {
    sender: string;
    totalAmount: number;
    // token is now irrelevant as we aggregate USD value
}


export async function logTip(tip: TipLog) {
  try {
    const docRef = await addDoc(collection(db, 'tips'), {
      ...tip,
      timestamp: serverTimestamp(),
    });
    console.log('Document written with ID: ', docRef.id);
    return { success: true, id: docRef.id };
  } catch (e) {
    console.error('Error adding document: ', e);
    return { success: false, error: 'Failed to log tip' };
  }
}

export async function getTipsBySender(sender: string): Promise<TipDocument[]> {
  try {
    const tipsCollection = collection(db, 'tips');
    const q = query(
      tipsCollection,
      where('sender', '==', sender),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const tips = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<TipDocument, 'id'>),
    }));
    return tips;
  } catch (error) {
    console.error('Error fetching tips:', error);
    return [];
  }
}

export async function getTipsByReceiver(receiver: string): Promise<TipDocument[]> {
  try {
    const tipsCollection = collection(db, 'tips');
    const q = query(
      tipsCollection,
      where('receiver', '==', receiver),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const tips = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<TipDocument, 'id'>),
    }));
    return tips;
  } catch (error) {
    console.error('Error fetching tips for creator:', error);
    return [];
  }
}

export async function getTopTippers(receiver: string, limit: number = 3): Promise<TopTipper[]> {
    try {
        const tips = await getTipsByReceiver(receiver);
        const prices = await getPrices();
        
        const tipperStats: { [sender: string]: number } = {};

        tips.forEach(tip => {
            const amount = parseFloat(tip.amount);
            const price = prices[tip.token.toLowerCase()] || 0;
            const usdValue = amount * price;

            if (!isNaN(usdValue)) {
                if (tipperStats[tip.sender]) {
                    tipperStats[tip.sender] += usdValue;
                } else {
                    tipperStats[tip.sender] = usdValue;
                }
            }
        });
        
        const sortedTippers = Object.entries(tipperStats)
            .map(([sender, totalAmount]) => ({ sender, totalAmount }))
            .sort((a, b) => b.totalAmount - a.totalAmount);
            
        return sortedTippers.slice(0, limit);

    } catch (error) {
        console.error('Error calculating top tippers:', error);
        return [];
    }
}


export async function getGlobalTopTippers(limit: number = 10): Promise<TopTipper[]> {
    try {
        const tipsCollection = collection(db, 'tips');
        const querySnapshot = await getDocs(tipsCollection);
        const prices = await getPrices();

        const tipperStats: { [sender: string]: number } = {};

        querySnapshot.forEach(doc => {
            const tip = doc.data() as Tip;
            const amount = parseFloat(tip.amount);
            const price = prices[tip.token.toLowerCase()] || 0;
            const usdValue = amount * price;

            if (!isNaN(usdValue)) {
                if (tipperStats[tip.sender]) {
                    tipperStats[tip.sender] += usdValue;
                } else {
                    tipperStats[tip.sender] = usdValue;
                }
            }
        });

        const sortedTippers = Object.entries(tipperStats)
            .map(([sender, totalAmount]) => ({ sender, totalAmount }))
            .sort((a, b) => b.totalAmount - a.totalAmount);

        return sortedTippers.slice(0, limit);

    } catch (error) {
        console.error('Error calculating global top tippers:', error);
        return [];
    }
}
