const express = require('express');
const authenticate = require('../middleware/auth');
const { db } = require('../firebase/admin');

const router = express.Router();

// Get user data
router.get('/', authenticate, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User data not found' });
    }
    
    res.json(userDoc.data());
  } catch (error) {
    console.error('Error getting user data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update watchlist
router.post('/watchlist', authenticate, async (req, res) => {
  try {
    const { cryptoId, name, symbol } = req.body;
    
    if (!cryptoId || !name || !symbol) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const userRef = db.collection('users').doc(req.user.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User data not found' });
    }
    
    const userData = userDoc.data();
    const watchlist = userData.watchlist || [];
    
    // Check if crypto already in watchlist
    if (watchlist.some(item => item.cryptoId === cryptoId)) {
      return res.status(400).json({ message: 'Crypto already in watchlist' });
    }
    
    // Add to watchlist
    const newWatchlistItem = {
      id: Date.now().toString(),
      cryptoId,
      name,
      symbol,
      addedAt: Date.now()
    };
    
    await userRef.update({
      watchlist: [...watchlist, newWatchlistItem]
    });
    
    res.status(201).json(newWatchlistItem);
  } catch (error) {
    console.error('Error updating watchlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove from watchlist
router.delete('/watchlist/:cryptoId', authenticate, async (req, res) => {
  try {
    const { cryptoId } = req.params;
    
    const userRef = db.collection('users').doc(req.user.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User data not found' });
    }
    
    const userData = userDoc.data();
    const watchlist = userData.watchlist || [];
    
    // Filter out the crypto to remove
    const updatedWatchlist = watchlist.filter(item => item.cryptoId !== cryptoId);
    
    // If nothing was removed
    if (updatedWatchlist.length === watchlist.length) {
      return res.status(404).json({ message: 'Crypto not found in watchlist' });
    }
    
    await userRef.update({ watchlist: updatedWatchlist });
    
    res.json({ message: 'Removed from watchlist' });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add to favorites
router.post('/favorites', authenticate, async (req, res) => {
  try {
    const { cryptoId } = req.body;
    
    if (!cryptoId) {
      return res.status(400).json({ message: 'Missing cryptoId' });
    }
    
    const userRef = db.collection('users').doc(req.user.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User data not found' });
    }
    
    const userData = userDoc.data();
    const favoriteCoins = userData.favoriteCoins || [];
    
    // Check if already in favorites
    if (favoriteCoins.includes(cryptoId)) {
      return res.status(400).json({ message: 'Already in favorites' });
    }
    
    // Add to favorites
    await userRef.update({
      favoriteCoins: [...favoriteCoins, cryptoId]
    });
    
    res.status(201).json({ cryptoId, message: 'Added to favorites' });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove from favorites
router.delete('/favorites/:cryptoId', authenticate, async (req, res) => {
  try {
    const { cryptoId } = req.params;
    
    const userRef = db.collection('users').doc(req.user.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User data not found' });
    }
    
    const userData = userDoc.data();
    const favoriteCoins = userData.favoriteCoins || [];
    
    // Remove from favorites
    const updatedFavorites = favoriteCoins.filter(id => id !== cryptoId);
    
    // If nothing was removed
    if (updatedFavorites.length === favoriteCoins.length) {
      return res.status(404).json({ message: 'Crypto not found in favorites' });
    }
    
    await userRef.update({ favoriteCoins: updatedFavorites });
    
    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add to portfolio
router.post('/portfolio', authenticate, async (req, res) => {
  try {
    const { cryptoId, name, symbol, amount, purchasePrice } = req.body;
    
    if (!cryptoId || !name || !symbol || !amount || !purchasePrice) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const userRef = db.collection('users').doc(req.user.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User data not found' });
    }
    
    const userData = userDoc.data();
    const portfolio = userData.portfolio || [];
    
    // Add to portfolio
    const newPortfolioItem = {
      id: Date.now().toString(),
      cryptoId,
      name,
      symbol,
      amount: Number(amount),
      purchasePrice: Number(purchasePrice),
      purchaseDate: Date.now()
    };
    
    await userRef.update({
      portfolio: [...portfolio, newPortfolioItem]
    });
    
    res.status(201).json(newPortfolioItem);
  } catch (error) {
    console.error('Error adding to portfolio:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove from portfolio
router.delete('/portfolio/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const userRef = db.collection('users').doc(req.user.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User data not found' });
    }
    
    const userData = userDoc.data();
    const portfolio = userData.portfolio || [];
    
    // Remove from portfolio
    const updatedPortfolio = portfolio.filter(item => item.id !== id);
    
    // If nothing was removed
    if (updatedPortfolio.length === portfolio.length) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }
    
    await userRef.update({ portfolio: updatedPortfolio });
    
    res.json({ message: 'Removed from portfolio' });
  } catch (error) {
    console.error('Error removing from portfolio:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user settings
router.put('/settings', authenticate, async (req, res) => {
  try {
    const { theme, currency, notifications } = req.body;
    const updates = {};
    
    if (theme !== undefined) updates['settings.theme'] = theme;
    if (currency !== undefined) updates['settings.currency'] = currency;
    if (notifications !== undefined) updates['settings.notifications'] = notifications;
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No settings provided to update' });
    }
    
    const userRef = db.collection('users').doc(req.user.uid);
    await userRef.update(updates);
    
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
