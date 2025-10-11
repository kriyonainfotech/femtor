const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        // // This will now correctly find the MONGO_URI from your .env file
        // console.log('--- Environment Check ---');
        // console.log('PORT variable is:', process.env.PORT);
        console.log('MONGO_URI is:', process.env.MONGO_URI);

        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        // Exit process with failure code
        process.exit(1);
    }
};

module.exports = connectDB;
