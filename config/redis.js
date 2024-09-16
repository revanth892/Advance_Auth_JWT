require('dotenv').config(); // Load environment variables from .env file
const { createClient } = require('redis'); // Import Redis client

// Create Redis client with connection options from .env file
const redisClient = createClient({
    password: process.env.REDIS_PASSWORD, // Redis password from environment
    socket: {
        host: process.env.REDIS_HOST, // Redis host from environment
        port: process.env.REDIS_PORT, // Redis port from environment
    }
});

// Export the redisClient to be used in other parts of the application
module.exports = redisClient;
