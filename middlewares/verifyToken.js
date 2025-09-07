const Vendor = require("../models/Vendor");  //we imported it because token is created based on vendor Id and it is present inside vendor.js
const jwt = require('jsonwebtoken'); // we imported it to verify the token
const dotEnv = require('dotenv');


dotEnv.config()
const secretKey = process.env.WhatIsYourName;


//vefityTorken is the middleware
const verifyToken = async(req,res,next)=>{   

    const token = req.headers.token;  //Only if the client explicitly sends the token in a custom header named token 

    if(!token){  //if token is not present in the headers
        return res.status(401).json({error :"Token is required"});

    }
    try{
        const decoded = jwt.verify(token,secretKey)  //decoding the token
        const vendor = await Vendor.findById(decoded.vendorId);

        if(!vendor){

            return res.status(404).json({error:"vendor not found"})
        }
        req.vendorId = vendor._id

        next()

    }catch(error){
       
        console.error(error)
        return res.status(500).json({error:"Invalid token"});
    }
}

module.exports = verifyToken