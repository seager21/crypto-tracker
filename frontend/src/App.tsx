import React, { useState, useEffect } from 'react';
import { Activity, BarChart, Grid, Newspaper } from 'lucide-react';

// Components
import LoadingSpinner from './components/LoadingSpinner';
import CryptoCard from './components/CryptoCard';
import InteractivePriceChart from './components/InteractivePriceChart';
import CryptoDetailPage from './components/CryptoDetailPage';
import CryptoPortfolioOverview from './components/CryptoPortfolioOverview';
import CryptoNews from './components/CryptoNews';
import Header from './components/Header';
import ErrorBoundary from './components/ErrorBoundary';

// Types
import { CryptoConfig, PriceHistoryPoint } from './types';

// Context
import { useCrypto, CryptoProvider } from './context/CryptoContext';

/**
 * Main application component wrapped with providers
 */
const AppContainer: React.FC = () => {
  return (
    <ErrorBoundary>
      <CryptoProvider>
        <AppContent />
      </CryptoProvider>
    </ErrorBoundary>
  );
};

/**
 * Main application content that uses the crypto context
 */
const AppContent: React.FC = () => {
  // Get data from context
  const { cryptoData, loading, isConnected, lastUpdate, refreshData } = useCrypto();

  const [priceHistory, setPriceHistory] = useState<PriceHistoryPoint[]>([]);
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'chart' | 'portfolio' | 'news'>('overview');

  // Configuration for all cryptocurrencies
  const cryptoConfig: Record<string, CryptoConfig> = {
    bitcoin: { 
      name: 'Bitcoin', 
      symbol: 'BTC', 
      icon: '₿', 
      color: '#F59E0B', 
      cardColor: 'orange',
    },
    ethereum: { 
      name: 'Ethereum', 
      symbol: 'ETH', 
      icon: '♦', 
      color: '#3B82F6', 
      cardColor: 'blue',
    },
    cardano: { 
      name: 'Cardano', 
      symbol: 'ADA', 
      icon: '♠', 
      color: '#10B981', 
      cardColor: 'green',
    },
    polkadot: { 
      name: 'Polkadot', 
      symbol: 'DOT', 
      icon: '●', 
      color: '#8B5CF6', 
      cardColor: 'purple',
    },
    chainlink: { 
      name: 'Chainlink', 
      symbol: 'LINK', 
      icon: '🔗', 
      color: '#EF4444', 
      cardColor: 'red',
    },
    litecoin: { 
      name: 'Litecoin', 
      symbol: 'LTC', 
      icon: 'Ł', 
      color: '#A7A9AC', 
      cardColor: 'slate',
    },
    binancecoin: { 
      name: 'Binance Coin', 
      symbol: 'BNB', 
      icon: '🅑', 
      color: '#F3BA2F', 
      cardColor: 'amber',
    },
    solana: { 
      name: 'Solana', 
      symbol: 'SOL', 
      icon: '◎', 
      color: '#9945FF', 
      cardColor: 'violet',
    },
    dogecoin: { 
      name: 'Dogecoin', 
      symbol: 'DOGE', 
      icon: '🐕', 
      color: '#C2A633', 
      cardColor: 'yellow',
    },
    ripple: { 
      name: 'XRP', 
      symbol: 'XRP', 
      icon: '✕', 
      color: '#23292F', 
      cardColor: 'gray',
    },
    'avalanche-2': { 
      name: 'Avalanche', 
      symbol: 'AVAX', 
      icon: '🏔', 
      color: '#E84142', 
      cardColor: 'red',
    },
    polygon: { 
      name: 'Polygon', 
      symbol: 'MATIC', 
      icon: '🔷', 
      color: '#8247E5', 
      cardColor: 'purple',
    },
    // Additional cryptocurrencies
    uniswap: { 
      name: 'Uniswap', 
      symbol: 'UNI', 
      icon: '🦄', 
      color: '#FF007A', 
      cardColor: 'pink',
    },
    cosmos: { 
      name: 'Cosmos', 
      symbol: 'ATOM', 
      icon: '⚛️', 
      color: '#2E3148', 
      cardColor: 'slate',
    },
    stellar: { 
      name: 'Stellar', 
      symbol: 'XLM', 
      icon: '⭐', 
      color: '#7D00FF', 
      cardColor: 'indigo',
    },
    filecoin: { 
      name: 'Filecoin', 
      symbol: 'FIL', 
      icon: '📁', 
      color: '#0090FF', 
      cardColor: 'blue',
    },
    aave: { 
      name: 'Aave', 
      symbol: 'AAVE', 
      icon: '👻', 
      color: '#B6509E', 
      cardColor: 'pink',
    },
    algorand: { 
      name: 'Algorand', 
      symbol: 'ALGO', 
      icon: '🔺', 
      color: '#000000', 
      cardColor: 'gray',
    },
    vechain: { 
      name: 'VeChain', 
      symbol: 'VET', 
      icon: '⚡', 
      color: '#15BDFF', 
      cardColor: 'sky',
    },
    'hedera-hashgraph': { 
      name: 'Hedera', 
      symbol: 'HBAR', 
      icon: '🔷', 
      color: '#000000', 
      cardColor: 'gray',
    },
    'theta-token': { 
      name: 'Theta Network', 
      symbol: 'THETA', 
      icon: '🎥', 
      color: '#2AB8E6', 
      cardColor: 'cyan',
    },
    'the-sandbox': { 
      name: 'The Sandbox', 
      symbol: 'SAND', 
      icon: '🏖️', 
      color: '#00D4FF', 
      cardColor: 'sky',
    },
  };

  useEffect(() => {
    if (cryptoData) {
      // Add to price history for charts
      const timestamp = new Date().toLocaleTimeString();
      setPriceHistory(prev => {
        const newHistory = [...prev, {
          time: timestamp,
          ...Object.keys(cryptoConfig).reduce((acc: Record<string, number>, key) => {
            const apiKey = key === 'avalanche-2' ? 'avalanche-2' : key;
            acc[key] = cryptoData[apiKey]?.usd || 0;
            return acc;
          }, {})
        }];
        // Keep only last 20 data points
        return newHistory.slice(-20);
      });
    }
  }, [cryptoData]);

  /**
   * Calculate the total market value of all tracked cryptocurrencies
   */
  const getTotalMarketValue = (): number => {
    if (!cryptoData) return 0;
    
    return Object.keys(cryptoConfig).reduce((total, key) => {
      const apiKey = key === 'avalanche-2' ? 'avalanche-2' : key;
      const marketCap = cryptoData[apiKey]?.usd_market_cap || 0;
      return total + marketCap / 1000000000; // Convert to billions
    }, 0);
  };

  /**
   * Count active cryptocurrencies with price data
   */
  const getActiveCryptos = (): number => {
    if (!cryptoData) return 0;
    
    return Object.keys(cryptoConfig).filter(key => {
      const apiKey = key === 'avalanche-2' ? 'avalanche-2' : key;
      return cryptoData[apiKey]?.usd > 0;
    }).length;
  };

  /**
   * Find the cryptocurrency with highest 24h price change
   */
  const getTopPerformer = (): string => {
    if (!cryptoData) return 'N/A';
    
    let topPerformer = null;
    let maxChange = -Infinity;
    
    Object.keys(cryptoConfig).forEach(key => {
      const apiKey = key === 'avalanche-2' ? 'avalanche-2' : key;
      const change = cryptoData[apiKey]?.usd_24h_change || 0;
      
      if (change > maxChange) {
        maxChange = change;
        topPerformer = cryptoConfig[key].name;
      }
    });
    
    return topPerformer || 'N/A';
  };

  // Render loading spinner when loading
  if (loading && !cryptoData) {
    return (
      <div className="min-h-screen bg-crypto-dark text-white p-6 flex flex-col">
        <Header 
          isConnected={isConnected}
          lastUpdate={lastUpdate}
          onRefresh={refreshData}
        />
        <div className="flex-grow flex items-center justify-center">
          <LoadingSpinner size="xl" message="Loading cryptocurrency data..." />
        </div>
      </div>
    );
  }

  // Render crypto detail view when a crypto is selected
  if (selectedCrypto) {
    const apiKey = selectedCrypto === 'avalanche-2' ? 'avalanche-2' : selectedCrypto;
    const cryptoInfo = cryptoConfig[selectedCrypto];
    const cryptoDetails = cryptoData?.[apiKey];
    
    return (
      <div className="min-h-screen bg-crypto-dark text-white p-6 flex flex-col">
        <Header 
          isConnected={isConnected}
          lastUpdate={lastUpdate}
          onRefresh={refreshData}
        />
        <button 
          className="text-white mb-4 flex items-center space-x-2 hover:text-crypto-blue transition-colors"
          onClick={() => setSelectedCrypto(null)}
        >
          <span>← Back to Overview</span>
        </button>
        
        {cryptoDetails && cryptoInfo && (
          <CryptoDetailPage 
            cryptoId={selectedCrypto}
            onBack={() => setSelectedCrypto(null)}
            name={cryptoInfo.name}
            symbol={cryptoInfo.symbol}
            icon={cryptoInfo.icon}
            color={cryptoInfo.color}
            price={cryptoDetails.usd}
            change24h={cryptoDetails.usd_24h_change}
            marketCap={cryptoDetails.usd_market_cap}
            volume={cryptoDetails.usd_24h_vol}
            lastUpdated={new Date(cryptoDetails.last_updated_at * 1000)}
          />
        )}
      </div>
    );
  }

  // Render main view
  return (
    <div className="min-h-screen bg-crypto-dark text-white p-6 flex flex-col">
      <Header 
        isConnected={isConnected}
        lastUpdate={lastUpdate}
        onRefresh={refreshData}
      />
      
      {/* Navigation */}
      <div className="mb-6 flex flex-wrap justify-center gap-2 sm:gap-4">
        <button 
          className={`nav-button flex items-center space-x-2 ${activeView === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveView('overview')}
        >
          <Grid className="w-5 h-5" />
          <span className="hidden sm:inline">Overview</span>
        </button>
        
        <button 
          className={`nav-button flex items-center space-x-2 ${activeView === 'chart' ? 'active' : ''}`}
          onClick={() => setActiveView('chart')}
        >
          <BarChart className="w-5 h-5" />
          <span className="hidden sm:inline">Charts</span>
        </button>
        
        <button 
          className={`nav-button flex items-center space-x-2 ${activeView === 'portfolio' ? 'active' : ''}`}
          onClick={() => setActiveView('portfolio')}
        >
          <Activity className="w-5 h-5" />
          <span className="hidden sm:inline">Portfolio</span>
        </button>
        
        <button 
          className={`nav-button flex items-center space-x-2 ${activeView === 'news' ? 'active' : ''}`}
          onClick={() => setActiveView('news')}
        >
          <Newspaper className="w-5 h-5" />
          <span className="hidden sm:inline">News</span>
        </button>
      </div>
      
      {/* Market Overview */}
      {activeView === 'overview' && cryptoData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="stat-card">
              <h3 className="text-gray-400 mb-1">Total Market Value</h3>
              <div className="text-2xl font-bold">${getTotalMarketValue().toFixed(2)}B</div>
            </div>
            
            <div className="stat-card">
              <h3 className="text-gray-400 mb-1">Active Cryptocurrencies</h3>
              <div className="text-2xl font-bold">{getActiveCryptos()}</div>
            </div>
            
            <div className="stat-card">
              <h3 className="text-gray-400 mb-1">Top Performer (24h)</h3>
              <div className="text-2xl font-bold">{getTopPerformer()}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Object.keys(cryptoConfig).map(key => {
              const apiKey = key === 'avalanche-2' ? 'avalanche-2' : key;
              const data = cryptoData[apiKey];
              
              if (!data) return null;
              
              return (
                <CryptoCard
                  key={key}
                  name={cryptoConfig[key].name}
                  symbol={cryptoConfig[key].symbol}
                  price={data.usd}
                  change24h={data.usd_24h_change}
                  marketCap={data.usd_market_cap}
                  icon={cryptoConfig[key].icon}
                  color={cryptoConfig[key].cardColor}
                  onClick={() => setSelectedCrypto(key)}
                  cryptoId={key}
                />
              );
            })}
          </div>
        </>
      )}
      
      {/* Chart View */}
      {activeView === 'chart' && priceHistory.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Price Trends</h2>
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
            <InteractivePriceChart data={priceHistory} cryptoConfig={cryptoConfig} />
          </div>
        </div>
      )}
      
      {/* Portfolio View */}
      {activeView === 'portfolio' && (
        <CryptoPortfolioOverview 
          cryptoData={cryptoData} 
          cryptoConfig={cryptoConfig}
          onCryptoClick={setSelectedCrypto}
        />
      )}
      
      {/* News View */}
      {activeView === 'news' && (
        <ErrorBoundary fallback={
          <div className="p-6 bg-red-900/20 border border-red-500/50 rounded-lg text-center">
            <h2 className="text-xl font-bold text-red-300 mb-2">Failed to load news</h2>
            <p className="text-red-200">Unable to fetch the latest cryptocurrency news. Please try again later.</p>
          </div>
        }>
          <CryptoNews />
        </ErrorBoundary>
      )}
    </div>
  );
};

export default AppContainer;
