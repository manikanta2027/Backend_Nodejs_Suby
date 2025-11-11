const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true // ✅ One cart per user
  },
  products: [
    {
      productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
      },
      quantity: { 
        type: Number, 
        default: 1,
        min: 1 // ✅ Prevent negative quantities
      }
    }
  ]
}, {
  timestamps: true // ✅ Add createdAt and updatedAt
});

// ✅ Create index on userId for faster queries
cartSchema.index({ userId: 1 });

module.exports = mongoose.model('Cart', cartSchema);
