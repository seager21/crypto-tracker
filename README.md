# 🚀 Crypto Tracker Pro - Enhanced Edition

A **modern, real-time cryptocurrency tracking application** built with **Node.js, Express, Socket.io, React, and Tailwind CSS**. Features a beautiful, responsive UI with live price updates, interactive charts, and professional design.

## ✨ New Features & Improvements

### 📰 **Cryptocurrency News Feed**

- **Latest crypto news** from NewsData.io API integration
- **Interactive news carousel** with article previews
- **Detailed article view** with modal popup
- **Keyboard navigation** for accessibility
- **News caching** for improved performance
- **Fallback mock data** when API is unavailable

### 🎨 **Modern React Frontend**

- **Professional UI** with Tailwind CSS and custom animations
- **Real-time price charts** using Recharts library
- **Responsive design** that works on all devices
- **Live connection status** indicator
- **Smooth animations** and transitions
- **Dark theme** with gradient backgrounds

### 📊 **Enhanced Data Visualization**

- **Interactive price charts** with Bitcoin and Ethereum
- **Market overview cards** with total market cap
- **24h change indicators** with color-coded trends
- **Price history tracking** (last 20 data points)
- **Live update timestamps**

### 🔧 **Improved Backend**

- **Enhanced API endpoints** with more crypto data
- **Better error handling** and logging
- **Support for additional cryptocurrencies**
- **Global market data endpoint**
- **Individual crypto data endpoint**

### 🛠 **Developer Experience**

- **Vite** for fast development and building
- **Hot reload** for instant development feedback
- **TypeScript** for improved code quality and developer experience
  - Strong typing with interfaces for components, props, and state
  - Type-safe API responses and data handling
  - Enhanced IDE support with autocompletion and error detection
- **ESLint & Prettier** for consistent code style
  - Standardized formatting across the entire codebase
  - TypeScript-specific linting rules for type safety
  - Automatic code formatting on save
- **Modern React patterns** with TypeScript interfaces
  - Custom hooks with proper typing
  - Context API with TypeScript generics
  - Error boundaries for graceful failure handling
- **Component-based architecture** with reusable components
  - Typed props and state throughout the component tree
  - Consistent component structure with interfaces
  - Reduced component complexity through proper typing
- **Professional project structure** with types and contexts

## Project Structure

```plaintext
crypto-tracker/
│── api/
│   ├── index.js           # Express.js API with WebSocket support
│   ├── routes/
│   │   └── news.js        # News API routes
│   └── services/
│       └── newsApi.js     # News API service with caching
│── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── CryptoNewsCarousel.jsx  # News carousel component
│   │   ├── context/      # React contexts for state management
│   │   └── types/        # TypeScript interfaces and types
│   ├── tsconfig.json     # TypeScript configuration
│   └── package.json      # Frontend dependencies
│── public/
│   └── index.html        # Static HTML
│── .env.example          # Example environment variables
│── vercel.json           # Vercel configuration
│── package.json          # Project dependencies
│── tsconfig.json         # Backend TypeScript configuration
│── .gitignore            # Ignore node_modules, etc.
│── .eslintrc.json        # ESLint configuration
│── .prettierrc           # Prettier configuration
```

## TypeScript Migration

The project has been migrated from JavaScript to TypeScript to improve code quality, maintainability, and developer experience.

### Migration Overview

- Converted all `.jsx` files to `.tsx` with proper TypeScript interfaces
- Added type definitions for component props and state
- Implemented TypeScript interfaces for API responses
- Set up proper error boundaries with TypeScript support
- Created type-safe context providers

### Key TypeScript Features Used

- **Interface Definitions**: Created interfaces for all component props and state
- **Type Guards**: Implemented for safer runtime type checking
- **Generic Components**: Used TypeScript generics for reusable components
- **Strict Null Checking**: Enabled for preventing null reference errors
- **Union Types**: Used for handling multiple possible data types

