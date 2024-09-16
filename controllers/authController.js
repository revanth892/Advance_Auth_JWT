const User = require('../models/userModel'); // Import User model
const jwt = require('jsonwebtoken'); // Import JWT for token handling
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing
const redisClient = require('../config/redis'); // Import Redis client

// Function to generate access and refresh tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' }); // Generate access token with 1 hour expiry
  const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1y' }); // Generate refresh token with 1 year expiry
  return { accessToken, refreshToken }; // Return both tokens
};

// Sign-up (registration) handler
exports.signup = async (req, res) => {
  const { name, email, password } = req.body; // Extract name, email, and password from request body
  try {
    let user = await User.findOne({ email }); // Check if user already exists
    if (user) return res.status(400).json({ message: 'User already exists' }); // If user exists, return error

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10); // Generate salt
    const hashedPassword = await bcrypt.hash(password, salt); // Hash password with salt

    // Create a new user
    user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save(); // Save the new user to the database

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Store refresh token in Redis
    await redisClient.set(user._id.toString(), refreshToken);

    res.status(201).json({ accessToken, refreshToken }); // Return tokens
  } catch (error) {
    res.status(500).json({ message: 'Server error' }); // Return server error
  }
};

// Login handler
exports.login = async (req, res) => {
  const { email, password } = req.body; // Extract email and password from request body
  try {
    const user = await User.findOne({ email }); // Find user by email
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' }); // Return error if credentials are invalid
    }

    const { accessToken, refreshToken } = generateTokens(user); // Generate tokens

    // Store refresh token in Redis
    await redisClient.set(user._id.toString(), refreshToken); // Store refresh token in Redis with user ID as key

    res.json({ accessToken, refreshToken }); // Return tokens to client
  } catch (error) {
    res.status(500).json({ message: 'Server error' }); // Return server error
  }
};

// Refresh token handler
// Refresh token handler
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body; // Extract refresh token from request body
  if (!refreshToken) return res.status(403).json({ message: 'Refresh token is required' }); // Return error if no refresh token is provided

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET); // Decode the refresh token

    // Find user by ID
    const user = await User.findById(decoded.id); // Use decoded.id to find the user
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' }); // Return error if user is not found
    }

    // Get the stored token from Redis
    const storedToken = await redisClient.get(decoded.id.toString());
    if (!storedToken || storedToken !== refreshToken) {
      return res.status(403).json({ message: 'Invalid refresh token' }); // Return error if token is invalid
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // Update Redis with new refresh token
    await redisClient.set(decoded.id.toString(), newRefreshToken); // Update refresh token in Redis

    res.json({ accessToken, refreshToken: newRefreshToken }); // Return new tokens to client
  } catch (error) {
    res.status(403).json({ message: 'Invalid token' }); // Return error if token verification fails
  }
};


// Logout handler
exports.logout = async (req, res) => {
  const userId = req.user.id; // Get user ID from request
  await redisClient.del(userId.toString()); // Delete refresh token from Redis
  res.status(200).json({ message: 'Logged out' }); // Return logout success message
};
