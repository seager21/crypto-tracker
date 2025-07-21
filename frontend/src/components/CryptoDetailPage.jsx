import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Globe, Calendar, DollarSign, BarChart3, Activity, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const CryptoDetailPage = ({ cryptoId, onBack }) => {
  const [detailData, setDetailData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7');

  useEffect(() => {
    fetchDetailData();
    fetchHistoricalData();
  }, [cryptoId, timeRange]);

  const fetchDetailData = async () => {
    try {
      const response = await fetch(`/api/crypto/${cryptoId}/details`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setDetailData(data);
    } catch (error) {
      console.error('Failed to fetch detail data:', error);
      // You could set an error state here if needed
    }
  };

  const fetchHistoricalData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/crypto/${cryptoId}/history?days=${timeRange}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Transform the data for the chart
      const chartData = data.prices?.map((price, index) => ({
        time: new Date(price[0]).toLocaleDateString(),
        price: price[1],
        volume: data.total_volumes?.[index]?.[1] || 0
      })) || [];
      
      setHistoricalData(chartData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch historical data:', error);
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num?.toFixed(2) || '0.00'}`;
  };

  const formatPercentage = (num) => {
    const isPositive = num >= 0;
    return (
      <span className={`flex items-center space-x-1 ${isPositive ? 'text-crypto-green' : 'text-crypto-red'}`}>
        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        <span>{isPositive ? '+' : ''}{num?.toFixed(2)}%</span>
      </span>
    );
  };

  if (loading && !detailData) {
    return (
      <div className="min-h-screen bg-crypto-darker flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-crypto-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading crypto details...</p>
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
          
          {detailData && (
            <div className="flex items-center space-x-4">
              <img 
                src={detailData.image?.large} 
                alt={detailData.name} 
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h1 className="text-3xl font-bold">{detailData.name}</h1>
                <p className="text-gray-400 text-lg">{detailData.symbol?.toUpperCase()}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {detailData && (
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
                  Rank #{detailData.market_cap_rank}
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
                  {formatPercentage(detailData.market_data?.price_change_percentage_24h_in_currency?.usd)}
                </div>
              </div>

              <div className="card">
                <div className="flex items-center space-x-3 mb-3">
                  <Users className="w-6 h-6 text-crypto-green" />
                  <h3 className="text-lg font-semibold">Circulating Supply</h3>
                </div>
                <p className="text-xl font-bold">
                  {detailData.market_data?.circulating_supply?.toLocaleString()}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {detailData.symbol?.toUpperCase()}
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
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="time" 
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickLine={false}
                      />
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
                          color: '#F9FAFB'
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
                          <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
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
                        ${detailData.market_data?.ath?.usd?.toLocaleString()}
                      </span>
                      <p className="text-sm text-gray-400">
                        {new Date(detailData.market_data?.ath_date?.usd).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">All-Time Low</span>
                    <div className="text-right">
                      <span className="font-semibold">
                        ${detailData.market_data?.atl?.usd?.toLocaleString()}
                      </span>
                      <p className="text-sm text-gray-400">
                        {new Date(detailData.market_data?.atl_date?.usd).toLocaleDateString()}
                      </p>
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
                    {formatPercentage(detailData.market_data?.price_change_percentage_1h_in_currency?.usd)}
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
        )}
      </div>
    </div>
  );
};

export default CryptoDetailPage;
