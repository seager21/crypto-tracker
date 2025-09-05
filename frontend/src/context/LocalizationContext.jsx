import React, { createContext, useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../i18n';

// Define supported currencies
export const CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar', code: 'USD' },
  EUR: { symbol: '€', name: 'Euro', code: 'EUR' },
  GBP: { symbol: '£', name: 'British Pound', code: 'GBP' },
  JPY: { symbol: '¥', name: 'Japanese Yen', code: 'JPY' },
  CNY: { symbol: '¥', name: 'Chinese Yuan', code: 'CNY' },
  INR: { symbol: '₹', name: 'Indian Rupee', code: 'INR' },
};

// Define news regions
export const NEWS_REGIONS = {
  global: 'Global',
  us: 'United States',
  uk: 'United Kingdom',
  eu: 'Europe',
  asia: 'Asia',
};

// Default timezone is user's local timezone
const defaultTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

// Get common timezones
const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Australia/Sydney',
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
    setSettings(prev => ({ ...prev, ...newSettings }));
  };
  
  // Format currency based on current settings
  const formatCurrency = (amount, targetCurrency = settings.currency) => {
    const currencyObj = CURRENCIES[targetCurrency];
    
    if (!currencyObj) return `$${amount.toFixed(2)}`; // Default to USD if invalid
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyObj.code,
    }).format(amount);
  };
  
  // Format date based on current timezone
  const formatDate = (dateInput, options = {}) => {
    const date = new Date(dateInput);
    
    return new Intl.DateTimeFormat(settings.language, {
      timeZone: settings.timezone,
      dateStyle: 'medium',
      timeStyle: 'short',
      ...options,
    }).format(date);
  };
  
  // Context value
  const value = {
    settings,
    updateSettings,
    formatCurrency,
    formatDate,
    LANGUAGES,
    CURRENCIES,
    NEWS_REGIONS,
    TIMEZONES,
  };
  
  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};

// Custom hook to use the localization context
export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};
