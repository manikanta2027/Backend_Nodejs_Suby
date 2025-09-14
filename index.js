const express = require("express");
const dotEnv = require('dotenv') // to accesss all the values frome .env file
const mongoose = require('mongoose'); // to connect with the database
const vendorRoutes = require('./routes/vendorRoutes');
const bodyParser = require('body-parser');
const firmRoutes = require('./routes/firmRoutes');
const productRoutes = require('./routes/productRoutes');
const cors = require('cors');
const path = require('path');

const app = express()
app.use(cors());

const PORT = process.env.PORT|| 4000;
dotEnv.config();  // to use all the values from .env 

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log('MongoDB connected successfully!'))
.catch(()=>console.log("MongoDB not connected successfully!"));

app.use(bodyParser.json())
//middle-ware for routes

app.use('/vendor',vendorRoutes); 
app.use('/firm',firmRoutes);
app.use('/product',productRoutes);
app.use('/uploads',express.static('uploads'));  //here uploads which is inside the express.static is the folder name



app.listen(PORT, ()=>{
    console.log(`server running successfully at ${PORT}`);
});

//creating route

app.use('/',(req,res)=>{
    res.send('<h1>Welcome to SUBY');
})