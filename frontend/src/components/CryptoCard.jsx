import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const CryptoCard = ({ name, symbol, price, change24h, marketCap, icon, color }) => {
  const isPositive = change24h >= 0;
  const colorClasses = {
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
  };

  const formatNumber = (num) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num?.toFixed(2) || '0.00'}`;
  };

  return (
    <div className={`crypto-card bg-gradient-to-br ${colorClasses[color]} animate-fade-in`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{icon}</div>
          <div>
            <h3 className="text-xl font-bold">{name}</h3>
            <p className="text-gray-400 text-sm">{symbol}</p>
          </div>
        </div>
        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full ${
          isPositive ? 'bg-crypto-green/20 text-crypto-green' : 'bg-crypto-red/20 text-crypto-red'
        }`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span className="text-sm font-medium">
            {isPositive ? '+' : ''}{change24h?.toFixed(2) || '0.00'}%
          </span>
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <p className="text-gray-400 text-sm">Current Price</p>
          <p className="text-3xl font-bold">${price?.toLocaleString() || '0.00'}</p>
        </div>
        
        <div>
          <p className="text-gray-400 text-sm">Market Cap</p>
          <p className="text-lg font-semibold">{formatNumber(marketCap)}</p>
        </div>
      </div>
      
      <div className="mt-4 h-1 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${isPositive ? 'bg-crypto-green' : 'bg-crypto-red'} rounded-full transition-all duration-1000`}
          style={{ width: `${Math.min(Math.abs(change24h) * 10, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

export default CryptoCard;
