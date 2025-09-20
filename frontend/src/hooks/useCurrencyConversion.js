import { useState, useEffect, useCallback } from 'react';
import { useLocalization } from '../context/LocalizationContext';

/**
 * Custom hook for currency conversion in the application
 * @returns {Object} Methods and state for currency conversion
 */
export function useCurrencyConversion() {
  const { settings } = useLocalization();
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch exchange rates on mount or when currency changes
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('http://localhost:4000/api/currency/rates');

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.rates) {
          setRates(data.rates);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching exchange rates:', err);
        setError(err.message);
        // Set fallback rates
        setRates({
          USD: 1.0,
          EUR: 0.85,
          GBP: 0.73,
          JPY: 110.25,
          CNY: 6.45,
          INR: 74.5,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRates();
  }, []);

  /**
   * Convert an amount from USD to the selected currency
   * @param {number} amountUsd - Amount in USD to convert
   * @returns {number} Converted amount in selected currency
   */
  const convertFromUsd = useCallback(
    (amountUsd) => {
      if (!rates || !amountUsd) return amountUsd;

      const targetCurrency = settings.currency;
      if (targetCurrency === 'USD') return amountUsd;

      const rate = rates[targetCurrency];
      if (!rate) return amountUsd;

      return amountUsd * rate;
    },
    [rates, settings.currency]
  );

  /**
   * Format currency with proper symbol and decimal places
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency string
   */
  const formatCurrency = useCallback(
    (amount) => {
      if (amount === undefined || amount === null) return '—';

      const currency = settings.currency;
      const currencySymbol =
        {
          USD: '$',
          EUR: '€',
          GBP: '£',
          JPY: '¥',
          CNY: '¥',
          INR: '₹',
        }[currency] || '$';

      // Special case for JPY which doesn't use decimal places
      const fractionDigits = currency === 'JPY' ? 0 : 2;

      return `${currencySymbol}${amount.toLocaleString(undefined, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      })}`;
    },
    [settings.currency]
  );

  /**
   * Convert and format a USD amount to the current selected currency
   * @param {number} amountUsd - Amount in USD
   * @returns {string} Formatted currency string in selected currency
   */
  const convertAndFormat = useCallback(
    (amountUsd) => {
      const converted = convertFromUsd(amountUsd);
      return formatCurrency(converted);
    },
    [convertFromUsd, formatCurrency]
  );

  return {
    rates,
    loading,
    error,
    convertFromUsd,
    formatCurrency,
    convertAndFormat,
    selectedCurrency: settings.currency,
  };
}
