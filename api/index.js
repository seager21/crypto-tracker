// Import dependencies
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from frontend build
app.use(express.static("../frontend/dist"));

// Function to fetch crypto data with timeout and retry
const fetchCryptoData = async (retryCount = 0) => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await axios.get("https://api.coingecko.com/api/v3/simple/price", {
            params: {
                ids: "bitcoin,ethereum,cardano,polkadot,chainlink,litecoin,binancecoin,solana,dogecoin,ripple,avalanche-2,polygon,uniswap,cosmos,stellar,filecoin,aave,algorand,vechain,hedera-hashgraph,theta-token,the-sandbox",
                vs_currencies: "usd",
                include_market_cap: true,
                include_24hr_change: true,
                include_24hr_vol: true,
                include_last_updated_at: true
            },
            timeout: 10000, // 10 second timeout
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log("✅ Successfully fetched crypto data");
        return response.data;
    } catch (error) {
        console.error("❌ Failed to fetch crypto data:", error.message);
        
        // Retry logic for rate limiting or network issues
        if (retryCount < 3 && (error.code === 'ECONNABORTED' || error.response?.status === 429)) {
            const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
            console.log(`🔄 Retrying in ${delay}ms... (attempt ${retryCount + 1}/3)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchCryptoData(retryCount + 1);
        }
        
        return null;
    }
};

// Function to get global market data
const fetchGlobalData = async () => {
    try {
        const response = await axios.get("https://api.coingecko.com/api/v3/global");
        return response.data.data;
    } catch (error) {
        console.error("Failed to fetch global data", error);
        return null;
    }
};

// API route to fetch crypto data
app.get("/crypto", async (req, res) => {
    const data = await fetchCryptoData();
    if (data) {
        res.json(data);
    } else {
        res.status(500).json({ error: "Failed to fetch crypto data" });
    }
});

// API route to fetch global market data
app.get("/global", async (req, res) => {
    const data = await fetchGlobalData();
    if (data) {
        res.json(data);
    } else {
        res.status(500).json({ error: "Failed to fetch global data" });
    }
});

// API route to fetch specific crypto data
app.get("/crypto/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const response = await axios.get("https://api.coingecko.com/api/v3/simple/price", {
            params: {
                ids: id,
                vs_currencies: "usd",
                include_market_cap: true,
                include_24hr_change: true,
                include_24hr_vol: true
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch crypto data" });
    }
});

// API route to fetch detailed crypto information
app.get("/crypto/:id/details", async (req, res) => {
    const { id } = req.params;
    try {
        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}`, {
            params: {
                localization: false,
                tickers: false,
                market_data: true,
                community_data: true,
                developer_data: false,
                sparkline: false
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error("Failed to fetch detailed crypto data", error);
        res.status(500).json({ error: "Failed to fetch detailed crypto data" });
    }
});

// API route to fetch historical crypto data
app.get("/crypto/:id/history", async (req, res) => {
    const { id } = req.params;
    const { days = 7 } = req.query;
    try {
        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}/market_chart`, {
            params: {
                vs_currency: "usd",
                days: days,
                interval: days <= 1 ? "hourly" : "daily"
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error("Failed to fetch historical crypto data", error);
        res.status(500).json({ error: "Failed to fetch historical crypto data" });
    }
});

// API route to fetch crypto news
app.get("/news", async (req, res) => {
    const { limit = 10, source = 'cryptocompare' } = req.query;
    
    try {
        let newsData = [];
        
        if (source === 'cryptocompare') {
            // Use CryptoCompare API (free tier)
            const response = await axios.get("https://min-api.cryptocompare.com/data/v2/news/", {
                params: {
                    lang: "EN",
                    sortOrder: "latest",
                    limit: limit
                }
            });
            
            if (response.data.Response === "Success") {
                newsData = response.data.Data.map(article => ({
                    id: article.id,
                    title: article.title,
                    body: article.body,
                    url: article.url,
                    imageurl: article.imageurl,
                    source: article.source_info.name,
                    published_on: article.published_on,
                    tags: article.tags || []
                }));
            }
        } else if (source === 'coingecko') {
            // Fallback to manual news aggregation from popular crypto sites
            newsData = [
                {
                    id: '1',
                    title: 'Bitcoin Reaches New All-Time High',
                    body: 'Bitcoin continues its impressive rally as institutional adoption grows...',
                    url: 'https://cointelegraph.com',
                    imageurl: 'https://via.placeholder.com/300x200?text=Bitcoin+News',
                    source: 'CoinTelegraph',
                    published_on: Math.floor(Date.now() / 1000),
                    tags: ['Bitcoin', 'ATH', 'Adoption']
                },
                {
                    id: '2',
                    title: 'Ethereum 2.0 Staking Rewards Increase',
                    body: 'New improvements to Ethereum staking are providing better rewards for validators...',
                    url: 'https://cointelegraph.com',
                    imageurl: 'https://via.placeholder.com/300x200?text=Ethereum+News',
                    source: 'CoinTelegraph',
                    published_on: Math.floor(Date.now() / 1000) - 3600,
                    tags: ['Ethereum', 'Staking', 'ETH2']
                },
                {
                    id: '3',
                    title: 'DeFi Protocol Sees Record TVL',
                    body: 'Decentralized Finance continues to grow with new protocols launching...',
                    url: 'https://cointelegraph.com',
                    imageurl: 'https://via.placeholder.com/300x200?text=DeFi+News',
                    source: 'CoinTelegraph',
                    published_on: Math.floor(Date.now() / 1000) - 7200,
                    tags: ['DeFi', 'TVL', 'Growth']
                }
            ];
        }
        
        res.json({
            success: true,
            data: newsData,
            source: source
        });
        
    } catch (error) {
        console.error("Failed to fetch crypto news:", error.message);
        
        // Fallback to sample news data
        const fallbackNews = [
            {
                id: 'fallback-1',
                title: 'Crypto Market Update',
                body: 'Stay updated with the latest cryptocurrency market trends and analysis...',
                url: 'https://cointelegraph.com',
                imageurl: 'https://via.placeholder.com/300x200?text=Crypto+Update',
                source: 'CoinTelegraph',
                published_on: Math.floor(Date.now() / 1000),
                tags: ['Market', 'Analysis']
            }
        ];
        
        res.json({
            success: true,
            data: fallbackNews,
            source: 'fallback',
            message: 'Using fallback news data'
        });
    }
});

// WebSocket connection with improved error handling
io.on("connection", (socket) => {
    console.log("📡 Client connected");
    
    const sendCryptoData = async () => {
        try {
            const data = await fetchCryptoData();
            if (data) {
                socket.emit("cryptoData", data);
                console.log("📊 Crypto data sent to client");
            } else {
                console.log("⚠️ No crypto data available, sending empty object");
                socket.emit("cryptoData", {});
            }
        } catch (error) {
            console.log("❌ Error sending crypto data:", error.message);
            socket.emit("cryptoData", {});
        }
    };

    // Send data immediately on connection
    sendCryptoData();
    
    // Send data every 30 seconds (faster than before)
    const interval = setInterval(sendCryptoData, 30000);
    
    socket.on("disconnect", () => {
        console.log("📡 Client disconnected");
        clearInterval(interval);
    });
    
    // Handle manual refresh requests from client
    socket.on("requestRefresh", () => {
        console.log("🔄 Manual refresh requested");
        sendCryptoData();
    });
});

// Default route
app.get("/", (req, res) => {
    res.send("Crypto Tracking API is running");
});

// Start server (for local testing)
if (process.env.NODE_ENV !== "vercel") {
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export the app for Vercel
module.exports = app;
