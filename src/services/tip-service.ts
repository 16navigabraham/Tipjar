'use server';

import { db } from '@/lib/firebase';
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, where, Timestamp, limit as firestoreLimit } from 'firebase/firestore';

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
    token: string;
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
        
        const tipperStats: { [sender: string]: { [token: string]: number } } = {};

        tips.forEach(tip => {
            const amount = parseFloat(tip.amount);
            if (!isNaN(amount)) {
                if (!tipperStats[tip.sender]) {
                    tipperStats[tip.sender] = {};
                }
                if (tipperStats[tip.sender][tip.token]) {
                    tipperStats[tip.sender][tip.token] += amount;
                } else {
                    tipperStats[tip.sender][tip.token] = amount;
                }
            }
        });
        
        const allTippers: TopTipper[] = [];
        Object.entries(tipperStats).forEach(([sender, tokenAmounts]) => {
            Object.entries(tokenAmounts).forEach(([token, totalAmount]) => {
                if(token === 'ETH') { // only show ETH for now
                     allTippers.push({ sender, totalAmount, token });
                }
            });
        });

        const sortedTippers = allTippers
            .sort((a, b) => b.totalAmount - a.totalAmount);
            
        return sortedTippers.slice(0, limit);

    } catch (error) {
        console.error('Error calculating top tippers:', error);
        return [];
    }
}
