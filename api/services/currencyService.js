// Currency conversion service
const axios = require('axios');
const NodeCache = require('node-cache');
const dotenv = require('dotenv');

dotenv.config();

// Exchange rates API key
const API_KEY = process.env.EXCHANGE_RATES_API_KEY || '';

// Cache configuration (1 hour)
const ratesCache = new NodeCache({
  stdTTL: 3600, // 1 hour
  checkperiod: 600, // 10 minutes
});

/**
 * Get exchange rates for conversion from USD to other currencies
 * @returns {Promise<Object>} - Object with currency rates
 */
async function getExchangeRates() {
  const cacheKey = 'exchange-rates';
  
  // Check cache first
  const cachedRates = ratesCache.get(cacheKey);
  if (cachedRates) {
    console.log('🔍 Cache hit for exchange rates');
    return cachedRates;
  }
  
  try {
    console.log('🔄 Fetching exchange rates');
    
    // Use a free exchange rates API (fallback to mocked data if no API key)
    if (!API_KEY) {
      console.log('⚠️ No exchange rates API key, using mock data');
      return getMockExchangeRates();
    }
    
    // Using ExchangeRate-API as an example
    const response = await axios.get(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`);
    
    if (response.data && response.data.conversion_rates) {
      const rates = response.data.conversion_rates;
      
      // Cache the exchange rates
      ratesCache.set(cacheKey, rates);
      
      console.log('✅ Successfully fetched exchange rates');
      return rates;
    } else {
      throw new Error('Invalid response format from Exchange Rates API');
    }
  } catch (error) {
    console.error('❌ Error fetching exchange rates:', error.message);
    return getMockExchangeRates();
  }
}

/**
 * Convert amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code (e.g., 'USD')
 * @param {string} toCurrency - Target currency code (e.g., 'EUR')
 * @returns {Promise<number>} - Converted amount
 */
async function convertCurrency(amount, fromCurrency = 'USD', toCurrency = 'USD') {
  // No conversion needed
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  try {
    const rates = await getExchangeRates();
    
    // First convert to USD (if not already USD)
    let inUSD = amount;
    if (fromCurrency !== 'USD') {
      inUSD = amount / rates[fromCurrency];
    }
    
    // Then convert from USD to target currency
    return inUSD * rates[toCurrency];
  } catch (error) {
    console.error('❌ Error converting currency:', error.message);
    return amount; // Return original amount in case of error
  }
}

/**
 * Get mock exchange rates for common currencies
 * @returns {Object} - Mock exchange rates
 */
function getMockExchangeRates() {
  return {
    USD: 1.0,
    EUR: 0.85,
    GBP: 0.73,
    JPY: 110.25,
    CNY: 6.45,
    INR: 74.5,
    CAD: 1.25,
    AUD: 1.35,
    CHF: 0.92,
    HKD: 7.78,
    SGD: 1.35
  };
}

module.exports = {
  getExchangeRates,
  convertCurrency
};
