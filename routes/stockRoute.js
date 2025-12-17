const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Update stock quantity
router.put('/:id', async (req, res) => {
  try {
    const { quantity } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: { quantity } },
      { new: true }
    );
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

// Get stock details
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stock' });
  }
});

module.exports = router;