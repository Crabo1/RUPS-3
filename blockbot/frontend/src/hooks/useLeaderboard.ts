import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

type Leaderboard = {
  id: number;
  name: string;
  creator: number;
  createdAt: string;
};

export type LeaderboardRow = {
  id: number;
  user: string;
  total_stars: number;
};

type CreateLeaderboardData = {
  name: string;
};

type LeaderboardError = {
  message: string;
  status?: number;
};

const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

const API = 'http://localhost:5050';

export function useLeaderboard() {
  const queryClient = useQueryClient();

  const {
    isLoading,
    data: leaderboard,
    error,
    refetch,
  } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async (): Promise<Leaderboard | null> => {
      const token = getToken();
      if (!token) throw new Error('No token');

      const res = await fetch(`${API}/leaderboard/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 404) {
        return null;
      }

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: 'Unknown error' }));
        throw new Error(
          errorData.message || `HTTP ${res.status}: ${res.statusText}`,
        );
      }

      return res.json();
    },
    enabled: !!getToken(),
    retry: false,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  const {
    data: leaderboardRows,
    isLoading: isLoadingRows,
    error: rowsError,
  } = useQuery({
    queryKey: ['leaderboard-rows'],
    queryFn: async (): Promise<LeaderboardRow[]> => {
      const token = getToken();
      if (!token) throw new Error('No token');

      const res = await fetch(`${API}/leaderboard/rows`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: 'Failed to fetch leaderboard rows' }));
        throw new Error(
          errorData.message || `HTTP ${res.status}: ${res.statusText}`,
        );
      }

      return res.json();
    },
    enabled: !!getToken() && !!leaderboard,
    retry: false,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateLeaderboardData) => {
      const token = getToken();
      if (!token) throw new Error('No token');

      const res = await fetch(`${API}/leaderboard/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: 'Failed to create leaderboard' }));
        const error: LeaderboardError = {
          message: errorData.message || 'Failed to create leaderboard',
          status: res.status,
        };
        throw error;
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
    onError: (error: LeaderboardError) => {
      console.error('Create leaderboard error:', error.message);
    },
  });

  const joinMutation = useMutation({
    mutationFn: async (leaderboardId: number) => {
      const token = getToken();
      if (!token) throw new Error('No token');

      const res = await fetch(`${API}/leaderboard/join/${leaderboardId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: 'Failed to join leaderboard' }));
        const error: LeaderboardError = {
          message: errorData.message || 'Failed to join leaderboard',
          status: res.status,
        };
        throw error;
      }

      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
    onError: (error: LeaderboardError) => {
      console.error('Join leaderboard error:', error.message);
    },
  });

  return {
    leaderboard,
    isLoading,
    error,
    refetch,
    leaderboardRows: leaderboardRows || [],
    isLoadingRows,
    rowsError,
    createLeaderboard: createMutation.mutateAsync,
    joinLeaderboard: joinMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isJoining: joinMutation.isPending,
    createError: createMutation.error as LeaderboardError | null,
    joinError: joinMutation.error as LeaderboardError | null,
  };
}
