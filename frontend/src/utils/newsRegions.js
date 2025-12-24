// Regional news filtering and source management

export const NEWS_SOURCES_BY_REGION = {
  global: [
    { id: 'cointelegraph', name: 'Cointelegraph', language: 'en', url: 'https://cointelegraph.com' },
    { id: 'coindesk', name: 'CoinDesk', language: 'en', url: 'https://www.coindesk.com' },
    { id: 'decrypt', name: 'Decrypt', language: 'en', url: 'https://decrypt.co' },
    { id: 'theblock', name: 'The Block', language: 'en', url: 'https://www.theblock.co' },
  ],
  us: [
    { id: 'coindesk', name: 'CoinDesk', language: 'en', url: 'https://www.coindesk.com' },
    { id: 'forbes-crypto', name: 'Forbes Crypto', language: 'en', url: 'https://www.forbes.com/crypto-blockchain' },
    { id: 'cnbc-crypto', name: 'CNBC Crypto', language: 'en', url: 'https://www.cnbc.com/cryptotrader' },
  ],
  uk: [
    { id: 'cityam', name: 'City A.M.', language: 'en', url: 'https://www.cityam.com' },
    { id: 'telegraph-crypto', name: 'The Telegraph Crypto', language: 'en', url: 'https://www.telegraph.co.uk' },
    { id: 'ft-crypto', name: 'Financial Times Crypto', language: 'en', url: 'https://www.ft.com' },
  ],
  eu: [
    { id: 'btc-echo', name: 'BTC-ECHO', language: 'de', url: 'https://www.btc-echo.de' },
    { id: 'journalducoin', name: 'Journal du Coin', language: 'fr', url: 'https://journalducoin.com' },
    { id: 'cryptonews-eu', name: 'Cryptonews EU', language: 'en', url: 'https://cryptonews.com' },
  ],
  africa: [
    { id: 'cointelegraph-pt', name: 'Cointelegraph PT', language: 'pt', url: 'https://pt.cointelegraph.com' },
    { id: 'livecoins-pt', name: 'LiveCoins Africa', language: 'pt', url: 'https://livecoins.com.br' },
    { id: 'bitcoin-africa', name: 'Bitcoin Africa', language: 'en', url: 'https://bitcoinafrica.io' },
  ],
  asia: [
    { id: 'coinpost', name: 'CoinPost', language: 'ja', url: 'https://coinpost.jp' },
    { id: 'jinse', name: 'Jinse', language: 'zh', url: 'https://www.jinse.com' },
    { id: 'blockbeats', name: 'BlockBeats', language: 'zh', url: 'https://www.theblockbeats.info' },
    { id: 'coinnews-kr', name: 'CoinNews Korea', language: 'ko', url: 'https://www.coinnews.com' },
  ],
  latam: [
    { id: 'cointelegraph-es', name: 'Cointelegraph ES', language: 'es', url: 'https://es.cointelegraph.com' },
    { id: 'criptonoticias', name: 'CriptoNoticias', language: 'es', url: 'https://www.criptonoticias.com' },
    { id: 'livecoins', name: 'LiveCoins', language: 'pt', url: 'https://livecoins.com.br' },
  ],
};

// Filter news sources by region and language
export const getNewsSources = (region = 'global', language = 'en') => {
  const regionSources = NEWS_SOURCES_BY_REGION[region] || NEWS_SOURCES_BY_REGION.global;
  
  // If requesting specific language, filter by language
  if (language && language !== 'en') {
    const languageFiltered = regionSources.filter((source) => source.language === language);
    // If no sources in that language, fall back to region sources
    return languageFiltered.length > 0 ? languageFiltered : regionSources;
  }
  
  return regionSources;
};

// Get news feed URL for a source
export const getNewsFeedUrl = (sourceId, region = 'global') => {
  const allSources = Object.values(NEWS_SOURCES_BY_REGION).flat();
  const source = allSources.find((s) => s.id === sourceId);
  return source ? `${source.url}/feed` : null;
};

// Language to region mapping for automatic detection
export const LANGUAGE_TO_REGION = {
  en: 'global',
  es: 'latam',
  fr: 'eu',
  de: 'eu',
  ja: 'asia',
  zh: 'asia',
  ko: 'asia',
  pt: 'africa',
  ru: 'eu',
  it: 'eu',
};

// Get recommended region based on language
export const getRecommendedRegion = (language) => {
  return LANGUAGE_TO_REGION[language] || 'global';
};

// Get news sources with language preference
export const getLocalizedNewsSources = (region, preferredLanguage) => {
  const sources = getNewsSources(region, preferredLanguage);
  
  // Sort to prioritize sources in preferred language
  return sources.sort((a, b) => {
    if (a.language === preferredLanguage && b.language !== preferredLanguage) return -1;
    if (a.language !== preferredLanguage && b.language === preferredLanguage) return 1;
    return 0;
  });
};

export default {
  NEWS_SOURCES_BY_REGION,
  getNewsSources,
  getNewsFeedUrl,
  getRecommendedRegion,
  getLocalizedNewsSources,
};
