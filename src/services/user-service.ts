'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

export interface UserProfile {
    walletAddress: string;
    username: string;
    displayName: string;
    bio: string;
    avatar: string; // pfpUrl
    createdAt: Date;
    totalTipsReceived: number;
    totalTipsSent: number;
    isVerified: boolean;
}

export interface UserDocument extends UserProfile {
    id: string; // The walletAddress in lowercase
}


export async function getUserProfile(walletAddress: string): Promise<UserDocument | null> {
    const userDoc = await getDoc(doc(db, 'users', walletAddress.toLowerCase()));
    if (!userDoc.exists()) {
        return null;
    }
    const data = userDoc.data() as UserProfile;
    return { id: userDoc.id, ...data };
  }

export async function createUserProfile(profileData: Omit<UserProfile, 'totalTipsReceived' | 'totalTipsSent' | 'isVerified' | 'createdAt'>): Promise<void> {
    const userRef = doc(db, 'users', profileData.walletAddress.toLowerCase());
    const data: UserProfile = {
      ...profileData,
      totalTipsReceived: 0,
      totalTipsSent: 0,
      isVerified: false,
      createdAt: new Date()
    };
    await setDoc(userRef, data);
  }

export async function updateUserProfile(walletAddress: string, updates: Partial<UserProfile>): Promise<void> {
    const userRef = doc(db, 'users', walletAddress.toLowerCase());
    await updateDoc(userRef, updates);
  }

export async function getUserByUsername(username: string): Promise<UserDocument | null> {
    const usersCollection = collection(db, 'users');
    const q = query(
        usersCollection,
        where('username', '==', username),
        limit(1)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }

    const userDoc = querySnapshot.docs[0];
    return {
        id: userDoc.id,
        ...(userDoc.data() as UserProfile),
    };
  }

export async function checkUsernameAvailability(username: string): Promise<boolean> {
    const q = query(collection(db, "users"), where("username", "==", username), limit(1));
    const snapshot = await getDocs(q);
    return snapshot.empty;
  }

export async function getAllUsers(): Promise<UserDocument[]> {
    const usersCollection = collection(db, 'users');
    const querySnapshot = await getDocs(usersCollection);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as UserProfile),
    }));
  }
