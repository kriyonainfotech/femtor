const express = require('express');
const app = express();
const cors = require("cors");
const http = require("http"); // You need http
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
app.use(cookieParser());
// 1. IMPORT your WebSocket initializer
const { initializeWebSocket } = require('./utils/websocket'); // Adjust path if needed

dotenv.config();

const connectDB = require('./config/db');
connectDB();

// --- SERVER SETUP ---
// Create the main HTTP server that both Express and WebSockets will use
const server = http.createServer(app);

// 2. INITIALIZE your WebSocket server and pass it the main server instance
initializeWebSocket(server);
// --------------------

// Middleware (no changes here)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: ["http://localhost:5173", "https://admin.femtormasterclass.com"],
    credentials: true,
}));


// --- REMOVED ---
// We have deleted the old wss.on('connection', ...) logic from this file.
// All WebSocket logic is now handled by websocket.js.
// ---------------


// Routes (no changes here)
app.get('/', (req, res) => res.send('API is running ✅'));
app.use('/api', require('./routes/indexRoute'));

const PORT = process.env.PORT || 5000;

// Use server.listen, not app.listen
server.listen(PORT, () => console.log(`Server (with WebSockets) running on port ${PORT}`));

