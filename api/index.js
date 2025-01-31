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

// Function to fetch crypto data
const fetchCryptoData = async () => {
    try {
        const response = await axios.get("https://api.coingecko.com/api/v3/simple/price", {
            params: {
                ids: "bitcoin,ethereum",
                vs_currencies: "usd",
                include_market_cap: true,
                include_24hr_change: true
            }
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch crypto data", error);
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

// WebSocket connection
io.on("connection", (socket) => {
    console.log("Client connected");
    
    const sendCryptoData = async () => {
        const data = await fetchCryptoData();
        if (data) {
            socket.emit("cryptoData", data);
        }
    };

    // Send data every 10 seconds
    const interval = setInterval(sendCryptoData, 10000);
    
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
