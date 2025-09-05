// Import dependencies
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const cryptoRoutes = require("./routes/crypto");
const authenticate = require("./middleware/auth");
const cryptoApi = require("./services/cryptoApi");

// Load environment variables
dotenv.config();

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

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/crypto", cryptoRoutes);

// Use the cryptoApi service for fetching data
const fetchCryptoData = async () => {
    try {
        const coinIds = [
            "bitcoin", "ethereum", "cardano", "polkadot", "chainlink", 
            "litecoin", "binancecoin", "solana", "dogecoin", "ripple",
            "avalanche-2", "polygon", "uniswap", "cosmos", "stellar", 
            "filecoin", "aave", "algorand", "vechain", "hedera-hashgraph", 
            "theta-token", "the-sandbox"
        ];
        
        return await cryptoApi.getCryptoPrices(coinIds);
    } catch (error) {
        console.error("❌ Failed to fetch crypto data:", error.message);
        return null;
    }
};

// Function to get global market data
const fetchGlobalData = async () => {
    try {
        return await cryptoApi.getGlobalMarketData();
    } catch (error) {
        console.error("Failed to fetch global data", error);
        return null;
    }
};

// Legacy API routes for backward compatibility
app.get("/crypto", async (req, res) => {
    const data = await fetchCryptoData();
    if (data) {
        res.json(data);
    } else {
        res.status(500).json({ error: "Failed to fetch crypto data" });
    }
});

