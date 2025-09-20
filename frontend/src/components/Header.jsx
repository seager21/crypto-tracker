import React, { useState } from 'react';
import { RefreshCw, Wifi, WifiOff, Clock, Menu, X } from 'lucide-react';

const Header = ({ isConnected, lastUpdate, onRefresh, loading = false }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const formatTime = (date) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString();
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-crypto-dark/90 backdrop-blur-lg border-b border-gray-700/50 sticky top-0 z-50 animate-fade-in">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-crypto-green to-crypto-red bg-clip-text text-transparent truncate max-w-[200px] sm:max-w-none animate-float">
              Crypto Tracker
            </div>
            <div className="hidden sm:block text-gray-400 text-xs sm:text-sm animate-pulse-slow">
              Real-time tracking
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-1 rounded-md text-gray-400 hover:text-white focus:outline-none"
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-crypto-green" />
                  <span className="text-crypto-green text-sm">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-crypto-red" />
                  <span className="text-crypto-red text-sm">Offline</span>
                </>
              )}
            </div>

            {/* Last Update */}
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <Clock className="w-4 h-4" />
              <span>Updated: {formatTime(lastUpdate)}</span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="btn-lightning flex items-center space-x-1 py-1.5 px-3 text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-gray-700/50 space-y-4 animate-fade-in slide-up">
            {/* Connection Status */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">Connection Status:</div>
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <>
                    <Wifi className="w-4 h-4 text-crypto-green" />
                    <span className="text-crypto-green text-sm">Live</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-crypto-red" />
                    <span className="text-crypto-red text-sm">Offline</span>
                  </>
                )}
              </div>
            </div>

            {/* Last Update */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">Last Updated:</div>
              <div className="text-sm text-white">{formatTime(lastUpdate)}</div>
            </div>

            {/* Mobile Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="btn-lightning w-full flex items-center justify-center space-x-2 py-2 slide-up"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Data</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
