const Order = require('../models/Order');
const Product = require('../models/Product');

// AI Recommendation Algorithm
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Step 1: Get current user's order history
    const userOrders = await Order.find({ userId }).populate('products.productId');
    
    if (userOrders.length === 0) {
      // New user - recommend popular items
      return getPopularProducts(res);
    }

    // Step 2: Extract products user has ordered
    const userProductIds = new Set();
    userOrders.forEach(order => {
      order.products.forEach(p => {
        if (p.productId) userProductIds.add(p.productId._id.toString());
      });
    });

    // Step 3: Find similar users (collaborative filtering)
    const allOrders = await Order.find({ userId: { $ne: userId } }).populate('products.productId');
    
    const similarUsers = [];
    const userMap = new Map();

    allOrders.forEach(order => {
      const otherUserId = order.userId.toString();
      if (!userMap.has(otherUserId)) {
        userMap.set(otherUserId, []);
      }
      
      order.products.forEach(p => {
        if (p.productId) {
          userMap.get(otherUserId).push(p.productId._id.toString());
        }
      });
    });

    // Step 4: Calculate similarity score
    userMap.forEach((products, otherUserId) => {
      const commonProducts = products.filter(p => userProductIds.has(p));
      const similarityScore = commonProducts.length;
      
      if (similarityScore > 0) {
        similarUsers.push({ userId: otherUserId, score: similarityScore, products });
      }
    });

    // Sort by similarity score
    similarUsers.sort((a, b) => b.score - a.score);

    // Step 5: Get recommendations from similar users
    const recommendedProductIds = new Set();
    
    similarUsers.slice(0, 5).forEach(user => {
      user.products.forEach(productId => {
        if (!userProductIds.has(productId)) {
          recommendedProductIds.add(productId);
        }
      });
    });

    // Step 6: Fetch product details
    const recommendations = await Product.find({
      _id: { $in: Array.from(recommendedProductIds) }
    }).populate('firm').limit(10);

    res.json({
      success: true,
      recommendations,
      algorithm: 'collaborative-filtering',
      basedOn: userOrders.length + ' past orders'
    });

  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
};

// Fallback: Popular products for new users
async function getPopularProducts(res) {
  try {
    const popularProducts = await Product.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'products.productId',
          as: 'orders'
        }
      },
      {
        $addFields: {
          orderCount: { $size: '$orders' }
        }
      },
      {
        $sort: { orderCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    await Product.populate(popularProducts, { path: 'firm' });

    res.json({
      success: true,
      recommendations: popularProducts,
      algorithm: 'popularity-based',
      basedOn: 'trending items'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get popular products' });
  }
}
