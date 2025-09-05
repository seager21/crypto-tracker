// Simple Express Server (No Socket.IO) for debugging

// Import dependencies
const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const cryptoApi = require('./services/cryptoApi');
const newsRoutes = require('./routes/news');

// Load environment variables
dotenv.config();

const app = express();
const PORT = 4000; // Fixed port for debugging

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📝 ${req.method} request to ${req.url}`);
  next();
});

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Simple test endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Use news routes
app.use('/api/news', newsRoutes);

// API endpoint for crypto data
app.get('/api/crypto', async (req, res) => {
  try {
    console.log('🔄 API request received for crypto data');

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

    const data = await cryptoApi.getCryptoPrices(coinIds);
    console.log(`✅ Sending crypto data with ${Object.keys(data).length} items`);

    res.json(data);
  } catch (error) {
    console.error('❌ Error in /api/crypto endpoint:', error.message);
    res.status(500).json({ error: 'Failed to fetch crypto data' });
  }
});

// Default route
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../frontend/dist', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔗 API available at: http://localhost:${PORT}/api/`);
  console.log(`🌐 Frontend available at: http://localhost:${PORT}/`);
});
