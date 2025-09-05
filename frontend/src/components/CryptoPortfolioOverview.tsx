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
import { CryptoData, CryptoConfig } from '../types';

interface CryptoPortfolioOverviewProps {
  /**
   * Cryptocurrency data from API
   */
  cryptoData: Record<string, CryptoData> | null;

  /**
   * Configuration for cryptocurrencies
   */
  cryptoConfig: Record<string, CryptoConfig>;

  /**
   * Handler for when a cryptocurrency is clicked
   */
  onCryptoClick: (cryptoId: string) => void;
}

/**
 * Component for displaying and managing a cryptocurrency portfolio
 */
const CryptoPortfolioOverview: React.FC<CryptoPortfolioOverviewProps> = ({
  cryptoData,
  cryptoConfig,
  onCryptoClick,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('marketCap');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories: Record<string, string> = {
    all: 'All Cryptos',
    major: 'Major Coins',
    defi: 'DeFi Tokens',
    platform: 'Platform Tokens',
    utility: 'Utility Tokens',
    gaming: 'Gaming & NFT',
    media: 'Media & Entertainment',
  };

  // Categorize cryptos
  const cryptoCategories: Record<string, string[]> = {
    major: ['bitcoin', 'ethereum', 'binancecoin', 'ripple', 'cardano', 'solana'],
    defi: ['uniswap', 'aave', 'chainlink', 'polygon'],
    platform: ['avalanche-2', 'algorand', 'cosmos', 'stellar', 'polkadot'],
    utility: ['litecoin', 'vechain', 'hedera-hashgraph'],
    gaming: ['the-sandbox', 'dogecoin'],
    media: ['theta-token'],
  };

  /**
   * Format large numbers with appropriate suffixes
   */
  const formatNumber = (num: number): string => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  /**
   * Filter cryptocurrencies based on search term and selected category
   */
  const getFilteredCryptos = (): Array<{ id: string; data: CryptoData }> => {
    if (!cryptoData) return [];

    return Object.keys(cryptoConfig)
      .filter((key) => {
        const apiKey = key === 'avalanche-2' ? 'avalanche-2' : key;

        // Check if data exists
        if (!cryptoData[apiKey]) return false;

        // Filter by search term
        const matchesSearch =
          searchTerm === '' ||
          cryptoConfig[key].name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cryptoConfig[key].symbol.toLowerCase().includes(searchTerm.toLowerCase());

        // Filter by category
        const matchesCategory =
          selectedCategory === 'all' ||
          (cryptoCategories[selectedCategory] && cryptoCategories[selectedCategory].includes(key));

        return matchesSearch && matchesCategory;
      })
      .map((key) => {
        const apiKey = key === 'avalanche-2' ? 'avalanche-2' : key;
        return { id: key, data: cryptoData[apiKey] };
      })
      .sort((a, b) => {
        const aValue = getSortValue(a.id, a.data);
        const bValue = getSortValue(b.id, b.data);

        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      });
  };

  /**
   * Get the value to sort by
   */
  const getSortValue = (cryptoId: string, data: CryptoData): number => {
    switch (sortBy) {
      case 'name':
        return cryptoConfig[cryptoId].name.charCodeAt(0);
      case 'price':
        return data.usd;
      case 'change':
        return data.usd_24h_change;
      case 'marketCap':
        return data.usd_market_cap;
      case 'volume':
        return data.usd_24h_vol;
      default:
        return data.usd_market_cap;
    }
  };

  /**
   * Handle sort order change
   */
  const handleSortOrderChange = (): void => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  /**
   * Handle sort by change
   */
  const handleSortByChange = (value: string): void => {
    if (sortBy === value) {
      handleSortOrderChange();
    } else {
      setSortBy(value);
    }
  };

  /**
   * Get the total portfolio value
   */
  const getTotalPortfolioValue = (): number => {
    // This would be replaced with actual portfolio holdings calculation
    // For now, just sum up the market caps as a placeholder
    return getFilteredCryptos().reduce((total, { data }) => {
      return total + data.usd_market_cap / 1e9; // Convert to billions
    }, 0);
  };

  const filteredCryptos = getFilteredCryptos();

  return (
    <div className="portfolio-overview">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="stat-card flex flex-col md:flex-row justify-between">
          <div>
            <h3 className="text-gray-400 mb-1">Total Portfolio Value</h3>
            <div className="text-2xl font-bold">${getTotalPortfolioValue().toFixed(2)}B</div>
          </div>
          <div className="mt-2 md:mt-0 text-right">
            <h3 className="text-gray-400 mb-1">Cryptos Tracked</h3>
            <div className="text-2xl font-bold">{filteredCryptos.length}</div>
          </div>
        </div>

        <div className="filter-card">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              size={18}
            />
            <input
              type="text"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-10 text-gray-300 focus:outline-none focus:ring-2 focus:ring-crypto-blue focus:border-transparent"
              placeholder="Search cryptocurrencies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex justify-between mt-3">
            <div className="flex space-x-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                aria-label="Grid view"
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                aria-label="List view"
              >
                <List size={18} />
              </button>
            </div>
            <button
              onClick={handleSortOrderChange}
              className="view-toggle-btn"
              aria-label={sortOrder === 'asc' ? 'Sort descending' : 'Sort ascending'}
            >
              {sortOrder === 'asc' ? <SortAsc size={18} /> : <SortDesc size={18} />}
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 overflow-x-auto">
        <div className="flex space-x-2">
          {Object.entries(categories).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`category-btn ${selectedCategory === key ? 'active' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="rounded-xl overflow-hidden bg-gray-800/50 border border-gray-700">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900/30">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortByChange('name')}
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortByChange('price')}
                >
                  Price
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortByChange('change')}
                >
                  24h %
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hidden md:table-cell"
                  onClick={() => handleSortByChange('marketCap')}
                >
                  Market Cap
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hidden lg:table-cell"
                  onClick={() => handleSortByChange('volume')}
                >
                  Volume (24h)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredCryptos.map(({ id, data }) => {
                const isPositive = data.usd_24h_change >= 0;

                return (
                  <tr
                    key={id}
                    className="hover:bg-gray-700/30 cursor-pointer transition-colors"
                    onClick={() => onCryptoClick(id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-xl mr-3">{cryptoConfig[id].icon}</div>
                        <div>
                          <div className="font-medium">{cryptoConfig[id].name}</div>
                          <div className="text-gray-400 text-sm">{cryptoConfig[id].symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="font-medium">${data.usd.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div
                        className={`flex items-center justify-end space-x-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}
                      >
                        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <span>
                          {isPositive ? '+' : ''}
                          {data.usd_24h_change.toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right hidden md:table-cell">
                      {formatNumber(data.usd_market_cap)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right hidden lg:table-cell">
                      {formatNumber(data.usd_24h_vol)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCryptos.map(({ id, data }) => {
            const isPositive = data.usd_24h_change >= 0;

            return (
              <div
                key={id}
                className={`bg-gradient-to-br ${cryptoConfig[id].cardColor === 'orange' ? 'from-orange-500/20 to-orange-600/20 border-orange-500/30' : ''}
                ${cryptoConfig[id].cardColor === 'blue' ? 'from-blue-500/20 to-blue-600/20 border-blue-500/30' : ''}
                ${cryptoConfig[id].cardColor === 'green' ? 'from-green-500/20 to-green-600/20 border-green-500/30' : ''}
                ${cryptoConfig[id].cardColor === 'purple' ? 'from-purple-500/20 to-purple-600/20 border-purple-500/30' : ''}
                ${cryptoConfig[id].cardColor === 'red' ? 'from-red-500/20 to-red-600/20 border-red-500/30' : ''}
                ${cryptoConfig[id].cardColor === 'yellow' ? 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30' : ''}
                ${cryptoConfig[id].cardColor === 'indigo' ? 'from-indigo-500/20 to-indigo-600/20 border-indigo-500/30' : ''}
                ${cryptoConfig[id].cardColor === 'pink' ? 'from-pink-500/20 to-pink-600/20 border-pink-500/30' : ''}
                ${cryptoConfig[id].cardColor === 'gray' ? 'from-gray-500/20 to-gray-600/20 border-gray-500/30' : ''}
                ${cryptoConfig[id].cardColor === 'teal' ? 'from-teal-500/20 to-teal-600/20 border-teal-500/30' : ''}
                ${cryptoConfig[id].cardColor === 'cyan' ? 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30' : ''}
                ${cryptoConfig[id].cardColor === 'amber' ? 'from-amber-500/20 to-amber-600/20 border-amber-500/30' : ''}
                ${cryptoConfig[id].cardColor === 'violet' ? 'from-violet-500/20 to-violet-600/20 border-violet-500/30' : ''}
                ${cryptoConfig[id].cardColor === 'sky' ? 'from-sky-500/20 to-sky-600/20 border-sky-500/30' : ''}
                ${cryptoConfig[id].cardColor === 'lime' ? 'from-lime-500/20 to-lime-600/20 border-lime-500/30' : ''}
                ${cryptoConfig[id].cardColor === 'slate' ? 'from-slate-500/20 to-slate-600/20 border-slate-500/30' : ''}
                p-4 rounded-xl border cursor-pointer hover:shadow-lg transition-shadow`}
                onClick={() => onCryptoClick(id)}
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{cryptoConfig[id].icon}</div>
                    <div>
                      <h3 className="font-medium">{cryptoConfig[id].name}</h3>
                      <p className="text-gray-400 text-sm">{cryptoConfig[id].symbol}</p>
                    </div>
                  </div>
                  <div
                    className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
                      isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span className="text-xs">
                      {isPositive ? '+' : ''}
                      {data.usd_24h_change.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div className="text-lg font-bold">${data.usd.toLocaleString()}</div>

                <div className="flex justify-between text-sm text-gray-400 mt-2">
                  <span>Market Cap:</span>
                  <span>{formatNumber(data.usd_market_cap)}</span>
                </div>

                <div className="flex justify-between text-sm text-gray-400">
                  <span>Volume (24h):</span>
                  <span>{formatNumber(data.usd_24h_vol)}</span>
                </div>

                <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${isPositive ? 'bg-green-500' : 'bg-red-500'} rounded-full`}
                    style={{ width: `${Math.min(Math.abs(data.usd_24h_change) * 5, 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredCryptos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No cryptocurrencies found matching your search criteria.</p>
          <button
            className="mt-4 px-4 py-2 bg-crypto-blue/30 hover:bg-crypto-blue/50 text-crypto-blue rounded-lg"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

export default CryptoPortfolioOverview;
