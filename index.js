// server.js

const express = require("express");
const dotEnv = require('dotenv');
const mongoose = require('mongoose');
const vendorRoutes = require('./routes/vendorRoutes');
const firmRoutes = require('./routes/firmRoutes');
const productRoutes = require('./routes/productRoutes');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

dotEnv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully!'))
    .catch(() => console.log("MongoDB not connected successfully!"));

// --------------------
// Existing routes
// --------------------
app.use('/vendor', vendorRoutes);
app.use('/firm', firmRoutes);
app.use('/product', productRoutes);
app.use('/uploads', express.static('uploads'));

// --------------------
// New user and cart routes
// --------------------
const userRoutes = require('./routes/userRoutes');
const searchRoutes = require('./routes/search');    // for user signup/login
const cartRoutes = require('./routes/cartRoutes');    // for cart actions

app.use('/user', userRoutes);  
app.use('/api/search', searchRoutes); // /user/signup, /user/login
app.use('/cart', cartRoutes);   // /cart/add, /cart, /cart/remove

const recommendationRoutes = require('./routes/recommendationRoutes');

// Add this line with other routes
app.use('/api/recommendations', recommendationRoutes);

// Add this with your other route imports
const orderRoutes = require('./routes/orderRoutes');

// Add this with your other route registrations
app.use('/api/orders', orderRoutes);


// --------------------
// Default route
// --------------------
app.use('/', (req, res) => {
    res.send('<h1>Welcome to SUBY</h1>');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running successfully at ${PORT}`);
});
