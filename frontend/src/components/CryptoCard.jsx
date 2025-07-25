import React from 'react';
import { TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';

const CryptoCard = ({ name, symbol, price, change24h, marketCap, icon, color, onClick, cryptoId }) => {
  const isPositive = change24h >= 0;
  const colorClasses = {
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    red: 'from-red-500/20 to-red-600/20 border-red-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
    pink: 'from-pink-500/20 to-pink-600/20 border-pink-500/30',
    indigo: 'from-indigo-500/20 to-indigo-600/20 border-indigo-500/30',
    teal: 'from-teal-500/20 to-teal-600/20 border-teal-500/30',
    gray: 'from-gray-500/20 to-gray-600/20 border-gray-500/30',
    cyan: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30',
    lime: 'from-lime-500/20 to-lime-600/20 border-lime-500/30',
    // New color variants
    slate: 'from-slate-500/20 to-slate-600/20 border-slate-500/30',
    amber: 'from-amber-500/20 to-amber-600/20 border-amber-500/30',
    violet: 'from-violet-500/20 to-violet-600/20 border-violet-500/30',
    sky: 'from-sky-500/20 to-sky-600/20 border-sky-500/30',
  };

  const formatNumber = (num) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num?.toFixed(2) || '0.00'}`;
  };

  return (
    <div 
      className={`crypto-card bg-gradient-to-br ${colorClasses[color]} animate-fade-in cursor-pointer relative group`}
      onClick={() => onClick && onClick(cryptoId)}
    >
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <ExternalLink className="w-5 h-5 text-gray-400" />
      </div>
      
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
      
      <div className="mt-3 text-center">
        <p className="text-xs text-gray-500">Click to view details</p>
      </div>
    </div>
  );
};

export default CryptoCard;
