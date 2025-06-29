import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import CryptoCard from './components/CryptoCard';
import PriceChart from './components/PriceChart';
import Header from './components/Header';
import { TrendingUp, TrendingDown, Activity, RefreshCw } from 'lucide-react';

function App() {
  const [cryptoData, setCryptoData] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loading, setLoading] = useState(true);

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
          bitcoin: data.bitcoin?.usd || 0,
          ethereum: data.ethereum?.usd || 0,
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
    const btcValue = (cryptoData.bitcoin?.usd || 0) * (cryptoData.bitcoin?.usd_market_cap || 0) / 1000000000;
    const ethValue = (cryptoData.ethereum?.usd || 0) * (cryptoData.ethereum?.usd_market_cap || 0) / 1000000000;
    return btcValue + ethValue;
  };

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                <p className="text-gray-400 text-sm">24h Volume</p>
                <p className="text-2xl font-bold text-crypto-green">
                  $1.2T
                </p>
              </div>
              <Activity className="w-8 h-8 text-crypto-blue" />
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Cryptos</p>
                <p className="text-2xl font-bold text-white">2</p>
              </div>
              <div className="w-3 h-3 bg-crypto-green rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Crypto Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {cryptoData?.bitcoin && (
            <CryptoCard
              name="Bitcoin"
              symbol="BTC"
              price={cryptoData.bitcoin.usd}
              change24h={cryptoData.bitcoin.usd_24h_change}
              marketCap={cryptoData.bitcoin.usd_market_cap}
              icon="₿"
              color="orange"
            />
          )}
          
          {cryptoData?.ethereum && (
            <CryptoCard
              name="Ethereum"
              symbol="ETH"
              price={cryptoData.ethereum.usd}
              change24h={cryptoData.ethereum.usd_24h_change}
              marketCap={cryptoData.ethereum.usd_market_cap}
              icon="♦"
              color="blue"
            />
          )}
        </div>

        {/* Price Chart */}
        {priceHistory.length > 1 && (
          <div className="card">
            <h3 className="text-xl font-bold mb-6 text-center">Price History</h3>
            <PriceChart data={priceHistory} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
