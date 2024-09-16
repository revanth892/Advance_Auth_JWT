const User = require('../models/userModel'); // Import User model

// Get user details
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // Find user by ID and exclude password from response
    if (!user) return res.status(404).json({ message: 'User not found' }); // Return error if user not found
    res.json(user); // Return user data
  } catch (error) {
    res.status(500).json({ message: 'Server error' }); // Return server error
  }
};

// Sample protected route to get some other data
exports.getProtectedData = async (req, res) => {
  const protectedData = {
    message: "This is protected data only accessible to authenticated users.",
    timestamp: new Date(),
  };
  
  res.json(protectedData); // Return the protected data
};
