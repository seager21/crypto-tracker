// NewsData.io API service for crypto news
const axios = require('axios');
const NodeCache = require('node-cache');
const dotenv = require('dotenv');

dotenv.config();

// Get API key from environment variables
const API_KEY = process.env.NEWSDATA_API_KEY || '';

// Cache configuration (30 minutes)
const newsCache = new NodeCache({
  stdTTL: 1800,
  checkperiod: 300,
});

/**
 * Fetch cryptocurrency news from NewsData.io API
 * @param {Object} options - Options for fetching news
 * @param {number} options.limit - Number of news articles to fetch
 * @param {string} options.language - Language code (e.g., 'en')
 * @returns {Promise<Array>} - Array of news articles
 */
async function fetchCryptoNews({ limit = 10, language = 'en' } = {}) {
  const cacheKey = `crypto-news:${limit}:${language}`;
  
  // Check cache first
  const cachedNews = newsCache.get(cacheKey);
  if (cachedNews) {
    console.log(`🔍 Cache hit for crypto news (${limit} articles)`);
    return cachedNews;
  }
  
  // Check if we should use mock data (for development or if API key is invalid)
  const useMockData = process.env.USE_MOCK_NEWS === 'true' || !API_KEY;
  
  if (useMockData) {
    console.log('⚠️ Using mock news data (API key missing or mock mode enabled)');
    return getMockNewsData(limit);
  }
  
  try {
    console.log(`🔄 Fetching crypto news from NewsData.io (${limit} articles)`);
    
    if (!API_KEY) {
      console.error('⚠️ NewsData.io API key is missing!');
      throw new Error('API key is required for NewsData.io');
    }

    const response = await axios.get('https://newsdata.io/api/1/news', {
      params: {
        apikey: API_KEY,
        q: 'crypto OR cryptocurrency OR bitcoin OR ethereum OR blockchain',
        language: language,
        size: limit
      },
      timeout: 15000 // 15 seconds timeout
    });

    if (response.data && response.data.results) {
      // Transform the news data to match our app's format
      const newsArticles = response.data.results.map(article => ({
        id: article.article_id || String(Math.random()),
        title: article.title || 'No Title',
        body: article.description || article.content || 'No description available',
        url: article.link,
        imageurl: article.image_url || null,
        source: article.source_id || article.source_name || 'NewsData.io',
        published_on: Math.floor(new Date(article.pubDate).getTime() / 1000),
        tags: extractTags(article),
        full_content: article.content || article.description || 'No content available'
      }));
      
      // Cache the news data
      newsCache.set(cacheKey, newsArticles);
      
      console.log(`✅ Successfully fetched ${newsArticles.length} crypto news articles`);
      return newsArticles;
    } else {
      throw new Error('Invalid response format from NewsData.io API');
    }
  } catch (error) {
    console.error('❌ Error fetching crypto news:', error.message);
    throw error;
  }
}

/**
 * Extract tags from a news article
 * @param {Object} article - News article object
 * @returns {Array<string>} - Array of tags
 */
function extractTags(article) {
  const tags = [];
  
  // Extract keywords
  if (article.keywords && Array.isArray(article.keywords)) {
    tags.push(...article.keywords.slice(0, 5));
  }
  
  // Extract categories
  if (article.category && Array.isArray(article.category)) {
    tags.push(...article.category);
  }

  // If we don't have tags yet, extract from title
  if (tags.length === 0 && article.title) {
    const keywords = ['bitcoin', 'ethereum', 'crypto', 'blockchain', 'nft', 'defi', 'token', 'wallet'];
    keywords.forEach(keyword => {
      if (article.title.toLowerCase().includes(keyword) && !tags.includes(keyword)) {
        tags.push(keyword);
      }
    });
  }

  // Remove duplicates and trim to reasonable size
  return [...new Set(tags)]
    .filter(Boolean)
    .slice(0, 5)
    .map(tag => tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase());
}

/**
 * Get mock news data for testing and fallback
 * @param {number} limit - Number of mock articles to generate
 * @returns {Array} - Array of mock news articles
 */
