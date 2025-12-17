const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  department: String,
  price: Number,
  quantity: Number,
  reorderLevel: Number
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;