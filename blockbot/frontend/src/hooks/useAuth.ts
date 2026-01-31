import { useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

type User = { id: number; username: string; email: string };
type LoginData = { username: string; password: string };
type RegisterData = { username: string; email: string; password: string };
type AuthError = { message: string; status?: number };

const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

const API = 'http://localhost:5050';

export function useAuth() {
  const queryClient = useQueryClient();

  const {
    isLoading,
    data: user,
    error,
  } = useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<User> => {
      const token = getToken();
      if (!token) throw new Error('No token');

      const res = await fetch(`${API}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

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
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (error) {
      removeToken();
      queryClient.setQueryData(['profile'], null);
    }
  }, [error, queryClient]);

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const res = await fetch(`${API}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: 'Login failed' }));
        const error: AuthError = {
          message: errorData.message || 'Login failed',
          status: res.status,
        };
        throw error;
      }

      return res.json();
    },
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: AuthError) => {
      console.error('Login error:', error.message);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const res = await fetch(`${API}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: 'Registration failed' }));
        const error: AuthError = {
          message: errorData.message || 'Registration failed',
          status: res.status,
        };
        throw error;
      }

      return res.json();
    },
    onSuccess: (data) => {
      if (data.token) {
        setToken(data.token);
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      }
    },
    onError: (error: AuthError) => {
      console.error('Registration error:', error.message);
    },
  });

  const logout = () => {
    removeToken();
    queryClient.setQueryData(['profile'], null);
    queryClient.clear();
  };

  const clearErrors = useCallback(() => {
    loginMutation.reset();
    registerMutation.reset();
  }, [loginMutation, registerMutation]);

  return {
    user,
    isLoggedIn: !!user,
    isLoading:
      isLoading || loginMutation.isPending || registerMutation.isPending,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout,
    clearErrors,

    loginError: loginMutation.error as AuthError | null,
    registerError: registerMutation.error as AuthError | null,

    hasToken: !!getToken(),
  };
}
