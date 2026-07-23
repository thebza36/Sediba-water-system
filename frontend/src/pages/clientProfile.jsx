import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Bar } from "react-chartjs-2";

// ✅ REQUIRED for Chart.js v3+
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function ClientProfile() {
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [client, setClient] = useState(null);
  const [sales, setSales] = useState([]);
  const [payment, setPayment] = useState("");
  const API = import.meta.env.VITE_API_URL;

  const load = async () => {
    try {
        const res = await fetch(`${API}/clients/${id}`, {
        headers: {
        Authorization: `Bearer ${token}`,
  },
});

      const data = await res.json();

      // handle both response shapes safely
      setClient(data.client || data);
      setSales(data.sales || []);
    } catch (err) {
      console.error("Failed loading client:", err);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const pay = async () => {
    if (!payment) return;

      await fetch(`${import.meta.env.VITE_API_URL}/clients/${id}/payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount: Number(payment) }),
    });

    setPayment("");
    load();
  };

  const chartData = {
    labels: sales.map(s =>
      new Date(s.date).toLocaleDateString()
    ),
    datasets: [
      {
        label: "Water Purchased (L)",
        data: sales.map(s => s.totalSold),
      },
    ],
  };

  const invoice = () => {
  window.open(`${import.meta.env.VITE_API_URL}/reports/client/${id}`);
};

  if (!client) return <p>Loading...</p>;

  return (
    <div style={{ padding: 30 }}>
      <h1>{client.name}</h1>

      <p><b>Debt:</b> R {client.debt || 0}</p>

      <input
        placeholder="Payment amount"
        value={payment}
        onChange={e => setPayment(e.target.value)}
        style={{ marginRight: 10 }}
      />

      <button onClick={pay} style={{ marginRight: 10 }}>
        Record Payment
      </button>

      <button onClick={invoice}>
        Generate Invoice
      </button>

      <h3 style={{ marginTop: 30 }}>Purchase History</h3>
      <Bar data={chartData} />

      <table style={{ width: "100%", marginTop: 20 }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Meter</th>
            <th>Water</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {sales.map(s => (
            <tr key={s._id}>
              <td>{new Date(s.date).toLocaleDateString()}</td>
              <td>{s.meter?.meterNumber || "-"}</td>
              <td>{s.totalSold}</td>
              <td>R {s.revenue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
