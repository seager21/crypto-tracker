const express = require('express');
const cryptoApi = require('../services/cryptoApi');
const authenticate = require('../middleware/auth');

const router = express.Router();

// Root route to match the frontend's fetch to /api/crypto
router.get('/', async (req, res) => {
  try {
    const coinIds = [
      'bitcoin',
      'ethereum',
      'cardano',
      'polkadot',
      'chainlink',
      'litecoin',
      'binancecoin',
      'solana',
      'dogecoin',
      'ripple',
      'avalanche-2',
      'polygon',
      'uniswap',
      'cosmos',
      'stellar',
      'filecoin',
      'aave',
      'algorand',
      'vechain',
      'hedera-hashgraph',
      'theta-token',
      'the-sandbox',
    ];

    const data = await cryptoApi.getCryptoPrices(coinIds, 'usd');
    res.json(data);
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    res.status(500).json({ error: 'Failed to fetch crypto price data' });
  }
});

// Public routes
router.get('/prices', async (req, res) => {
  try {
    const coinIds = req.query.ids
      ? req.query.ids.split(',')
      : [
          'bitcoin',
          'ethereum',
          'cardano',
          'polkadot',
          'chainlink',
          'litecoin',
          'binancecoin',
          'solana',
          'dogecoin',
          'ripple',
          'avalanche-2',
          'polygon',
          'uniswap',
          'cosmos',
          'stellar',
          'filecoin',
          'aave',
          'algorand',
          'vechain',
          'hedera-hashgraph',
          'theta-token',
          'the-sandbox',
        ];

    const currency = req.query.currency || 'usd';

    const data = await cryptoApi.getCryptoPrices(coinIds, currency);
    res.json(data);
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    res.status(500).json({ error: 'Failed to fetch crypto price data' });
  }
});

router.get('/global', async (req, res) => {
  try {
    const data = await cryptoApi.getGlobalMarketData();
    res.json(data);
  } catch (error) {
    console.error('Error fetching global market data:', error);
    res.status(500).json({ error: 'Failed to fetch global market data' });
  }
});

// Protected route for more detailed coin info
router.get('/coin/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await cryptoApi.getCoinDetails(id);
    res.json(data);
  } catch (error) {
    console.error(`Error fetching details for ${req.params.id}:`, error);
    res.status(500).json({ error: `Failed to fetch data for ${req.params.id}` });
  }
});

// Protected route for historical data - requires authentication
router.get('/history/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const days = req.query.days || '7';
    const currency = req.query.currency || 'usd';

    const data = await cryptoApi.getCoinHistory(id, days, currency);
    res.json(data);
  } catch (error) {
    console.error(`Error fetching history for ${req.params.id}:`, error);
    res.status(500).json({ error: `Failed to fetch historical data for ${req.params.id}` });
  }
});

// Admin-only route for cache management - requires admin authentication
router.get('/cache/stats', authenticate, async (req, res) => {
  try {
    // Check if user is admin (you'll need to implement this check)
    // if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin access required' });

    const stats = cryptoApi.getCacheStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching cache stats:', error);
    res.status(500).json({ error: 'Failed to fetch cache statistics' });
  }
});

router.post('/cache/clear', authenticate, async (req, res) => {
  try {
    // Check if user is admin (you'll need to implement this check)
    // if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin access required' });

    cryptoApi.clearCache();
    res.json({ message: 'Cache cleared successfully' });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

module.exports = router;
