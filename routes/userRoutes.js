const express = require('express');
const { signup, login } = require('../controllers/userController');
const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

const router = express.Router();

// ------------------
// Existing Routes
// ------------------
router.post('/signup', signup);
router.post('/login', login);

// ------------------
// Forgot Password
// ------------------
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const token = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // valid 1 hour
    await user.save();

    const resetUrl = `https://react-suby-frontend.vercel.app/reset-password/${token}`;

    // ✅ USE MAILTRAP (NOT GMAIL)
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <h3>Password Reset</h3>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
      `
    });

    res.json({ message: "Password reset email sent" });

  } catch (err) {
    console.error("MAILTRAP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------
// Reset Password
// ------------------
router.post('/reset-password/:token', async (req, res) => {
  try {
    const token = req.params.token;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // still valid?
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const hashed = await bcrypt.hash(password, 10);

    user.password = hashed;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
