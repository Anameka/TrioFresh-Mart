require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use('/assets', express.static(path.join(__dirname)));

/* ================= DATABASE CONNECTION ================= */
const envUri = process.env.MONGO_URI;
const uri = envUri || (() => {
  const user = process.env.MONGO_USER;
  const passRaw = process.env.MONGO_PASS;
  const host = process.env.MONGO_HOST;
  const db = process.env.MONGO_DB || "inventoryDB";

  if (!user || !passRaw || !host) {
    console.error("Missing Mongo configuration. Set MONGO_URI or MONGO_USER/MONGO_PASS/MONGO_HOST in .env");
    process.exit(1);
  }

  const pass = encodeURIComponent(passRaw);
  return `mongodb+srv://${user}:${pass}@${host}/${db}?retryWrites=true&w=majority`;
})();

mongoose.connect(uri)
  .then(() => console.log("✅ MongoDB Atlas Connected"))
  .catch((err) => {
    console.error("❌ Connection error:", err);
    process.exit(1);
  });

/* ================= MODELS ================= */
const Product = require("./models/Product");
const Purchase = require("./models/Purchase");
const Sale = require("./models/Sale");

/* ================= DASHBOARD ================= */
app.get("/", async (req, res) => {
  const products = await Product.find();
  const lowStock = products.filter((p) => p.quantity <= p.reorderLevel);

  let html = `
    <h2>TrioFresh Mart</h2>
    <p>Total Products: ${products.length}</p>
    <p style="color:red">Low Stock Items: ${lowStock.length}</p>

    <a href="addProduct.html">Add Product</a> | 
    <a href="stock.html">Stock Update</a> |
    <a href="purchase.html">Purchase</a> |
    <a href="sales.html">Sales</a> |
    <a href="report.html">Reports</a>
    <hr>
  `;

  lowStock.forEach((p) => {
    html += `<p style="color:red">⚠ ${p.name} LOW STOCK (${p.quantity})</p>`;
  });

  res.send(html);
});

/* ================= ADD PRODUCT ================= */
// Add single product
app.post("/add", async (req, res) => {
  await Product.create(req.body);
  res.redirect("/");
});

// Add multiple products at once
app.post("/addMany", async (req, res) => {
  try {
    const products = await Product.insertMany(req.body); // expects array of products
    res.status(201).json({ message: "Products added successfully", products });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ================= UPDATE STOCK (MANUAL) ================= */
app.post("/updateStock", async (req, res) => {
  const { id, qty } = req.body;
  await Product.findByIdAndUpdate(id, {
    $inc: { quantity: Number(qty) },
  });
  res.redirect("/");
});

/* ================= PURCHASE (STOCK IN) ================= */
app.post("/purchase", async (req, res) => {
  try {
    const { productId, quantityAdded, supplier } = req.body;

    await Purchase.create({ productId, quantityAdded, supplier });
    await Product.findByIdAndUpdate(productId, {
      $inc: { quantity: Number(quantityAdded) },
    });

    res.status(200).send("✅ Purchase successful");
  } catch (err) {
    res.status(500).send("❌ Purchase failed");
  }
});

/* ================= SALES (STOCK OUT) ================= */
app.post("/sale", async (req, res) => {
  try {
    const { productId, quantitySold } = req.body;
    const product = await Product.findById(productId);

    if (!product || product.quantity < quantitySold) {
      return res.status(400).send("❌ Insufficient stock");
    }

    await Sale.create({ productId, quantitySold });
    await Product.findByIdAndUpdate(productId, {
      $inc: { quantity: -Number(quantitySold) },
    });

    res.status(200).send("✅ Sale successful");
  } catch (err) {
    res.status(500).send("❌ Sale failed");
  }
});

/* ================= REPORT ================= */
app.get("/report", async (req, res) => {
  const products = await Product.find();
  const report = products.map(p => ({
    name: p.name,
    department: p.department,
    price: p.price,
    stock: p.quantity,
    reorderLevel: p.reorderLevel,
    status: p.quantity <= p.reorderLevel ? "⚠️ Reorder Needed" : "✅ Sufficient"
  }));
  res.json(report);
});

/* ================= SERVER ================= */
app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});