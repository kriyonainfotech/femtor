const express = require('express');
const app = express();
const cors = require("cors");

const dotenv = require('dotenv');
// THE VERY FIRST LINE OF EXECUTABLE CODE
dotenv.config();

// NOW, LET'S DEBUG TO BE 100% SURE

const connectDB = require('./config/db');
connectDB();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: ["http://localhost:5173"], // your frontend URL
    credentials: true, // allow cookies if you ever use them
}))

app.get('/', (req, res) => res.send('API is running ✅'));

// Mount routers
app.use('/api', require('./routes/indexRoute'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
