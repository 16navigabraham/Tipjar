'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, doc, setDoc, getDoc } from 'firebase/firestore';

export interface User {
    username: string;
    walletAddress: `0x${string}`;
    pfpUrl?: string;
}

export interface UserDocument extends User {
    id: string;
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
    try {
        const userRef = doc(db, 'users', username.toLowerCase());
        const docSnap = await getDoc(userRef);
        return !docSnap.exists();
    } catch(e) {
        console.error("Error checking username availability:", e);
        return false; // Fail safe
    }
}

export async function getUserByUsername(username: string): Promise<UserDocument | null> {
    try {
        const userRef = doc(db, 'users', username.toLowerCase());
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
            return null;
        }
        
        return {
            id: docSnap.id,
            ...(docSnap.data() as User),
        };
    } catch (error) {
        console.error('Error fetching user by username:', error);
        return null;
    }
}

export async function getUserByWalletAddress(walletAddress: `0x${string}`): Promise<UserDocument | null> {
    try {
        const usersCollection = collection(db, 'users');
        const q = query(
            usersCollection,
            where('walletAddress', '==', walletAddress),
            limit(1)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null; // No user found with this wallet address
        }

        const userDoc = querySnapshot.docs[0];
        return {
            id: userDoc.id,
            ...(userDoc.data() as User),
        };
    } catch (error) {
        console.error('Error fetching user by wallet address:', error);
        return null;
    }
}

export async function createUser(user: User) {
    try {
        // Use the lowercase username as the document ID for case-insensitive lookups
        const userRef = doc(db, 'users', user.username.toLowerCase());
        
        const isAvailable = await isUsernameAvailable(user.username);
        if (!isAvailable) {
            return { success: false, error: 'Username is already taken.' };
        }

        await setDoc(userRef, {
            ...user,
            username: user.username // Keep original casing for display
        });
        return { success: true };
    } catch(e) {
        console.error('Error creating user:', e);
        return { success: false, error: 'An unexpected error occurred.' };
    }
}

export async function getAllUsers(): Promise<UserDocument[]> {
    try {
        const usersCollection = collection(db, 'users');
        const querySnapshot = await getDocs(usersCollection);
        const users = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as User),
        }));
        // Manually add the hardcoded creator to the list if not already present
        const creatorExists = users.some(u => u.walletAddress.toLowerCase() === '0x3525a342340576D4229415494848316239B27f12'.toLowerCase());
        if (!creatorExists) {
             users.push({
                id: 'creator',
                username: 'creator',
                walletAddress: '0x3525a342340576D4229415494848316239B27f12',
                pfpUrl: '',
            });
        }
        return users;
    } catch (error) {
        console.error('Error fetching all users:', error);
        return [];
    }
}
