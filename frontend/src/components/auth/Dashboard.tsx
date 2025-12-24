import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import UserProfile from './UserProfile';
import Watchlist from '../Watchlist';
import CryptoPortfolioOverview from '../CryptoPortfolioOverview';
import { User, List, TrendingUp, Wallet, Heart } from 'lucide-react';

interface DashboardProps {
  cryptoData: Record<string, any> | null;
  cryptoConfig: Record<string, any>;
}

const Dashboard: React.FC<DashboardProps> = ({ cryptoData, cryptoConfig }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'watchlist' | 'portfolio' | 'profile'>('overview');
  const { currentUser, userData } = useAuth();

  // Calculate portfolio stats from current cryptoData
  const calculateStats = () => {
    if (!userData?.portfolio || !cryptoData) {
      return { currentValue: 0, totalInvested: 0, totalGain: 0, totalGainPercent: 0 };
    }

    let totalInvested = 0;
    let currentValue = 0;

    userData.portfolio.forEach((item: any) => {
      const invested = item.amount * item.purchasePrice;
      totalInvested += invested;

      // Get current price from cryptoData
      const cryptoKey = Object.keys(cryptoData).find(
        (key) => cryptoData[key]?.id === item.cryptoId
      );
      if (cryptoKey && cryptoData[cryptoKey]) {
        const currentPrice = cryptoData[cryptoKey]?.current_price || item.purchasePrice;
        currentValue += item.amount * currentPrice;
      } else {
        currentValue += invested; // Use invested amount if price not found
      }
    });

    const totalGain = currentValue - totalInvested;
    const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

    return { currentValue, totalInvested, totalGain, totalGainPercent };
  };

  const stats = calculateStats();

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {currentUser?.displayName || 'User'}! 👋
        </h1>
        <p className="text-gray-400">
          Manage your crypto portfolio, watchlist, and account settings
        </p>
      </div>

      {/* Stats Cards */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Portfolio Value</p>
                <p className="text-2xl font-bold text-white">${stats.currentValue.toFixed(2)}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-600/20 flex items-center justify-center">
                <Wallet className="text-blue-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Invested</p>
                <p className="text-2xl font-bold text-white">${stats.totalInvested.toFixed(2)}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-600/20 flex items-center justify-center">
                <TrendingUp className="text-purple-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Gain/Loss</p>
                <p className={`text-2xl font-bold ${stats.totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${stats.totalGain.toFixed(2)}
                </p>
              </div>
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                stats.totalGain >= 0 ? 'bg-green-600/20' : 'bg-red-600/20'
              }`}>
                <TrendingUp className={stats.totalGain >= 0 ? 'text-green-400' : 'text-red-400'} size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Gain %</p>
                <p className={`text-2xl font-bold ${stats.totalGainPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stats.totalGainPercent.toFixed(2)}%
                </p>
              </div>
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                stats.totalGainPercent >= 0 ? 'bg-green-600/20' : 'bg-red-600/20'
              }`}>
                <Heart className={stats.totalGainPercent >= 0 ? 'text-green-400' : 'text-red-400'} size={24} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 sticky top-6">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center p-3 rounded-lg transition font-medium ${
                  activeTab === 'overview'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <TrendingUp size={18} className="mr-3" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('watchlist')}
                className={`w-full flex items-center p-3 rounded-lg transition font-medium ${
                  activeTab === 'watchlist'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <List size={18} className="mr-3" />
                <span>Watchlist</span>
              </button>

              <button
                onClick={() => setActiveTab('portfolio')}
                className={`w-full flex items-center p-3 rounded-lg transition font-medium ${
                  activeTab === 'portfolio'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Wallet size={18} className="mr-3" />
                <span>Portfolio</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center p-3 rounded-lg transition font-medium ${
                  activeTab === 'profile'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <User size={18} className="mr-3" />
                <span>Profile</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:min-h-screen">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">📊 Recent Activity</h2>
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center text-gray-400">
                  <p>No recent transactions</p>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">⭐ Watchlist Summary</h2>
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <p className="text-gray-400 mb-4">You have {userData?.watchlist?.length || 0} coins on your watchlist</p>
                  {userData?.watchlist && userData.watchlist.length > 0 ? (
                    <div className="space-y-2">
                      {userData.watchlist.slice(0, 5).map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                          <span className="text-white">{item.name}</span>
                          <span className="text-gray-400 text-sm">{item.symbol.toUpperCase()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Start adding coins to your watchlist</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'watchlist' && (
            <Watchlist cryptoData={cryptoData} cryptoConfig={cryptoConfig} />
          )}

          {activeTab === 'portfolio' && (
            <CryptoPortfolioOverview 
              cryptoData={cryptoData} 
              cryptoConfig={cryptoConfig}
              onCryptoClick={(cryptoId) => console.log('Clicked:', cryptoId)}
            />
          )}

          {activeTab === 'profile' && <UserProfile />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
