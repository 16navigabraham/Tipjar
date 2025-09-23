'use server';

import { db } from '@/lib/firebase';
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, where, Timestamp } from 'firebase/firestore';

export interface Tip {
  amount: string;
  token: string;
  sender: string;
  txHash: string;
  timestamp: Date | Timestamp;
}

export interface TipLog extends Omit<Tip, 'timestamp'> {
  timestamp: Date,
}

export interface TipDocument extends Omit<Tip, 'timestamp'> {
  id: string;
  timestamp: Timestamp;
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
