import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CryptoData, CryptoConfig } from '../types';

// Define the context state shape
interface CryptoContextState {
  cryptoData: Record<string, CryptoData> | null;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  isConnected: boolean;
  refreshData: () => void;
}

// Create a context with default values
const CryptoContext = createContext<CryptoContextState>({
  cryptoData: null,
  loading: true,
  error: null,
  lastUpdate: null,
  isConnected: false,
  refreshData: () => {},
});

interface CryptoProviderProps {
  children: ReactNode;
}

/**
 * Provider component that makes crypto data available to any
 * child component that calls the useCrypto hook.
 */
export const CryptoProvider: React.FC<CryptoProviderProps> = ({ children }) => {
  const [cryptoData, setCryptoData] = useState<Record<string, CryptoData> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const fetchCryptoData = async (retryCount = 0): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch('/api/crypto', {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setCryptoData(data);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch crypto data:', error);

      // Retry logic
      if (retryCount < 2 && error instanceof Error && error.name !== 'AbortError') {
        const delay = (retryCount + 1) * 2000;
        console.log(`Retrying in ${delay}ms... (attempt ${retryCount + 1}/2)`);
        setTimeout(() => {
          fetchCryptoData(retryCount + 1);
        }, delay);
      } else {
        setLoading(false);
        setError('Failed to load cryptocurrency data. Please try again later.');
      }
    }
  };

  useEffect(() => {
    // Fetch data on initial load
    fetchCryptoData();

    // Set up WebSocket connection
    // (Placeholder for WebSocket implementation)
    setIsConnected(true);

    // Clean up function
    return () => {
      // Disconnect WebSocket
      setIsConnected(false);
    };
  }, []);

  const refreshData = (): void => {
    fetchCryptoData();
  };

  const value = {
    cryptoData,
    loading,
    error,
    lastUpdate,
    isConnected,
    refreshData,
  };

  return <CryptoContext.Provider value={value}>{children}</CryptoContext.Provider>;
};

/**
 * Custom hook that provides access to crypto data context
 */
export const useCrypto = (): CryptoContextState => {
  const context = useContext(CryptoContext);

  if (context === undefined) {
    throw new Error('useCrypto must be used within a CryptoProvider');
  }

  return context;
};
