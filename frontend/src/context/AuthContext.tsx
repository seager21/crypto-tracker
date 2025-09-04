import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
  User as FirebaseUser,
  updateProfile,
  AuthError
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase/firebase';
import { User, AuthState, UserData } from '@/types/auth';

// Default user data structure
const DEFAULT_USER_DATA: UserData = {
  watchlist: [],
  portfolio: [],
  favoriteCoins: [],
  settings: {
    theme: 'dark',
    currency: 'usd',
    notifications: true
  }
};

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  register: (email: string, password: string, displayName: string) => Promise<UserCredential>;
  login: (email: string, password: string) => Promise<UserCredential>;
  loginWithGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  resetError: () => void;
  addToWatchlist: (cryptoId: string, name: string, symbol: string) => Promise<void>;
  removeFromWatchlist: (cryptoId: string) => Promise<void>;
  addToFavorites: (cryptoId: string) => Promise<void>;
  removeFromFavorites: (cryptoId: string) => Promise<void>;
  addToPortfolio: (cryptoId: string, name: string, symbol: string, amount: number, purchasePrice: number) => Promise<void>;
  removeFromPortfolio: (id: string) => Promise<void>;
  updateUserSettings: (settings: Partial<UserData['settings']>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  const [userData, setUserData] = useState<UserData | null>(null);

  // Convert Firebase user to our User type
  const formatUser = (firebaseUser: FirebaseUser): User => ({
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL
  });

  // Fetch user data from Firestore
  const fetchUserData = async (userId: string) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setUserData(userDoc.data() as UserData);
      } else {
        // Create a new user document if it doesn't exist
        await setDoc(userDocRef, DEFAULT_USER_DATA);
        setUserData(DEFAULT_USER_DATA);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setAuthState(prev => ({ ...prev, error: 'Failed to load user data' }));
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = formatUser(firebaseUser);
        setAuthState({ user, loading: false, error: null });
        await fetchUserData(user.uid);
      } else {
        setAuthState({ user: null, loading: false, error: null });
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Register a new user
  const register = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName });
      }
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), DEFAULT_USER_DATA);
      
      return userCredential;
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, error: error.message }));
      throw error;
    }
  };

  // Log in existing user
  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, error: error.message }));
      throw error;
    }
  };

  // Log in with Google
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Check if this is a new user and create a document if needed
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        await setDoc(userDocRef, DEFAULT_USER_DATA);
      }
      
      return userCredential;
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, error: error.message }));
      throw error;
    }
  };

  // Log out
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, error: error.message }));
      throw error;
    }
  };

  // Reset error state
  const resetError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  // Update user data in Firestore
  const updateUserDocInFirestore = async (newData: Partial<UserData>) => {
    if (!authState.user?.uid) return;
    
    try {
      const userDocRef = doc(db, 'users', authState.user.uid);
      await setDoc(userDocRef, { ...userData, ...newData }, { merge: true });
      setUserData(prev => prev ? { ...prev, ...newData } : null);
    } catch (error) {
      console.error('Error updating user data:', error);
      setAuthState(prev => ({ ...prev, error: 'Failed to update user data' }));
    }
  };

  // Watchlist functions
  const addToWatchlist = async (cryptoId: string, name: string, symbol: string) => {
    if (!userData) return;
    
    const newWatchlistItem = {
      id: Date.now().toString(),
      cryptoId,
      name,
      symbol,
      addedAt: Date.now()
    };
    
    const newWatchlist = [...userData.watchlist, newWatchlistItem];
    await updateUserDocInFirestore({ watchlist: newWatchlist });
  };

  const removeFromWatchlist = async (cryptoId: string) => {
    if (!userData) return;
    
    const newWatchlist = userData.watchlist.filter(item => item.cryptoId !== cryptoId);
    await updateUserDocInFirestore({ watchlist: newWatchlist });
  };

  // Favorite coins functions
  const addToFavorites = async (cryptoId: string) => {
    if (!userData) return;
    
    const newFavorites = [...userData.favoriteCoins, cryptoId];
    await updateUserDocInFirestore({ favoriteCoins: newFavorites });
  };

  const removeFromFavorites = async (cryptoId: string) => {
    if (!userData) return;
    
    const newFavorites = userData.favoriteCoins.filter(id => id !== cryptoId);
    await updateUserDocInFirestore({ favoriteCoins: newFavorites });
  };

  // Portfolio functions
  const addToPortfolio = async (
    cryptoId: string,
    name: string,
    symbol: string,
    amount: number,
    purchasePrice: number
  ) => {
    if (!userData) return;
    
    const newPortfolioItem = {
      id: Date.now().toString(),
      cryptoId,
      name,
      symbol,
      amount,
      purchasePrice,
      purchaseDate: Date.now()
    };
    
    const newPortfolio = [...userData.portfolio, newPortfolioItem];
    await updateUserDocInFirestore({ portfolio: newPortfolio });
  };

  const removeFromPortfolio = async (id: string) => {
    if (!userData) return;
    
    const newPortfolio = userData.portfolio.filter(item => item.id !== id);
    await updateUserDocInFirestore({ portfolio: newPortfolio });
  };

  // Settings functions
  const updateUserSettings = async (settings: Partial<UserData['settings']>) => {
    if (!userData) return;
    
    const newSettings = { ...userData.settings, ...settings };
    await updateUserDocInFirestore({ settings: newSettings });
  };

  const value = {
    currentUser: authState.user,
    userData,
    loading: authState.loading,
    error: authState.error,
    register,
    login,
    loginWithGoogle,
    logout,
    resetError,
    addToWatchlist,
    removeFromWatchlist,
    addToFavorites,
    removeFromFavorites,
    addToPortfolio,
    removeFromPortfolio,
    updateUserSettings
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
