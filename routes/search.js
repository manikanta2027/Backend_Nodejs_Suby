// routes/search.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Firm = require('../models/Firm');

router.get('/', async (req, res) => {
  const { query } = req.query;
  if (!query) return res.json({ firms: [], suggestions: [] });

  try {
    // Find products matching query and populate firm details
    const products = await Product.find({
      productName: { $regex: query, $options: 'i' }
    }).populate('firm'); // Populate full firm details

    // Build unique list of firms that have this product
    const firmMap = new Map();
    
    products.forEach(product => {
      product.firm.forEach(f => {
        if (!firmMap.has(f._id.toString())) {
          firmMap.set(f._id.toString(), {
            _id: f._id,
            firmName: f.firmName,
            area: f.area,
            region: f.region,
            image: f.image,
            offer: f.offer,
            matchedProduct: product.productName // Which product matched
          });
        }
      });
    });

    const firms = Array.from(firmMap.values());

    // Autocomplete suggestions
    const suggestions = await Product.find({
      productName: { $regex: `^${query}`, $options: 'i' }
    }).limit(5).select('productName');

    res.json({ 
      firms, 
      suggestions: suggestions.map(s => s.productName) 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
