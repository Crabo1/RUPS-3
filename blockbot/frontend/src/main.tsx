import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './styles/global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      onError: (error: Error & { status?: number }) => {
        // Check if the error is a 401 Unauthorized
        if (error?.message?.includes('401') || error?.status === 401) {
          localStorage.removeItem('token');
          queryClient.setQueryData(['profile'], null);
          queryClient.clear();
          window.location.href = '/auth?mode=login';
        }
      },
    },
    mutations: {
      onError: (error: Error & { status?: number }) => {
        // Check if the error is a 401 Unauthorized
        if (error?.message?.includes('401') || error?.status === 401) {
          localStorage.removeItem('token');
          queryClient.setQueryData(['profile'], null);
          queryClient.clear();
          window.location.href = '/auth?mode=login';
        }
      },
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
