const jwt = require('jsonwebtoken'); // Import JWT

// Middleware to protect routes
exports.protect = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1]; // Get token from Authorization header
  if (!token) return res.status(401).json({ message: 'Unauthorized' }); // Return error if no token

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' }); // Return error if token is invalid
    req.user = decoded; // Attach decoded user data to request
    next(); // Proceed to the next middleware/route handler
  });
};
