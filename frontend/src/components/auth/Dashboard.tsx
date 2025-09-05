import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import UserProfile from './UserProfile';
import Watchlist from '../Watchlist';
import CryptoPortfolioOverview from '../CryptoPortfolioOverview';
import { User, Settings, List } from 'lucide-react';

interface DashboardProps {
  cryptoData: Record<string, any> | null;
  cryptoConfig: Record<string, any>;
}

const Dashboard: React.FC<DashboardProps> = ({ cryptoData, cryptoConfig }) => {
  const [activeTab, setActiveTab] = useState<'watchlist' | 'portfolio' | 'profile'>('watchlist');
  const { currentUser } = useAuth();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-gray-900 rounded-xl p-6 mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">
          Welcome, {currentUser?.displayName || 'User'}
        </h1>
        <p className="text-gray-400">
          Manage your crypto watchlist, portfolio, and account settings
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/4">
          <div className="bg-gray-800 rounded-xl p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('watchlist')}
                className={`w-full flex items-center p-3 rounded-lg transition ${
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
                className={`w-full flex items-center p-3 rounded-lg transition ${
                  activeTab === 'portfolio'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Settings size={18} className="mr-3" />
                <span>Portfolio</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center p-3 rounded-lg transition ${
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

        <div className="md:w-3/4">
          {activeTab === 'watchlist' && (
            <Watchlist cryptoData={cryptoData} cryptoConfig={cryptoConfig} />
          )}

          {activeTab === 'portfolio' && (
            <CryptoPortfolioOverview cryptoData={cryptoData} cryptoConfig={cryptoConfig} />
          )}

          {activeTab === 'profile' && <UserProfile />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
