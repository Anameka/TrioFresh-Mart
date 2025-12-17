document.addEventListener("DOMContentLoaded", () => {
  // Ensure all department selects show the same options
  const departments = [
    "Dairy",
    "Bakery",
    "Grocery",
    "Fruits",
    "Vegetables",
    "Meat & Seafood",
    "Personal Care",
    "Household"
  ];

  function populateDepartmentSelects() {
    document.querySelectorAll('select[name="department"]').forEach(select => {
      // preserve a single placeholder option if present
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = 'Select Department';

      // clear existing options
      select.innerHTML = '';
      select.appendChild(placeholder);

      departments.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = d;
        select.appendChild(opt);
      });
    });
  }

  populateDepartmentSelects();

  // Add Product
  const addForm = document.getElementById("addProductForm");
  if (addForm) {
    addForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const product = Object.fromEntries(new FormData(addForm).entries());
      await fetch("/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product)
      });
      addForm.reset();
      alert("✅ Product added!");
    });
  }

  // Stock Update
  const stockForm = document.getElementById("stockForm");
  if (stockForm) {
    stockForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(stockForm).entries());
      await fetch("/updateStock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      alert("✅ Stock updated!");
    });
  }

  // Purchase
  const purchaseForm = document.getElementById("purchaseForm");
  if (purchaseForm) {
    purchaseForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(purchaseForm).entries());
      await fetch("/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      alert("✅ Purchase recorded!");
    });
  }

  // Sales
  const salesForm = document.getElementById("salesForm");
  if (salesForm) {
    salesForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(salesForm).entries());
      await fetch("/sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      alert("✅ Sale recorded!");
    });
  }

  // Inventory Report
  const inventoryTable = document.getElementById("inventoryTable");
  if (inventoryTable) {
    loadInventory();
    document.getElementById("downloadPdfBtn")?.addEventListener("click", () => {
      generateInvoicePDF();
    });
  }

  // Transaction Report
  const transactionTable = document.getElementById("transactionTable");
  if (transactionTable) {
    loadTransactions();
  }
});

// Load inventory
async function loadInventory() {
  const res = await fetch("/report");
  const data = await res.json();
  const tbody = document.querySelector("#inventoryTable tbody");
  tbody.innerHTML = "";
  data.forEach(p => {
    const row = `<tr>
      <td>${p.name}</td>
      <td>${p.department}</td>
      <td>₹${p.price}</td>
      <td>${p.stock}</td>
      <td>${p.reorderLevel}</td>
      <td>${p.status}</td>
    </tr>`;
    tbody.innerHTML += row;
  });
}

// Generate PDF invoice
function generateInvoicePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("TrioFresh Mart - Inventory Report", 20, 20);

  const rows = [];
  document.querySelectorAll("#inventoryTable tbody tr").forEach(tr => {
    const cells = Array.from(tr.querySelectorAll("td")).map(td => td.innerText);
    rows.push(cells);
  });

  doc.autoTable({
    head: [["Name", "Department", "Price", "Stock", "Reorder Level", "Status"]],
    body: rows,
    startY: 30
  });

  doc.save("InventoryReport.pdf");
}

// Load transactions
async function loadTransactions() {
  try {
    const resPurchases = await fetch("/api/purchases");
    const purchases = await resPurchases.json();
    const resSales = await fetch("/api/sales");
    const sales = await resSales.json();

    const tbody = document.querySelector("#transactionTable tbody");
    tbody.innerHTML = "";

    purchases.forEach(p => {
      tbody.innerHTML += `<tr>
        <td>Purchase</td>
        <td>${p.productId}</td>
        <td>${p.quantityAdded}</td>
        <td>${p.supplier || "-"}</td>
        <td>${new Date(p.date).toLocaleDateString()}</td>
      </tr>`;
    });

    sales.forEach(s => {
      tbody.innerHTML += `<tr>
        <td>Sale</td>
        <td>${s.productId}</td>
        <td>${s.quantitySold}</td>
        <td>${s.customer || "-"}</td>
        <td>${new Date(s.date).toLocaleDateString()}</td>
      </tr>`;
    });
  } catch (err) {
    console.error("Error loading transactions:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("transactionTable")) {
    loadTransactions();
  }
});