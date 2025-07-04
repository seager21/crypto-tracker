import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import CryptoCard from './components/CryptoCard';
import InteractivePriceChart from './components/InteractivePriceChart';
import CryptoDetailPage from './components/CryptoDetailPage';
import CryptoPortfolioOverview from './components/CryptoPortfolioOverview';
import Header from './components/Header';
import { TrendingUp, TrendingDown, Activity, RefreshCw, BarChart, Grid, List } from 'lucide-react';

function App() {
  const [cryptoData, setCryptoData] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [activeView, setActiveView] = useState('overview'); // 'overview', 'chart', 'portfolio'

  // Configuration for all cryptocurrencies (22 total)
  const cryptoConfig = {
    bitcoin: { name: 'Bitcoin', symbol: 'BTC', icon: '₿', color: '#F59E0B', cardColor: 'orange' },
    ethereum: { name: 'Ethereum', symbol: 'ETH', icon: '♦', color: '#3B82F6', cardColor: 'blue' },
    cardano: { name: 'Cardano', symbol: 'ADA', icon: '♠', color: '#10B981', cardColor: 'green' },
    polkadot: { name: 'Polkadot', symbol: 'DOT', icon: '●', color: '#8B5CF6', cardColor: 'purple' },
    chainlink: { name: 'Chainlink', symbol: 'LINK', icon: '🔗', color: '#EF4444', cardColor: 'red' },
    litecoin: { name: 'Litecoin', symbol: 'LTC', icon: 'Ł', color: '#A7A9AC', cardColor: 'slate' },
    binancecoin: { name: 'Binance Coin', symbol: 'BNB', icon: '🅑', color: '#F3BA2F', cardColor: 'amber' },
    solana: { name: 'Solana', symbol: 'SOL', icon: '◎', color: '#9945FF', cardColor: 'violet' },
    dogecoin: { name: 'Dogecoin', symbol: 'DOGE', icon: '🐕', color: '#C2A633', cardColor: 'yellow' },
    ripple: { name: 'XRP', symbol: 'XRP', icon: '✕', color: '#23292F', cardColor: 'gray' },
    'avalanche-2': { name: 'Avalanche', symbol: 'AVAX', icon: '🏔', color: '#E84142', cardColor: 'red' },
    polygon: { name: 'Polygon', symbol: 'MATIC', icon: '🔷', color: '#8247E5', cardColor: 'purple' },
    // Adding 10 more popular cryptocurrencies
    'uniswap': { name: 'Uniswap', symbol: 'UNI', icon: '🦄', color: '#FF007A', cardColor: 'pink' },
    'cosmos': { name: 'Cosmos', symbol: 'ATOM', icon: '⚛️', color: '#2E3148', cardColor: 'slate' },
    'stellar': { name: 'Stellar', symbol: 'XLM', icon: '⭐', color: '#7D00FF', cardColor: 'indigo' },
    'filecoin': { name: 'Filecoin', symbol: 'FIL', icon: '📁', color: '#0090FF', cardColor: 'blue' },
    'aave': { name: 'Aave', symbol: 'AAVE', icon: '👻', color: '#B6509E', cardColor: 'pink' },
    'algorand': { name: 'Algorand', symbol: 'ALGO', icon: '🔺', color: '#000000', cardColor: 'gray' },
    'vechain': { name: 'VeChain', symbol: 'VET', icon: '⚡', color: '#15BDFF', cardColor: 'sky' },
    'hedera-hashgraph': { name: 'Hedera', symbol: 'HBAR', icon: '🔷', color: '#000000', cardColor: 'gray' },
    'theta-token': { name: 'Theta Network', symbol: 'THETA', icon: '🎥', color: '#2AB8E6', cardColor: 'cyan' },
    'the-sandbox': { name: 'The Sandbox', symbol: 'SAND', icon: '🏖️', color: '#00D4FF', cardColor: 'sky' }
  };

  useEffect(() => {
    // Initialize socket connection
    const socket = io('http://localhost:3000');

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    socket.on('cryptoData', (data) => {
      setCryptoData(data);
      setLastUpdate(new Date());
      setLoading(false);
      
      // Add to price history for charts
      const timestamp = new Date().toLocaleTimeString();
      setPriceHistory(prev => {
        const newHistory = [...prev, {
          time: timestamp,
          ...Object.keys(cryptoConfig).reduce((acc, key) => {
            const apiKey = key === 'avalanche-2' ? 'avalanche-2' : key;
            acc[key] = data[apiKey]?.usd || 0;
            return acc;
          }, {})
        }];
        // Keep only last 20 data points
        return newHistory.slice(-20);
      });
    });

    // Fetch initial data
    fetchCryptoData();

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchCryptoData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/crypto');
      const data = await response.json();
      setCryptoData(data);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch crypto data:', error);
      setLoading(false);
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
    return Object.keys(cryptoConfig).filter(key => {
      const apiKey = key === 'avalanche-2' ? 'avalanche-2' : key;
      return cryptoData[apiKey]?.usd > 0;
    }).length;
  };

  const getTopPerformer = () => {
    if (!cryptoData) return 'N/A';
    
    let topPerformer = null;
    let maxChange = -Infinity;
    
    Object.keys(cryptoConfig).forEach(key => {
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
    return (
      <CryptoDetailPage 
        cryptoId={selectedCrypto} 
        onBack={handleBackToDashboard}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-crypto-darker flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-crypto-blue mx-auto mb-4" />
          <p className="text-gray-400">Loading crypto data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-crypto-darker via-crypto-dark to-crypto-darker">
      <Header 
        isConnected={isConnected} 
        lastUpdate={lastUpdate}
        onRefresh={fetchCryptoData}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Market Cap</p>
                <p className="text-2xl font-bold text-crypto-blue">
                  ${getTotalMarketValue().toFixed(2)}B
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-crypto-green" />
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Portfolio Size</p>
                <p className="text-2xl font-bold text-crypto-green">
                  {Object.keys(cryptoConfig).length}
                </p>
                <p className="text-xs text-gray-500">Cryptocurrencies</p>
              </div>
              <Activity className="w-8 h-8 text-crypto-blue" />
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Cryptos</p>
                <p className="text-2xl font-bold text-white">{getActiveCryptos()}</p>
                <p className="text-xs text-gray-500">Currently Trading</p>
              </div>
              <div className="w-3 h-3 bg-crypto-green rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Top Performer</p>
                <p className="text-lg font-bold text-crypto-green">
                  {getTopPerformer()}
                </p>
                <p className="text-xs text-gray-500">24h Change</p>
              </div>
              <TrendingUp className="w-8 h-8 text-crypto-green" />
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex bg-crypto-dark border border-gray-700 rounded-lg p-1">
            <button
              onClick={() => setActiveView('overview')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeView === 'overview' 
                  ? 'bg-crypto-blue text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveView('chart')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeView === 'chart' 
                  ? 'bg-crypto-blue text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <BarChart className="w-4 h-4" />
              <span>Interactive Chart</span>
            </button>
            <button
              onClick={() => setActiveView('portfolio')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeView === 'portfolio' 
                  ? 'bg-crypto-blue text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
              <span>Portfolio</span>
            </button>
          </div>
        </div>

        {/* Content Based on Active View */}
        {activeView === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
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
      </div>
    </div>
  );
}

export default App;
