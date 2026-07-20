import React, { useEffect, useState } from "react";

export default function RecordSale() {

  const token = localStorage.getItem("token");

  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("cash");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [lastSale, setLastSale] = useState(null);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };

  /* ================= LOAD PRODUCTS ================= */

  const loadProducts = async () => {
    try {

      const res = await fetch("http://localhost:5000/api/products", { headers });
      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Products not JSON:", text);
        return;
      }

      setProducts(data || []);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  /* ================= ADD ITEM ================= */

  const addItem = () => {

    const product = products.find(p => p._id === selectedProduct);

    if (!product || !quantity) return;

    const qty = Number(quantity);

    const existing = items.find(i => i.product === product._id);

    if (existing) {

      const updatedItems = items.map(i =>
        i.product === product._id
          ? { ...i, quantity: i.quantity + qty }
          : i
      );

      setItems(updatedItems);

    } else {

      const newItem = {
        product: product._id,
        name: product.name,
        size: product.size,
        price: Number(product.price),
        quantity: qty
      };

      setItems([...items, newItem]);

    }

    setSelectedProduct("");
    setQuantity("");

  };

  /* ================= REMOVE ITEM ================= */

  const removeItem = (index) => {

    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);

  };

  /* ================= TOTAL ================= */

  const totalRevenue = items.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  /* ================= SUBMIT SALE ================= */

  const handleSubmit = async () => {
 console.log("🚀 CALLING:", "http://localhost:5000/api/water-sales/pos");
    try {

      if (items.length === 0) {
        setMessage("❌ No items added");
        return;
      }

      setLoading(true);
      setMessage("");

      const res = await fetch("http://localhost:5000/api/water-sales/pos", {
        method: "POST",
        headers,
        body: JSON.stringify({
          items: items.map(i => ({
            product: i.product,
            quantity: Number(i.quantity),
            price: Number(i.price)
          })),
          paymentMethod
        })
      });

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("SERVER RETURNED HTML:", text);
        throw new Error("Server error (wrong route or backend issue)");
      }

      if (!res.ok) {
        throw new Error(data.message || "Sale failed");
      }

      setLastSale(data.sale);

      setItems([]);
      setPaymentMethod("cash");

      setMessage("✅ Sale completed successfully");

    } catch (err) {

      console.error(err);
      setMessage("❌ Sale failed: " + err.message);

    } finally {

      setLoading(false);

    }

  };

  /* ================= PRINT RECEIPT ================= */

  const printReceipt = () => {

    if (!lastSale) return;

    const receiptWindow = window.open("", "PRINT", "height=600,width=400");

    receiptWindow.document.write(`
      <html>
      <head>
        <title>Receipt</title>
        <style>
          body{font-family:monospace;padding:20px}
          h2{text-align:center}
        </style>
      </head>
      <body>

      <h2>SEDIBA WATER</h2>
      <hr/>

      ${lastSale.items.map(i => `
        <p>${i.quantity} x ${i.product?.name || ""} = R${Number(i.price) * Number(i.quantity)}</p>
      `).join("")}

      <hr/>

      <p>Total: R${lastSale.revenue}</p>
      <p>Payment: ${lastSale.paymentMethod}</p>

      <p>${new Date().toLocaleString()}</p>

      </body>
      </html>
    `);

    receiptWindow.document.close();
    receiptWindow.focus();
    receiptWindow.print();
    receiptWindow.close();

  };

  const currency = (value) =>
    new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR"
    }).format(Number(value) || 0);

  return (
    <div style={container}>

      <h1 style={title}>🧾 Sediba POS</h1>

      <div style={card}>

        <h3>Add Product</h3>

        <div style={formRow}>

          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            style={input}
          >

            <option value="">Select Product</option>

            {products.map((p) => (

              <option key={p._id} value={p._id}>
                {p.name} {p.size} (R{p.price}) - Stock:{p.stock}
              </option>

            ))}

          </select>

          <input
            type="number"
            placeholder="Qty"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            style={input}
          />

          <button onClick={addItem} style={btnAdd}>
            Add
          </button>

        </div>

      </div>

      <div style={card}>

        <h3>Items</h3>

        {items.length === 0 && <p>No items added</p>}

        {items.map((item, index) => (

          <div key={index} style={itemRow}>

            <div>
              {item.name} {item.size} x{item.quantity}
            </div>

            <div>
              {currency(item.price * item.quantity)}
            </div>

            <button
              onClick={() => removeItem(index)}
              style={removeBtn}
            >
              ✖
            </button>

          </div>

        ))}

        <hr />

        <h2>Total: {currency(totalRevenue)}</h2>

      </div>

      <div style={card}>

        <h3>Payment Method</h3>

        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          style={input}
        >

          <option value="cash">Cash</option>
          <option value="speedpoint">Speed Point</option>

        </select>

        <button
          onClick={handleSubmit}
          disabled={loading || items.length === 0}
          style={btnComplete}
        >

          {loading ? "Processing..." : "Complete Sale"}

        </button>

        {lastSale && (
          <button
            onClick={printReceipt}
            style={{ ...btnComplete, background:"#1e293b"}}
          >
            Print Receipt
          </button>
        )}

        {message && (
          <div
            style={{
              marginTop:15,
              padding:12,
              borderRadius:8,
              textAlign:"center",
              fontWeight:600,
              background: message.includes("❌") ? "#fee2e2" : "#dcfce7",
              color: message.includes("❌") ? "#b91c1c" : "#166534"
            }}
          >
            {message}
          </div>
        )}

      </div>

    </div>
  );
}

/* ================= STYLES ================= */

const container = { width: "100%" };

const title = {
  fontSize: 28,
  fontWeight: 700,
  marginBottom: 20
};

const card = {
  background: "white",
  padding: 20,
  borderRadius: 14,
  marginBottom: 20,
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)"
};

const formRow = {
  display: "flex",
  gap: 10,
  marginTop: 10
};

const input = {
  flex: 1,
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ddd"
};

const btnAdd = {
  padding: "10px 16px",
  background: "#2563eb",
  border: "none",
  borderRadius: 8,
  color: "white",
  cursor: "pointer"
};

const btnComplete = {
  marginTop: 15,
  padding: "12px 18px",
  background: "#16a34a",
  border: "none",
  borderRadius: 8,
  color: "white",
  cursor: "pointer",
  width: "100%"
};

const itemRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 10,
  borderBottom: "1px solid #eee"
};

const removeBtn = {
  background: "red",
  color: "white",
  border: "none",
  borderRadius: 6,
  padding: "5px 8px",
  cursor: "pointer"
};