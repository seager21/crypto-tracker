import React, { useState, useEffect } from 'react';
import { ExternalLink, Clock, Tag, RefreshCw, AlertCircle, Newspaper } from 'lucide-react';

const CryptoNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch('/api/news?limit=12', {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('News data received:', data);

      if (data.success && data.data) {
        setNews(data.data);
      } else {
        throw new Error('Invalid news data format');
      }
    } catch (error) {
      console.error('Failed to fetch news:', error);
      setError('Failed to load crypto news. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchNews(true);
  };

  const formatTimeAgo = (timestamp) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading && news.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Newspaper className="w-8 h-8 text-crypto-green" />
            <h2 className="text-2xl font-bold">Crypto News</h2>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="card">
              <div className="animate-pulse">
                <div className="w-full h-48 bg-gray-700 rounded-lg mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-700 rounded w-full"></div>
                  <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Newspaper className="w-8 h-8 text-crypto-green" />
          <h2 className="text-2xl font-bold">Crypto News</h2>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-crypto-blue hover:bg-crypto-blue/80 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="card border-red-500/50 bg-red-500/10">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <div>
              <h3 className="font-semibold text-red-300">Error Loading News</h3>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* News Grid */}
      {news.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((article) => (
            <article
              key={article.id}
              className="card group hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              {/* Image */}
              <div className="relative overflow-hidden rounded-lg mb-4">
                <img
                  src={article.imageurl || 'https://via.placeholder.com/300x200?text=Crypto+News'}
                  alt={article.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=Crypto+News';
                  }}
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-crypto-blue/90 text-white text-xs px-2 py-1 rounded-full">
                    {article.source}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <h3 className="font-bold text-lg leading-tight group-hover:text-crypto-green transition-colors">
                  {article.title}
                </h3>
                
                <p className="text-gray-400 text-sm">
                  {truncateText(article.body)}
                </p>

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {article.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="flex items-center space-x-1 bg-crypto-dark/50 text-xs px-2 py-1 rounded-full"
                      >
                        <Tag className="w-3 h-3" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                  <div className="flex items-center space-x-2 text-gray-400 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{formatTimeAgo(article.published_on)}</span>
                  </div>
                  
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-crypto-blue hover:text-crypto-green transition-colors text-sm"
                  >
                    <span>Read more</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* No News State */}
      {!loading && !error && news.length === 0 && (
        <div className="card text-center py-12">
          <Newspaper className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No News Available</h3>
          <p className="text-gray-400">
            Unable to load crypto news at the moment. Please try refreshing.
          </p>
        </div>
      )}
    </div>
  );
};

export default CryptoNews;
