/**
 * Represents cryptocurrency data from the API
 */
export interface CryptoData {
  usd: number;
  usd_24h_change: number;
  usd_24h_vol: number;
  usd_market_cap: number;
  last_updated_at: number;
}

/**
 * Configuration for a cryptocurrency display
 */
export interface CryptoConfig {
  name: string;
  symbol: string;
  icon: string;
  color: string;
  cardColor: string;
}

/**
 * Historical price data point
 */
export interface PriceHistoryPoint {
  time: string;
  [cryptoId: string]: string | number;
}

/**
 * News article data structure
 */
export interface NewsArticle {
  id: string;
  title: string;
  body: string;
  url: string;
  imageurl: string;
  source: string;
  published_on: number;
  tags: string[];
}

/**
 * API response for news data
 */
export interface NewsResponse {
  success: boolean;
  data: NewsArticle[];
  source: string;
  message?: string;
}

/**
 * Historical market data for a cryptocurrency
 */
export interface MarketHistoryData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

/**
 * Detailed crypto data from API
 */
export interface CryptoDetailData {
  id: string;
  symbol: string;
  name: string;
  description: { en: string };
  links: {
    homepage: string[];
    blockchain_site: string[];
    official_forum_url: string[];
    chat_url: string[];
    announcement_url: string[];
    twitter_screen_name: string;
    facebook_username: string;
    telegram_channel_identifier: string;
    subreddit_url: string;
    repos_url: { github: string[] };
  };
  image: {
    thumb: string;
    small: string;
    large: string;
  };
  market_data: {
    current_price: { usd: number };
    ath: { usd: number };
    ath_change_percentage: { usd: number };
    ath_date: { usd: string };
    atl: { usd: number };
    atl_change_percentage: { usd: number };
    atl_date: { usd: string };
    market_cap: { usd: number };
    market_cap_rank: number;
    fully_diluted_valuation: { usd: number };
    total_volume: { usd: number };
    high_24h: { usd: number };
    low_24h: { usd: number };
    price_change_24h: number;
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_30d: number;
    price_change_percentage_1y: number;
    market_cap_change_24h: number;
    market_cap_change_percentage_24h: number;
    price_change_percentage_1h_in_currency: { usd: number };
    price_change_percentage_24h_in_currency: { usd: number };
    circulating_supply: number;
    total_supply: number;
    max_supply: number;
  };
  community_data: {
    facebook_likes: number;
    twitter_followers: number;
    reddit_average_posts_48h: number;
    reddit_average_comments_48h: number;
    reddit_subscribers: number;
    reddit_accounts_active_48h: number;
    telegram_channel_user_count: number;
  };
  genesis_date: string;
  market_cap_rank: number;
  coingecko_rank: number;
  coingecko_score: number;
  developer_score: number;
  community_score: number;
  liquidity_score: number;
  public_interest_score: number;
}
