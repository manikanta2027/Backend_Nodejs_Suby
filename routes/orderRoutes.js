const express = require('express');
const router = express.Router();
const { createOrder, getOrderHistory, getOrderById } = require('../controllers/orderController');
const verifyUserToken = require('../middlewares/verifyUserToken');

// Create order from cart
router.post('/create', verifyUserToken, createOrder);

// Get order history
router.get('/history', verifyUserToken, getOrderHistory);

// Get single order
router.get('/:orderId', verifyUserToken, getOrderById);

module.exports = router;
