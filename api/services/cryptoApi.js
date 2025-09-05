/**
 * CoinGecko API service with caching and rate limiting
 */
const axios = require('axios');
const NodeCache = require('node-cache');
const rateLimit = require('axios-rate-limit');
const pRetry = require('p-retry');
const memoryCache = require('memory-cache');
const dotenv = require('dotenv');

dotenv.config();

// Constants from environment variables
const API_KEY = process.env.COINGECKO_API_KEY || '';
const USE_PRO_API = process.env.COINGECKO_USE_PRO_API === 'true';
const BASE_URL = USE_PRO_API 
  ? process.env.COINGECKO_PRO_API_URL 
  : process.env.COINGECKO_API_URL;

// Rate limit settings from env or defaults
const RATE_LIMIT_REQUESTS = parseInt(process.env.COINGECKO_RATE_LIMIT_REQUESTS || '10', 10);
const RATE_LIMIT_PERIOD = parseInt(process.env.COINGECKO_RATE_LIMIT_PERIOD || '60000', 10);

// Cache configuration
const CACHE_TTL = {
  PRICES: 30, // 30 seconds for price data
  MARKET_DATA: 300, // 5 minutes for market data
  COIN_DETAILS: 1800, // 30 minutes for coin details
};

// Create cache instance
const cache = new NodeCache({
  stdTTL: CACHE_TTL.PRICES,
  checkperiod: 120,
  useClones: false,
});

// Create rate-limited axios instance
const http = rateLimit(axios.create(), { 
  maxRequests: RATE_LIMIT_REQUESTS,
  perMilliseconds: RATE_LIMIT_PERIOD, 
  maxRPS: RATE_LIMIT_REQUESTS / (RATE_LIMIT_PERIOD / 1000),
});

// Rate limit tracking for dynamic backoff
const rateLimitTracker = {
  lastRateLimitHit: 0,
  consecutiveFailures: 0,
  isRateLimited: false,
  backoffTime: 1000, // Start with 1 second
};

/**
 * Get the appropriate headers for API calls
 */
const getHeaders = () => {
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  // Add API key if we have one and are using Pro API
  if (API_KEY && USE_PRO_API) {
    headers['x-cg-pro-api-key'] = API_KEY;
  }
  
  return headers;
};

/**
 * Make a request to CoinGecko API with retry logic and caching
 * @param {string} endpoint - API endpoint path
 * @param {Object} params - Query parameters
 * @param {number} cacheTTL - Cache time-to-live in seconds
 * @returns {Promise<any>} - Response data
 */
