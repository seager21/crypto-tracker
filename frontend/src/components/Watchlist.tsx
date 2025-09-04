import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface WatchlistProps {
  cryptoData: Record<string, any> | null;
  cryptoConfig: Record<string, any>;
}

const Watchlist: React.FC<WatchlistProps> = ({ cryptoData, cryptoConfig }) => {
  const { userData, removeFromWatchlist } = useAuth();

  const handleRemoveFromWatchlist = async (cryptoId: string, name: string) => {
    try {
      await removeFromWatchlist(cryptoId);
      toast.success(`${name} removed from watchlist`);
    } catch (error) {
      toast.error('Failed to remove from watchlist');
    }
  };

  if (!userData) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 text-center">
        <p className="text-gray-400">Please log in to use watchlist</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Star className="h-5 w-5 mr-2 text-yellow-400" />
          Your Watchlist
        </h2>
      </div>

      {userData.watchlist.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">Your watchlist is empty</p>
          <p className="text-gray-500 text-sm mt-2">
            Add cryptocurrencies to track them here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {userData.watchlist.map((item) => {
            const cryptoInfo = cryptoConfig[item.cryptoId];
            const price = cryptoData?.[item.cryptoId]?.usd || 0;
            const priceChange = cryptoData?.[item.cryptoId]?.usd_24h_change || 0;
            const isPositive = priceChange >= 0;

            return (
              <div
                key={item.id}
                className="flex items-center justify-between bg-gray-700 p-3 rounded-lg"
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium bg-${cryptoInfo?.cardColor || 'gray'}-600`}>
                    {cryptoInfo?.icon || '?'}
                  </div>
                  <div className="ml-3">
                    <p className="text-white font-medium">{item.name}</p>
                    <p className="text-gray-400 text-sm">{item.symbol.toUpperCase()}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-white font-medium">
                      ${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                    <p
                      className={`text-sm ${
                        isPositive ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {priceChange.toFixed(2)}%
                    </p>
                  </div>

                  <button
                    onClick={() => handleRemoveFromWatchlist(item.cryptoId, item.name)}
                    className="p-1.5 rounded-full bg-gray-600 hover:bg-gray-500 text-gray-300"
                    aria-label={`Remove ${item.name} from watchlist`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
