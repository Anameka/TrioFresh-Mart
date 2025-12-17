require("dotenv").config();
const mongoose = require("mongoose");

// 1. Connect to MongoDB Atlas
const uri = process.env.MONGO_URI || 
  `mongodb+srv://${encodeURIComponent(process.env.MONGO_USER)}:${encodeURIComponent(process.env.MONGO_PASS)}@${process.env.MONGO_HOST}/${process.env.MONGO_DB || "inventoryDB"}?retryWrites=true&w=majority`;

mongoose.connect(uri)
  .then(() => console.log("✅ MongoDB Atlas Connected"))
  .catch(err => console.error("❌ Connection error:", err));

// 2. Define Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  department: { 
    type: String, 
    required: true, 
    enum: ["Dairy", "Bakery", "Grocery", "Fruits", "Personal Care", "Household", "Vegetables","Meat & Seafood"] 
  },
  price: { type: Number, required: true, min: 1 },
  quantity: { type: Number, required: true, min: 0 },
  reorderLevel: { type: Number, required: true, min: 0 }
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

// 3. Functions

// ➕ Insert multiple products at once
async function addProducts(productsArray) {
  try {
    const products = await Product.insertMany(productsArray);
    console.log("✅ Products added:", products);
  } catch (err) {
    console.error("❌ Error adding products:", err);
  }
}

// 🔄 Update stock for a product
async function updateStock(productId, change) {
  try {
    const product = await Product.findById(productId);
    if (!product) {
      console.log("❌ Product not found");
      return;
    }
    product.quantity += change;
    await product.save();
    console.log("✅ Stock updated:", product);
  } catch (err) {
    console.error("❌ Error updating stock:", err);
  }
}

// 📊 Inventory report
async function inventoryReport() {
  try {
    const products = await Product.find();
    products.forEach(p => {
      const status = p.quantity <= p.reorderLevel ? "⚠️ Reorder Needed" : "✅ Sufficient";
      console.log(`${p.name} | Dept: ${p.department} | Stock: ${p.quantity} | Reorder: ${p.reorderLevel} | Status: ${status}`);
    });
  } catch (err) {
    console.error("❌ Error generating report:", err);
  }
}

// 4. Demo run
(async () => {
  // Example: add multiple products
  await addProducts([
    { name: "Milk", department: "Dairy", price: 55, quantity: 100, reorderLevel: 20 },
    { name: "Bread", department: "Bakery", price: 40, quantity: 60, reorderLevel: 15 },
    { name: "Apple", department: "Fruits", price: 120, quantity: 200, reorderLevel: 50 },
    { name: "Soap", department: "Personal Care", price: 35, quantity: 80, reorderLevel: 10 }
  ]);

  // Show inventory report
  await inventoryReport();

  // Example stock update (replace with actual productId from DB)
  // await updateStock("67890abcdef1234567890", -5);
})();