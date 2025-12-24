import React, { createContext, useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../i18n';
import {
  convertCurrency,
  formatCurrencyAmount,
  CURRENCY_INFO,
  getCurrencySymbol,
} from '../utils/currencyConverter';

// Define supported currencies
export const CURRENCIES = CURRENCY_INFO;

// Export LANGUAGES from i18n config
export { LANGUAGES };

// Define news regions
export const NEWS_REGIONS = {
  global: { name: 'Global', languages: ['en', 'es', 'fr', 'de', 'ja', 'zh'] },
  us: { name: 'United States', languages: ['en'], primaryLang: 'en' },
  uk: { name: 'United Kingdom', languages: ['en'], primaryLang: 'en' },
  eu: { name: 'Europe', languages: ['en', 'de', 'fr', 'es'], primaryLang: 'en' },
  africa: { name: 'Africa', languages: ['en', 'pt'], primaryLang: 'en' },
  asia: { name: 'Asia', languages: ['en', 'ja', 'zh'], primaryLang: 'en' },
  latam: { name: 'Latin America', languages: ['es', 'pt'], primaryLang: 'es' },
};

// Default timezone is user's local timezone
const defaultTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

// Get common timezones
export const TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  // Americas
  { value: 'America/New_York', label: 'New York (EST/EDT)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
  { value: 'America/Chicago', label: 'Chicago (CST/CDT)' },
  { value: 'America/Denver', label: 'Denver (MST/MDT)' },
  // Europe
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Europe/Lisbon', label: 'Lisbon (WET/WEST)' },
  // Africa
  { value: 'Africa/Luanda', label: 'Luanda (WAT)' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST)' },
  // Asia
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  // Pacific
  { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZDT/NZST)' },
];

// Initial state
const initialSettings = {
  language: localStorage.getItem('i18nextLng') || 'en',
  currency: localStorage.getItem('currency') || 'USD',
  newsRegion: localStorage.getItem('newsRegion') || 'global',
  timezone: localStorage.getItem('timezone') || defaultTimezone,
  theme: localStorage.getItem('theme') || 'dark',
};

// Create context
const LocalizationContext = createContext();

export const LocalizationProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [settings, setSettings] = useState(initialSettings);

  // Update language when settings change
  useEffect(() => {
    i18n.changeLanguage(settings.language);
    localStorage.setItem('i18nextLng', settings.language);
  }, [settings.language, i18n]);

  // Save other settings to localStorage
  useEffect(() => {
    localStorage.setItem('currency', settings.currency);
    localStorage.setItem('newsRegion', settings.newsRegion);
    localStorage.setItem('timezone', settings.timezone);
    localStorage.setItem('theme', settings.theme);
  }, [settings]);

  // Update settings
  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Format currency based on current settings with conversion
  const formatCurrency = (amountInUSD, options = {}) => {
    const { targetCurrency = settings.currency, fromCurrency = 'USD', showSymbol = true } = options;

    if (!amountInUSD && amountInUSD !== 0) return `${getCurrencySymbol(targetCurrency)}0.00`;

    // Convert currency if needed
    const convertedAmount =
      fromCurrency === targetCurrency
        ? amountInUSD
        : convertCurrency(amountInUSD, fromCurrency, targetCurrency);

    // Format based on locale and currency
    const currencyInfo = CURRENCIES[targetCurrency];
    const locale = currencyInfo?.locale || settings.language;

    try {
      if (showSymbol) {
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: targetCurrency,
          minimumFractionDigits: targetCurrency === 'JPY' || targetCurrency === 'KRW' ? 0 : 2,
          maximumFractionDigits: targetCurrency === 'JPY' || targetCurrency === 'KRW' ? 0 : 2,
        }).format(convertedAmount);
      } else {
        return new Intl.NumberFormat(locale, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(convertedAmount);
      }
    } catch (error) {
      // Fallback formatting
      const symbol = getCurrencySymbol(targetCurrency);
      return `${symbol}${convertedAmount.toFixed(2)}`;
    }
  };

  // Format date based on current timezone and locale
  const formatDate = (dateInput, options = {}) => {
    const date =
      typeof dateInput === 'string' || typeof dateInput === 'number'
        ? new Date(dateInput)
        : dateInput;

    const {
      timezone = settings.timezone,
      dateStyle = 'medium',
      timeStyle = 'short',
      showTime = true,
    } = options;

    try {
      const formatOptions = {
        timeZone: timezone,
        ...options,
      };

      if (dateStyle && !options.year) {
        formatOptions.dateStyle = dateStyle;
      }

      if (timeStyle && showTime && !options.hour) {
        formatOptions.timeStyle = timeStyle;
      }

      return new Intl.DateTimeFormat(settings.language, formatOptions).format(date);
    } catch (error) {
      // Fallback to simple formatting
      return date.toLocaleString(settings.language);
    }
  };

  // Format time only
  const formatTime = (dateInput) => {
    return formatDate(dateInput, {
      dateStyle: undefined,
      timeStyle: 'medium',
      showTime: true,
    });
  };

  // Get timezone offset display
  const getTimezoneOffset = (timezone = settings.timezone) => {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        timeZoneName: 'short',
      });
      const parts = formatter.formatToParts(now);
      const timeZonePart = parts.find((part) => part.type === 'timeZoneName');
      return timeZonePart ? timeZonePart.value : '';
    } catch (error) {
      return '';
    }
  };

  // Context value
  const value = {
    settings,
    updateSettings,
    formatCurrency,
    formatDate,
    formatTime,
    getTimezoneOffset,
    convertCurrency: (amount, from, to) => convertCurrency(amount, from, to),
    getCurrencySymbol: (currency) => getCurrencySymbol(currency),
    LANGUAGES,
    CURRENCIES,
    NEWS_REGIONS,
    TIMEZONES,
  };

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
};

// Custom hook to use the localization context
export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};
