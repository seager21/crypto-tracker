const admin = require('firebase-admin');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Firebase Admin with service account credentials
try {
  // Try to load from service account JSON file first
  const serviceAccountPath = path.join(__dirname, '../../crypto-tracker-9feb4-firebase-adminsdk-fbsvc-d44cb69bd8.json');
  
  let credentials;
  try {
    credentials = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(credentials),
      projectId: credentials.project_id,
    });
    console.log('✅ Firebase Admin initialized with service account file');
  } catch (fileError) {
    // If service account json file not found, try environment variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✅ Firebase Admin initialized with environment variable');
    } else {
      // Last resort: use application default credentials
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
      console.log('✅ Firebase Admin initialized with application default credentials');
    }
  }
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:', error);
  process.exit(1);
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
