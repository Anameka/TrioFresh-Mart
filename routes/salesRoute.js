const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Product = require('../models/Product');

// Record a sale
router.post('/', async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Create sale record
    const sale = new Sale({
      productId,
      quantitySold: quantity
    });
    await sale.save();

    // Update product stock
    await Product.findByIdAndUpdate(productId, { $inc: { quantity: -quantity } });

    res.json({ message: 'Sale recorded successfully', sale });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record sale' });
  }
});

// Get all sales
router.get('/', async (req, res) => {
  try {
    const sales = await Sale.find().populate('productId');
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

module.exports = router;