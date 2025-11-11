const Order = require('../models/Order');
const Cart = require('../models/Cart');

// Create order from cart
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user's cart
    const cart = await Cart.findOne({ userId }).populate('products.productId');
    
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate totals
    const itemTotal = cart.products.reduce((sum, item) => {
      const price = parseFloat(item.productId.price) || 0;
      return sum + (price * item.quantity);
    }, 0);

    const deliveryFee = 40;
    const gst = Math.round(itemTotal * 0.05); // 5% GST
    const totalAmount = itemTotal + deliveryFee + gst;

    // Create order
    const order = new Order({
      userId,
      products: cart.products.map(item => ({
        productId: item.productId._id,
        productName: item.productId.productName,
        quantity: item.quantity,
        price: parseFloat(item.productId.price)
      })),
      totalAmount,
      deliveryFee,
      gst,
      status: 'confirmed'
    });

    await order.save();

    // Clear cart after order
    cart.products = [];
    await cart.save();

    res.json({ 
      success: true, 
      order,
      message: 'Order placed successfully! 🎉' 
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

// Get user's order history
exports.getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ orderDate: -1 })
      .populate('products.productId');
    
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Order history error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Get single order details
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.orderId,
      userId: req.user._id 
    }).populate('products.productId');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};
