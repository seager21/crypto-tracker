import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
}

interface ApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  makeRequest: (url: string, options?: ApiOptions) => Promise<T | null>;
}

export function useApi<T>(): ApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const makeRequest = useCallback(
    async (url: string, options: ApiOptions = {}): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        // Add auth header if user is logged in
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...options.headers,
        };

        if (currentUser) {
          // Normally we'd include the JWT token here
          // In our app, Firebase handles this for us
          // But you would typically do something like:
          // headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(url, {
          method: options.method || 'GET',
          headers,
          body: options.body ? JSON.stringify(options.body) : undefined,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
        return result;
      } catch (err: any) {
        const errorMessage = err.message || 'An unknown error occurred';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [currentUser]
  );

  return { data, loading, error, makeRequest };
}
