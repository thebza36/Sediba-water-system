import { useContext, useEffect, useState } from "react";
import API from "../api/axios";
import { ThemeContext } from "../context/ThemeContext";
import { Droplets } from "lucide-react";

function AdminTankRefills() {

  const { theme } = useContext(ThemeContext);

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
      <div style={center(theme)}>
        <h2>Loading Tank Refills...</h2>
      </div>
    );
  }

  return (

    <div style={page(theme)}>

      <h1
        style={{
          ...title(theme),
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Droplets size={32} strokeWidth={2.2} />
        Tank Refills
      </h1>

      <div style={card(theme)}>

        <h2 style={sectionTitle(theme)}>
          Tank Refill History
        </h2>

        <div style={tableWrapper}>

          <table style={table}>

            <thead>

              <tr style={thead(theme)}>

                <th style={th(theme)}>
                  Date
                </th>

                <th style={th(theme)}>
                  Tank
                </th>

                <th style={th(theme)}>
                  Litres Added
                </th>

                <th style={th(theme)}>
                  Employee
                </th>

                <th style={th(theme)}>
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {refills.length === 0 ? (

                <tr>

                  <td
                    colSpan="5"
                    style={emptyCell(theme)}
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
                        ? rowEven(theme)
                        : rowOdd(theme)
                    }
                  >

                    <td style={td(theme)}>
                      {new Date(
                        r.date
                      ).toLocaleDateString()}
                    </td>

                    <td style={td(theme)}>
                      {r.tankName}
                    </td>

                    <td style={td(theme)}>
                      {r.litresAdded} L
                    </td>

                    <td style={td(theme)}>
                      {r.employeeName || "-"}
                    </td>

                    <td style={td(theme)}>

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


/* =========================================================
   STYLES
========================================================= */

const page = (theme) => ({
  width: "100%",
  maxWidth: 1300,
  margin: "0 auto",
  padding: "15px",
  boxSizing: "border-box",
  background: "transparent",
  color: theme.text,
  overflowX: "hidden",
});


const title = (theme) => ({
  fontSize: "clamp(24px,5vw,34px)",
  fontWeight: 700,
  marginBottom: 20,
  color: theme.primary,
});


const card = (theme) => ({
  background: theme.card,
  color: theme.text,
  padding: 20,
  borderRadius: 20,
  boxShadow: "0 8px 25px rgba(0,0,0,.08)",
  width: "100%",
  boxSizing: "border-box",
  border: `1px solid ${theme.border}`,
});


const sectionTitle = (theme) => ({
  fontSize: "clamp(18px,4vw,24px)",
  fontWeight: 700,
  marginBottom: 20,
  color: theme.text,
});


const tableWrapper = {
  width: "100%",
  overflowX: "auto",
  WebkitOverflowScrolling: "touch",
  borderRadius: 10,
};


const table = {
  width: "100%",
  minWidth: 700,
  borderCollapse: "collapse",
};


const thead = (theme) => ({
  background: theme.primary,
  color: "white",
});


const th = (theme) => ({
  background: theme.primary,
  color: "white",
  padding: 14,
  textAlign: "left",
  whiteSpace: "nowrap",
  fontWeight: 600,
});


const td = (theme) => ({
  padding: 14,
  borderBottom: `1px solid ${theme.border}`,
  color: theme.text,
  whiteSpace: "nowrap",
});


const rowEven = (theme) => ({
  background: theme.card,
});


const rowOdd = (theme) => ({
  background: theme.tableHeader || theme.card,
});


const emptyCell = (theme) => ({
  padding: 25,
  textAlign: "center",
  color: theme.textSecondary || theme.text,
  background: theme.card,
});


const deleteBtn = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
  minWidth: 90,
  minHeight: 40,
};


const center = (theme) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "60vh",
  color: theme.text,
  background: "transparent",
});


export default AdminTankRefills;