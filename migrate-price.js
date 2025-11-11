// migrate-price.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

async function migratePrice() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products to migrate`);

    let updated = 0;
    let skipped = 0;

    for (const product of products) {
      // Convert string price to number
      const numPrice = parseFloat(product.price);
      
      if (!isNaN(numPrice)) {
        product.price = numPrice;
        await product.save({ validateBeforeSave: false }); // Skip validation
        updated++;
        console.log(`✅ Updated ${product.productName}: "${product.price}" → ${numPrice}`);
      } else {
        skipped++;
        console.log(`⚠️ Skipped ${product.productName}: Invalid price "${product.price}"`);
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${products.length}`);

    mongoose.connection.close();
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migratePrice();
