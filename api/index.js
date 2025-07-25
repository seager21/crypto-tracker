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

// Function to fetch crypto data
const fetchCryptoData = async () => {
    try {
        const response = await axios.get("https://api.coingecko.com/api/v3/simple/price", {
            params: {
                ids: "bitcoin,ethereum,cardano,polkadot,chainlink,litecoin,binancecoin,solana,dogecoin,ripple,avalanche-2,polygon,uniswap,cosmos,stellar,filecoin,aave,algorand,vechain,hedera-hashgraph,theta-token,the-sandbox",
                vs_currencies: "usd",
                include_market_cap: true,
                include_24hr_change: true,
                include_24hr_vol: true,
                include_last_updated_at: true
            }
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch crypto data", error);
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

// WebSocket connection
io.on("connection", (socket) => {
    console.log("Client connected");
    
    const sendCryptoData = async () => {
        try {
            const data = await fetchCryptoData();
            if (data) {
                socket.emit("cryptoData", data);
            }
        } catch (error) {
            console.log("Error sending crypto data:", error.message);
            // Send cached data or empty array if no data available
            socket.emit("cryptoData", []);
        }
    };

    // Send data immediately on connection
    sendCryptoData();
    
    // Send data every 60 seconds to avoid rate limiting
    const interval = setInterval(sendCryptoData, 60000);
    
    socket.on("disconnect", () => {
        console.log("Client disconnected");
        clearInterval(interval);
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
