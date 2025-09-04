import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Eye, EyeOff, BarChart3, Filter, Settings } from 'lucide-react';
import { PriceHistoryPoint, CryptoConfig } from '../types';

interface InteractivePriceChartProps {
  /**
   * Array of price history data points
   */
  data: PriceHistoryPoint[];
  
  /**
   * Configuration for cryptocurrencies to display
   */
  cryptoConfig: Record<string, CryptoConfig>;
}

/**
 * Interactive price chart component for displaying cryptocurrency prices
 */
const InteractivePriceChart: React.FC<InteractivePriceChartProps> = ({ data, cryptoConfig }) => {
  const [visibleCryptos, setVisibleCryptos] = useState<Record<string, boolean>>(
    Object.keys(cryptoConfig).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>)
  );
  
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all']);

  // Categorize cryptocurrencies
  const categories: Record<string, string[]> = {
    'major': ['bitcoin', 'ethereum', 'binancecoin', 'ripple', 'cardano', 'solana', 'polkadot'],
    'defi': ['uniswap', 'aave', 'chainlink', 'polygon'],
    'platform': ['avalanche-2', 'algorand', 'cosmos', 'stellar'],
    'other': ['dogecoin', 'filecoin', 'litecoin', 'theta-token', 'vechain', 'hedera-hashgraph', 'the-sandbox'],
  };

  /**
   * Toggle visibility of a cryptocurrency in the chart
   */
  const toggleCrypto = (crypto: string): void => {
    setVisibleCryptos(prev => ({
      ...prev,
      [crypto]: !prev[crypto]
    }));
  };

  /**
   * Toggle visibility of all cryptocurrencies
   */
  const toggleAllCryptos = (value: boolean): void => {
    setVisibleCryptos(
      Object.keys(cryptoConfig).reduce((acc, key) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, boolean>)
    );
  };

  /**
   * Handle category filter change
   */
  const handleCategoryChange = (category: string): void => {
    setSelectedCategories(prev => {
      // If "all" is selected or deselected, handle specially
      if (category === 'all') {
        return ['all'];
      }
      
      // If selecting a category when "all" was previously selected
      const newSelection = prev.includes('all') 
        ? [category]
        : prev.includes(category)
          ? prev.filter(cat => cat !== category)
          : [...prev, category];
          
      // If no categories are selected, default to "all"
      return newSelection.length === 0 ? ['all'] : newSelection;
    });
    
    // Update visible cryptos based on categories
    if (category === 'all') {
      toggleAllCryptos(true);
    } else {
      const cryptosInCategory = categories[category] || [];
      
      setVisibleCryptos(prev => {
        const newState = { ...prev };
        
        if (selectedCategories.includes(category)) {
          // Category is being deselected
          cryptosInCategory.forEach(crypto => {
            newState[crypto] = false;
          });
        } else {
          // Category is being selected
          if (selectedCategories.includes('all')) {
            // If "all" was selected, deselect everything first
            Object.keys(newState).forEach(key => {
              newState[key] = false;
            });
          }
          
          // Then select the category's cryptos
          cryptosInCategory.forEach(crypto => {
            newState[crypto] = true;
          });
        }
        
        return newState;
      });
    }
  };

  const formatPrice = (value: number): string => {
    return `$${value.toLocaleString(undefined, { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    })}`;
  };

  // Get visible data
  const visibleData = data.map(point => {
    const newPoint: PriceHistoryPoint = { time: point.time };
    
    Object.keys(cryptoConfig).forEach(key => {
      if (visibleCryptos[key] && point[key] !== undefined) {
        newPoint[key] = point[key];
      }
    });
    
    return newPoint;
  });

  return (
    <div className="interactive-chart">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className="text-gray-400 hover:text-white"
            aria-label={showFilters ? "Hide filters" : "Show filters"}
          >
            <Filter size={18} />
          </button>
          <button 
            onClick={() => toggleAllCryptos(true)} 
            className="text-gray-400 hover:text-white"
            aria-label="Show all cryptocurrencies"
          >
            <Eye size={18} />
          </button>
          <button 
            onClick={() => toggleAllCryptos(false)} 
            className="text-gray-400 hover:text-white"
            aria-label="Hide all cryptocurrencies"
          >
            <EyeOff size={18} />
          </button>
        </div>
        
        <div className="text-gray-400 text-sm">
          {Object.keys(visibleCryptos).filter(key => visibleCryptos[key]).length} currencies shown
        </div>
      </div>
      
      {showFilters && (
        <div className="mb-4 bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <h3 className="text-sm font-medium mb-2 text-gray-400">Filter by category:</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`filter-btn ${selectedCategories.includes('all') ? 'active' : ''}`}
            >
              All
            </button>
            
            <button
              onClick={() => handleCategoryChange('major')}
              className={`filter-btn ${selectedCategories.includes('major') ? 'active' : ''}`}
            >
              Major Coins
            </button>
            
            <button
              onClick={() => handleCategoryChange('defi')}
              className={`filter-btn ${selectedCategories.includes('defi') ? 'active' : ''}`}
            >
              DeFi
            </button>
            
            <button
              onClick={() => handleCategoryChange('platform')}
              className={`filter-btn ${selectedCategories.includes('platform') ? 'active' : ''}`}
            >
              Platforms
            </button>
            
            <button
              onClick={() => handleCategoryChange('other')}
              className={`filter-btn ${selectedCategories.includes('other') ? 'active' : ''}`}
            >
              Others
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 mt-3">
            {Object.keys(cryptoConfig).map(key => (
              <button
                key={key}
                onClick={() => toggleCrypto(key)}
                className={`crypto-toggle flex items-center space-x-1 px-2 py-1 rounded ${visibleCryptos[key] ? 'bg-gray-700' : 'bg-gray-800'}`}
                style={{ borderLeft: visibleCryptos[key] ? `3px solid ${cryptoConfig[key].color}` : '3px solid transparent' }}
              >
                <span>{cryptoConfig[key].icon}</span>
                <span className="text-xs">{cryptoConfig[key].symbol}</span>
                {visibleCryptos[key] ? <Eye size={12} /> : <EyeOff size={12} />}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={visibleData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                color: '#F9FAFB',
              }}
              formatter={(value: number, name: string) => [
                formatPrice(value), 
                cryptoConfig[name]?.name || name,
              ]}
              labelStyle={{ color: '#9CA3AF' }}
            />
            <Legend 
              wrapperStyle={{ color: '#9CA3AF' }}
            />
            
            {Object.keys(cryptoConfig).map(key => {
              if (!visibleCryptos[key]) return null;
              
              return (
                <Line 
                  key={key}
                  type="monotone" 
                  dataKey={key} 
                  stroke={cryptoConfig[key].color}
                  strokeWidth={2}
                  dot={{ fill: cryptoConfig[key].color, strokeWidth: 1, r: 3 }}
                  activeDot={{ r: 5 }}
                  name={cryptoConfig[key].name}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default InteractivePriceChart;
