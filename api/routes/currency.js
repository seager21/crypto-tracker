const express = require('express');
const { getExchangeRates, convertCurrency } = require('../services/currencyService');

const router = express.Router();

// Get all available exchange rates (relative to USD)
router.get('/rates', async (req, res) => {
  try {
    const rates = await getExchangeRates();
    res.json({
      success: true,
      base: 'USD',
      rates
    });
  } catch (error) {
    console.error('Error getting exchange rates:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exchange rates',
      error: error.message
    });
  }
});

// Convert a specific amount between currencies
router.get('/convert', async (req, res) => {
  try {
    const { amount, from, to } = req.query;
    
    if (!amount || isNaN(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount parameter'
      });
    }
    
    const fromCurrency = (from || 'USD').toUpperCase();
    const toCurrency = (to || 'USD').toUpperCase();
    
    const convertedAmount = await convertCurrency(
      parseFloat(amount),
      fromCurrency,
      toCurrency
    );
    
    res.json({
      success: true,
      query: {
        amount: parseFloat(amount),
        from: fromCurrency,
        to: toCurrency
      },
      result: convertedAmount
    });
  } catch (error) {
    console.error('Error converting currency:', error.message);
    res.status(500).json({
      success: false,
      message: 'Currency conversion failed',
      error: error.message
    });
  }
});

module.exports = router;
