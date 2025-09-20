import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Globe,
  Calendar,
  DollarSign,
  BarChart3,
  Activity,
  Users,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { fetchWithRetry } from '../utils/apiUtils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

const CryptoDetailPage = ({ cryptoId, onBack }) => {
  const [detailData, setDetailData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7');
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    fetchDetailData();
    fetchHistoricalData();
  }, [cryptoId, timeRange]);

  const fetchDetailData = async () => {
    try {
      setError(null);
      console.log(`Fetching details for: ${cryptoId}`);

      const response = await fetchWithRetry(
        `/api/crypto/${cryptoId}/details`,
        {},
        10000, // 10 second timeout
        3 // 3 retries
      );

      const data = await response.json();
      console.log('Detail data received:', data);
      setDetailData(data);
    } catch (error) {
      console.error('Failed to fetch detail data:', error);
      setError(`Failed to load cryptocurrency details: ${error.message}`);

      // Retry mechanism for rate limiting
      if (error.message.includes('429') && retryCount < 3) {
        setTimeout(
          () => {
            setRetryCount((prev) => prev + 1);
            fetchDetailData();
          },
          2000 * (retryCount + 1)
        ); // Exponential backoff
      }
    }
  };

  const fetchHistoricalData = async () => {
    try {
      setLoading(true);

      const response = await fetchWithRetry(
        `/api/crypto/${cryptoId}/history?days=${timeRange}`,
        {},
        10000, // 10 second timeout
        3 // 3 retries
      );

      const data = await response.json();

      // Transform the data for the chart
      const chartData =
        data.prices?.map((price, index) => ({
          time:
            timeRange === '1'
              ? new Date(price[0]).toLocaleTimeString()
              : new Date(price[0]).toLocaleDateString(),
          price: price[1],
          volume: data.total_volumes?.[index]?.[1] || 0,
        })) || [];

      setHistoricalData(chartData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch historical data:', error);
      setLoading(false);
      // Don't set error for historical data, just show empty chart
    }
  };

  const retryFetch = () => {
    setRetryCount(0);
    setError(null);
    fetchDetailData();
    fetchHistoricalData();
  };

  const formatNumber = (num) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num?.toFixed(2) || '0.00'}`;
  };

  const formatPercentage = (num) => {
    if (num === null || num === undefined) return <span className="text-gray-400">N/A</span>;
    const isPositive = num >= 0;
    return (
      <span
        className={`flex items-center space-x-1 ${isPositive ? 'text-crypto-green' : 'text-crypto-red'}`}
      >
        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        <span>
          {isPositive ? '+' : ''}
          {num?.toFixed(2)}%
        </span>
      </span>
    );
  };

  // Get crypto name from config as fallback
  const getCryptoInfo = () => {
    const cryptoMapping = {
      bitcoin: { name: 'Bitcoin', symbol: 'BTC', icon: '₿' },
      ethereum: { name: 'Ethereum', symbol: 'ETH', icon: '♦' },
      cardano: { name: 'Cardano', symbol: 'ADA', icon: '♠' },
      polkadot: { name: 'Polkadot', symbol: 'DOT', icon: '●' },
      chainlink: { name: 'Chainlink', symbol: 'LINK', icon: '🔗' },
      litecoin: { name: 'Litecoin', symbol: 'LTC', icon: 'Ł' },
      binancecoin: { name: 'Binance Coin', symbol: 'BNB', icon: '🅑' },
      solana: { name: 'Solana', symbol: 'SOL', icon: '◎' },
      dogecoin: { name: 'Dogecoin', symbol: 'DOGE', icon: '🐕' },
      ripple: { name: 'XRP', symbol: 'XRP', icon: '✕' },
      'avalanche-2': { name: 'Avalanche', symbol: 'AVAX', icon: '🏔' },
      polygon: { name: 'Polygon', symbol: 'MATIC', icon: '🔷' },
      uniswap: { name: 'Uniswap', symbol: 'UNI', icon: '🦄' },
      cosmos: { name: 'Cosmos', symbol: 'ATOM', icon: '⚛️' },
      stellar: { name: 'Stellar', symbol: 'XLM', icon: '⭐' },
      filecoin: { name: 'Filecoin', symbol: 'FIL', icon: '📁' },
      aave: { name: 'Aave', symbol: 'AAVE', icon: '👻' },
      algorand: { name: 'Algorand', symbol: 'ALGO', icon: '🔺' },
      vechain: { name: 'VeChain', symbol: 'VET', icon: '⚡' },
      'hedera-hashgraph': { name: 'Hedera', symbol: 'HBAR', icon: '🔷' },
      'theta-token': { name: 'Theta Network', symbol: 'THETA', icon: '🎥' },
      'the-sandbox': { name: 'The Sandbox', symbol: 'SAND', icon: '🏖️' },
    };

    return (
      cryptoMapping[cryptoId] || { name: cryptoId, symbol: cryptoId.toUpperCase(), icon: '🪙' }
    );
  };

  const cryptoInfo = getCryptoInfo();

  if (loading && !detailData && !error) {
    return (
      <div className="min-h-screen bg-crypto-darker flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-crypto-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading {cryptoInfo.name} details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-crypto-darker via-crypto-dark to-crypto-darker">
      {/* Header */}
      <div className="bg-crypto-dark/80 backdrop-blur-sm border-b border-gray-700/50 p-6">
        <div className="container mx-auto flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-crypto-blue hover:text-crypto-blue/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center space-x-4">
            {detailData?.image?.large ? (
              <img
                src={detailData.image.large}
                alt={detailData.name}
                className="w-12 h-12 rounded-full"
                onError={(e) => (e.target.style.display = 'none')}
              />
            ) : (
              <div className="w-12 h-12 bg-crypto-dark rounded-full flex items-center justify-center text-2xl">
                {cryptoInfo.icon}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold">{detailData?.name || cryptoInfo.name}</h1>
              <p className="text-gray-400 text-lg">
                {detailData?.symbol?.toUpperCase() || cryptoInfo.symbol}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="card mb-8 border-crypto-red/30 bg-crypto-red/10">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="w-6 h-6 text-crypto-red" />
              <h3 className="text-lg font-semibold text-crypto-red">Error Loading Data</h3>
            </div>
            <p className="text-gray-300 mb-4">{error}</p>
            <button
              onClick={retryFetch}
              className="flex items-center space-x-2 bg-crypto-blue hover:bg-crypto-blue/80 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {detailData ? (
          <>
            {/* Price Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="card">
                <div className="flex items-center space-x-3 mb-3">
                  <DollarSign className="w-6 h-6 text-crypto-blue" />
                  <h3 className="text-lg font-semibold">Current Price</h3>
                </div>
                <p className="text-3xl font-bold">
                  ${detailData.market_data?.current_price?.usd?.toLocaleString() || '0.00'}
                </p>
                <div className="mt-2">
                  {formatPercentage(detailData.market_data?.price_change_percentage_24h)}
                </div>
              </div>

              <div className="card">
                <div className="flex items-center space-x-3 mb-3">
                  <BarChart3 className="w-6 h-6 text-crypto-green" />
                  <h3 className="text-lg font-semibold">Market Cap</h3>
                </div>
                <p className="text-2xl font-bold">
                  {formatNumber(detailData.market_data?.market_cap?.usd)}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Rank #{detailData.market_cap_rank || 'N/A'}
                </p>
              </div>

              <div className="card">
                <div className="flex items-center space-x-3 mb-3">
                  <Activity className="w-6 h-6 text-crypto-blue" />
                  <h3 className="text-lg font-semibold">24h Volume</h3>
                </div>
                <p className="text-2xl font-bold">
                  {formatNumber(detailData.market_data?.total_volume?.usd)}
                </p>
                <div className="mt-2">
                  {formatPercentage(
                    detailData.market_data?.price_change_percentage_24h_in_currency?.usd
                  )}
                </div>
              </div>

              <div className="card">
                <div className="flex items-center space-x-3 mb-3">
                  <Users className="w-6 h-6 text-crypto-green" />
                  <h3 className="text-lg font-semibold">Circulating Supply</h3>
                </div>
                <p className="text-xl font-bold">
                  {detailData.market_data?.circulating_supply?.toLocaleString() || 'N/A'}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {detailData.symbol?.toUpperCase() || cryptoInfo.symbol}
                </p>
              </div>
            </div>

            {/* Price Chart */}
            <div className="card mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Price Chart</h3>
                <div className="flex space-x-2">
                  {['1', '7', '30', '90'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        timeRange === range
                          ? 'bg-crypto-blue text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {range}D
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-crypto-blue border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : historicalData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} tickLine={false} />
                      <YAxis
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickLine={false}
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB',
                        }}
                        formatter={(value) => [`$${value.toLocaleString()}`, 'Price']}
                        labelStyle={{ color: '#9CA3AF' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#F59E0B"
                        fill="url(#colorPrice)"
                        strokeWidth={3}
                      />
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No historical data available</p>
                    <p className="text-gray-500 text-sm">Try selecting a different time range</p>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-xl font-bold mb-4">About {detailData.name}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">All-Time High</span>
                    <div className="text-right">
                      <span className="font-semibold">
                        ${detailData.market_data?.ath?.usd?.toLocaleString() || 'N/A'}
                      </span>
                      {detailData.market_data?.ath_date?.usd && (
                        <p className="text-sm text-gray-400">
                          {new Date(detailData.market_data.ath_date.usd).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">All-Time Low</span>
                    <div className="text-right">
                      <span className="font-semibold">
                        ${detailData.market_data?.atl?.usd?.toLocaleString() || 'N/A'}
                      </span>
                      {detailData.market_data?.atl_date?.usd && (
                        <p className="text-sm text-gray-400">
                          {new Date(detailData.market_data.atl_date.usd).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Supply</span>
                    <span className="font-semibold">
                      {detailData.market_data?.total_supply?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Max Supply</span>
                    <span className="font-semibold">
                      {detailData.market_data?.max_supply?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-xl font-bold mb-4">Price Changes</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">1 Hour</span>
                    {formatPercentage(
                      detailData.market_data?.price_change_percentage_1h_in_currency?.usd
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">24 Hours</span>
                    {formatPercentage(detailData.market_data?.price_change_percentage_24h)}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">7 Days</span>
                    {formatPercentage(detailData.market_data?.price_change_percentage_7d)}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">30 Days</span>
                    {formatPercentage(detailData.market_data?.price_change_percentage_30d)}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">1 Year</span>
                    {formatPercentage(detailData.market_data?.price_change_percentage_1y)}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          !error && (
            <div className="card text-center">
              <div className="py-12">
                <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Data Not Available</h3>
                <p className="text-gray-400 mb-4">
                  Unable to load detailed information for {cryptoInfo.name}
                </p>
                <button
                  onClick={retryFetch}
                  className="flex items-center space-x-2 bg-crypto-blue hover:bg-crypto-blue/80 text-white px-4 py-2 rounded-lg transition-colors mx-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default CryptoDetailPage;