// Legacy API route for global market data
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
            try {
                const response = await axios.get("https://min-api.cryptocompare.com/data/v2/news/", {
                    params: {
                        lang: "EN",
                        sortOrder: "latest",
                        limit: limit
                    },
                    timeout: 8000
                });
                
                if (response.data.Response === "Success" && response.data.Data && response.data.Data.length > 0) {
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
                } else {
                    throw new Error('No news data from CryptoCompare');
                }
            } catch (ccError) {
                console.log('CryptoCompare API failed, using fallback data:', ccError.message);
                throw ccError; // Continue to fallback
            }
        }
        
        // If CryptoCompare fails or returns empty, use fallback data
        if (newsData.length === 0) {
            newsData = [
                {
                    id: '1',
                    title: 'Bitcoin Reaches New All-Time High Amid Institutional Adoption',
                    body: 'Bitcoin continues its impressive rally as major institutions and corporations increase their cryptocurrency holdings. The digital asset has gained significant momentum following recent regulatory clarity and growing acceptance among traditional financial institutions.',
                    url: 'https://cointelegraph.com',
                    imageurl: 'https://images.cointelegraph.com/images/1434_aHR0cHM6Ly9zMy5jb2ludGVsZWdyYXBoLmNvbS91cGxvYWRzLzIwMjQtMDEvYml0Y29pbi1hdGgtMjAyNC5qcGc=.jpg',
                    source: 'CoinTelegraph',
                    published_on: Math.floor(Date.now() / 1000),
                    tags: ['Bitcoin', 'ATH', 'Institutional Adoption']
                },
                {
                    id: '2',
                    title: 'Ethereum 2.0 Staking Rewards See Significant Increase',
                    body: 'Recent improvements to the Ethereum network have resulted in higher staking rewards for validators. The upgrade enhances network security while providing better returns for ETH holders participating in the staking ecosystem.',
                    url: 'https://cointelegraph.com',
                    imageurl: 'https://images.cointelegraph.com/images/1434_aHR0cHM6Ly9zMy5jb2ludGVsZWdyYXBoLmNvbS91cGxvYWRzLzIwMjQtMDEvZXRoZXJldW0tc3Rha2luZy5qcGc=.jpg',
                    source: 'CoinTelegraph',
                    published_on: Math.floor(Date.now() / 1000) - 3600,
                    tags: ['Ethereum', 'Staking', 'ETH2', 'Rewards']
                },
                {
                    id: '3',
                    title: 'DeFi Protocol Sees Record Total Value Locked',
                    body: 'Decentralized Finance continues to experience explosive growth with new protocols launching and existing ones seeing unprecedented levels of total value locked. This trend indicates growing confidence in DeFi technologies.',
                    url: 'https://cointelegraph.com',
                    imageurl: 'https://images.cointelegraph.com/images/1434_aHR0cHM6Ly9zMy5jb2ludGVsZWdyYXBoLmNvbS91cGxvYWRzLzIwMjQtMDEvZGVmaS10dmwtcmVjb3JkLmpwZw==.jpg',
                    source: 'CoinTelegraph',
                    published_on: Math.floor(Date.now() / 1000) - 7200,
                    tags: ['DeFi', 'TVL', 'Growth', 'Protocols']
                },
                {
                    id: '4',
                    title: 'Central Bank Digital Currencies Gain Momentum Globally',
                    body: 'Multiple countries are accelerating their central bank digital currency (CBDC) development programs. This represents a significant shift in how governments view digital currencies and their potential role in future monetary systems.',
                    url: 'https://cointelegraph.com',
                    imageurl: 'https://images.cointelegraph.com/images/1434_aHR0cHM6Ly9zMy5jb2ludGVsZWdyYXBoLmNvbS91cGxvYWRzLzIwMjQtMDEvY2JkYy1nbG9iYWwuanBn.jpg',
                    source: 'CoinTelegraph',
                    published_on: Math.floor(Date.now() / 1000) - 10800,
                    tags: ['CBDC', 'Government', 'Digital Currency']
                },
                {
                    id: '5',
                    title: 'NFT Market Shows Signs of Revival After Recent Downturn',
                    body: 'The NFT marketplace is experiencing renewed interest with innovative projects and utility-focused collections driving engagement. New use cases beyond digital art are emerging, expanding the NFT ecosystem.',
                    url: 'https://cointelegraph.com',
                    imageurl: 'https://images.cointelegraph.com/images/1434_aHR0cHM6Ly9zMy5jb2ludGVsZWdyYXBoLmNvbS91cGxvYWRzLzIwMjQtMDEvbmZ0LXJldml2YWwuanBn.jpg',
                    source: 'CoinTelegraph',
                    published_on: Math.floor(Date.now() / 1000) - 14400,
                    tags: ['NFT', 'Digital Art', 'Blockchain', 'Innovation']
                },
                {
                    id: '6',
                    title: 'Layer 2 Solutions Experience Explosive Growth',
                    body: 'Layer 2 scaling solutions for Ethereum are seeing unprecedented adoption as users seek faster and cheaper transactions. These networks are becoming essential infrastructure for the growing DeFi and NFT ecosystems.',
                    url: 'https://cointelegraph.com',
                    imageurl: 'https://images.cointelegraph.com/images/1434_aHR0cHM6Ly9zMy5jb2ludGVsZWdyYXBoLmNvbS91cGxvYWRzLzIwMjQtMDEvbGF5ZXItMi1ncm93dGguanBn.jpg',
                    source: 'CoinTelegraph',
                    published_on: Math.floor(Date.now() / 1000) - 18000,
                    tags: ['Layer 2', 'Ethereum', 'Scaling', 'Infrastructure']
                }
            ].slice(0, parseInt(limit));
        }
        
        res.json({
            success: true,
            data: newsData,
            source: newsData.length > 0 ? (source === 'cryptocompare' ? 'cryptocompare' : 'fallback') : 'fallback'
        });
        
    } catch (error) {
        console.error("Failed to fetch crypto news:", error.message);
        
        // Always provide fallback news data
        const fallbackNews = [
            {
                id: 'fallback-1',
                title: 'Crypto Market Update - Stay Informed',
                body: 'Stay updated with the latest cryptocurrency market trends, analysis, and breaking news from the digital asset space. Monitor price movements and market developments.',
                url: 'https://cointelegraph.com',
                imageurl: 'https://via.placeholder.com/300x200?text=Crypto+Update',
                source: 'CoinTelegraph',
                published_on: Math.floor(Date.now() / 1000),
                tags: ['Market', 'Analysis', 'Update']
            }
        ];
        
        res.json({
            success: true,
            data: fallbackNews,
            source: 'fallback',
            message: 'Using fallback news data due to API unavailability'
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
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/dist', 'index.html'));
});
app.get("/", (req, res) => {
    res.send("Crypto Tracking API is running");
});

// Start server (for local testing)
if (process.env.NODE_ENV !== "vercel") {
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export the app for Vercel
module.exports = app;
