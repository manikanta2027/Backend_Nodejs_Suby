const Cart = require('../models/Cart');

// Add product to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      if (quantity > 0) {
        cart = new Cart({
          userId: req.user._id,
          products: [{ productId, quantity }]
        });
      } else {
        return res.status(400).json({ error: "Cannot remove from empty cart" });
      }
    } else {
      const index = cart.products.findIndex(p => p.productId.equals(productId));
      if (index > -1) {
        cart.products[index].quantity += quantity;
        if (cart.products[index].quantity <= 0) {
          cart.products.splice(index, 1);
        }
      } else if (quantity > 0) {
        cart.products.push({ productId, quantity });
      }
    }

    await cart.save();
    await cart.populate('products.productId');
    res.json({ products: cart.products });
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
};

// Get user cart - ✅ ONLY CHANGE THIS FUNCTION
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id })
      .populate({
        path: 'products.productId',
        select: 'productName price description image'
      });

    if (!cart) {
      return res.json({ products: [] });
    }

    // ✅ Convert string price to number when sending to frontend
    const transformedProducts = cart.products.map(item => ({
      product: {
        _id: item.productId._id,
        productName: item.productId.productName,
        price: parseFloat(item.productId.price) || 0, // ✅ Convert here
        description: item.productId.description,
        image: item.productId.image
      },
      quantity: item.quantity
    }));

    res.json({ products: transformedProducts });
  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    let cart = await Cart.findOne({ userId: req.user._id });
    
    if (cart) {
      cart.products = cart.products.filter(p => !p.productId.equals(productId));
      await cart.save();
      await cart.populate('products.productId');
    }

    res.json({ products: cart ? cart.products : [] });
  } catch (err) {
    console.error('Remove from cart error:', err);
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
};
