const express = require('express');
const Order = require('../models/Order');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify token
const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(500).json({ error: 'Failed to authenticate token' });
    req.userId = decoded.id;
    next();
  });
};

// Place a new order
router.post('/', authMiddleware, async (req, res) => {
  const { items, total } = req.body;
  try {
    const newOrder = new Order({ user: req.userId, items, total });
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get order history for a user
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