function getMockNewsData(limit = 10) {
  const mockNews = [
    {
      id: 'mock-001',
      title: 'Bitcoin Surges Past $100,000 as Institutional Adoption Accelerates',
      body: 'Bitcoin has broken through the $100,000 mark for the first time in history as major financial institutions continue to add the cryptocurrency to their balance sheets.',
      url: 'https://example.com/bitcoin-100k',
      imageurl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?ixlib=rb-4.0.3',
      source: 'Crypto Daily',
      published_on: Math.floor(new Date().getTime() / 1000) - 3600,
      tags: ['Bitcoin', 'Market', 'Institutions'],
      full_content: 'Bitcoin has broken through the $100,000 mark for the first time in history as major financial institutions continue to add the cryptocurrency to their balance sheets. This milestone comes after months of steady growth and increased adoption from traditional finance players.'
    },
    {
      id: 'mock-002',
      title: 'Ethereum 3.0 Roadmap Unveiled: Promising 100x Scalability Improvements',
      body: 'The Ethereum Foundation has released details about the next major upgrade to the network, promising significant improvements to transaction throughput and cost efficiency.',
      url: 'https://example.com/ethereum-3',
      imageurl: 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?ixlib=rb-4.0.3',
      source: 'ETH News',
      published_on: Math.floor(new Date().getTime() / 1000) - 7200,
      tags: ['Ethereum', 'Technology', 'Scaling'],
      full_content: 'The Ethereum Foundation has released details about the next major upgrade to the network, promising significant improvements to transaction throughput and cost efficiency. Ethereum 3.0 aims to address the ongoing scalability challenges facing the network while maintaining its decentralized nature.'
    },
    {
      id: 'mock-003',
      title: 'Central Banks Pilot Digital Currencies in Partnership with Blockchain Firms',
      body: 'Five major central banks have announced a coordinated effort to pilot central bank digital currencies (CBDCs) using blockchain technology from leading crypto companies.',
      url: 'https://example.com/cbdc-pilot',
      imageurl: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?ixlib=rb-4.0.3',
      source: 'Global Finance Review',
      published_on: Math.floor(new Date().getTime() / 1000) - 10800,
      tags: ['CBDC', 'Regulation', 'Banks'],
      full_content: 'Five major central banks have announced a coordinated effort to pilot central bank digital currencies (CBDCs) using blockchain technology from leading crypto companies. This unprecedented collaboration signals a growing acceptance of digital currency technology in traditional finance sectors.'
    },
    {
      id: 'mock-004',
      title: 'NFT Market Rebounds as Gaming and Metaverse Projects Gain Traction',
      body: 'The non-fungible token (NFT) market is experiencing a resurgence led by gaming applications and metaverse projects, with trading volumes reaching new highs.',
      url: 'https://example.com/nft-gaming',
      imageurl: 'https://images.unsplash.com/photo-1635003913011-95971ed70a9a?ixlib=rb-4.0.3',
      source: 'NFT Insider',
      published_on: Math.floor(new Date().getTime() / 1000) - 14400,
      tags: ['NFT', 'Gaming', 'Metaverse'],
      full_content: 'The non-fungible token (NFT) market is experiencing a resurgence led by gaming applications and metaverse projects, with trading volumes reaching new highs. This renewed interest comes after a period of market consolidation that saw many speculative NFT projects fade while utility-focused applications continued to build.'
    },
    {
      id: 'mock-005',
      title: 'Decentralized Finance Protocols Reach $1 Trillion in Total Value Locked',
      body: 'The DeFi ecosystem has achieved a significant milestone with $1 trillion in assets now secured across various protocols, highlighting the sector\'s tremendous growth.',
      url: 'https://example.com/defi-trillion',
      imageurl: 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?ixlib=rb-4.0.3',
      source: 'DeFi Pulse',
      published_on: Math.floor(new Date().getTime() / 1000) - 18000,
      tags: ['DeFi', 'Finance', 'Growth'],
      full_content: 'The DeFi ecosystem has achieved a significant milestone with $1 trillion in assets now secured across various protocols, highlighting the sector\'s tremendous growth. This represents a tenfold increase from just two years ago and demonstrates the increasing trust in decentralized financial infrastructure.'
    },
    {
      id: 'mock-006',
      title: 'Major Retailer Announces Bitcoin Payment Integration for Online Shopping',
      body: 'One of the world\'s largest online retailers has announced plans to accept Bitcoin and other cryptocurrencies as payment options for all purchases.',
      url: 'https://example.com/retail-crypto',
      imageurl: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?ixlib=rb-4.0.3',
      source: 'Retail Tech News',
      published_on: Math.floor(new Date().getTime() / 1000) - 21600,
      tags: ['Adoption', 'Retail', 'Payments'],
      full_content: 'One of the world\'s largest online retailers has announced plans to accept Bitcoin and other cryptocurrencies as payment options for all purchases. The company will use a third-party payment processor to handle the transactions and convert cryptocurrency payments to traditional currency as needed.'
    },
    {
      id: 'mock-007',
      title: 'Crypto Environmental Impact: New Study Shows 75% of Mining Uses Renewable Energy',
      body: 'A comprehensive new study on cryptocurrency mining reveals that three-quarters of global operations now use renewable energy sources, challenging previous environmental concerns.',
      url: 'https://example.com/crypto-renewable',
      imageurl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?ixlib=rb-4.0.3',
      source: 'Green Tech Report',
      published_on: Math.floor(new Date().getTime() / 1000) - 25200,
      tags: ['Environment', 'Mining', 'Renewable'],
      full_content: 'A comprehensive new study on cryptocurrency mining reveals that three-quarters of global operations now use renewable energy sources, challenging previous environmental concerns. The shift has been driven by both economic factors and industry initiatives aimed at improving sustainability.'
    },
    {
      id: 'mock-008',
      title: 'Regulatory Clarity Arrives as Global Crypto Framework Announced',
      body: 'A coalition of G20 nations has agreed on a comprehensive regulatory framework for cryptocurrencies, providing much-needed clarity for businesses and investors.',
      url: 'https://example.com/crypto-regulation',
      imageurl: 'https://images.unsplash.com/photo-1607863680198-23d4b2565df0?ixlib=rb-4.0.3',
      source: 'Regulatory Affairs',
      published_on: Math.floor(new Date().getTime() / 1000) - 28800,
      tags: ['Regulation', 'Policy', 'Global'],
      full_content: 'A coalition of G20 nations has agreed on a comprehensive regulatory framework for cryptocurrencies, providing much-needed clarity for businesses and investors. The framework addresses key areas including taxation, security requirements, consumer protection, and anti-money laundering provisions.'
    },
    {
      id: 'mock-009',
      title: 'Layer 2 Solutions Transform Blockchain Landscape with Record Adoption',
      body: 'Layer 2 scaling solutions for major blockchains have seen unprecedented adoption in recent months, significantly reducing fees and increasing transaction speeds.',
      url: 'https://example.com/layer2-scaling',
      imageurl: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-4.0.3',
      source: 'Blockchain Insider',
      published_on: Math.floor(new Date().getTime() / 1000) - 32400,
      tags: ['Layer 2', 'Scaling', 'Technology'],
      full_content: 'Layer 2 scaling solutions for major blockchains have seen unprecedented adoption in recent months, significantly reducing fees and increasing transaction speeds. These technologies work by processing transactions off the main blockchain while still inheriting its security properties.'
    },
    {
      id: 'mock-010',
      title: 'Crypto Education Initiative Launches to Bring Blockchain Courses to Universities',
      body: 'A new non-profit consortium of blockchain companies and educational institutions has launched with the goal of bringing standardized crypto education to universities worldwide.',
      url: 'https://example.com/crypto-education',
      imageurl: 'https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?ixlib=rb-4.0.3',
      source: 'Education Technology',
      published_on: Math.floor(new Date().getTime() / 1000) - 36000,
      tags: ['Education', 'University', 'Blockchain'],
      full_content: 'A new non-profit consortium of blockchain companies and educational institutions has launched with the goal of bringing standardized crypto education to universities worldwide. The initiative aims to address the growing demand for blockchain expertise across industries and prepare students for careers in the rapidly evolving digital economy.'
    }
  ];
  
  // Return the requested number of mock articles (or all if limit > available)
  return mockNews.slice(0, limit);
}

module.exports = { fetchCryptoNews };
