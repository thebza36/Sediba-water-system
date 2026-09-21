import { useContext, useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import { ThemeContext } from "../context/ThemeContext";
import {
  Droplets,
  Search,
  CalendarDays,
  Users,
  Database,
  Trash2,
  RefreshCw,
  CircleAlert,
  Gauge,
  X,
  Waves,
} from "lucide-react";

function AdminTankRefills() {
  const { theme } = useContext(ThemeContext);
  const [refills, setRefills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadRefills = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/readings/refills");
      setRefills(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("LOAD TANK REFILLS ERROR:", err);
      setError(
        err?.response?.data?.message ||
        "Unable to load tank refill records."
      );
      setRefills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRefills();
  }, []);

  const filteredRefills = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return refills;
    return refills.filter((refill) => {
      const tank = String(refill?.tankName || "").toLowerCase();
      const employee = String(refill?.employeeName || "").toLowerCase();
      const litres = String(refill?.litresAdded ?? "").toLowerCase();
      const date = refill?.date
        ? new Date(refill.date).toLocaleDateString().toLowerCase()
        : "";
      return (
        tank.includes(query) ||
        employee.includes(query) ||
        litres.includes(query) ||
        date.includes(query)
      );
    });
  }, [refills, search]);

  const statistics = useMemo(() => {
    const tanks = new Set();
    const employees = new Set();
    const totalLitres = refills.reduce(
      (total, refill) => total + (Number(refill?.litresAdded) || 0),
      0
    );

    refills.forEach((refill) => {
      if (refill?.tankName) {
        tanks.add(String(refill.tankName).trim().toLowerCase());
      }
      if (refill?.employeeName) {
        employees.add(String(refill.employeeName).trim().toLowerCase());
      }
    });

    return {
      totalRefills: refills.length,
      totalLitres,
      totalTanks: tanks.size,
      totalEmployees: employees.size,
    };
  }, [refills]);

  const formatLitres = (value) =>
    (Number(value) || 0).toLocaleString("en-ZA", {
      maximumFractionDigits: 2,
    });

  const formatDate = (date) => {
    if (!date) return "-";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "-";
    return parsed.toLocaleDateString("en-ZA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const deleteRefill = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await API.delete(`/readings/refills/${deleteId}`);
      setRefills((current) =>
        current.filter((refill) => refill._id !== deleteId)
      );
      setDeleteId(null);
    } catch (err) {
      console.error("DELETE TANK REFILL ERROR:", err);
      alert(
        err?.response?.data?.message ||
        "Delete failed. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  };

  const primary = theme.primary || "#2563eb";
  const text = theme.text || "#111827";
  const secondary = theme.textSecondary || "#64748b";
  const card = theme.card || "#ffffff";
  const background = theme.background || "#f5f7fb";
  const border = theme.border || "#e2e8f0";
  const input = theme.input || background;

  const pageStyle = {
    "--primary": primary,
    "--primary-soft": `${primary}12`,
    "--card": card,
    "--background": background,
    "--text": text,
    "--secondary": secondary,
    "--border": border,
    "--input": input,
    width: "100%",
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "24px",
    boxSizing: "border-box",
    color: text,
    overflowX: "hidden",
  };

  if (loading) {
    return (
      <div className="refill-loading-page" style={{ color: text }}>
        <div className="refill-loading-box">
          <div className="refill-loading-icon">
            <Droplets size={34} />
          </div>
          <h2>Loading Tank Refills</h2>
          <p>Please wait while we load the refill history.</p>
        </div>
        <style>{`
          .refill-loading-page{min-height:60vh;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box}
          .refill-loading-box{text-align:center}
          .refill-loading-icon{width:70px;height:70px;margin:0 auto 16px;border-radius:18px;background:${primary}12;color:${primary};display:flex;align-items:center;justify-content:center;animation:refillPulse 1.4s ease-in-out infinite}
          .refill-loading-box h2{margin:0;font-size:22px}
          .refill-loading-box p{margin:7px 0 0;color:${secondary};font-size:14px}
          @keyframes refillPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(.94);opacity:.65}}
        `}</style>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div className="refill-page-header">
        <div className="refill-header-left">
          <div className="refill-header-icon">
            <Droplets size={29} />
          </div>
          <div className="refill-heading-text">
            <h1>Tank Refills</h1>
            <p>Monitor and manage your tank refill history.</p>
          </div>
        </div>
        <button
          type="button"
          className="refill-refresh-button"
          onClick={loadRefills}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="refill-error">
          <CircleAlert size={21} />
          <div className="refill-error-text">
            <strong>Unable to load refills</strong>
            <span>{error}</span>
          </div>
          <button type="button" onClick={loadRefills}>
            Try Again
          </button>
        </div>
      )}

      <div className="refill-stats">
        <div className="refill-stat">
          <div className="refill-stat-icon blue">
            <Database size={21} />
          </div>
          <div>
            <span>Total Refills</span>
            <strong>{statistics.totalRefills}</strong>
          </div>
        </div>

        <div className="refill-stat">
          <div className="refill-stat-icon cyan">
            <Droplets size={21} />
          </div>
          <div>
            <span>Litres Added</span>
            <strong>{formatLitres(statistics.totalLitres)} L</strong>
          </div>
        </div>

        <div className="refill-stat">
          <div className="refill-stat-icon purple">
            <Gauge size={21} />
          </div>
          <div>
            <span>Tanks</span>
            <strong>{statistics.totalTanks}</strong>
          </div>
        </div>

        <div className="refill-stat">
          <div className="refill-stat-icon green">
            <Users size={21} />
          </div>
          <div>
            <span>Employees</span>
            <strong>{statistics.totalEmployees}</strong>
          </div>
        </div>
      </div>

      <div className="refill-main-card">
        <div className="refill-card-header">
          <div>
            <h2>Refill History</h2>
            <p>View all tank refill records recorded by employees.</p>
          </div>
          <div className="refill-count">
            <Waves size={16} />
            {filteredRefills.length}{" "}
            {filteredRefills.length === 1 ? "record" : "records"}
          </div>
        </div>

        <div className="refill-search-row">
          <div className="refill-search">
            <Search size={19} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by tank, employee, date or litres..."
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={17} />
              </button>
            )}
          </div>
        </div>

        {refills.length > 0 && filteredRefills.length === 0 && (
          <div className="refill-empty">
            <div className="refill-empty-icon">
              <Search size={29} />
            </div>
            <h3>No matching refills</h3>
            <p>No refill records match your search.</p>
            <button type="button" onClick={() => setSearch("")}>
              Clear Search
            </button>
          </div>
        )}

        {refills.length === 0 && (
          <div className="refill-empty">
            <div className="refill-empty-icon">
              <Droplets size={31} />
            </div>
            <h3>No tank refills found</h3>
            <p>There are currently no tank refill records available.</p>
          </div>
        )}

        {filteredRefills.length > 0 && (
          <>
            <div className="refill-desktop-table">
              <table>
                <thead>
                  <tr>
                    <th><CalendarDays size={15} /> Date</th>
                    <th><Gauge size={15} /> Tank</th>
                    <th><Droplets size={15} /> Litres Added</th>
                    <th><Users size={15} /> Employee</th>
                    <th className="actions-heading">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRefills.map((refill) => (
                    <tr key={refill._id}>
                      <td>
                        <div className="refill-date">
                          <CalendarDays size={16} />
                          {formatDate(refill.date)}
                        </div>
                      </td>
                      <td>
                        <div className="refill-tank">
                          <div className="small-icon">
                            <Gauge size={16} />
                          </div>
                          <strong>
                            {refill.tankName || "Unknown Tank"}
                          </strong>
                        </div>
                      </td>
                      <td>
                        <span className="litres-badge">
                          <Droplets size={14} />
                          {formatLitres(refill.litresAdded)} L
                        </span>
                      </td>
                      <td>
                        <div className="refill-employee">
                          <div className="employee-icon">
                            <Users size={15} />
                          </div>
                          <span>
                            {refill.employeeName || "Unknown Employee"}
                          </span>
                        </div>
                      </td>
                      <td className="actions-cell">
                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => setDeleteId(refill._id)}
                        >
                          <Trash2 size={15} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="refill-mobile-list">
              {filteredRefills.map((refill) => (
                <div className="refill-mobile-card" key={refill._id}>
                  <div className="mobile-refill-top">
                    <div className="mobile-tank">
                      <div className="mobile-tank-icon">
                        <Gauge size={20} />
                      </div>
                      <div>
                        <span>Tank</span>
                        <strong>
                          {refill.tankName || "Unknown Tank"}
                        </strong>
                      </div>
                    </div>
                    <span className="mobile-litres">
                      <Droplets size={14} />
                      {formatLitres(refill.litresAdded)} L
                    </span>
                  </div>

                  <div className="mobile-divider" />

                  <div className="mobile-refill-details">
                    <div className="mobile-detail">
                      <div className="detail-icon">
                        <CalendarDays size={16} />
                      </div>
                      <div>
                        <span>Date</span>
                        <strong>{formatDate(refill.date)}</strong>
                      </div>
                    </div>

                    <div className="mobile-detail">
                      <div className="detail-icon">
                        <Users size={16} />
                      </div>
                      <div>
                        <span>Employee</span>
                        <strong>
                          {refill.employeeName || "Unknown Employee"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="mobile-delete-button"
                    onClick={() => setDeleteId(refill._id)}
                  >
                    <Trash2 size={16} />
                    Delete Refill
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {deleteId && (
        <div
          className="refill-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !deleting) {
              setDeleteId(null);
            }
          }}
        >
          <div className="refill-modal">
            <div className="modal-delete-icon">
              <Trash2 size={26} />
            </div>
            <h2>Delete Tank Refill?</h2>
            <p>
              Are you sure you want to delete this tank refill record?
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="modal-cancel"
                onClick={() => setDeleteId(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="modal-delete"
                onClick={deleteRefill}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <RefreshCw className="refill-spin" size={16} />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .refill-page-header{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:24px}
        .refill-header-left{display:flex;align-items:center;gap:14px;min-width:0}
        .refill-header-icon{width:56px;height:56px;min-width:56px;border-radius:15px;background:var(--primary-soft);color:var(--primary);display:flex;align-items:center;justify-content:center;border:1px solid var(--primary-soft)}
        .refill-heading-text{min-width:0}
        .refill-heading-text h1{margin:0;color:var(--text);font-size:clamp(25px,4vw,33px);line-height:1.15;font-weight:750}
        .refill-heading-text p{margin:6px 0 0;color:var(--secondary);font-size:14px;line-height:1.45}
        .refill-refresh-button{height:43px;padding:0 16px;border:1px solid var(--border);border-radius:10px;background:var(--card);color:var(--text);display:flex;align-items:center;justify-content:center;gap:8px;font-size:14px;font-weight:650;cursor:pointer;white-space:nowrap}
        .refill-refresh-button:hover{border-color:var(--primary);color:var(--primary)}
        .refill-refresh-button:disabled{opacity:.6;cursor:not-allowed}
        .refill-error{display:flex;align-items:center;gap:12px;padding:14px 16px;margin-bottom:20px;border:1px solid rgba(220,38,38,.25);border-radius:12px;background:rgba(220,38,38,.07);color:#dc2626}
        .refill-error-text{display:flex;flex-direction:column;gap:3px;flex:1;min-width:0}
        .refill-error-text span{font-size:13px;overflow-wrap:anywhere}
        .refill-error>button{border:0;border-radius:8px;background:var(--primary);color:#fff;padding:9px 13px;font-weight:650;cursor:pointer}
        .refill-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:15px;margin-bottom:20px}
        .refill-stat{min-width:0;display:flex;align-items:center;gap:13px;padding:17px;border:1px solid var(--border);border-radius:15px;background:var(--card);box-shadow:0 5px 18px rgba(0,0,0,.055);box-sizing:border-box}
        .refill-stat-icon{width:44px;height:44px;min-width:44px;border-radius:12px;display:flex;align-items:center;justify-content:center}
        .refill-stat-icon.blue{background:var(--primary-soft);color:var(--primary)}
        .refill-stat-icon.cyan{background:rgba(2,132,199,.10);color:#0284c7}
        .refill-stat-icon.purple{background:rgba(124,58,237,.10);color:#7c3aed}
        .refill-stat-icon.green{background:rgba(5,150,105,.10);color:#059669}
        .refill-stat>div:last-child{display:flex;flex-direction:column;gap:3px;min-width:0}
        .refill-stat span{color:var(--secondary);font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .refill-stat strong{color:var(--text);font-size:21px;font-weight:750;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .refill-main-card{background:var(--card);border:1px solid var(--border);border-radius:19px;padding:20px;box-shadow:0 7px 25px rgba(0,0,0,.06);box-sizing:border-box}
        .refill-card-header{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-bottom:18px}
        .refill-card-header h2{margin:0;color:var(--text);font-size:22px;font-weight:720}
        .refill-card-header p{margin:5px 0 0;color:var(--secondary);font-size:13px}
        .refill-count{display:flex;align-items:center;gap:6px;padding:7px 11px;border-radius:20px;background:var(--primary-soft);color:var(--primary);font-size:12px;font-weight:700;white-space:nowrap}
        .refill-search-row{margin-bottom:18px}
        .refill-search{position:relative;width:100%;max-width:650px;height:46px;display:flex;align-items:center}
        .refill-search>svg{position:absolute;left:14px;color:var(--secondary);pointer-events:none}
        .refill-search input{width:100%;height:46px;box-sizing:border-box;padding:0 44px;border:1px solid var(--border);border-radius:11px;outline:none;background:var(--input);color:var(--text);font-size:14px}
        .refill-search input:focus{border-color:var(--primary);box-shadow:0 0 0 3px var(--primary-soft)}
        .refill-search>button{position:absolute;right:8px;width:30px;height:30px;border:0;border-radius:7px;background:var(--border);color:var(--text);display:flex;align-items:center;justify-content:center;cursor:pointer}
        .refill-desktop-table{width:100%;overflow-x:auto;border:1px solid var(--border);border-radius:12px}
        .refill-desktop-table table{width:100%;min-width:760px;border-collapse:collapse}
        .refill-desktop-table th{height:47px;padding:0 14px;background:var(--primary);color:#fff;text-align:left;font-size:13px;font-weight:650;white-space:nowrap}
        .refill-desktop-table th svg{vertical-align:middle;margin-right:6px}
        .refill-desktop-table .actions-heading{text-align:right}
        .refill-desktop-table td{padding:13px 14px;border-bottom:1px solid var(--border);color:var(--text);font-size:14px;vertical-align:middle}
        .refill-desktop-table tbody tr:last-child td{border-bottom:0}
        .refill-desktop-table tbody tr:nth-child(even){background:rgba(127,127,127,.035)}
        .refill-desktop-table tbody tr:hover{background:var(--primary-soft)}
        .refill-date,.refill-tank,.refill-employee{display:flex;align-items:center;gap:9px}
        .refill-date{white-space:nowrap;color:var(--secondary)}
        .refill-date svg{color:var(--primary)}
        .refill-tank strong{font-weight:680}
        .small-icon{width:31px;height:31px;min-width:31px;border-radius:8px;background:var(--primary-soft);color:var(--primary);display:flex;align-items:center;justify-content:center}
        .litres-badge{display:inline-flex;align-items:center;gap:6px;padding:7px 10px;border-radius:8px;background:rgba(2,132,199,.10);color:#0284c7;font-size:13px;font-weight:700;white-space:nowrap}
        .employee-icon{width:30px;height:30px;min-width:30px;border-radius:50%;background:rgba(5,150,105,.11);color:#059669;display:flex;align-items:center;justify-content:center}
        .actions-cell{text-align:right}
        .delete-button{height:37px;padding:0 12px;border:0;border-radius:8px;background:#dc2626;color:#fff;display:inline-flex;align-items:center;justify-content:center;gap:7px;font-size:13px;font-weight:650;cursor:pointer}
        .delete-button:hover,.mobile-delete-button:hover,.modal-delete:hover{background:#b91c1c}
        .refill-mobile-list{display:none}
        .refill-mobile-card{width:100%;box-sizing:border-box;padding:15px;border:1px solid var(--border);border-radius:14px;background:var(--card);box-shadow:0 4px 15px rgba(0,0,0,.05)}
        .mobile-refill-top{display:flex;align-items:center;justify-content:space-between;gap:10px}
        .mobile-tank{display:flex;align-items:center;gap:10px;min-width:0;flex:1}
        .mobile-tank-icon{width:42px;height:42px;min-width:42px;border-radius:11px;background:var(--primary-soft);color:var(--primary);display:flex;align-items:center;justify-content:center}
        .mobile-tank>div:last-child{min-width:0}
        .mobile-tank span,.mobile-detail span{display:block;color:var(--secondary);font-size:11px;font-weight:600;margin-bottom:2px}
        .mobile-tank strong{display:block;color:var(--text);font-size:15px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .mobile-litres{display:inline-flex;align-items:center;gap:5px;padding:7px 9px;border-radius:8px;background:rgba(2,132,199,.10);color:#0284c7;font-size:12px;font-weight:750;white-space:nowrap}
        .mobile-divider{height:1px;background:var(--border);margin:15px 0}
        .mobile-refill-details{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
        .mobile-detail{display:flex;align-items:center;gap:9px;min-width:0}
        .detail-icon{width:32px;height:32px;min-width:32px;border-radius:8px;background:var(--primary-soft);color:var(--primary);display:flex;align-items:center;justify-content:center}
        .mobile-detail>div:last-child{min-width:0}
        .mobile-detail strong{display:block;color:var(--text);font-size:13px;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .mobile-delete-button{width:100%;height:43px;margin-top:16px;border:0;border-radius:9px;background:#dc2626;color:#fff;display:flex;align-items:center;justify-content:center;gap:8px;font-size:13px;font-weight:700;cursor:pointer}
        .refill-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:55px 20px}
        .refill-empty-icon{width:64px;height:64px;margin-bottom:14px;border-radius:50%;background:var(--primary-soft);color:var(--primary);display:flex;align-items:center;justify-content:center}
        .refill-empty h3{margin:0;color:var(--text);font-size:18px}
        .refill-empty p{margin:7px 0 17px;color:var(--secondary);font-size:13px}
        .refill-empty button{height:40px;padding:0 15px;border:1px solid var(--border);border-radius:8px;background:var(--card);color:var(--primary);font-weight:650;cursor:pointer}
        .refill-modal-overlay{position:fixed;inset:0;z-index:9999;padding:20px;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.55);backdrop-filter:blur(3px);box-sizing:border-box}
        .refill-modal{width:100%;max-width:430px;padding:25px;border:1px solid var(--border);border-radius:18px;background:var(--card);color:var(--text);box-shadow:0 25px 70px rgba(0,0,0,.25);text-align:center;box-sizing:border-box}
        .modal-delete-icon{width:58px;height:58px;margin:0 auto 15px;border-radius:50%;background:rgba(220,38,38,.12);color:#dc2626;display:flex;align-items:center;justify-content:center}
        .refill-modal h2{margin:0;font-size:21px;font-weight:750;color:var(--text)}
        .refill-modal p{margin:10px 0 22px;color:var(--secondary);font-size:14px;line-height:1.55}
        .modal-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .modal-cancel,.modal-delete{height:43px;border-radius:9px;font-weight:650;cursor:pointer}
        .modal-cancel{border:1px solid var(--border);background:var(--background);color:var(--text)}
        .modal-delete{border:0;background:#dc2626;color:#fff;display:flex;align-items:center;justify-content:center;gap:7px}
        .modal-cancel:disabled,.modal-delete:disabled{opacity:.6;cursor:not-allowed}
        .refill-spin{animation:refillSpin 1s linear infinite}
        @keyframes refillSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}

        @media(max-width:1050px){
          .refill-stats{grid-template-columns:repeat(2,minmax(0,1fr))}
        }

        @media(max-width:768px){
          .refill-page-header{align-items:flex-start}
          .refill-header-left{flex:1}
          .refill-header-icon{width:50px;height:50px;min-width:50px}
          .refill-refresh-button{height:42px;padding:0 12px}
          .refill-stats{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
          .refill-stat{padding:14px;gap:10px}
          .refill-stat-icon{width:40px;height:40px;min-width:40px}
          .refill-stat strong{font-size:19px}
          .refill-main-card{padding:15px;border-radius:16px}
          .refill-card-header{align-items:flex-start;flex-direction:column;gap:10px}
          .refill-card-header h2{font-size:20px}
          .refill-count{align-self:flex-start}
          .refill-search{max-width:none}
          .refill-desktop-table{display:none}
          .refill-mobile-list{display:flex;flex-direction:column;gap:12px}
        }

        @media(max-width:560px){
          .refill-page-header{flex-direction:column}
          .refill-header-left{width:100%}
          .refill-refresh-button{width:100%}
          .refill-heading-text h1{font-size:25px}
          .refill-heading-text p{font-size:13px}
          .refill-error{align-items:flex-start;flex-wrap:wrap}
          .refill-error>button{width:100%}
          .refill-stats{grid-template-columns:1fr 1fr}
          .refill-stat{padding:13px 11px}
          .refill-stat-icon{width:37px;height:37px;min-width:37px}
          .refill-stat span{font-size:11px}
          .refill-stat strong{font-size:17px}
          .mobile-refill-details{grid-template-columns:1fr}
        }

        @media(max-width:390px){
          .refill-stats{grid-template-columns:1fr}
          .refill-stat{padding:14px}
          .mobile-refill-top{align-items:flex-start}
          .mobile-litres{font-size:11px}
          .refill-main-card{padding:12px}
        }
      `}</style>
    </div>
  );
}

export default AdminTankRefills;