const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Purchase = require('../models/Purchase');
const Sale = require('../models/Sale');

// Inventory report
router.get('/inventory', async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ reportType: 'Inventory', products });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate inventory report' });
  }
});

// Transaction report
router.get('/transactions', async (req, res) => {
  try {
    const purchases = await Purchase.find().populate('productId');
    const sales = await Sale.find().populate('productId');

    // Normalize records
    const txns = [
      ...purchases.map(p => ({ type: 'purchase', product: p.productId, quantity: p.quantityAdded, date: p.purchaseDate || p.createdAt, meta: { supplier: p.supplier } })),
      ...sales.map(s => ({ type: 'sale', product: s.productId, quantity: s.quantitySold, date: s.saleDate || s.createdAt, meta: { customer: s.customer } }))
    ];

    // Sort by date descending
    txns.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ reportType: 'Transactions', transactions: txns });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate transaction report' });
  }
});

module.exports = router;