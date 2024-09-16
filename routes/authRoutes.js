const express = require('express'); // Import Express
const { signup, login, refreshToken, logout } = require('../controllers/authController'); // Import auth controller methods
const router = express.Router(); // Create router instance

router.post('/signup', signup); // Route for sign-up (registration)
router.post('/login', login); // Route for login
router.post('/refresh-token', refreshToken); // Route for refreshing tokens
router.post('/logout', logout); // Route for logging out

module.exports = router; // Export router
