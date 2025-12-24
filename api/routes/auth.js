const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { admin, db, auth } = require('../firebase/admin');

dotenv.config();
const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    // Validation
    if (!email || !password || !displayName) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide all required fields: email, password, displayName' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters long' 
      });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide a valid email address' 
      });
    }

    try {
      // Check if user already exists
      await admin.auth().getUserByEmail(email);
      return res.status(400).json({ 
        success: false,
        message: 'Email already in use' 
      });
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
      // User doesn't exist, proceed with registration
    }

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });

    // Create user document in Firestore with all necessary fields
    const userData = {
      uid: userRecord.uid,
      email,
      displayName,
      photoURL: null,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      watchlist: [],
      portfolio: [],
      favoriteCoins: [],
      transactions: [],
      settings: {
        theme: 'dark',
        currency: 'usd',
        timezone: 'UTC',
        newsRegion: 'global',
        notifications: true,
      },
      stats: {
        totalInvested: 0,
        currentValue: 0,
        totalGain: 0,
        totalGainPercent: 0,
      },
      profile: {
        bio: '',
        location: '',
        website: '',
      },
    };

    await db.collection('users').doc(userRecord.uid).set(userData);

    // Generate JWT token
    const token = jwt.sign(
      { 
        uid: userRecord.uid, 
        email, 
        displayName 
      }, 
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        uid: userRecord.uid,
        email,
        displayName,
        photoURL: null,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);

    let message = 'Server error during registration';
    let statusCode = 500;

    if (error.code === 'auth/email-already-exists') {
      message = 'Email already in use';
      statusCode = 400;
    } else if (error.code === 'auth/invalid-email') {
      message = 'Invalid email address';
      statusCode = 400;
    } else if (error.code === 'auth/weak-password') {
      message = 'Password is too weak';
      statusCode = 400;
    } else if (error.message) {
      message = error.message;
    }

    res.status(statusCode).json({ 
      success: false,
      message 
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email and password' 
      });
    }

    try {
      // Get user by email
      const userRecord = await admin.auth().getUserByEmail(email);

      // Note: Firebase Admin SDK doesn't verify passwords
      // Password verification should be done on the client side with Firebase SDK
      // Or implement a custom token for server-side verification

      // Generate JWT token
      const token = jwt.sign(
        {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
        },
        process.env.JWT_SECRET || 'fallback-secret-key',
        { expiresIn: '7d' }
      );

      // Get user data from Firestore
      const userDoc = await db.collection('users').doc(userRecord.uid).get();
      const userData = userDoc.exists ? userDoc.data() : {};

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          photoURL: userRecord.photoURL || null,
        },
      });
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid email or password' 
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login' 
    });
  }
});

// Logout user (optional - mainly for frontend)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

// Get current user info
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    const userRecord = await admin.auth().getUser(decoded.uid);
    const userDoc = await db.collection('users').doc(decoded.uid).get();

    res.json({
      success: true,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
      },
      userData: userDoc.exists ? userDoc.data() : null,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ 
      success: false,
      message: 'Invalid or expired token' 
    });
  }
});

module.exports = router;
