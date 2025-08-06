import React from 'react';
import { RefreshCw, Wifi, WifiOff, Clock } from 'lucide-react';

const Header = ({ isConnected, lastUpdate, onRefresh, loading = false }) => {
  const formatTime = (date) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString();
  };

  return (
    <header className="bg-crypto-dark/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl font-bold bg-gradient-to-r from-crypto-green to-crypto-red bg-clip-text text-transparent">
              Crypto Tracker - Koi's Version v1.0.0
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
            <div className="flex items-center space-x-2 text-gray-400 text-sm hidden md:flex">
              <Clock className="w-4 h-4" />
              <span>Updated: {formatTime(lastUpdate)}</span>
            </div>
            
            {/* Refresh Button */}
            <button 
              onClick={onRefresh}
              disabled={loading}
              className={`btn-primary flex items-center space-x-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{loading ? 'Loading...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
