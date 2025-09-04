import React from 'react';
import { TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';

interface CryptoCardProps {
  /** Name of the cryptocurrency */
  name: string;
  
  /** Trading symbol of the cryptocurrency */
  symbol: string;
  
  /** Current price in USD */
  price: number;
  
  /** 24-hour price change percentage */
  change24h: number;
  
  /** Market capitalization in USD */
  marketCap: number;
  
  /** Icon/emoji to represent the cryptocurrency */
  icon: string;
  
  /** Color theme for the card */
  color: string;
  
  /** Handler for click events */
  onClick?: (cryptoId: string) => void;
  
  /** Unique identifier for the cryptocurrency */
  cryptoId: string;
}

/**
 * CryptoCard component displays cryptocurrency information in a styled card
 */
const CryptoCard: React.FC<CryptoCardProps> = ({ 
  name, 
  symbol, 
  price, 
  change24h, 
  marketCap, 
  icon, 
  color, 
  onClick, 
  cryptoId 
}) => {
  const isPositive = change24h >= 0;
  
  // Color themes for different cryptocurrencies
  const colorClasses: Record<string, string> = {
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
    slate: 'from-slate-500/20 to-slate-600/20 border-slate-500/30',
    amber: 'from-amber-500/20 to-amber-600/20 border-amber-500/30',
    violet: 'from-violet-500/20 to-violet-600/20 border-violet-500/30',
    sky: 'from-sky-500/20 to-sky-600/20 border-sky-500/30',
  };

  /**
   * Format a number as currency with appropriate suffixes
   * @param num - The number to format
   * @returns Formatted currency string
   */
  const formatNumber = (num: number): string => {
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
      
      <div className="flex items-start mb-6">
        <div className="crypto-icon mr-4 text-3xl leading-none">{icon}</div>
        <div>
          <h3 className="text-lg font-bold text-white">{name}</h3>
          <div className="text-gray-400">{symbol}</div>
        </div>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <div className="text-sm text-gray-400 mb-1">Price</div>
          <div className="text-2xl font-bold text-white">${price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</div>
        </div>
        
        <div className={`flex flex-col items-end ${isPositive ? 'text-crypto-green' : 'text-crypto-red'}`}>
          <div className="flex items-center">
            {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            <div className="font-medium">
              {isPositive ? '+' : ''}{change24h?.toFixed(2)}%
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            24h: {formatNumber(marketCap)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoCard;
