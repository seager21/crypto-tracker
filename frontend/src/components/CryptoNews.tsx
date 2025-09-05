import React, { useState, useEffect } from 'react';
import { ExternalLink, Clock, Tag, RefreshCw, AlertCircle, Newspaper } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { NewsArticle, NewsResponse } from '../types';

interface CryptoNewsProps {
  /**
   * Number of news articles to display
   * @default 12
   */
  limit?: number;
}

/**
 * Component that displays cryptocurrency news articles
 */
const CryptoNews: React.FC<CryptoNewsProps> = ({ limit = 12 }) => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  /**
   * Fetch news articles from the API
   */
  const fetchNews = async (isRefresh = false): Promise<void> => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      // Updated to use our new API endpoint
      const response = await fetch(`/api/news?limit=${limit}`, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as NewsResponse;

      if (data.success && data.data) {
        setNews(data.data);
      } else {
        throw new Error(data.message || 'Invalid news data format');
      }
    } catch (error) {
      console.error('Failed to fetch news:', error);
      setError(error instanceof Error ? error.message : 'Failed to load crypto news. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Handle manual refresh button click
   */
  const handleRefresh = (): void => {
    fetchNews(true);
  };

  /**
   * Format a Unix timestamp into a readable date
   */
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  /**
   * Toggle selection of a news tag for filtering
   */
  const toggleTag = (tag: string): void => {
    if (selectedTag === tag) {
      setSelectedTag(null);
    } else {
      setSelectedTag(tag);
    }
  };

  // Get all unique tags from news articles
  const allTags = Array.from(
    new Set(
      news.flatMap(article => article.tags?.filter(Boolean) || [])
    )
  ).slice(0, 10);

  // Filter news by selected tag if one is selected
  const filteredNews = selectedTag
    ? news.filter(article => article.tags?.includes(selectedTag))
    : news;

  if (loading && !news.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner size="lg" message="Loading cryptocurrency news..." />
      </div>
    );
  }

  return (
    <div className="crypto-news">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Cryptocurrency News</h2>
        <button 
          onClick={handleRefresh} 
          className="px-3 py-1 bg-crypto-blue/20 hover:bg-crypto-blue/30 text-crypto-blue rounded-lg flex items-center space-x-2 transition-colors"
          disabled={refreshing}
          aria-label="Refresh news"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
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
      
      {allTags.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm text-gray-400 mb-2">Filter by tag:</h3>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${
                  selectedTag === tag 
                    ? 'bg-crypto-blue text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Tag size={12} className="mr-1" />
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {filteredNews.length === 0 ? (
        <div className="text-center py-12">
          <Newspaper size={48} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No News Found</h3>
          <p className="text-gray-400">
            {selectedTag 
              ? `No news articles found with the tag "${selectedTag}".` 
              : 'No cryptocurrency news articles available at the moment.'}
          </p>
          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="mt-4 px-4 py-2 bg-crypto-blue/30 hover:bg-crypto-blue/50 text-crypto-blue rounded-lg"
            >
              Clear Filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map(article => (
            <div key={article.id} className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700 flex flex-col">
              <div className="relative">
                {article.imageurl ? (
                  <img 
                    src={article.imageurl} 
                    alt={article.title} 
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      // Fallback for broken images
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Cryptocurrency+News';
                    }}
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
                    <Newspaper size={48} className="text-gray-500" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <div className="text-xs font-medium flex items-center text-gray-300">
                    <Clock size={12} className="mr-1" />
                    {formatDate(article.published_on)}
                  </div>
                </div>
              </div>
              
              <div className="p-4 flex-grow">
                <h3 className="font-bold text-lg mb-2 line-clamp-2">{article.title}</h3>
                <p className="text-gray-400 text-sm line-clamp-3">
                  {article.body || 'Click to read the full article.'}
                </p>
              </div>
              
              {article.tags && article.tags.length > 0 && (
                <div className="px-4 py-2 border-t border-gray-700 flex flex-wrap gap-1">
                  {article.tags.slice(0, 3).map(tag => (
                    <span 
                      key={tag} 
                      className="bg-gray-700 text-gray-400 px-2 py-0.5 rounded text-xs cursor-pointer hover:bg-gray-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTag(tag);
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                  {article.tags.length > 3 && (
                    <span className="text-gray-500 text-xs">
                      +{article.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
              
              <div className="p-4 pt-2 border-t border-gray-700 mt-auto">
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-crypto-blue hover:text-crypto-blue-light flex items-center text-sm font-medium"
                >
                  Read on {article.source} <ExternalLink size={14} className="ml-1" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CryptoNews;
