import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

export type Challenge = {
  id: number;
  challenger_id: number;
  challengee_id: number;
  challenger_username: string;
  challengee_username: string;
  accepted: boolean;
};

export const useUserChallenge = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchChallenges = useCallback(async () => {
    if (!user) {
      setChallenges([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5050/challenges', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('API Response status:', res.status);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch challenges');
      }

      const data = await res.json();
      console.log('Fetched challenges:', data.challenges);

      setChallenges(data.challenges || []);
    } catch (error) {
      console.error('Failed to load challenges:', error);
      setChallenges([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  return { challenges, isLoading, refetch: fetchChallenges };
};
export default useUserChallenge;