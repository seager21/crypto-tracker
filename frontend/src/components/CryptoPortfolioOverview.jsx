import React, { useState } from 'react';
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Star,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

const CryptoPortfolioOverview = ({ cryptoData, cryptoConfig, onCryptoClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('marketCap');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = {
    all: 'All Cryptos',
    major: 'Major Coins',
    defi: 'DeFi Tokens',
    platform: 'Platform Tokens',
    utility: 'Utility Tokens',
    gaming: 'Gaming & NFT',
    media: 'Media & Entertainment',
  };

  const categoryMappings = {
    major: ['bitcoin', 'ethereum', 'binancecoin', 'ripple', 'cardano', 'solana', 'polkadot'],
    defi: ['uniswap', 'aave', 'chainlink', 'polygon'],
    platform: ['avalanche-2', 'algorand', 'cosmos', 'stellar'],
    utility: ['litecoin', 'dogecoin', 'vechain', 'filecoin'],
    gaming: ['the-sandbox'],
    media: ['theta-token'],
    enterprise: ['hedera-hashgraph'],
  };

  const filterCryptos = () => {
    let filtered = Object.entries(cryptoConfig).filter(([key, config]) => {
      const apiKey = key === 'avalanche-2' ? 'avalanche-2' : key;
      const data = cryptoData?.[apiKey];
      if (!data) return false;

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (
          !config.name.toLowerCase().includes(searchLower) &&
          !config.symbol.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all') {
        const cryptosInCategory = categoryMappings[selectedCategory] || [];
        if (!cryptosInCategory.includes(key)) {
          return false;
        }
      }

      return true;
    });

    // Sort
    filtered.sort(([keyA, configA], [keyB, configB]) => {
      const apiKeyA = keyA === 'avalanche-2' ? 'avalanche-2' : keyA;
      const apiKeyB = keyB === 'avalanche-2' ? 'avalanche-2' : keyB;
      const dataA = cryptoData[apiKeyA];
      const dataB = cryptoData[apiKeyB];

      let valueA, valueB;
      switch (sortBy) {
        case 'name':
          valueA = configA.name;
          valueB = configB.name;
          break;
        case 'price':
          valueA = dataA?.usd || 0;
          valueB = dataB?.usd || 0;
          break;
        case 'change24h':
          valueA = dataA?.usd_24h_change || 0;
          valueB = dataB?.usd_24h_change || 0;
          break;
        case 'marketCap':
        default:
          valueA = dataA?.usd_market_cap || 0;
          valueB = dataB?.usd_market_cap || 0;
          break;
      }

      if (typeof valueA === 'string') {
        return sortOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
      }
      return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
    });

    return filtered;
  };

  const formatNumber = (num) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num?.toFixed(2) || '0.00'}`;
  };

  const filteredCryptos = filterCryptos();

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search cryptocurrencies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-crypto-dark border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-crypto-blue"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-crypto-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-crypto-blue"
          >
            {Object.entries(categories).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Sort Controls */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-crypto-dark border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-crypto-blue"
          >
            <option value="marketCap">Market Cap</option>
            <option value="price">Price</option>
            <option value="change24h">24h Change</option>
            <option value="name">Name</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 bg-crypto-dark border border-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            {sortOrder === 'asc' ? (
              <SortAsc className="w-4 h-4" />
            ) : (
              <SortDesc className="w-4 h-4" />
            )}
          </button>

          {/* View Mode */}
          <div className="flex border border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-crypto-blue text-white' : 'bg-crypto-dark text-gray-400'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-crypto-blue text-white' : 'bg-crypto-dark text-gray-400'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>
          Showing {filteredCryptos.length} of {Object.keys(cryptoConfig).length} cryptocurrencies
        </span>
        <span>
          Sorted by {sortBy} ({sortOrder === 'asc' ? 'ascending' : 'descending'})
        </span>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-2">
          {filteredCryptos.map(([key, config]) => {
            const apiKey = key === 'avalanche-2' ? 'avalanche-2' : key;
            const data = cryptoData?.[apiKey];
            const isPositive = data?.usd_24h_change >= 0;

            return (
              <div
                key={key}
                onClick={() => onCryptoClick(key)}
                className="flex items-center justify-between p-4 bg-crypto-dark border border-gray-700 rounded-lg hover:bg-crypto-dark/80 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <span className="text-2xl">{config.icon}</span>
                  <div>
                    <div className="font-semibold">{config.name}</div>
                    <div className="text-sm text-gray-400">{config.symbol}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-6 text-right">
                  <div>
                    <div className="font-semibold">${data?.usd?.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">
                      {formatNumber(data?.usd_market_cap)}
                    </div>
                  </div>

                  <div
                    className={`flex items-center space-x-1 ${isPositive ? 'text-crypto-green' : 'text-crypto-red'}`}
                  >
                    {isPositive ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span>
                      {isPositive ? '+' : ''}
                      {data?.usd_24h_change?.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {filteredCryptos.map(([key, config]) => {
            const apiKey = key === 'avalanche-2' ? 'avalanche-2' : key;
            const data = cryptoData?.[apiKey];

            return (
              <div
                key={key}
                onClick={() => onCryptoClick(key)}
                className="card hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                      <h3 className="font-bold">{config.name}</h3>
                      <p className="text-gray-400 text-sm">{config.symbol}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-gray-400 text-sm">Price</p>
                    <p className="text-xl font-bold">${data?.usd?.toLocaleString()}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-xs">24h Change</p>
                      <p
                        className={`text-sm font-semibold ${
                          data?.usd_24h_change >= 0 ? 'text-crypto-green' : 'text-crypto-red'
                        }`}
                      >
                        {data?.usd_24h_change >= 0 ? '+' : ''}
                        {data?.usd_24h_change?.toFixed(2)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-xs">Market Cap</p>
                      <p className="text-sm font-semibold">{formatNumber(data?.usd_market_cap)}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No Results */}
      {filteredCryptos.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No cryptocurrencies found</div>
          <div className="text-gray-500 text-sm">Try adjusting your search or filter criteria</div>
        </div>
      )}
    </div>
  );
};

export default CryptoPortfolioOverview;
