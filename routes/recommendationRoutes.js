const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommendationController');
const verifyUserToken = require('../middlewares/verifyUserToken');

// Get personalized recommendations
router.get('/', verifyUserToken, getRecommendations);

module.exports = router;
