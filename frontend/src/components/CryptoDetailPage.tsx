import React, { useState, useEffect } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Globe,
  Activity,
  Users,
  AlertCircle,
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { CryptoDetailData, MarketHistoryData } from '../types';

interface CryptoDetailPageProps {
  /**
   * The ID of the cryptocurrency to display
   */
  cryptoId: string;

  /**
   * Function to go back to the previous view
   */
  onBack: () => void;

  /**
   * Display name of the cryptocurrency
   */
  name?: string;

  /**
   * Symbol of the cryptocurrency
   */
  symbol?: string;

  /**
   * Icon for the cryptocurrency
   */
  icon?: string;

  /**
   * Brand color for the cryptocurrency
   */
  color?: string;

  /**
   * Current price in USD
   */
  price?: number;

  /**
   * 24-hour price change percentage
   */
  change24h?: number;

  /**
   * Market capitalization in USD
   */
  marketCap?: number;

  /**
   * 24-hour trading volume in USD
   */
  volume?: number;

  /**
   * Last updated timestamp
   */
  lastUpdated?: Date;
}

/**
 * Detailed view of a cryptocurrency showing price, market data, and charts
 */
const CryptoDetailPage: React.FC<CryptoDetailPageProps> = ({
  cryptoId,
  onBack,
  name,
  symbol,
  icon,
  color,
  price,
  change24h,
  marketCap,
  volume,
  lastUpdated,
}) => {
  const [detailData, setDetailData] = useState<CryptoDetailData | null>(null);
  const [historicalData, setHistoricalData] = useState<MarketHistoryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<string>('7');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  useEffect(() => {
    fetchDetailData();
    fetchHistoricalData();
  }, [cryptoId, timeRange]);

  const fetchDetailData = async (): Promise<void> => {
    try {
      setError(null);
      const response = await fetch(`/api/crypto/${cryptoId}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setDetailData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cryptocurrency details');
      console.error('Error fetching crypto details:', err);
    }
  };

  const fetchHistoricalData = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch(`/api/crypto/${cryptoId}/history?days=${timeRange}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setHistoricalData(data);
    } catch (err) {
      console.error('Error fetching historical data:', err);
      if (retryCount < 2) {
        setRetryCount((prev) => prev + 1);
        setTimeout(() => {
          fetchHistoricalData();
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatHistoricalData = () => {
    if (!historicalData || !historicalData.prices) return [];

    return historicalData.prices.map(([timestamp, price]) => ({
      date: new Date(timestamp).toLocaleDateString(),
      price: price,
    }));
  };

  const formatMarketCapData = () => {
    if (!historicalData || !historicalData.market_caps) return [];

    return historicalData.market_caps.map(([timestamp, marketCap]) => ({
      date: new Date(timestamp).toLocaleDateString(),
      marketCap,
    }));
  };

  const formatVolumeData = () => {
    if (!historicalData || !historicalData.total_volumes) return [];

    return historicalData.total_volumes.map(([timestamp, volume]) => ({
      date: new Date(timestamp).toLocaleDateString(),
      volume,
    }));
  };

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
  };

  // Calculate percentage change for the selected time period
  const calculatePriceChange = (): number => {
    if (!historicalData || !historicalData.prices || historicalData.prices.length < 2) return 0;

    const firstPrice = historicalData.prices[0][1];
    const lastPrice = historicalData.prices[historicalData.prices.length - 1][1];

    return ((lastPrice - firstPrice) / firstPrice) * 100;
  };

  // Format numbers with commas and proper decimals
  const formatNumber = (num: number, decimals = 2): string => {
    if (num === undefined) return 'N/A';
    return num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  // Format large numbers with appropriate suffix (B, M, K)
  const formatLargeNumber = (num: number): string => {
    if (num === undefined) return 'N/A';
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  // Format date in a readable format
  const formatDate = (timestamp: number): string => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  const priceChangeColor = (change: number): string => {
    return change >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const chartData = formatHistoricalData();
  const periodChange = calculatePriceChange();
  const isPositiveChange = periodChange >= 0;

  if (loading && !detailData) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" message={`Loading ${name || cryptoId} data...`} />
      </div>
    );
  }

  return (
    <div className="crypto-detail animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="text-4xl">{icon || '📊'}</div>
          <div>
            <h1 className="text-2xl font-bold">{name || detailData?.name || cryptoId}</h1>
            <p className="text-gray-400">{symbol || detailData?.symbol || ''}</p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="rounded-full bg-gray-800 p-2 hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="text-red-500 mr-2" size={20} />
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Price Card */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400">Current Price</h3>
            {lastUpdated && (
              <span className="text-xs text-gray-500">
                Last updated: {formatDate(lastUpdated.getTime())}
              </span>
            )}
          </div>
          <div className="text-3xl font-bold">
            ${formatNumber(price || detailData?.market_data?.current_price?.usd || 0)}
          </div>
          <div
            className={`text-sm mt-1 flex items-center space-x-1 ${priceChangeColor(change24h || 0)}`}
          >
            {isPositiveChange ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>
              {isPositiveChange ? '+' : ''}
              {formatNumber(change24h || 0)}% (24h)
            </span>
          </div>
        </div>

        {/* Market Cap Card */}
        <div className="stat-card">
          <h3 className="text-gray-400 mb-2">Market Cap</h3>
          <div className="text-3xl font-bold">
            {formatLargeNumber(marketCap || detailData?.market_data?.market_cap?.usd || 0)}
          </div>
          <div className="text-sm mt-1 text-gray-400">
            Rank: #{detailData?.market_cap_rank || 'N/A'}
          </div>
        </div>

        {/* Trading Volume Card */}
        <div className="stat-card">
          <h3 className="text-gray-400 mb-2">24h Trading Volume</h3>
          <div className="text-3xl font-bold">
            {formatLargeNumber(volume || detailData?.market_data?.total_volume?.usd || 0)}
          </div>
          <div className="text-sm mt-1 text-gray-400">
            Fully Diluted:{' '}
            {formatLargeNumber(detailData?.market_data?.fully_diluted_valuation?.usd || 0)}
          </div>
        </div>
      </div>

      {/* Price Chart Section */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Price Chart</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => handleTimeRangeChange('1')}
              className={`chart-range-btn ${timeRange === '1' ? 'active' : ''}`}
            >
              24h
            </button>
            <button
              onClick={() => handleTimeRangeChange('7')}
              className={`chart-range-btn ${timeRange === '7' ? 'active' : ''}`}
            >
              7d
            </button>
            <button
              onClick={() => handleTimeRangeChange('30')}
              className={`chart-range-btn ${timeRange === '30' ? 'active' : ''}`}
            >
              30d
            </button>
            <button
              onClick={() => handleTimeRangeChange('90')}
              className={`chart-range-btn ${timeRange === '90' ? 'active' : ''}`}
            >
              90d
            </button>
            <button
              onClick={() => handleTimeRangeChange('365')}
              className={`chart-range-btn ${timeRange === '365' ? 'active' : ''}`}
            >
              1y
            </button>
          </div>
        </div>

        <div className="h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner size="md" message="Loading chart data..." />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color || '#3B82F6'} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={color || '#3B82F6'} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" tick={{ fill: '#9CA3AF' }} tickLine={{ stroke: '#4B5563' }} />
                <YAxis
                  tick={{ fill: '#9CA3AF' }}
                  tickLine={{ stroke: '#4B5563' }}
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={(value) => `$${formatNumber(value)}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    borderColor: '#374151',
                    borderRadius: '0.5rem',
                  }}
                  labelStyle={{ color: '#D1D5DB' }}
                  formatter={(value: number) => [`$${formatNumber(value)}`, 'Price']}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={color || '#3B82F6'}
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="mt-4 text-center">
          <div className={`text-lg font-semibold ${priceChangeColor(periodChange)}`}>
            {isPositiveChange ? '+' : ''}
            {formatNumber(periodChange)}% in the last{' '}
            {timeRange === '1' ? '24 hours' : `${timeRange} days`}
          </div>
        </div>
      </div>

      {/* Additional Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Supply Info */}
        <div className="info-card">
          <h3 className="text-lg font-semibold mb-4">Supply Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Circulating Supply</span>
              <span>
                {formatNumber(detailData?.market_data?.circulating_supply || 0, 0)} {symbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Supply</span>
              <span>
                {detailData?.market_data?.total_supply
                  ? formatNumber(detailData.market_data.total_supply, 0)
                  : 'Unlimited'}{' '}
                {symbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Max Supply</span>
              <span>
                {detailData?.market_data?.max_supply
                  ? formatNumber(detailData.market_data.max_supply, 0)
                  : 'Unlimited'}{' '}
                {symbol}
              </span>
            </div>
          </div>
        </div>

        {/* Price History */}
        <div className="info-card">
          <h3 className="text-lg font-semibold mb-4">Price History</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">All Time High</span>
              <span className="text-green-400">
                ${formatNumber(detailData?.market_data?.ath?.usd || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">ATH Date</span>
              <span>
                {detailData?.market_data?.ath_date?.usd
                  ? new Date(detailData.market_data.ath_date.usd).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">All Time Low</span>
              <span className="text-red-400">
                ${formatNumber(detailData?.market_data?.atl?.usd || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Market Data Charts */}
      <div className="grid grid-cols-1 gap-8 mb-8">
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Market Cap History</h3>
          <div className="h-[250px]">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner size="sm" message="Loading market cap data..." />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={formatMarketCapData()}
                  margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorMarketCap" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" tick={{ fill: '#9CA3AF' }} />
                  <YAxis
                    tick={{ fill: '#9CA3AF' }}
                    tickFormatter={(value) => `$${(value / 1e9).toFixed(1)}B`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }}
                    formatter={(value: number) => [`$${formatLargeNumber(value)}`, 'Market Cap']}
                  />
                  <Area
                    type="monotone"
                    dataKey="marketCap"
                    stroke="#10B981"
                    fillOpacity={1}
                    fill="url(#colorMarketCap)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Trading Volume History</h3>
          <div className="h-[250px]">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner size="sm" message="Loading volume data..." />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={formatVolumeData()}
                  margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" tick={{ fill: '#9CA3AF' }} />
                  <YAxis
                    tick={{ fill: '#9CA3AF' }}
                    tickFormatter={(value) => `$${(value / 1e9).toFixed(1)}B`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }}
                    formatter={(value: number) => [`$${formatLargeNumber(value)}`, 'Volume']}
                  />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke="#8B5CF6"
                    fillOpacity={1}
                    fill="url(#colorVolume)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {detailData?.description?.en && (
        <div className="mb-8 bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">About {name || detailData.name}</h3>
          <div
            className="crypto-description text-gray-300"
            dangerouslySetInnerHTML={{ __html: detailData.description.en }}
          />
        </div>
      )}

      {/* Links and Resources */}
      {detailData?.links && (
        <div className="mb-8 bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Links & Resources</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {detailData.links.homepage?.[0] && (
              <a
                href={detailData.links.homepage[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-crypto-blue hover:underline"
              >
                <Globe size={16} />
                <span>Official Website</span>
              </a>
            )}

            {detailData.links.blockchain_site
              ?.filter(Boolean)
              .slice(0, 3)
              .map((site, index) => (
                <a
                  key={index}
                  href={site}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-crypto-blue hover:underline"
                >
                  <Activity size={16} />
                  <span>Explorer {index + 1}</span>
                </a>
              ))}

            {detailData.links.subreddit_url && (
              <a
                href={detailData.links.subreddit_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-crypto-blue hover:underline"
              >
                <Users size={16} />
                <span>Reddit</span>
              </a>
            )}

            {detailData.links.repos_url?.github
              ?.filter(Boolean)
              .slice(0, 2)
              .map((repo, index) => (
                <a
                  key={index}
                  href={repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-crypto-blue hover:underline"
                >
                  <Globe size={16} />
                  <span>GitHub Repo {index + 1}</span>
                </a>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CryptoDetailPage;