async function makeRequest(endpoint, params = {}, cacheTTL = CACHE_TTL.PRICES) {
  const cacheKey = `${endpoint}:${JSON.stringify(params)}`;
  
  // Check if we're currently rate limited
  if (rateLimitTracker.isRateLimited) {
    const timeSinceRateLimit = Date.now() - rateLimitTracker.lastRateLimitHit;
    if (timeSinceRateLimit < rateLimitTracker.backoffTime) {
      console.log(`🛑 Still in backoff period. Waiting ${(rateLimitTracker.backoffTime - timeSinceRateLimit) / 1000}s...`);
      throw new Error(`Rate limited. Try again in ${(rateLimitTracker.backoffTime - timeSinceRateLimit) / 1000}s.`);
    } else {
      // Reset rate limit status but keep track of consecutive failures
      rateLimitTracker.isRateLimited = false;
    }
  }
  
  // Check cache first
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log(`🔍 Cache hit for ${endpoint}`);
    return cachedData;
  }
  
  // No cache hit, make the actual request with retries
  try {
    const response = await pRetry(async () => {
      try {
        const url = `${BASE_URL}${endpoint}`;
        
        // Add a timestamp to bypass any intermediary caching (e.g. browser cache, CDN)
        const finalParams = {
          ...params,
          _t: Date.now()
        };
        
        const response = await http.get(url, {
          params: finalParams,
          headers: getHeaders(),
          timeout: 15000, // 15 seconds timeout
        });
        
        // Reset consecutive failures on success
        if (rateLimitTracker.consecutiveFailures > 0) {
          console.log('✅ API request succeeded after previous failures. Resetting failure counter.');
          rateLimitTracker.consecutiveFailures = 0;
          rateLimitTracker.backoffTime = 1000;
        }
        
        // Cache the successful response
        cache.set(cacheKey, response.data, cacheTTL);
        
        return response;
      } catch (error) {
        // Handle rate limiting
        if (error.response && error.response.status === 429) {
          rateLimitTracker.lastRateLimitHit = Date.now();
          rateLimitTracker.isRateLimited = true;
          rateLimitTracker.consecutiveFailures++;
          rateLimitTracker.backoffTime = Math.min(60000, Math.pow(2, rateLimitTracker.consecutiveFailures) * 1000);
          
          console.log(`⏱️ Rate limited! Backing off for ${rateLimitTracker.backoffTime / 1000}s...`);
          
          // Throw a retriable error
          throw new pRetry.AbortError(`Rate limited. Backing off for ${rateLimitTracker.backoffTime / 1000}s.`);
        }
        
        // For network errors, retries might help
        if (!error.response) {
          console.log('🌐 Network error. Will retry...');
          throw error;
        }
        
        // For other errors, abort retry
        console.error(`❌ API error: ${error.message}`);
        throw new pRetry.AbortError(error.message);
      }
    }, {
      retries: 3,
      minTimeout: 500,
      maxTimeout: 10000,
      onFailedAttempt: error => {
        console.log(`🔄 Attempt ${error.attemptNumber} failed. ${error.retriesLeft} retries left.`);
      },
    });
    
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to fetch data from ${endpoint}:`, error.message);
    
    // If we have a slightly stale version in the cache, return that as fallback
    const staleData = memoryCache.get(`stale:${cacheKey}`);
    if (staleData) {
      console.log(`♻️ Returning stale data for ${endpoint}`);
      return staleData;
    }
    
    throw error;
  }
}

/**
 * Get cryptocurrency prices with market data
 * @param {string[]} coinIds - Array of coin IDs
 * @param {string} currency - Currency (default: usd)
 */
async function getCryptoPrices(coinIds = [], currency = 'usd') {
  const params = {
    ids: coinIds.join(','),
    vs_currencies: currency,
    include_market_cap: true,
    include_24hr_change: true,
    include_24hr_vol: true,
    include_last_updated_at: true,
  };
  
  try {
    const data = await makeRequest('/simple/price', params, CACHE_TTL.PRICES);
    
    // Keep a copy in stale cache for fallback with a longer TTL
    memoryCache.put(`stale:/simple/price:${JSON.stringify(params)}`, data, CACHE_TTL.PRICES * 5 * 1000);
    
    return data;
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    throw error;
  }
}

/**
 * Get global crypto market data
 */
async function getGlobalMarketData() {
  try {
    const data = await makeRequest('/global', {}, CACHE_TTL.MARKET_DATA);
    
    // Keep a copy in stale cache for fallback
    memoryCache.put(`stale:/global:{}`, data, CACHE_TTL.MARKET_DATA * 5 * 1000);
    
    return data;
  } catch (error) {
    console.error('Error fetching global market data:', error);
    throw error;
  }
}

/**
 * Get detailed data for a specific coin
 * @param {string} coinId - Coin ID
 */
async function getCoinDetails(coinId) {
  try {
    const data = await makeRequest(`/coins/${coinId}`, {
      localization: false,
      tickers: false,
      market_data: true,
      community_data: false,
      developer_data: false
    }, CACHE_TTL.COIN_DETAILS);
    
    // Keep a copy in stale cache for fallback
    memoryCache.put(`stale:/coins/${coinId}:`, data, CACHE_TTL.COIN_DETAILS * 5 * 1000);
    
    return data;
  } catch (error) {
    console.error(`Error fetching details for ${coinId}:`, error);
    throw error;
  }
}

/**
 * Get historical market data for a coin
 * @param {string} coinId - Coin ID
 * @param {string} days - Time period (1, 7, 14, 30, etc.)
 * @param {string} currency - Currency (default: usd)
 */
async function getCoinHistory(coinId, days = '7', currency = 'usd') {
  try {
    const data = await makeRequest(`/coins/${coinId}/market_chart`, {
      vs_currency: currency,
      days: days,
      interval: days > 30 ? 'daily' : days > 1 ? 'hourly' : 'minutely'
    }, CACHE_TTL.MARKET_DATA);
    
    return data;
  } catch (error) {
    console.error(`Error fetching history for ${coinId}:`, error);
    throw error;
  }
}

/**
 * Clear cache for testing
 */
function clearCache() {
  cache.flushAll();
  console.log('🧹 Cache cleared');
}

/**
 * Get cache statistics
 */
function getCacheStats() {
  return {
    keys: cache.keys(),
    stats: cache.getStats(),
    hits: cache.getStats().hits,
    misses: cache.getStats().misses,
    rateLimitStatus: rateLimitTracker
  };
}

module.exports = {
  getCryptoPrices,
  getGlobalMarketData,
  getCoinDetails,
  getCoinHistory,
  clearCache,
  getCacheStats,
};
