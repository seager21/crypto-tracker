# Crypto Tracker API

This project is a **real-time cryptocurrency tracking API** built with **Node.js, Express, WebSockets (Socket.io), and Axios**. It fetches data from the **CoinGecko API** and serves it via REST API and WebSockets. The project also includes a frontend using **Tailwind CSS**.

## Features
- **Real-time Crypto Price Updates** (via WebSockets)
- **REST API Endpoint** (`/crypto`) to fetch Bitcoin and Ethereum data
- **Frontend with Tailwind CSS** to display crypto prices
- **Deployed on Vercel**

## Project Structure
```
crypto-tracker/
│── api/
│   └── index.js       # Express.js API with WebSocket support
│── public/
│   ├── index.html     # Frontend page
│   ├── styles.css     # Custom CSS (optional)
│── vercel.json        # Vercel configuration
│── package.json       # Project dependencies
│── .gitignore         # Ignore node_modules, etc.
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

