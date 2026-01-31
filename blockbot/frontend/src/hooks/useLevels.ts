import { useQuery } from '@tanstack/react-query';
import type { Action, CellType, Level, ObjectType } from '../types/game';

const API = 'http://localhost:5050';

const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

interface BackendLevel {
  id: number;
  name: string;
  description: string;
  pos: number;
  actions: string[];
  level_matrix: string[][];
  object_matrix: (string | null)[][];
}

export function useLevels() {
  const {
    data: levelsData,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['levels'],
    queryFn: async (): Promise<{ levels: BackendLevel[] }> => {
      const token = getToken();
      if (!token) throw new Error('No token');

      const res = await fetch(`${API}/levels`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: 'Failed to fetch levels' }));
        throw new Error(errorData.message || 'Failed to fetch levels');
      }

      return res.json();
    },
    enabled: !!getToken(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const levels: Level[] = (levelsData?.levels || []).map((level) => ({
    index: level.pos,
    name: level.name,
    description: level.description,
    actions: level.actions as Action[],
    levelMatrix: level.level_matrix as CellType[][],
    objectsMatrix: level.object_matrix as (ObjectType | null)[][],
  }));

  const getLevelByIndex = (index: number): Level | undefined => {
    return levels.find((level) => level.index === index);
  };

  return {
    levels,
    loading,
    error: error?.message || null,
    getLevelByIndex,
  };
}
