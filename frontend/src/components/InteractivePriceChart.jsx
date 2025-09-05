import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Eye, EyeOff, BarChart3, Filter, Settings } from 'lucide-react';

const InteractivePriceChart = ({ data, cryptoConfig }) => {
  const [visibleCryptos, setVisibleCryptos] = useState(
    Object.keys(cryptoConfig).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {})
  );

  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(['all']);

  // Categorize cryptocurrencies
  const categories = {
    major: ['bitcoin', 'ethereum', 'binancecoin', 'ripple', 'cardano', 'solana', 'polkadot'],
    defi: ['uniswap', 'aave', 'chainlink', 'polygon'],
    platform: ['avalanche-2', 'algorand', 'cosmos', 'stellar'],
    utility: ['litecoin', 'dogecoin', 'vechain', 'filecoin'],
    gaming: ['the-sandbox'],
    media: ['theta-token'],
    enterprise: ['hedera-hashgraph'],
  };

  const toggleCrypto = (cryptoKey) => {
    setVisibleCryptos((prev) => ({
      ...prev,
      [cryptoKey]: !prev[cryptoKey],
    }));
  };

  const toggleAll = () => {
    const allVisible = Object.values(visibleCryptos).every((v) => v);
    setVisibleCryptos((prev) =>
      Object.keys(prev).reduce((acc, key) => {
        acc[key] = !allVisible;
        return acc;
      }, {})
    );
  };

  const toggleCategory = (category) => {
    if (category === 'all') {
      toggleAll();
      return;
    }

    const cryptosInCategory = categories[category] || [];
    const allCategoryVisible = cryptosInCategory.every((crypto) => visibleCryptos[crypto]);

    setVisibleCryptos((prev) => {
      const newState = { ...prev };
      cryptosInCategory.forEach((crypto) => {
        newState[crypto] = !allCategoryVisible;
      });
      return newState;
    });
  };

  const getVisibleCount = () => {
    return Object.values(visibleCryptos).filter((v) => v).length;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-crypto-dark border border-gray-700 rounded-lg p-4 shadow-xl">
          <p className="text-gray-300 text-sm mb-3 font-medium">{label}</p>
          <div className="space-y-2">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-sm text-gray-200 font-medium">
                    {cryptoConfig[entry.dataKey]?.name}
                  </span>
                </div>
                <span className="text-sm font-bold text-white">
                  ${entry.value?.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      {/* Chart Controls Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-crypto-blue" />
            <span className="text-lg font-semibold">Interactive Price Chart</span>
          </div>
          <div className="text-sm text-gray-400">
            {getVisibleCount()} of {Object.keys(cryptoConfig).length} cryptocurrencies visible
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleAll}
            className="flex items-center space-x-2 px-3 py-1 bg-crypto-blue hover:bg-crypto-blue/80 text-white rounded-lg transition-colors text-sm"
          >
            <Eye className="w-4 h-4" />
            <span>Toggle All</span>
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors text-sm ${
              showFilters
                ? 'bg-crypto-dark border border-crypto-blue text-crypto-blue'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Category Filters */}
      {showFilters && (
        <div className="bg-crypto-dark/50 rounded-lg p-4 mb-6 border border-gray-700">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Filter by Category</h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => toggleCategory('all')}
              className="px-3 py-1 bg-crypto-blue hover:bg-crypto-blue/80 text-white rounded-lg text-sm transition-colors"
            >
              All
            </button>
            {Object.entries(categories).map(([category, cryptos]) => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors capitalize ${
                  cryptos.every((crypto) => visibleCryptos[crypto])
                    ? 'bg-crypto-green/20 text-crypto-green border border-crypto-green/50'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {category} ({cryptos.length})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Crypto Toggle Controls */}
      <div className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {Object.entries(cryptoConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => toggleCrypto(key)}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                visibleCryptos[key]
                  ? 'bg-crypto-dark border-crypto-blue text-white shadow-lg'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{config.icon}</span>
                <div className="text-left">
                  <div className="font-medium text-sm">{config.name}</div>
                  <div className="text-xs text-gray-400">{config.symbol}</div>
                </div>
              </div>
              {visibleCryptos[key] ? (
                <Eye className="w-4 h-4 text-crypto-blue" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-96 bg-crypto-dark/30 rounded-lg p-4 border border-gray-700">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="time"
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ color: '#9CA3AF' }}
              formatter={(value) => cryptoConfig[value]?.name || value}
            />
            {Object.entries(cryptoConfig).map(
              ([key, config]) =>
                visibleCryptos[key] && (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={config.color}
                    strokeWidth={2}
                    dot={{ fill: config.color, strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, fill: config.color }}
                    name={config.name}
                    connectNulls={false}
                  />
                )
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Statistics */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-400">
          Showing {getVisibleCount()} currencies • Data updates every 10 seconds
        </p>
      </div>
    </div>
  );
};

export default InteractivePriceChart;