### Example TypeScript Interface

```typescript
// Example of a TypeScript interface for cryptocurrency data
interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  price: {
    usd: number;
    usd_24h_change: number;
  };
  market_cap: number;
  volume: number;
  image: string;
}
```

## Installation

### Prerequisites

- Node.js (v14+) installed
- npm (v6+) installed
- TypeScript knowledge for development

### Clone the Repository

```sh
git clone https://github.com/your-username/crypto-tracker.git
cd crypto-tracker
```

### Install Dependencies

```sh
npm run install-all
```

### Environment Variables

Copy the example environment file:

```sh
cp .env.example .env
```

Update the `.env` file with your API keys and configuration:

```env
# API Keys
COINGECKO_API_KEY=your_coingecko_api_key
NEWSDATA_API_KEY=your_newsdata_api_key

# Feature Flags
USE_MOCK_NEWS=false  # Set to true if you don't have a NewsData.io API key

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
```

- Get a free CoinGecko API key at [CoinGecko](https://www.coingecko.com/en/api)
- Get a free NewsData.io API key at [NewsData.io](https://newsdata.io/)
- Set up a Firebase project for authentication features

## Running the Project Locally

### Start the Development Server

```sh
npm run dev
```

The application will be available at `http://localhost:5173` with hot reloading enabled.

## API Usage

### GET `/crypto`

Fetches real-time Bitcoin and Ethereum prices.

```sh
curl http://localhost:3000/crypto
```

Response:

```json
{
  "bitcoin": {
    "usd": 42000,
    "usd_24h_change": -2.3
  },
  "ethereum": {
    "usd": 3000,
    "usd_24h_change": 1.5
  }
}
```

### GET `/api/news`

Fetches the latest cryptocurrency news articles.

```sh
curl http://localhost:3000/api/news
```

Response:

```json
{
  "status": "success",
  "totalResults": 10,
  "results": [
    {
      "title": "Bitcoin Reaches New All-Time High",
      "link": "https://example.com/news/bitcoin-ath",
      "description": "Bitcoin has reached a new all-time high price...",
      "pubDate": "2023-05-15 09:30:00",
      "imageUrl": "https://example.com/images/bitcoin.jpg",
      "source": "Crypto News Network"
    },
    // More articles...
  ]
}
```

## WebSocket Integration

### Connecting to WebSocket

Clients can receive live updates every 10 seconds:

```typescript
// TypeScript example with proper typing
import { io, Socket } from 'socket.io-client';
import { CryptoData } from './types';

const socket: Socket = io('http://localhost:3000');
socket.on('cryptoData', (data: CryptoData) => {
  console.log('Updated Prices:', data);
});
```

## Development Workflow

### TypeScript Commands

```sh
# Type checking
npm run type-check

# Linting with ESLint (includes TypeScript rules)
npm run lint

# Format code with Prettier
npm run format
```

## Deploying on Vercel

### Install Vercel CLI

```sh
npm install -g vercel
```

### Deploy

```sh
vercel
```

This will provide a live URL for your API and frontend.

## TypeScript Configuration

The project uses a modern TypeScript configuration with strict type checking to ensure maximum type safety.

### tsconfig.json Overview

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### ESLint Configuration for TypeScript

The project uses ESLint with TypeScript-specific rules to ensure code quality:

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "plugin:prettier/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": ["react-refresh", "@typescript-eslint"],
  "rules": {
    "react-refresh/only-export-components": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-unused-vars": "warn"
  }
}
```

## Next Steps

- Expand TypeScript coverage to API layer including the News API
- Enhance the News feed with article filtering by cryptocurrency
- Add unit tests with TypeScript support (Jest/React Testing Library)
- Implement more advanced TypeScript features like discriminated unions
- Further improve component reusability with generic TypeScript patterns
- Add documentation comments for better IDE integration
- Add search functionality to the News feed
- Implement user preferences for News content

## License

MIT License
