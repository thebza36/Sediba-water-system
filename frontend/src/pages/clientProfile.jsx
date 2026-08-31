import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
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

  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [client, setClient] = useState(null);
  const [sales, setSales] = useState([]);
  const [payment, setPayment] = useState("");

  const load = async () => {
    try {
      const res = await fetch(`${API}/clients/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

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

    try {
      await fetch(`${API}/clients/${id}/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Number(payment),
        }),
      });

      setPayment("");
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const invoice = () => {
    window.open(`${API}/reports/client/${id}`, "_blank");
  };

  const chartData = {
    labels: sales.map((s) =>
      new Date(s.date).toLocaleDateString()
    ),
    datasets: [
      {
        label: "Water Purchased (L)",
        data: sales.map((s) => s.totalSold),
        backgroundColor: "#2563eb",
      },
    ],
  };

  if (!client) {
    return (
      <div style={center}>
        <h2>Loading Client...</h2>
      </div>
    );
  }

  return (
    <div style={page}>
      <h1 style={title}>{client.name}</h1>

      <div style={card}>
        <h3>
          Outstanding Debt:{" "}
          <span style={{ color: "#dc2626" }}>
            R {client.debt || 0}
          </span>
        </h3>

        <div style={paymentRow}>
          <input
            type="number"
            placeholder="Payment amount"
            value={payment}
            onChange={(e) =>
              setPayment(e.target.value)
            }
            style={input}
          />

          <button
            style={payBtn}
            onClick={pay}
          >
            Record Payment
          </button>

          <button
            style={invoiceBtn}
            onClick={invoice}
          >
            Generate Invoice
          </button>
        </div>
      </div>

      <div style={card}>
        <h2 style={sectionTitle}>
          Purchase History
        </h2>

        <div style={chartWrapper}>
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
            }}
          />
        </div>
      </div>

      <div style={card}>
        <h2 style={sectionTitle}>
          Sales History
        </h2>

        <div style={tableWrapper}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Date</th>
                <th style={th}>Meter</th>
                <th style={th}>Water</th>
                <th style={th}>Revenue</th>
              </tr>
            </thead>

            <tbody>
              {sales.map((s, index) => (
                <tr
                  key={s._id}
                  style={
                    index % 2 === 0
                      ? rowEven
                      : rowOdd
                  }
                >
                  <td style={td}>
                    {new Date(
                      s.date
                    ).toLocaleDateString()}
                  </td>

                  <td style={td}>
                    {s.meter?.meterNumber ||
                      "-"}
                  </td>

                  <td style={td}>
                    {s.totalSold} L
                  </td>

                  <td style={td}>
                    R {s.revenue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =======================
   STYLES
======================= */

const page = {
  width: "100%",
  maxWidth: 1300,
  margin: "0 auto",
  padding: "15px",
  background: "#f8fafc",
  boxSizing: "border-box",
};

const title = {
  fontSize: "clamp(24px,5vw,34px)",
  fontWeight: 700,
  color: "#1e3a8a",
  marginBottom: 20,
};

const card = {
  background: "white",
  padding: 20,
  borderRadius: 20,
  marginBottom: 20,
  boxShadow: "0 8px 25px rgba(0,0,0,.08)",
};

const sectionTitle = {
  fontSize: "clamp(18px,4vw,24px)",
  fontWeight: 700,
  marginBottom: 20,
};

const paymentRow = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  marginTop: 20,
};

const input = {
  flex: 1,
  minWidth: 220,
  padding: 12,
  border: "1px solid #d1d5db",
  borderRadius: 8,
};

const payBtn = {
  background: "#16a34a",
  color: "white",
  border: "none",
  padding: "12px 18px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
};

const invoiceBtn = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "12px 18px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
};

const chartWrapper = {
  width: "100%",
  height: 350,
};

const tableWrapper = {
  width: "100%",
  overflowX: "auto",
  WebkitOverflowScrolling: "touch",
};

const table = {
  width: "100%",
  minWidth: 700,
  borderCollapse: "collapse",
};

const th = {
  background: "#1e3a8a",
  color: "white",
  padding: 14,
  textAlign: "left",
  whiteSpace: "nowrap",
};

const td = {
  padding: 14,
  borderBottom: "1px solid #e5e7eb",
  whiteSpace: "nowrap",
};

const rowEven = {
  background: "#ffffff",
};

const rowOdd = {
  background: "#f8fafc",
};

const center = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "60vh",
};