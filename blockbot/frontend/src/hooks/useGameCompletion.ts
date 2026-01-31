import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const API = 'http://localhost:5050';

const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

interface CompleteGameRequest {
  blocks_used: string;
  stars?: number;
  completed: boolean;
}

interface CompletedGame {
  level: number;
  stars: number;
}

export function useGameCompletion() {
  const queryClient = useQueryClient();

  const {
    data: completedGames,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['completed-games'],
    queryFn: async (): Promise<CompletedGame[]> => {
      const token = getToken();
      if (!token) throw new Error('No token');

      const res = await fetch(`${API}/game`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: 'Failed to fetch completed games' }));
        throw new Error(errorData.message || 'Failed to fetch completed games');
      }

      return res.json();
    },
    enabled: !!getToken(),
    retry: false,
    staleTime: 30 * 1000,
  });

  const completeGameMutation = useMutation({
    mutationFn: async ({
      gameId,
      data,
    }: {
      gameId: number;
      data: CompleteGameRequest;
    }) => {
      const token = getToken();
      if (!token) throw new Error('No token');

      const res = await fetch(`${API}/game/completed/${gameId}`, {
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
          .catch(() => ({ message: 'Failed to complete game' }));
        throw new Error(errorData.message || 'Failed to complete game');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['completed-games'] });
    },
  });

  return {
    completedGames: completedGames || [],
    isLoading,
    error,
    completeGame: completeGameMutation.mutateAsync,
    isCompleting: completeGameMutation.isPending,
    completeError: completeGameMutation.error,
  };
}
