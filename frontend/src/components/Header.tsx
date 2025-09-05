import React from 'react';
import { RefreshCw, Wifi, WifiOff, Clock } from 'lucide-react';

interface HeaderProps {
  /** Indicates whether the connection to the server is active */
  isConnected: boolean;

  /** Timestamp of the last data update */
  lastUpdate: Date | null;

  /** Callback function for manual refresh */
  onRefresh: () => void;

  /** Indicates whether data is currently loading */
  loading?: boolean;
}

/**
 * Header component that displays connection status and refresh controls
 */
const Header: React.FC<HeaderProps> = ({ isConnected, lastUpdate, onRefresh, loading = false }) => {
  /**
   * Format a date into a readable time string
   * @param date - The date to format
   * @returns Formatted time string or "Never" if no date provided
   */
  const formatTime = (date: Date | null): string => {
    if (!date) return 'Never';
    return date.toLocaleTimeString();
  };

  return (
    <header className="bg-crypto-dark/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl font-bold bg-gradient-to-r from-crypto-green to-crypto-red bg-clip-text text-transparent">
              Crypto Tracker - Koi&#39;s Version v2.4.1
            </div>
            <div className="hidden sm:block text-gray-400 text-sm">
              Real-time cryptocurrency tracking
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-crypto-green" />
                  <span className="text-crypto-green text-sm hidden sm:inline">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-crypto-red" />
                  <span className="text-crypto-red text-sm hidden sm:inline">Offline</span>
                </>
              )}
            </div>

            {/* Last Update */}
            <div className="hidden md:flex items-center space-x-1 text-gray-400 text-sm">
              <Clock className="w-4 h-4" />
              <span>Updated {formatTime(lastUpdate)}</span>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-1.5 bg-crypto-dark hover:bg-gray-800 rounded border border-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
