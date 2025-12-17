const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const Purchase = require("../models/Purchase");
const Sale = require("../models/Sale");

// GET /api/products - list all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET /api/products/:id - get product by id
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// POST /api/products - create product
router.post("/", async (req, res) => {
  try {
    const p = await Product.create(req.body);
    res.status(201).json(p);
  } catch (err) {
    res.status(400).json({ error: "Failed to create product" });
  }
});

// PUT /api/products/:id - update product
router.put("/:id", async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Product not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Failed to update product" });
  }
});

// DELETE /api/products/:id - delete product
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Product not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// POST /api/products/:id/purchase - add stock
router.post("/:id/purchase", async (req, res) => {
  try {
    const { quantityAdded, supplier } = req.body;
    await Purchase.create({ productId: req.params.id, quantityAdded, supplier });
    await Product.findByIdAndUpdate(req.params.id, { $inc: { quantity: Number(quantityAdded) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Purchase failed" });
  }
});

// POST /api/products/:id/sale - reduce stock
router.post("/:id/sale", async (req, res) => {
  try {
    const { quantitySold } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product || product.quantity < quantitySold) return res.status(400).json({ error: "Insufficient stock" });
    await Sale.create({ productId: req.params.id, quantitySold });
    await Product.findByIdAndUpdate(req.params.id, { $inc: { quantity: -Number(quantitySold) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Sale failed" });
  }
});

module.exports = router;
