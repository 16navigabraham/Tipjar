'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, doc, setDoc } from 'firebase/firestore';

export interface User {
    username: string;
    walletAddress: `0x${string}`;
}

export interface UserDocument extends User {
    id: string;
}

export async function getUserByUsername(username: string): Promise<UserDocument | null> {
    try {
        // This is a placeholder for a real user lookup.
        // In a real app, you would query your 'users' collection.
        if (username === 'creator') {
            return {
                id: '1',
                username: 'creator',
                walletAddress: '0x3525a342340576D4229415494848316239B27f12', // Replace with a real address if needed
            };
        }

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
            ...(userDoc.data() as User),
        };
    } catch (error) {
        console.error('Error fetching user by username:', error);
        return null;
    }
}

// Helper function to add a user to firestore - you might not need this in production
// if you manage users differently.
export async function createUser(user: User) {
    try {
        const userRef = doc(db, 'users', user.username);
        await setDoc(userRef, user);
        return { success: true };
    } catch(e) {
        console.error('Error creating user:', e);
        return { success: false };
    }
}
