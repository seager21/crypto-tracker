# 🚀 Crypto Tracker Pro - Enhanced Edition

A **modern, real-time cryptocurrency tracking application** built with **Node.js, Express, Socket.io, React, and Tailwind CSS**. Features a beautiful, responsive UI with live price updates, interactive charts, and professional design.

## ✨ New Features & Improvements

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
- **ESLint & Prettier** for consistent code style
- **Modern React patterns** with TypeScript interfaces
- **Component-based architecture** with reusable components
- **Professional project structure** with types and contexts

## Project Structure

```plaintext
crypto-tracker/
│── api/
│   └── index.js       # Express.js API with WebSocket support
│── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── context/      # React contexts for state management
│   │   └── types/        # TypeScript interfaces and types
│   ├── tsconfig.json     # TypeScript configuration
│   └── package.json      # Frontend dependencies
│── public/
│   └── index.html        # Static HTML
│── vercel.json           # Vercel configuration
│── package.json          # Project dependencies
│── tsconfig.json         # Backend TypeScript configuration
│── .gitignore            # Ignore node_modules, etc.
│── .eslintrc.json        # ESLint configuration
│── .prettierrc           # Prettier configuration
```

## Installation
### Prerequisites
- Node.js installed
- npm installed

### Clone the Repository
```sh
git clone https://github.com/your-username/crypto-tracker.git
cd crypto-tracker
```

### Install Dependencies
```sh
npm install
```

## Running the Project Locally
### Start the Server
```sh
node api/index.js
```
### Open the Frontend
Simply open `public/index.html` in your browser.

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

## WebSocket Integration
### Connecting to WebSocket
Clients can receive live updates every 10 seconds:
```javascript
const socket = io('http://localhost:3000');
socket.on('cryptoData', (data) => {
    console.log("Updated Prices:", data);
});
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

## Next Steps
- Add more cryptocurrencies
- Improve frontend UI with charts
- Implement WebSocket authentication

## License
MIT License

