import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink, X } from 'lucide-react';

const CryptoNewsCarousel = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Number of slides to show at once based on screen size
  const [slidesPerView, setSlidesPerView] = useState(3);

  // Memoize slide navigation functions with useCallback
  const handlePrevSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleNextSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, Math.ceil(news.length / slidesPerView) - 1));
  }, [news.length, slidesPerView]);

  const openModal = useCallback((article) => {
    setSelectedArticle(article);
    setModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelectedArticle(null);
    document.body.style.overflow = 'auto'; // Re-enable scrolling
  }, []);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:4000/api/news?limit=10');

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.results && Array.isArray(data.results)) {
        setNews(data.results);
      } else {
        setNews([]);
        console.warn('News API returned no results or invalid format');
      }
    } catch (err) {
      console.error('Failed to fetch news:', err);
      setError('Failed to load news. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Adjust slides per view based on window width
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setSlidesPerView(1);
      } else if (window.innerWidth < 1024) {
        setSlidesPerView(2);
      } else {
        setSlidesPerView(3);
      }
    };

    // Initial setup
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Handle keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (modalOpen) {
        // Handle modal keyboard controls
        if (e.key === 'Escape') {
          closeModal();
        }
      } else {
        // Handle carousel keyboard controls
        if (e.key === 'ArrowLeft') {
          handlePrevSlide();
        } else if (e.key === 'ArrowRight') {
          handleNextSlide();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalOpen, handlePrevSlide, handleNextSlide, closeModal]);

  // Format dates consistently
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '';

    // Handle both string dates and UNIX timestamps
    const date =
      typeof dateString === 'number'
        ? new Date(dateString * 1000) // Convert UNIX timestamp (seconds) to milliseconds
        : new Date(dateString);

    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }, []);

  // Calculate visible news items
  const visibleNews = news.slice(
    currentSlide * slidesPerView,
    currentSlide * slidesPerView + slidesPerView
  );
  if (loading) {
    return (
      <div className="card flex items-center justify-center p-8">
        <div className="animate-pulse flex space-x-2">
          <div className="w-3 h-3 bg-crypto-blue rounded-full"></div>
          <div className="w-3 h-3 bg-crypto-blue rounded-full"></div>
          <div className="w-3 h-3 bg-crypto-blue rounded-full"></div>
        </div>
        <span className="ml-3 text-gray-400">Loading news...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6">
        <div className="text-red-500 flex items-center justify-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          {error}
        </div>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="card p-6">
        <div className="text-gray-500 flex flex-col items-center justify-center">
          <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
            />
          </svg>
          <p>No news articles available at the moment</p>
          <button
            className="mt-4 bg-crypto-blue hover:bg-blue-700 text-white px-4 py-2 rounded"
            onClick={fetchNews}
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4 text-white">Crypto News</h2>

        {/* News Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            className={`absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-crypto-dark/80 rounded-full p-2 ${currentSlide === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-crypto-blue/20'}`}
            onClick={handlePrevSlide}
            disabled={currentSlide === 0}
            aria-label="Previous news articles"
          >
            <ArrowLeft className="w-5 h-5 text-white" aria-hidden="true" />
          </button>

          <button
            className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-crypto-dark/80 rounded-full p-2 ${currentSlide >= Math.ceil(news.length / slidesPerView) - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-crypto-blue/20'}`}
            onClick={handleNextSlide}
            disabled={currentSlide >= Math.ceil(news.length / slidesPerView) - 1}
            aria-label="Next news articles"
          >
            <ArrowRight className="w-5 h-5 text-white" aria-hidden="true" />
          </button>

          {/* News Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleNews.map((article) => (
              <div
                key={article.id || `article-${Math.random()}`}
                className="bg-crypto-dark border border-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition duration-300 hover:border-crypto-blue cursor-pointer"
                onClick={() => openModal(article)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openModal(article);
                  }
                }}
                tabIndex="0"
                role="article"
                aria-label={`${article.title} - Click to read more`}
              >
                {article.image_url ? (
                  <div className="w-full h-40 overflow-hidden">
                    <img
                      src={article.image_url}
                      alt={article.title || 'Cryptocurrency news image'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          'https://via.placeholder.com/800x400?text=Cryptocurrency+News';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 bg-crypto-darker flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No image available</span>
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <span className="text-xs text-gray-400">{formatDate(article.pubDate)}</span>
                    <span className="ml-auto text-xs bg-crypto-blue/30 text-crypto-blue px-2 py-1 rounded font-medium">
                      {article.source_id || 'News'}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                    {article.title}
                  </h3>

                  <p className="text-gray-300 text-sm mb-3 line-clamp-3">
                    {article.description || 'Click to read more about this story...'}
                  </p>

                  <div className="flex justify-end">
                    <span className="text-crypto-blue font-medium text-xs flex items-center">
                      Read more
                      <ExternalLink className="w-3 h-3 ml-1" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Dots */}
          <div
            className="flex justify-center mt-6"
            role="tablist"
            aria-label="News carousel navigation"
          >
            {Array.from({ length: Math.ceil(news.length / slidesPerView) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full mx-1 ${
                  currentSlide === index ? 'bg-crypto-blue' : 'bg-gray-700'
                }`}
                aria-label={`Go to slide ${index + 1}`}
                aria-selected={currentSlide === index}
                role="tab"
              />
            ))}
          </div>
        </div>
      </div>

      {/* News Article Modal */}
      {modalOpen && selectedArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="article-modal-title"
        >
          <div className="bg-crypto-darker border border-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-crypto-darker border-b border-gray-800 p-4 flex justify-between items-center">
              <h3 id="article-modal-title" className="text-xl font-bold text-white">
                {selectedArticle.title}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white"
                aria-label="Close article"
              >
                <X className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>

            {selectedArticle.image_url && (
              <div className="w-full h-64 md:h-80 overflow-hidden">
                <img
                  src={selectedArticle.image_url}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/800x400?text=Cryptocurrency+News';
                  }}
                />
              </div>
            )}

            <div className="p-6">
              <div className="flex items-center mb-4">
                <span className="text-sm text-gray-400">{formatDate(selectedArticle.pubDate)}</span>
                <span className="mx-2 text-gray-600">•</span>
                <span className="text-sm bg-crypto-blue/20 text-crypto-blue px-2 py-1 rounded">
                  {selectedArticle.source_id || 'News Source'}
                </span>
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 mb-6">
                  {selectedArticle.description ||
                    selectedArticle.content ||
                    'No content available for this article.'}
                </p>
              </div>

              {selectedArticle.keywords && (
                <div className="mt-6">
                  <h4 className="text-sm text-gray-400 mb-2">Topics:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle.keywords.slice(0, 5).map((keyword, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-crypto-dark text-gray-400 px-3 py-1 rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedArticle.link && (
                <div className="mt-8">
                  <a
                    href={selectedArticle.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center bg-crypto-blue hover:bg-blue-700 text-white px-4 py-3 rounded-md transition duration-300"
                  >
                    Visit Original Article
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CryptoNewsCarousel;
