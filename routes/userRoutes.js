const express = require('express'); // Import Express
const { getUserDetails, getProtectedData } = require('../controllers/userController'); // Import user controller methods
const { protect } = require('../middlewares/authMiddleware'); // Import authentication middleware
const router = express.Router(); // Create router instance

router.get('/me', protect, getUserDetails); // Route to get current user details (protected)
router.get('/protected-data', protect, getProtectedData); // Example protected route

module.exports = router; // Export router
