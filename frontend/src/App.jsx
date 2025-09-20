import React, { useState, useEffect } from 'react';
import LoadingSpinner from './components/LoadingSpinner';
import { io } from 'socket.io-client';
import CryptoCard from './components/CryptoCard';
import InteractivePriceChart from './components/InteractivePriceChart';
import CryptoDetailPage from './components/CryptoDetailPage';
import CryptoPortfolioOverview from './components/CryptoPortfolioOverview';
import CryptoNewsCarousel from './components/CryptoNewsCarousel';
import Header from './components/Header';
import SettingsPanel from './components/SettingsPanel';
import FallingCoins from './components/FallingCoins';
import PortfolioHoldings from './components/PortfolioHoldings';
import TransactionHistory from './components/TransactionHistory';
import PerformanceVisualization from './components/PerformanceVisualization';
import DataExport from './components/DataExport';
import { PortfolioProvider } from './context/PortfolioContext';
import {
  TrendingUp,
  Activity,
  BarChart,
  Grid,
  List,
  Newspaper,
  Wallet,
  History,
  LineChart,
  Download,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LocalizationProvider, useLocalization } from './context/LocalizationContext';
import './i18n';

function AppContent() {
  const { t } = useTranslation();
  const { settings, formatCurrency } = useLocalization();
  const [cryptoData, setCryptoData] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [activeView, setActiveView] = useState('overview'); // 'overview', 'chart', 'portfolio', 'holdings', 'transactions', 'performance', 'export', 'news'
  const [showCoins] = useState(true); // Control the coin animation

  // Configuration for all cryptocurrencies (22 total)
  const cryptoConfig = {
    bitcoin: { name: 'Bitcoin', symbol: 'BTC', icon: '₿', color: '#F59E0B', cardColor: 'orange' },
    ethereum: { name: 'Ethereum', symbol: 'ETH', icon: '♦', color: '#3B82F6', cardColor: 'blue' },
    cardano: { name: 'Cardano', symbol: 'ADA', icon: '♠', color: '#10B981', cardColor: 'green' },
    polkadot: { name: 'Polkadot', symbol: 'DOT', icon: '●', color: '#8B5CF6', cardColor: 'purple' },
    chainlink: {
      name: 'Chainlink',
      symbol: 'LINK',
      icon: '🔗',
      color: '#EF4444',
      cardColor: 'red',
    },
    litecoin: { name: 'Litecoin', symbol: 'LTC', icon: 'Ł', color: '#A7A9AC', cardColor: 'slate' },
    binancecoin: {
      name: 'Binance Coin',
      symbol: 'BNB',
      icon: '🅑',
      color: '#F3BA2F',
      cardColor: 'amber',
    },
    solana: { name: 'Solana', symbol: 'SOL', icon: '◎', color: '#9945FF', cardColor: 'violet' },
    dogecoin: {
      name: 'Dogecoin',
      symbol: 'DOGE',
      icon: '🐕',
      color: '#C2A633',
      cardColor: 'yellow',
    },
    ripple: { name: 'XRP', symbol: 'XRP', icon: '✕', color: '#23292F', cardColor: 'gray' },
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
    // Adding 10 more popular cryptocurrencies
    uniswap: { name: 'Uniswap', symbol: 'UNI', icon: '🦄', color: '#FF007A', cardColor: 'pink' },
    cosmos: { name: 'Cosmos', symbol: 'ATOM', icon: '⚛️', color: '#2E3148', cardColor: 'slate' },
    stellar: { name: 'Stellar', symbol: 'XLM', icon: '⭐', color: '#7D00FF', cardColor: 'indigo' },
    filecoin: { name: 'Filecoin', symbol: 'FIL', icon: '📁', color: '#0090FF', cardColor: 'blue' },
    aave: { name: 'Aave', symbol: 'AAVE', icon: '👻', color: '#B6509E', cardColor: 'pink' },
    algorand: { name: 'Algorand', symbol: 'ALGO', icon: '🔺', color: '#000000', cardColor: 'gray' },
    vechain: { name: 'VeChain', symbol: 'VET', icon: '⚡', color: '#15BDFF', cardColor: 'sky' },
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

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection with better error handling
    const socketInstance = io('http://localhost:4000', {
      timeout: 10000,
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 5,
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('✅ Connected to server');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('❌ Disconnected from server');
    });

    socketInstance.on('cryptoData', (data) => {
      if (data && Object.keys(data).length > 0) {
        setCryptoData(data);
        setLastUpdate(new Date());
        setLoading(false);

        // Add to price history for charts
        const timestamp = new Date().toLocaleTimeString();
        setPriceHistory((prev) => {
          const newHistory = [
            ...prev,
            {
              time: timestamp,
              ...Object.keys(cryptoConfig).reduce((acc, key) => {
                const apiKey = key === 'avalanche-2' ? 'avalanche-2' : key;
                acc[key] = data[apiKey]?.usd || 0;
                return acc;
              }, {}),
            },
          ];
          // Keep only last 20 data points
          return newHistory.slice(-20);
        });
      } else {
        console.log('⚠️ Received empty crypto data');
      }
    });

    // Connection error handling
    socketInstance.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      setIsConnected(false);
      // Fallback to REST API if WebSocket fails
      setTimeout(() => {
        fetchCryptoData();
      }, 2000);
    });

    // Fetch initial data immediately (don't wait for WebSocket)
    fetchCryptoData();

    // Set up a fallback polling mechanism
    const fallbackInterval = setInterval(() => {
      if (!isConnected) {
        console.log('🔄 WebSocket disconnected, using fallback fetch');
        fetchCryptoData();
      }
    }, 30000);

    return () => {
      socketInstance.disconnect();
      clearInterval(fallbackInterval);
    };
  }, []);

  // Manual refresh function
  const handleManualRefresh = () => {
    if (socket && isConnected) {
      socket.emit('requestRefresh');
    } else {
      fetchCryptoData();
    }
  };

  const fetchCryptoData = async (retryCount = 0) => {
    try {
      setLoading(true);
      console.log('🔄 Fetching crypto data...');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      // Use direct API url instead of relative path
      const API_URL = 'http://localhost:4000/api/crypto';
      console.log(`🌐 Attempting to fetch from: ${API_URL}`);

      const response = await fetch(API_URL, {
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
      console.log('✅ Successfully fetched crypto data');

      setCryptoData(data);
      setLastUpdate(new Date());
      setLoading(false);

      return data;
    } catch (error) {
      console.error('❌ Failed to fetch crypto data:', error);

      // Retry logic
      if (retryCount < 2 && error.name !== 'AbortError') {
        const delay = (retryCount + 1) * 2000; // 2s, 4s delays
        console.log(`🔄 Retrying in ${delay}ms... (attempt ${retryCount + 1}/2)`);
        setTimeout(() => {
          fetchCryptoData(retryCount + 1);
        }, delay);
      } else {
        setLoading(false);
        // Show user-friendly error message
        console.error('Failed to load cryptocurrency data. Please check your connection.');
      }
    }
  };

  const getTotalMarketValue = () => {
    if (!cryptoData) return 0;
    return Object.keys(cryptoConfig).reduce((total, key) => {
      const apiKey = key === 'avalanche-2' ? 'avalanche-2' : key;
      const marketCap = cryptoData[apiKey]?.usd_market_cap || 0;
      return total + marketCap / 1000000000; // Convert to billions
    }, 0);
  };

  const getActiveCryptos = () => {
    if (!cryptoData) return 0;
    return Object.keys(cryptoConfig).filter((key) => {
      const apiKey = key === 'avalanche-2' ? 'avalanche-2' : key;
      return cryptoData[apiKey]?.usd > 0;
    }).length;
  };

  const getTopPerformer = () => {
    if (!cryptoData) return 'N/A';

    let topPerformer = null;
    let maxChange = -Infinity;

    Object.keys(cryptoConfig).forEach((key) => {
      const apiKey = key === 'avalanche-2' ? 'avalanche-2' : key;
      const change = cryptoData[apiKey]?.usd_24h_change;
      if (change && change > maxChange) {
        maxChange = change;
        topPerformer = cryptoConfig[key].symbol;
      }
    });

    return topPerformer ? `${topPerformer} +${maxChange.toFixed(2)}%` : 'N/A';
  };

  const handleCryptoClick = (cryptoId) => {
    setSelectedCrypto(cryptoId);
  };

  const handleBackToDashboard = () => {
    setSelectedCrypto(null);
  };

  // Show detail page if crypto is selected
  if (selectedCrypto) {
    return <CryptoDetailPage cryptoId={selectedCrypto} onBack={handleBackToDashboard} />;
  }

  if (loading && !cryptoData) {
    return (
      <div className="min-h-screen bg-crypto-darker flex items-center justify-center">
        <LoadingSpinner size="xl" message="Loading crypto data..." className="py-20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-crypto-darker via-crypto-dark to-crypto-darker relative">
      {/* Add falling coins background */}
      {showCoins && <FallingCoins count={20} />}
      <Header
        isConnected={isConnected}
        lastUpdate={lastUpdate}
        onRefresh={handleManualRefresh}
        loading={loading}
      />{' '}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Market Overview - Mobile Optimized */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="card p-3 sm:p-4 animate-fade-in hover-glow group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">Market Cap</p>
                <p className="text-lg sm:text-2xl font-bold text-crypto-blue group-hover:text-crypto-gold transition-colors">
                  ${getTotalMarketValue().toFixed(2)}B
                </p>
              </div>
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-crypto-green group-hover:text-crypto-gold transition-colors" />
            </div>
          </div>

          <div
            className="card p-3 sm:p-4 animate-fade-in hover-glow group"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">Portfolio</p>
                <p className="text-lg sm:text-2xl font-bold text-crypto-green group-hover:text-crypto-gold transition-colors">
                  {Object.keys(cryptoConfig).length}
                </p>
                <p className="text-xs text-gray-500 hidden sm:block">Cryptocurrencies</p>
              </div>
              <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-crypto-blue group-hover:text-crypto-gold transition-colors" />
            </div>
          </div>

          <div
            className="card p-3 sm:p-4 animate-fade-in hover-glow group"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">Active</p>
                <p className="text-lg sm:text-2xl font-bold text-white group-hover:text-crypto-gold transition-colors">
                  {getActiveCryptos()}
                </p>
                <p className="text-xs text-gray-500 hidden sm:block">Currently Trading</p>
              </div>
              <div className="w-3 h-3 bg-crypto-green group-hover:bg-crypto-gold rounded-full animate-pulse transition-colors"></div>
            </div>
          </div>

          <div
            className="card p-3 sm:p-4 animate-fade-in hover-glow group"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">Top Performer</p>
                <p className="text-sm sm:text-lg font-bold text-crypto-green truncate max-w-[100px] sm:max-w-none group-hover:text-crypto-gold transition-colors">
                  {getTopPerformer()}
                </p>
                <p className="text-xs text-gray-500 hidden sm:block">24h Change</p>
              </div>
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-crypto-green group-hover:text-crypto-gold transition-colors" />
            </div>
          </div>
        </div>

        {/* View Toggle - Mobile Optimized */}
        <div className="flex items-center justify-center mb-6 sm:mb-8 overflow-x-auto pb-2 no-scrollbar">
          <div className="flex bg-crypto-dark border border-gray-700 rounded-lg p-1 shadow-lg space-x-1">
            <button
              onClick={() => setActiveView('overview')}
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-lg transition-colors whitespace-nowrap btn-lightning text-xs sm:text-sm ${
                activeView === 'overview'
                  ? 'bg-crypto-dark border-2 border-f1c40f text-f1c40f'
                  : 'bg-crypto-dark border border-gray-600 text-gray-400 hover:text-f1c40f hover:border-f1c40f'
              }`}
            >
              <Grid className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Overview</span>
            </button>
            <button
              onClick={() => setActiveView('chart')}
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-lg transition-colors whitespace-nowrap btn-lightning text-xs sm:text-sm ${
                activeView === 'chart'
                  ? 'bg-crypto-dark border-2 border-f1c40f text-f1c40f'
                  : 'bg-crypto-dark border border-gray-600 text-gray-400 hover:text-f1c40f hover:border-f1c40f'
              }`}
            >
              <BarChart className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Chart</span>
            </button>
            <button
              onClick={() => setActiveView('portfolio')}
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-lg transition-colors whitespace-nowrap btn-lightning text-xs sm:text-sm ${
                activeView === 'portfolio'
                  ? 'bg-crypto-dark border-2 border-f1c40f text-f1c40f'
                  : 'bg-crypto-dark border border-gray-600 text-gray-400 hover:text-f1c40f hover:border-f1c40f'
              }`}
            >
              <List className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Portfolio</span>
            </button>
            <button
              onClick={() => setActiveView('holdings')}
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-lg transition-colors whitespace-nowrap btn-lightning text-xs sm:text-sm ${
                activeView === 'holdings'
                  ? 'bg-crypto-dark border-2 border-f1c40f text-f1c40f'
                  : 'bg-crypto-dark border border-gray-600 text-gray-400 hover:text-f1c40f hover:border-f1c40f'
              }`}
            >
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Holdings</span>
            </button>
            <button
              onClick={() => setActiveView('transactions')}
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-lg transition-colors whitespace-nowrap btn-lightning text-xs sm:text-sm ${
                activeView === 'transactions'
                  ? 'bg-crypto-dark border-2 border-f1c40f text-f1c40f'
                  : 'bg-crypto-dark border border-gray-600 text-gray-400 hover:text-f1c40f hover:border-f1c40f'
              }`}
            >
              <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Transactions</span>
            </button>
            <button
              onClick={() => setActiveView('performance')}
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-lg transition-colors whitespace-nowrap btn-lightning text-xs sm:text-sm ${
                activeView === 'performance'
                  ? 'bg-crypto-dark border-2 border-f1c40f text-f1c40f'
                  : 'bg-crypto-dark border border-gray-600 text-gray-400 hover:text-f1c40f hover:border-f1c40f'
              }`}
            >
              <BarChart className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Performance</span>
            </button>
            <button
              onClick={() => setActiveView('export')}
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-lg transition-colors whitespace-nowrap btn-lightning text-xs sm:text-sm ${
                activeView === 'export'
                  ? 'bg-crypto-dark border-2 border-f1c40f text-f1c40f'
                  : 'bg-crypto-dark border border-gray-600 text-gray-400 hover:text-f1c40f hover:border-f1c40f'
              }`}
            >
              <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={() => setActiveView('news')}
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-lg transition-colors whitespace-nowrap btn-lightning text-xs sm:text-sm ${
                activeView === 'news'
                  ? 'bg-crypto-dark border-2 border-f1c40f text-f1c40f'
                  : 'bg-crypto-dark border border-gray-600 text-gray-400 hover:text-f1c40f hover:border-f1c40f'
              }`}
            >
              <Newspaper className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">News</span>
            </button>
          </div>
        </div>

        {/* Content Based on Active View - Mobile Optimized */}
        {activeView === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
            {Object.entries(cryptoConfig).map(([key, config]) => {
              const apiKey = key === 'avalanche-2' ? 'avalanche-2' : key;
              const data = cryptoData?.[apiKey];

              if (!data) return null;

              return (
                <CryptoCard
                  key={key}
                  name={config.name}
                  symbol={config.symbol}
                  price={data.usd}
                  change24h={data.usd_24h_change}
                  marketCap={data.usd_market_cap}
                  icon={config.icon}
                  color={config.cardColor}
                  onClick={handleCryptoClick}
                  cryptoId={key}
                />
              );
            })}
          </div>
        )}

        {activeView === 'chart' && priceHistory.length > 1 && (
          <div className="card">
            <InteractivePriceChart data={priceHistory} cryptoConfig={cryptoConfig} />
          </div>
        )}

        {activeView === 'portfolio' && (
          <div className="card">
            <CryptoPortfolioOverview
              cryptoData={cryptoData}
              cryptoConfig={cryptoConfig}
              onCryptoClick={handleCryptoClick}
            />
          </div>
        )}

        {activeView === 'holdings' && <PortfolioHoldings cryptoConfig={cryptoConfig} />}

        {activeView === 'transactions' && <TransactionHistory cryptoConfig={cryptoConfig} />}

        {activeView === 'performance' && <PerformanceVisualization cryptoConfig={cryptoConfig} />}

        {activeView === 'export' && <DataExport cryptoConfig={cryptoConfig} />}

        {activeView === 'news' && <CryptoNewsCarousel />}
      </div>
    </div>
  );
}

// Wrap the app with our LocalizationProvider and PortfolioProvider
function App() {
  return (
    <LocalizationProvider>
      <PortfolioProvider>
        <AppContent />
        <SettingsPanel />
      </PortfolioProvider>
    </LocalizationProvider>
  );
}

export default App;
