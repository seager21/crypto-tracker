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

export interface UserData {
  watchlist: WatchlistItem[];
  portfolio: Portfolio[];
  favoriteCoins: string[];
  settings: {
    theme: 'light' | 'dark';
    currency: string;
    notifications: boolean;
  };
}
