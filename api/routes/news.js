const express = require('express');
const { fetchCryptoNews } = require('../services/newsApi');

const router = express.Router();

// Route to get crypto news from NewsData.io
router.get('/', async (req, res) => {
  try {
    const { limit = 12, language = 'en' } = req.query;

    const newsArticles = await fetchCryptoNews({
      limit: parseInt(limit, 10),
      language,
    });

    res.json({
      success: true,
      results: newsArticles,
      source: 'newsdata.io',
    });
  } catch (error) {
    console.error('Error in news route:', error.message);

    // Provide fallback news data
    const fallbackNews = [
      {
        id: 'fallback-1',
        title: 'Crypto Market Update - Stay Informed',
        body: 'Stay updated with the latest cryptocurrency market trends, analysis, and breaking news from the digital asset space.',
        url: 'https://example.com/crypto-news',
        imageurl: 'https://via.placeholder.com/300x200?text=Crypto+Update',
        source: 'CryptoTracker',
        published_on: Math.floor(Date.now() / 1000),
        tags: ['Market', 'Analysis', 'Update'],
      },
    ];

    res.json({
      success: true,
      results: fallbackNews,
      source: 'fallback',
      message: 'Using fallback news data due to API unavailability',
    });
  }
});

module.exports = router;
