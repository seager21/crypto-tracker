// Currency conversion rates utility
// In production, these rates should be fetched from a real API like exchangerate-api.com

const BASE_CURRENCY = 'USD';

// Exchange rates relative to USD (updated periodically)
const EXCHANGE_RATES = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.50,
  CNY: 7.24,
  INR: 83.12,
  AUD: 1.53,
  CAD: 1.36,
  CHF: 0.88,
  KRW: 1320.50,
  BRL: 4.97,
  RUB: 92.50,
  MXN: 17.12,
};

export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  if (!amount || !fromCurrency || !toCurrency) return 0;
  
  // Convert to USD first (base currency)
  const amountInUSD = amount / EXCHANGE_RATES[fromCurrency];
  
  // Convert from USD to target currency
  const convertedAmount = amountInUSD * EXCHANGE_RATES[toCurrency];
  
  return convertedAmount;
};

export const formatCurrencyAmount = (amount, currency = 'USD', locale = 'en-US') => {
  const currencyInfo = CURRENCY_INFO[currency] || CURRENCY_INFO.USD;
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyInfo.code,
      minimumFractionDigits: currency === 'JPY' || currency === 'KRW' ? 0 : 2,
      maximumFractionDigits: currency === 'JPY' || currency === 'KRW' ? 0 : 2,
    }).format(amount);
  } catch (error) {
    // Fallback for unsupported currencies
    return `${currencyInfo.symbol}${amount.toFixed(2)}`;
  }
};

export const CURRENCY_INFO = {
  USD: { symbol: '$', name: 'US Dollar', code: 'USD', locale: 'en-US' },
  EUR: { symbol: '€', name: 'Euro', code: 'EUR', locale: 'de-DE' },
  GBP: { symbol: '£', name: 'British Pound', code: 'GBP', locale: 'en-GB' },
  JPY: { symbol: '¥', name: 'Japanese Yen', code: 'JPY', locale: 'ja-JP' },
  CNY: { symbol: '¥', name: 'Chinese Yuan', code: 'CNY', locale: 'zh-CN' },
  INR: { symbol: '₹', name: 'Indian Rupee', code: 'INR', locale: 'en-IN' },
  AUD: { symbol: '$', name: 'Australian Dollar', code: 'AUD', locale: 'en-AU' },
  CAD: { symbol: '$', name: 'Canadian Dollar', code: 'CAD', locale: 'en-CA' },
  CHF: { symbol: 'Fr', name: 'Swiss Franc', code: 'CHF', locale: 'de-CH' },
  KRW: { symbol: '₩', name: 'South Korean Won', code: 'KRW', locale: 'ko-KR' },
  BRL: { symbol: 'R$', name: 'Brazilian Real', code: 'BRL', locale: 'pt-BR' },
  RUB: { symbol: '₽', name: 'Russian Ruble', code: 'RUB', locale: 'ru-RU' },
  MXN: { symbol: '$', name: 'Mexican Peso', code: 'MXN', locale: 'es-MX' },
};

// Get currency symbol
export const getCurrencySymbol = (currency) => {
  return CURRENCY_INFO[currency]?.symbol || '$';
};

// Get all supported currencies
export const getSupportedCurrencies = () => {
  return Object.keys(CURRENCY_INFO);
};

// Update exchange rates (in production, call this periodically)
export const updateExchangeRates = async () => {
  // In production, fetch from API:
  // const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
  // const data = await response.json();
  // Update EXCHANGE_RATES with data.rates
  
  console.log('Exchange rates would be updated here in production');
  return EXCHANGE_RATES;
};

export { EXCHANGE_RATES };
