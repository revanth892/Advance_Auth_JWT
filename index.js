require('dotenv').config(); // Load environment variables from .env file
const express = require('express'); // Import Express framework
const mongoose = require('mongoose'); // Import Mongoose for MongoDB interactions
const redisClient = require('./config/redis'); // Import Redis client
const authRoutes = require('./routes/authRoutes'); // Import authentication routes
const userRoutes = require('./routes/userRoutes'); // Import user routes

const app = express(); // Create an Express application
app.use(express.json()); // Middleware to parse JSON request bodies

// MongoDB connection

// Mount authentication routes on /api/auth
app.use('/api/auth', authRoutes);

// Mount user routes on /api/user
app.use('/api/user', userRoutes);

// Define the port and start the server
const PORT = process.env.PORT || 7777; // Use PORT from .env or default to 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // Start the server

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected")) // Log success message
.catch(err => console.log(err)); // Log error message if connection fails

// Redis connection
redisClient.connect().catch(console.error); 
redisClient.on('connect', () => {
  console.log('Redis connected'); // Log success message for Redis connection
});

