export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface WatchlistItem {
  id: string;
  cryptoId: string;
  name: string;
  symbol: string;
  addedAt: number;
}

export interface Portfolio {
  id: string;
  cryptoId: string;
  name: string;
  symbol: string;
  amount: number;
  purchasePrice: number;
  purchaseDate: number;
}

export interface Transaction {
  id: string;
  cryptoId: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  date: number;
  notes?: string;
}

export interface UserProfile {
  bio: string;
  location: string;
  website: string;
}

export interface UserStats {
  totalInvested: number;
  currentValue: number;
  totalGain: number;
  totalGainPercent: number;
}

export interface UserData {
  uid?: string;
  email?: string;
  displayName?: string;
  photoURL?: string | null;
  watchlist: WatchlistItem[];
  portfolio: Portfolio[];
  favoriteCoins: string[];
  transactions?: Transaction[];
  settings: {
    theme: 'light' | 'dark';
    currency: string;
    timezone?: string;
    newsRegion?: string;
    notifications: boolean;
  };
  profile?: UserProfile;
  stats?: UserStats;
  createdAt?: any;
  updatedAt?: any;
}
