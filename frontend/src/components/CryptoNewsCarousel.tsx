import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, Clock, Tag, RefreshCw, AlertCircle, Newspaper, ChevronLeft, ChevronRight, X } from 'lucide-react';

// Interface for news article data from API
interface NewsArticle {
  id: string;
  title: string;
  body: string;
  url: string;
  imageurl: string | null;
  source: string;
  published_on: number;
  tags: string[];
  full_content?: string;
}

// Interface for API response
interface NewsResponse {
  success: boolean;
  data: NewsArticle[];
  source: string;
  message?: string;
}

const CryptoNewsCarousel: React.FC = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNews();

    // Auto-rotate carousel
    const interval = setInterval(() => {
      if (!modalOpen) {
        nextSlide();
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [modalOpen]);

  /**
   * Fetch news from the API
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
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch('/api/news?limit=10', {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as NewsResponse;
      console.log('News data received:', data);

      if (data.success && data.data && data.data.length > 0) {
        setNews(data.data);
        setCurrentSlide(0); // Reset to first slide on new data
      } else {
        throw new Error('Invalid news data format');
      }
    } catch (error) {
      console.error('Failed to fetch news:', error);
      setError(error instanceof Error ? error.message : 'Failed to load crypto news');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Handle manual refresh
   */
  const handleRefresh = (): void => {
    fetchNews(true);
  };

  /**
   * Format timestamp to relative time (e.g., "5 hours ago")
   */
  const formatTimeAgo = (timestamp: number): string => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
  };

  /**
   * Truncate text to specified length
   */
  const truncateText = (text: string, maxLength = 150): string => {
    if (!text) return 'No description available';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  /**
   * Move to next slide in carousel
   */
  const nextSlide = (): void => {
    setCurrentSlide((prev) => (prev === news.length - 1 ? 0 : prev + 1));
  };

  /**
   * Move to previous slide in carousel
   */
  const prevSlide = (): void => {
    setCurrentSlide((prev) => (prev === 0 ? news.length - 1 : prev - 1));
  };

  /**
   * Open modal with article details
   */
  const openArticleModal = (article: NewsArticle): void => {
    setSelectedArticle(article);
    setModalOpen(true);
  };

  /**
   * Close article modal
   */
  const closeModal = (): void => {
    setModalOpen(false);
    setSelectedArticle(null);
  };

  // Loading state
  if (loading && news.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Newspaper className="w-8 h-8 text-crypto-green" />
            <h2 className="text-2xl font-bold">Crypto News</h2>
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-8 flex items-center justify-center">
          <div className="animate-pulse flex space-x-6 w-full">
            <div className="h-64 w-1/3 bg-gray-700 rounded-lg"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-6 bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-700 rounded"></div>
                <div className="h-3 bg-gray-700 rounded"></div>
                <div className="h-3 bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
          </div>
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

      {/* News Carousel */}
      {news.length > 0 && (
        <div className="relative">
          <div 
            ref={carouselRef}
            className="carousel-container rounded-lg overflow-hidden relative"
          >
            {news.map((article, index) => (
              <div
                key={article.id}
                className={`carousel-slide ${
                  index === currentSlide ? 'block' : 'hidden'
                }`}
              >
                <div className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700 flex flex-col md:flex-row">
                  {/* Left: Image */}
                  <div className="md:w-1/3 relative h-64">
                    <img
                      src={article.imageurl || 'https://via.placeholder.com/300x200?text=Crypto+News'}
                      alt={article.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Crypto+News';
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-crypto-blue/90 text-white text-xs px-2 py-1 rounded-full">
                        {article.source}
                      </span>
                    </div>
                  </div>
                  
                  {/* Right: Content */}
                  <div className="md:w-2/3 p-6 flex flex-col justify-between">
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold leading-tight hover:text-crypto-green transition-colors">
                        {article.title}
                      </h3>
                      
                      <p className="text-gray-400 text-sm">
                        {truncateText(article.body, 200)}
                      </p>
                      
                      {/* Tags */}
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {article.tags.slice(0, 4).map((tag, i) => (
                            <span
                              key={i}
                              className="flex items-center space-x-1 bg-crypto-dark/50 text-xs px-2 py-1 rounded-full"
                            >
                              <Tag className="w-3 h-3" />
                              <span>{tag}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-700">
                      <div className="flex items-center space-x-2 text-gray-400 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{formatTimeAgo(article.published_on)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => openArticleModal(article)}
                          className="flex items-center space-x-1 text-crypto-green hover:text-crypto-blue transition-colors text-sm"
                        >
                          <span>Read more</span>
                        </button>
                        
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 text-crypto-blue hover:text-crypto-green transition-colors text-sm"
                        >
                          <span>Original</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Navigation Controls */}
          <div className="flex justify-center mt-4">
            <div className="flex items-center space-x-1">
              <button
                onClick={prevSlide}
                className="p-2 rounded-full bg-gray-800 hover:bg-crypto-blue/70 transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {/* Dots navigation */}
              <div className="flex items-center space-x-1">
                {news.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      currentSlide === index ? 'bg-crypto-green' : 'bg-gray-600'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
              
              <button
                onClick={nextSlide}
                className="p-2 rounded-full bg-gray-800 hover:bg-crypto-blue/70 transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
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

      {/* Modal for full article */}
      {modalOpen && selectedArticle && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 z-10 p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-bold">{selectedArticle.source}</h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-800 rounded-full"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Image */}
              {selectedArticle.imageurl && (
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={selectedArticle.imageurl}
                    alt={selectedArticle.title}
                    className="w-full max-h-80 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=No+Image+Available';
                    }}
                  />
                </div>
              )}
              
              {/* Title */}
              <h2 className="text-2xl font-bold">{selectedArticle.title}</h2>
              
              {/* Metadata */}
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(selectedArticle.published_on * 1000).toLocaleString()}</span>
                </div>
                
                {/* Tags */}
                {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedArticle.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="flex items-center space-x-1 bg-crypto-dark/50 text-xs px-2 py-1 rounded-full"
                      >
                        <Tag className="w-3 h-3" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="prose prose-invert max-w-none">
                <p>{selectedArticle.full_content || selectedArticle.body}</p>
              </div>
              
              {/* Footer with link */}
              <div className="pt-6 border-t border-gray-700">
                <a
                  href={selectedArticle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-crypto-blue hover:bg-crypto-blue/80 rounded-lg transition-colors"
                >
                  <span>Read full article on {selectedArticle.source}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CryptoNewsCarousel;
