// middleware/verifyUserToken.js
const User = require("../models/User");
const jwt = require('jsonwebtoken');
const dotEnv = require('dotenv');

dotEnv.config();
const secretKey = process.env.WhatIsYourName;

const verifyUserToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token is required" });
  }

  const token = authHeader.split(" ")[1];

  try {
  const decoded = jwt.verify(token, secretKey);
  const user = await User.findById(decoded.userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  req.user = user; // always access req.user._id
  next();
} catch (error) {
  if (error.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Token expired" });
  }
  return res.status(401).json({ error: "Invalid token" });
}

};

module.exports = verifyUserToken;
