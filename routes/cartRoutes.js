// routes/cartRoutes.js

const express = require('express');
const router = express.Router();

// Controllers for cart actions
const { addToCart, getCart, removeFromCart } = require('../controllers/cartController');

// Middleware to verify logged-in users
const verifyUserToken = require('../middlewares/verifyUserToken');

// ----------------------
// CART ROUTES
// ----------------------

// Add a product to the user's cart
// Endpoint: POST /cart/add
router.post('/add', verifyUserToken, addToCart);

// Get all products in the user's cart
// Endpoint: GET /cart
router.get('/', verifyUserToken, getCart);

// Remove a product from the user's cart
// Endpoint: POST /cart/remove
router.post('/remove', verifyUserToken, removeFromCart);

module.exports = router;
