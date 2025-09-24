
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { UserProfile, getUserProfile, createUserProfile as createUserProfileService } from '@/services/user-service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export const useApp = () => {
  const { address, isConnected } = useAccount();
  const [isNewUser, setIsNewUser] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: userProfile, isLoading: loading } = useQuery({
    queryKey: ['userProfile', address],
    queryFn: async () => {
        if (!address) return null;
        const profile = await getUserProfile(address);
        if (profile) {
            setIsNewUser(false);
            return profile;
        } else {
            setIsNewUser(true);
            return null;
        }
    },
    enabled: isConnected && !!address,
  });

  const createProfile = async (profileData: Omit<UserProfile, 'walletAddress' | 'totalTipsReceived' | 'totalTipsSent' | 'isVerified' | 'createdAt'>) => {
    if (!address) throw new Error("Wallet not connected");
    
    try {
      await createUserProfileService({
        walletAddress: address,
        ...profileData
      });
      await queryClient.invalidateQueries({ queryKey: ['userProfile', address] });
      setIsNewUser(false);
      router.push('/leaderboard');
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  };

  return {
    isConnected,
    address,
    userProfile,
    isNewUser,
    loading,
    createProfile,
  };
};
