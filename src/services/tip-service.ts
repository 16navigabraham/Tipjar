'use server';

import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export interface Tip {
  amount: string;
  token: string;
  sender: string;
  txHash: string;
  timestamp: Date;
}

export async function logTip(tip: Omit<Tip, 'timestamp'>) {
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
