import { useEffect, useState } from "react";
import API from "../api/axios";

function AdminTankRefills() {

  const [refills, setRefills] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRefills = async () => {
    try {

      const res = await API.get(
        "/readings/refills"
      );

      setRefills(
        Array.isArray(res.data)
          ? res.data
          : []
      );

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    loadRefills();
  }, []);

  const deleteRefill = async (id) => {

    const ok = window.confirm(
      "Delete this refill?"
    );

    if (!ok) return;

    try {

      await API.delete(
        `/readings/refills/${id}`
      );

      loadRefills();

    } catch (err) {

      console.error(err);

      alert(
        err?.response?.data?.message ||
        "Delete failed"
      );

    }

  };

  if (loading) {
    return (
      <div style={page}>
        Loading...
      </div>
    );
  }

  return (

    <div style={page}>

      <h1 style={title}>
        🚰 Tank Refills
      </h1>

      <div style={card}>

        <h2 style={sectionTitle}>
          Tank Refill History
        </h2>

        <div style={tableWrapper}>

          <table style={table}>

            <thead>

              <tr>

                <th style={th}>Date</th>
                <th style={th}>Tank</th>
                <th style={th}>Litres Added</th>
                <th style={th}>Employee</th>
                <th style={th}>Actions</th>

              </tr>

            </thead>

            <tbody>

              {refills.length === 0 ? (

                <tr>

                  <td
                    colSpan="5"
                    style={emptyCell}
                  >
                    No refills found
                  </td>

                </tr>

              ) : (

                refills.map((r, index) => (

                  <tr
                    key={r._id}
                    style={
                      index % 2 === 0
                        ? rowEven
                        : rowOdd
                    }
                  >

                    <td style={td}>
                      {new Date(
                        r.date
                      ).toLocaleDateString()}
                    </td>

                    <td style={td}>
                      {r.tankName}
                    </td>

                    <td style={td}>
                      {r.litresAdded} L
                    </td>

                    <td style={td}>
                      {r.employeeName || "-"}
                    </td>

                    <td style={td}>

                      <button
                        style={deleteBtn}
                        onClick={() =>
                          deleteRefill(r._id)
                        }
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );

}

const page = {
  padding: 30
};

const title = {
  fontSize: 36,
  marginBottom: 20
};

const card = {
  background: "white",
  padding: 25,
  borderRadius: 20,
  boxShadow:
    "0 5px 15px rgba(0,0,0,0.08)"
};

const sectionTitle = {
  marginBottom: 20
};

const tableWrapper = {
  overflowX: "auto"
};

const table = {
  width: "100%",
  borderCollapse: "collapse"
};

const th = {
  background: "#1e3a8a",
  color: "white",
  padding: 12,
  textAlign: "left"
};

const td = {
  padding: 12,
  borderBottom:
    "1px solid #e2e8f0"
};

const rowEven = {
  background: "#ffffff"
};

const rowOdd = {
  background: "#f8fafc"
};

const emptyCell = {
  padding: 25,
  textAlign: "center"
};

const deleteBtn = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: 8,
  cursor: "pointer"
};

export default AdminTankRefills;