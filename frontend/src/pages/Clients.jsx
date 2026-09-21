import React, {
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { ThemeContext } from "../context/ThemeContext";

import {
  Users,
  Search,
  Trash2,
  Save,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit3,
  Plus,
  MapPin,
  Phone,
  Droplets,
  Banknote,
  WalletCards,
  Building2,
  User,
  X,
  RefreshCw,
} from "lucide-react";

const API = `${import.meta.env.VITE_API_URL}/clients`;


/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Clients() {

  const { theme } = useContext(ThemeContext);

  const token = localStorage.getItem("token");

  /* =======================================================
     CLIENT DATA
  ======================================================= */

  const [clients, setClients] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* =======================================================
     MESSAGES
  ======================================================= */

  const [msg, setMsg] = useState("");

  /* =======================================================
     SEARCH
  ======================================================= */

  const [search, setSearch] = useState("");

  /* =======================================================
     ADD / EDIT
  ======================================================= */

  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    location: "",
    phone: "",
    type: "individual",
  });

  const nameRef = useRef(null);

  /* =======================================================
     CONFIRMATION MODALS
  ======================================================= */

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);

  const [error, setError] = useState("");

  /* =======================================================
     FOCUS NAME FIELD
  ======================================================= */

  useEffect(() => {

    if (
      showModal &&
      nameRef.current
    ) {
      setTimeout(() => {
        nameRef.current?.focus();
      }, 100);
    }

  }, [showModal]);


  /* =========================================================
     LOAD CLIENTS
  ========================================================= */

  const loadClients = async (
    showRefresh = false
  ) => {

    try {

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setMsg("");

      const res = await fetch(API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.message ||
          "Failed to load clients"
        );
      }

      const arr = Array.isArray(data)
        ? data
        : [];

      setClients(arr);

      setFiltered(arr);

    } catch (err) {

      console.error(
        "LOAD CLIENTS ERROR:",
        err
      );

      setMsg(
        err?.message ||
        "Failed to load clients"
      );

    } finally {

      setLoading(false);
      setRefreshing(false);

    }

  };


  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {

    loadClients();

  }, []);


  /* =========================================================
     SEARCH
  ========================================================= */

  useEffect(() => {

    const q = search
      .trim()
      .toLowerCase();

    if (!q) {

      setFiltered(clients);

      return;

    }

    const results = clients.filter(
      (client) => {

        const name =
          client.name
            ?.toLowerCase() || "";

        const location =
          client.location
            ?.toLowerCase() || "";

        const phone =
          client.phone || "";

        const type =
          client.type
            ?.toLowerCase() || "";

        return (
          name.includes(q) ||
          location.includes(q) ||
          phone.includes(q) ||
          type.includes(q)
        );

      }
    );

    setFiltered(results);

  }, [search, clients]);


  /* =========================================================
     RESET FORM
  ========================================================= */

  const resetForm = () => {

    setForm({
      name: "",
      location: "",
      phone: "",
      type: "individual",
    });

    setEditing(null);

  };


  /* =========================================================
     OPEN ADD MODAL
  ========================================================= */

  const openAddModal = () => {

    resetForm();

    setError("");

    setShowSaveConfirm(false);

    setShowModal(true);

  };


  /* =========================================================
     CLOSE ADD / EDIT MODAL
  ========================================================= */

  const closeFormModal = () => {

    setShowModal(false);

    setShowSaveConfirm(false);

    setEditing(null);

    setError("");

    resetForm();

  };


  /* =========================================================
     VALIDATE FORM
  ========================================================= */

  const validate = () => {

    const name =
      form.name.trim();

    const location =
      form.location.trim();

    const phone =
      form.phone.trim();

    if (!name) {

      setError(
        "Client name is required."
      );

      return false;

    }

    if (!location) {

      setError(
        "Client location is required."
      );

      return false;

    }

    if (phone) {

      const saRegex =
        /^(?:\+27|0)[6-8][0-9]{8}$/;

      if (!saRegex.test(phone)) {

        setError(
          "Please enter a valid South African mobile number, for example 0821234567 or +27821234567."
        );

        return false;

      }

    }

    return true;

  };


  /* =========================================================
     PREPARE SAVE
  ========================================================= */

  const prepareSave = () => {

    setError("");

    if (!validate()) {
      return;
    }

    setShowSaveConfirm(true);

  };


  /* =========================================================
     SAVE CLIENT
  ========================================================= */

  const saveClient = async () => {

    if (!validate()) {
      return;
    }

    try {

      setError("");

      const method =
        editing
          ? "PUT"
          : "POST";

      const url =
        editing
          ? `${API}/${editing}`
          : API;

      const cleanForm = {
        name: form.name.trim(),
        location: form.location.trim(),
        phone: form.phone.trim(),
        type: form.type,
      };

      const res = await fetch(
        url,
        {
          method,
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
          },
          body: JSON.stringify(
            cleanForm
          ),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {

        throw new Error(
          data?.message ||
          "Unable to save client."
        );

      }

      setShowSaveConfirm(false);

      setShowModal(false);

      setEditing(null);

      resetForm();

      setMsg(
        editing
          ? "Client updated successfully."
          : "Client created successfully."
      );

      setShowSuccess(true);

      await loadClients();

    } catch (err) {

      console.error(
        "SAVE CLIENT ERROR:",
        err
      );

      setShowSaveConfirm(false);

      setError(
        err?.message ||
        "Save failed."
      );

    }

  };


  /* =========================================================
     START EDIT
  ========================================================= */

  const startEdit = (client) => {

    setEditing(client._id);

    setForm({
      name: client.name || "",
      location:
        client.location || "",
      phone:
        client.phone || "",
      type:
        client.type ||
        "individual",
    });

    setError("");

    setShowModal(true);

  };


  /* =========================================================
     OPEN DELETE CONFIRMATION
  ========================================================= */

  const openDeleteModal = (id) => {

    setDeleteId(id);

    setShowDeleteModal(true);

  };


  /* =========================================================
     DELETE CLIENT
  ========================================================= */

  const deleteClient = async () => {

    if (!deleteId) {
      return;
    }

    try {

      setError("");

      const res =
        await fetch(
          `${API}/${deleteId}`,
          {
            method: "DELETE",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await res.json();

      if (!res.ok) {

        throw new Error(
          data?.message ||
          "Delete failed."
        );

      }

      setShowDeleteModal(false);

      setDeleteId(null);

      setMsg(
        "Client deleted successfully."
      );

      await loadClients();

    } catch (err) {

      console.error(
        "DELETE CLIENT ERROR:",
        err
      );

      setShowDeleteModal(false);

      setDeleteId(null);

      setError(
        err?.message ||
        "Delete failed."
      );

    }

  };


  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalClients =
    clients.length;


  const totalWater =
    clients.reduce(
      (total, client) =>
        total +
        Number(
          client.totalWater || 0
        ),
      0
    );


  const totalRevenue =
    clients.reduce(
      (total, client) =>
        total +
        Number(
          client.totalRevenue || 0
        ),
      0
    );


  const totalDebt =
    clients.reduce(
      (total, client) =>
        total +
        Number(
          client.debt || 0
        ),
      0
    );


  /* =========================================================
     CURRENCY
  ========================================================= */

  const currency = (value) => {

    return new Intl.NumberFormat(
      "en-ZA",
      {
        style: "currency",
        currency: "ZAR",
      }
    ).format(
      Number(value) || 0
    );

  };


  /* =========================================================
     LOADING SCREEN
  ========================================================= */

  if (loading) {

    return (

      <div
        style={loadingStyle(theme)}
      >

        <div
          style={loadingBox(theme)}
        >

          <RefreshCw
            size={30}
            className="clients-spin"
          />

          <span>
            Loading clients...
          </span>

        </div>

      </div>

    );

  }


  /* =========================================================
     PAGE
  ========================================================= */

  return (

    <>

      <style>
        {`

          .clients-page {
            width: 100%;
            max-width: 1400px;
            margin: 0 auto;
            box-sizing: border-box;
          }

          .clients-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            margin-bottom: 22px;
          }

          .clients-title {
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 0;
          }

          .clients-stats {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 15px;
            margin-bottom: 20px;
          }

          .clients-search {
            margin-bottom: 20px;
          }

          .clients-table-card {
            overflow: hidden;
          }

          .clients-table-wrapper {
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          .clients-table {
            width: 100%;
            min-width: 900px;
            border-collapse: collapse;
          }

          .clients-desktop-only {
            display: block;
          }

          .clients-mobile-only {
            display: none;
          }

          .client-mobile-card {
            border: 1px solid;
            border-radius: 16px;
            padding: 16px;
            margin-bottom: 12px;
          }

          .client-mobile-top {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 14px;
          }

          .client-mobile-name {
            font-size: 17px;
            font-weight: 700;
            margin: 0;
          }

          .client-mobile-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 14px;
          }

          .client-mobile-detail {
            min-width: 0;
          }

          .client-mobile-label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: .5px;
            opacity: .7;
            margin-bottom: 3px;
          }

          .client-mobile-value {
            font-size: 14px;
            font-weight: 600;
            word-break: break-word;
          }

          .client-mobile-financials {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 8px;
            margin-bottom: 14px;
          }

          .client-mobile-financial {
            padding: 10px 8px;
            border-radius: 10px;
            text-align: center;
          }

          .client-mobile-financial-label {
            display: block;
            font-size: 10px;
            opacity: .7;
            margin-bottom: 4px;
          }

          .client-mobile-financial-value {
            display: block;
            font-size: 13px;
            font-weight: 700;
          }

          .client-mobile-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .clients-modal-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 16px;
          }

          .clients-modal-actions-single {
            display: block;
            margin-top: 16px;
          }

          .clients-action-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
          }

          .clients-stat-icon {
            width: 42px;
            height: 42px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 10px;
          }

          .clients-spin {
            animation: clientsSpin 1s linear infinite;
          }

          @keyframes clientsSpin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 900px) {

            .clients-stats {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }

          }

          @media (max-width: 700px) {

            .clients-header {
              align-items: stretch;
              flex-direction: column;
            }

            .clients-title {
              font-size: 25px;
            }

            .clients-header-button {
              width: 100% !important;
              max-width: none !important;
            }

            .clients-desktop-only {
              display: none;
            }

            .clients-mobile-only {
              display: block;
            }

            .clients-search {
              margin-bottom: 15px;
            }

          }

          @media (max-width: 480px) {

            .clients-page {
              padding: 12px !important;
            }

            .clients-stats {
              grid-template-columns: 1fr 1fr;
              gap: 10px;
            }

            .clients-stat-card {
              padding: 14px 10px !important;
              border-radius: 13px !important;
            }

            .clients-stat-value {
              font-size: 18px !important;
            }

            .client-mobile-details {
              grid-template-columns: 1fr;
            }

            .client-mobile-financials {
              grid-template-columns: 1fr;
            }

            .clients-modal-actions {
              grid-template-columns: 1fr;
            }

          }

        `}
      </style>


      <div
        style={page(theme)}
        className="clients-page"
      >

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="clients-header">

          <h1
            style={pageTitle(theme)}
            className="clients-title"
          >

            <Users
              size={32}
              strokeWidth={2.2}
            />

            Clients

          </h1>


          <button
            style={primaryBtn(theme)}
            className="clients-header-button clients-action-button"
            onClick={openAddModal}
          >

            <Plus
              size={19}
              strokeWidth={2.5}
            />

            Add Client

          </button>

        </div>


        {/* ===================================================
            MESSAGE
        =================================================== */}

        {msg && (

          <div
            style={msgBox(theme)}
          >

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >

              <span>
                {msg}
              </span>

              <button
                onClick={() =>
                  setMsg("")
                }
                style={{
                  background: "transparent",
                  border: "none",
                  color: theme.text,
                  cursor: "pointer",
                  padding: 3,
                }}
              >

                <X size={18} />

              </button>

            </div>

          </div>

        )}


        {/* ===================================================
            STATISTICS
        =================================================== */}

        <div className="clients-stats">

          <Stat
            title="Total Clients"
            value={totalClients}
            icon={
              <Users
                size={21}
              />
            }
            theme={theme}
          />


          <Stat
            title="Water Sold"
            value={`${totalWater} L`}
            icon={
              <Droplets
                size={21}
              />
            }
            theme={theme}
          />


          <Stat
            title="Total Revenue"
            value={currency(totalRevenue)}
            icon={
              <Banknote
                size={21}
              />
            }
            theme={theme}
          />


          <Stat
            title="Outstanding Debt"
            value={currency(totalDebt)}
            icon={
              <WalletCards
                size={21}
              />
            }
            theme={theme}
          />

        </div>


        {/* ===================================================
            SEARCH
        =================================================== */}

        <div
          className="clients-search"
          style={{
            position: "relative",
            width: "100%",
          }}
        >

          <Search
            size={20}
            strokeWidth={2}
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform:
                "translateY(-50%)",
              color:
                theme.textSecondary ||
                theme.text,
              pointerEvents: "none",
            }}
          />


          <input
            style={{
              ...searchBox(theme),
              paddingLeft: 45,
              margin: 0,
            }}
            placeholder="Search by name, location, phone or type..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

        </div>


        {/* ===================================================
            CLIENT TABLE CARD
        =================================================== */}

        <div
          style={card(theme)}
          className="clients-table-card"
        >

          {/* =================================================
              DESKTOP TABLE
          ================================================= */}

          <div
            className="clients-desktop-only"
          >

            {filtered.length === 0 ? (

              <Empty
                theme={theme}
                hasSearch={Boolean(search)}
              />

            ) : (

              <div
                className="clients-table-wrapper"
              >

                <table
                  className="clients-table"
                >

                  <thead
                    style={thead(theme)}
                  >

                    <tr>

                      <th
                        style={th(theme)}
                      >
                        Client
                      </th>

                      <th
                        style={th(theme)}
                      >
                        Location
                      </th>

                      <th
                        style={th(theme)}
                      >
                        Phone
                      </th>

                      <th
                        style={th(theme)}
                      >
                        Type
                      </th>

                      <th
                        style={th(theme)}
                      >
                        Water
                      </th>

                      <th
                        style={th(theme)}
                      >
                        Revenue
                      </th>

                      <th
                        style={th(theme)}
                      >
                        Debt
                      </th>

                      <th
                        style={{
                          ...th(theme),
                          textAlign: "center",
                        }}
                      >
                        Actions
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {filtered.map(
                      (client, index) => (

                        <tr
                          key={client._id}
                          style={
                            index % 2
                              ? rowAlt(theme)
                              : row(theme)
                          }
                        >

                          {/* CLIENT */}

                          <td
                            style={td(theme)}
                          >

                            <div
                              style={{
                                display: "flex",
                                alignItems:
                                  "center",
                                gap: 10,
                              }}
                            >

                              <div
                                style={avatar(theme)}
                              >

                                {client.name
                                  ?.charAt(0)
                                  ?.toUpperCase() ||
                                  "C"}

                              </div>

                              <strong>
                                {client.name ||
                                  "Unnamed Client"}
                              </strong>

                            </div>

                          </td>


                          {/* LOCATION */}

                          <td
                            style={td(theme)}
                          >

                            <div
                              style={{
                                display: "flex",
                                alignItems:
                                  "center",
                                gap: 7,
                              }}
                            >

                              <MapPin
                                size={16}
                                style={{
                                  flexShrink: 0,
                                  color:
                                    theme.primary,
                                }}
                              />

                              {client.location ||
                                "—"}

                            </div>

                          </td>


                          {/* PHONE */}

                          <td
                            style={td(theme)}
                          >

                            {client.phone ? (

                              <div
                                style={{
                                  display: "flex",
                                  alignItems:
                                    "center",
                                  gap: 7,
                                }}
                              >

                                <Phone
                                  size={15}
                                  style={{
                                    color:
                                      theme.primary,
                                  }}
                                />

                                {client.phone}

                              </div>

                            ) : (
                              "—"
                            )}

                          </td>


                          {/* TYPE */}

                          <td
                            style={td(theme)}
                          >

                            <Badge
                              type={
                                client.type
                              }
                              theme={theme}
                            />

                          </td>


                          {/* WATER */}

                          <td
                            style={td(theme)}
                          >

                            <strong>
                              {Number(
                                client.totalWater ||
                                0
                              ).toLocaleString()}
                            </strong>

                            {" L"}

                          </td>


                          {/* REVENUE */}

                          <td
                            style={td(theme)}
                          >

                            {currency(
                              client.totalRevenue
                            )}

                          </td>


                          {/* DEBT */}

                          <td
                            style={td(theme)}
                          >

                            <span
                              style={{
                                fontWeight: 700,
                                color:
                                  Number(
                                    client.debt ||
                                    0
                                  ) > 0
                                    ? "#dc2626"
                                    : "#16a34a",
                              }}
                            >

                              {currency(
                                client.debt
                              )}

                            </span>

                          </td>


                          {/* ACTIONS */}

                          <td
                            style={{
                              ...td(theme),
                              textAlign:
                                "center",
                            }}
                          >

                            <div
                              style={{
                                display:
                                  "flex",
                                justifyContent:
                                  "center",
                                gap: 7,
                                flexWrap:
                                  "wrap",
                              }}
                            >

                              <button
                                style={editBtn(
                                  theme
                                )}
                                onClick={() =>
                                  startEdit(
                                    client
                                  )
                                }
                                title="Edit client"
                              >

                                <Edit3
                                  size={16}
                                />

                                Edit

                              </button>


                              <button
                                style={
                                  dangerBtn
                                }
                                onClick={() =>
                                  openDeleteModal(
                                    client._id
                                  )
                                }
                                title="Delete client"
                              >

                                <Trash2
                                  size={16}
                                />

                                Delete

                              </button>

                            </div>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>


          {/* =================================================
              MOBILE CLIENT CARDS
          ================================================= */}

          <div
            className="clients-mobile-only"
          >

            {filtered.length === 0 ? (

              <Empty
                theme={theme}
                hasSearch={Boolean(search)}
              />

            ) : (

              filtered.map((client) => (

                <div
                  key={client._id}
                  className="client-mobile-card"
                  style={{
                    background:
                      theme.card,
                    borderColor:
                      theme.border,
                    color:
                      theme.text,
                  }}
                >

                  {/* MOBILE CARD HEADER */}

                  <div
                    className="client-mobile-top"
                  >

                    <div
                      style={{
                        display: "flex",
                        alignItems:
                          "center",
                        gap: 10,
                        minWidth: 0,
                      }}
                    >

                      <div
                        style={avatar(theme)}
                      >

                        {client.name
                          ?.charAt(0)
                          ?.toUpperCase() ||
                          "C"}

                      </div>

                      <div
                        style={{
                          minWidth: 0,
                        }}
                      >

                        <h3
                          className="client-mobile-name"
                          style={{
                            color:
                              theme.text,
                          }}
                        >
                          {client.name ||
                            "Unnamed Client"}
                        </h3>

                        <Badge
                          type={
                            client.type
                          }
                          theme={theme}
                        />

                      </div>

                    </div>

                  </div>


                  {/* MOBILE DETAILS */}

                  <div
                    className="client-mobile-details"
                  >

                    <div
                      className="client-mobile-detail"
                    >

                      <div
                        className="client-mobile-label"
                      >
                        Location
                      </div>

                      <div
                        className="client-mobile-value"
                        style={{
                          color:
                            theme.text,
                        }}
                      >

                        <MapPin
                          size={14}
                          style={{
                            verticalAlign:
                              "middle",
                            marginRight: 5,
                            color:
                              theme.primary,
                          }}
                        />

                        {client.location ||
                          "—"}

                      </div>

                    </div>


                    <div
                      className="client-mobile-detail"
                    >

                      <div
                        className="client-mobile-label"
                      >
                        Phone
                      </div>

                      <div
                        className="client-mobile-value"
                        style={{
                          color:
                            theme.text,
                        }}
                      >

                        <Phone
                          size={14}
                          style={{
                            verticalAlign:
                              "middle",
                            marginRight: 5,
                            color:
                              theme.primary,
                          }}
                        />

                        {client.phone ||
                          "—"}

                      </div>

                    </div>

                  </div>


                  {/* MOBILE FINANCIALS */}

                  <div
                    className="client-mobile-financials"
                  >

                    <div
                      className="client-mobile-financial"
                      style={{
                        background:
                          theme.input ||
                          theme.tableHeader ||
                          theme.card,
                      }}
                    >

                      <span
                        className="client-mobile-financial-label"
                      >
                        Water
                      </span>

                      <span
                        className="client-mobile-financial-value"
                        style={{
                          color:
                            theme.text,
                        }}
                      >

                        {Number(
                          client.totalWater ||
                          0
                        ).toLocaleString()}{" "}
                        L

                      </span>

                    </div>


                    <div
                      className="client-mobile-financial"
                      style={{
                        background:
                          theme.input ||
                          theme.tableHeader ||
                          theme.card,
                      }}
                    >

                      <span
                        className="client-mobile-financial-label"
                      >
                        Revenue
                      </span>

                      <span
                        className="client-mobile-financial-value"
                        style={{
                          color:
                            theme.text,
                        }}
                      >

                        {currency(
                          client.totalRevenue
                        )}

                      </span>

                    </div>


                    <div
                      className="client-mobile-financial"
                      style={{
                        background:
                          theme.input ||
                          theme.tableHeader ||
                          theme.card,
                      }}
                    >

                      <span
                        className="client-mobile-financial-label"
                      >
                        Debt
                      </span>

                      <span
                        className="client-mobile-financial-value"
                        style={{
                          color:
                            Number(
                              client.debt ||
                              0
                            ) > 0
                              ? "#dc2626"
                              : "#16a34a",
                        }}
                      >

                        {currency(
                          client.debt
                        )}

                      </span>

                    </div>

                  </div>


                  {/* MOBILE ACTIONS */}

                  <div
                    className="client-mobile-actions"
                  >

                    <button
                      style={editBtn(theme)}
                      className="clients-action-button"
                      onClick={() =>
                        startEdit(client)
                      }
                    >

                      <Edit3
                        size={17}
                      />

                      Edit Client

                    </button>


                    <button
                      style={dangerBtn}
                      className="clients-action-button"
                      onClick={() =>
                        openDeleteModal(
                          client._id
                        )
                      }
                    >

                      <Trash2
                        size={17}
                      />

                      Delete

                    </button>

                  </div>

                </div>

              ))

            )}

          </div>

        </div>


        {/* ===================================================
            ADD / EDIT MODAL
        =================================================== */}

        {showModal && (

          <Modal
            theme={theme}
            onClose={closeFormModal}
          >

            <div
              style={{
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "space-between",
                gap: 10,
                marginBottom: 5,
              }}
            >

              <h3
                style={modalHeading(theme)}
              >

                {editing
                  ? "Update Client"
                  : "Add Client"}

              </h3>


              <button
                onClick={closeFormModal}
                style={{
                  background:
                    "transparent",
                  border: "none",
                  color:
                    theme.textSecondary ||
                    theme.text,
                  cursor: "pointer",
                  padding: 5,
                }}
                title="Close"
              >

                <X size={21} />

              </button>

            </div>


            <p
              style={{
                ...modalText(theme),
                marginTop: 0,
                marginBottom: 18,
              }}
            >

              {editing
                ? "Update the client's information below."
                : "Enter the new client's information below."}

            </p>


            {/* NAME */}

            <label
              style={label(theme)}
            >
              Client Name
            </label>

            <div
              style={{
                position: "relative",
              }}
            >

              <User
                size={18}
                style={fieldIcon(theme)}
              />

              <input
                ref={nameRef}
                style={{
                  ...input(theme),
                  paddingLeft: 42,
                  marginTop: 6,
                }}
                placeholder="Enter client name"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name:
                      e.target.value,
                  })
                }
              />

            </div>


            {/* LOCATION */}

            <label
              style={label(theme)}
            >
              Location
            </label>

            <div
              style={{
                position: "relative",
              }}
            >

              <MapPin
                size={18}
                style={fieldIcon(theme)}
              />

              <input
                style={{
                  ...input(theme),
                  paddingLeft: 42,
                  marginTop: 6,
                }}
                placeholder="Enter client location"
                value={form.location}
                onChange={(e) =>
                  setForm({
                    ...form,
                    location:
                      e.target.value,
                  })
                }
              />

            </div>


            {/* PHONE */}

            <label
              style={label(theme)}
            >
              Phone Number
            </label>

            <div
              style={{
                position: "relative",
              }}
            >

              <Phone
                size={18}
                style={fieldIcon(theme)}
              />

              <input
                style={{
                  ...input(theme),
                  paddingLeft: 42,
                  marginTop: 6,
                }}
                placeholder="0821234567"
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone:
                      e.target.value,
                  })
                }
              />

            </div>


            {/* TYPE */}

            <label
              style={label(theme)}
            >
              Client Type
            </label>

            <div
              style={{
                position: "relative",
              }}
            >

              <Building2
                size={18}
                style={fieldIcon(theme)}
              />

              <select
                style={{
                  ...input(theme),
                  paddingLeft: 42,
                  marginTop: 6,
                }}
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type:
                      e.target.value,
                  })
                }
              >

                <option value="individual">
                  Individual
                </option>

                <option value="business">
                  Business
                </option>

              </select>

            </div>


            {/* ACTIONS */}

            <div
              className="clients-modal-actions"
            >

              <button
                style={primaryBtn(theme)}
                onClick={
                  prepareSave
                }
                className="clients-action-button"
              >

                <Save size={18} />

                {editing
                  ? "Update Client"
                  : "Create Client"}

              </button>


              <button
                style={closeBtn(theme)}
                onClick={
                  closeFormModal
                }
                className="clients-action-button"
              >

                <X size={18} />

                Cancel

              </button>

            </div>

          </Modal>

        )}


        {/* ===================================================
            SAVE CONFIRMATION
        =================================================== */}

        {showSaveConfirm && (

          <Modal
            theme={theme}
            onClose={() =>
              setShowSaveConfirm(false)
            }
          >

            <div
              style={confirmIconBox(
                "#2563eb"
              )}
            >

              <Save size={28} />

            </div>


            <h3
              style={{
                ...modalHeading(theme),
                textAlign:
                  "center",
                marginBottom: 8,
              }}
            >
              Confirm Save
            </h3>


            <p
              style={{
                ...modalText(theme),
                textAlign:
                  "center",
                marginTop: 0,
              }}
            >

              Are you sure you want to{" "}
              {editing
                ? "update"
                : "save"}{" "}
              this client?

            </p>


            <div
              className="clients-modal-actions"
            >

              <button
                style={primaryBtn(theme)}
                onClick={saveClient}
                className="clients-action-button"
              >

                <CheckCircle
                  size={18}
                />

                Yes, Save

              </button>


              <button
                style={closeBtn(theme)}
                onClick={() =>
                  setShowSaveConfirm(
                    false
                  )
                }
                className="clients-action-button"
              >

                <X size={18} />

                Cancel

              </button>

            </div>

          </Modal>

        )}


        {/* ===================================================
            DELETE CONFIRMATION
        =================================================== */}

        {showDeleteModal && (

          <Modal
            theme={theme}
            onClose={() =>
              setShowDeleteModal(
                false
              )
            }
          >

            <div
              style={confirmIconBox(
                "#dc2626"
              )}
            >

              <AlertTriangle
                size={28}
              />

            </div>


            <h3
              style={{
                ...modalHeading(theme),
                color: "#dc2626",
                textAlign:
                  "center",
                marginBottom: 8,
              }}
            >
              Delete Client
            </h3>


            <p
              style={{
                ...modalText(theme),
                textAlign:
                  "center",
                marginTop: 0,
              }}
            >

              Are you sure you want to
              delete this client? This
              action cannot be undone.

            </p>


            <div
              className="clients-modal-actions"
            >

              <button
                style={dangerBtnLarge}
                onClick={
                  deleteClient
                }
                className="clients-action-button"
              >

                <Trash2 size={18} />

                Yes, Delete

              </button>


              <button
                style={closeBtn(theme)}
                onClick={() =>
                  setShowDeleteModal(
                    false
                  )
                }
                className="clients-action-button"
              >

                <X size={18} />

                Cancel

              </button>

            </div>

          </Modal>

        )}


        {/* ===================================================
            SUCCESS
        =================================================== */}

        {showSuccess && (

          <Modal
            theme={theme}
            onClose={() =>
              setShowSuccess(false)
            }
          >

            <div
              style={confirmIconBox(
                "#16a34a"
              )}
            >

              <CheckCircle
                size={30}
              />

            </div>


            <h3
              style={{
                color: "#16a34a",
                textAlign:
                  "center",
                marginTop: 0,
                marginBottom: 8,
              }}
            >
              Success
            </h3>


            <p
              style={{
                ...modalText(theme),
                textAlign:
                  "center",
                marginTop: 0,
              }}
            >

              Client saved
              successfully!

            </p>


            <button
              style={primaryBtn(theme)}
              onClick={() =>
                setShowSuccess(false)
              }
              className="clients-action-button"
            >

              <CheckCircle
                size={18}
              />

              Done

            </button>

          </Modal>

        )}


        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (

          <Modal
            theme={theme}
            onClose={() =>
              setError("")
            }
          >

            <div
              style={confirmIconBox(
                "#dc2626"
              )}
            >

              <XCircle
                size={30}
              />

            </div>


            <h3
              style={{
                color: "#dc2626",
                textAlign:
                  "center",
                marginTop: 0,
                marginBottom: 8,
              }}
            >
              Something Went Wrong
            </h3>


            <p
              style={{
                ...modalText(theme),
                textAlign:
                  "center",
                marginTop: 0,
                lineHeight: 1.6,
              }}
            >

              {error}

            </p>


            <button
              style={dangerBtnLarge}
              onClick={() =>
                setError("")
              }
              className="clients-action-button"
            >

              <X size={18} />

              Close

            </button>

          </Modal>

        )}

      </div>

    </>

  );

}


/* =========================================================
   STAT COMPONENT
========================================================= */

const Stat = ({
  title,
  value,
  icon,
  theme,
}) => (

  <div
    style={statCard(theme)}
    className="clients-stat-card"
  >

    <div
      className="clients-stat-icon"
      style={{
        background:
          theme.primary + "18",
        color:
          theme.primary,
      }}
    >

      {icon}

    </div>


    <div
      style={{
        fontSize: 13,
        color:
          theme.textSecondary ||
          theme.text,
        fontWeight: 600,
      }}
    >
      {title}
    </div>


    <div
      className="clients-stat-value"
      style={{
        fontSize: 22,
        fontWeight: 700,
        marginTop: 7,
        color: theme.text,
        wordBreak:
          "break-word",
      }}
    >
      {value}
    </div>

  </div>

);


/* =========================================================
   BADGE
========================================================= */

const Badge = ({
  type,
  theme,
}) => {

  const isBusiness =
    type === "business";

  return (

    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding:
          "5px 10px",
        borderRadius: 20,
        fontSize: 11,
        background:
          isBusiness
            ? theme.primary
            : theme.tableHeader ||
              theme.input ||
              theme.card,
        color:
          isBusiness
            ? "white"
            : theme.text,
        fontWeight: 700,
        textTransform:
          "capitalize",
        marginTop: 5,
      }}
    >

      {isBusiness ? (
        <Building2 size={12} />
      ) : (
        <User size={12} />
      )}

      {type ||
        "individual"}

    </span>

  );

};


/* =========================================================
   MODAL
========================================================= */

const Modal = ({
  children,
  onClose,
  theme,
}) => (

  <div
    style={overlay}
    onMouseDown={(e) => {

      if (
        e.target ===
        e.currentTarget
      ) {
        onClose();
      }

    }}
  >

    <div
      style={modal(theme)}
      onMouseDown={(e) =>
        e.stopPropagation()
      }
    >

      {children}

    </div>

  </div>

);


/* =========================================================
   EMPTY
========================================================= */

const Empty = ({
  theme,
  hasSearch,
}) => (

  <div
    style={{
      textAlign: "center",
      padding:
        "55px 20px",
      color:
        theme.textSecondary ||
        theme.text,
    }}
  >

    <div
      style={{
        width: 65,
        height: 65,
        margin:
          "0 auto 15px",
        borderRadius: "50%",
        display: "flex",
        alignItems:
          "center",
        justifyContent:
          "center",
        background:
          theme.primary + "15",
        color:
          theme.primary,
      }}
    >

      <Users size={30} />

    </div>


    <h3
      style={{
        color: theme.text,
        marginBottom: 7,
      }}
    >

      {hasSearch
        ? "No clients found"
        : "No clients yet"}

    </h3>


    <p
      style={{
        margin: 0,
        lineHeight: 1.5,
      }}
    >

      {hasSearch
        ? "Try a different search term."
        : "Add your first client to get started."}

    </p>

  </div>

);


/* =========================================================
   PAGE STYLE
========================================================= */

const page = (theme) => ({

  padding:
    "clamp(14px, 3vw, 25px)",

  background:
    "transparent",

  color:
    theme.text,

  minHeight:
    "100vh",

  width:
    "100%",

  boxSizing:
    "border-box",

  overflowX:
    "hidden",

});


/* =========================================================
   PAGE TITLE
========================================================= */

const pageTitle = (theme) => ({

  color:
    theme.primary,

  fontSize:
    "clamp(25px, 5vw, 34px)",

  fontWeight:
    700,

});


/* =========================================================
   STAT CARD
========================================================= */

const statCard = (theme) => ({

  background:
    theme.card,

  color:
    theme.text,

  padding:
    18,

  borderRadius:
    16,

  boxShadow:
    "0 8px 25px rgba(0,0,0,.08)",

  width:
    "100%",

  boxSizing:
    "border-box",

  textAlign:
    "center",

  border:
    `1px solid ${theme.border}`,

});


/* =========================================================
   SEARCH
========================================================= */

const searchBox = (theme) => ({

  width:
    "100%",

  padding:
    "14px 15px",

  borderRadius:
    11,

  border:
    `1px solid ${theme.border}`,

  background:
    theme.input ||
    theme.card,

  color:
    theme.text,

  fontSize:
    16,

  boxSizing:
    "border-box",

  outline:
    "none",

});


/* =========================================================
   CARD
========================================================= */

const card = (theme) => ({

  background:
    theme.card,

  color:
    theme.text,

  padding:
    "clamp(12px, 2vw, 20px)",

  borderRadius:
    18,

  boxShadow:
    "0 10px 30px rgba(0,0,0,.08)",

  width:
    "100%",

  boxSizing:
    "border-box",

  border:
    `1px solid ${theme.border}`,

});


/* =========================================================
   TABLE HEADER
========================================================= */

const thead = (theme) => ({

  background:
    theme.primary,

  color:
    "white",

});


/* =========================================================
   TABLE HEADER CELL
========================================================= */

const th = (theme) => ({

  padding:
    "14px 12px",

  textAlign:
    "left",

  whiteSpace:
    "nowrap",

  fontSize:
    13,

  color:
    "white",

  fontWeight:
    700,

});


/* =========================================================
   TABLE DATA
========================================================= */

const td = (theme) => ({

  padding:
    "13px 12px",

  borderBottom:
    `1px solid ${theme.border}`,

  color:
    theme.text,

  whiteSpace:
    "nowrap",

  fontSize:
    14,

});


/* =========================================================
   TABLE ROW
========================================================= */

const row = (theme) => ({

  background:
    theme.card,

});


/* =========================================================
   ALTERNATE ROW
========================================================= */

const rowAlt = (theme) => ({

  background:
    theme.tableHeader ||
    theme.input ||
    theme.card,

});


/* =========================================================
   PRIMARY BUTTON
========================================================= */

const primaryBtn = (theme) => ({

  display:
    "inline-flex",

  alignItems:
    "center",

  justifyContent:
    "center",

  gap:
    7,

  background:
    `linear-gradient(135deg, ${theme.primary}, #1d4ed8)`,

  color:
    "white",

  border:
    "none",

  padding:
    "12px 18px",

  borderRadius:
    10,

  cursor:
    "pointer",

  fontWeight:
    700,

  width:
    "100%",

  maxWidth:
    220,

  minHeight:
    46,

  boxSizing:
    "border-box",

});


/* =========================================================
   EDIT BUTTON
========================================================= */

const editBtn = (theme) => ({

  display:
    "inline-flex",

  alignItems:
    "center",

  justifyContent:
    "center",

  gap:
    6,

  padding:
    "8px 12px",

  background:
    theme.tableHeader ||
    theme.primary,

  color:
    "white",

  border:
    "none",

  borderRadius:
    8,

  cursor:
    "pointer",

  minHeight:
    38,

  fontWeight:
    600,

});


/* =========================================================
   DANGER BUTTON
========================================================= */

const dangerBtn = {

  display:
    "inline-flex",

  alignItems:
    "center",

  justifyContent:
    "center",

  gap:
    6,

  padding:
    "8px 12px",

  background:
    "#ef4444",

  color:
    "white",

  border:
    "none",

  borderRadius:
    8,

  cursor:
    "pointer",

  minHeight:
    38,

  fontWeight:
    600,

};


/* =========================================================
   LARGE DANGER BUTTON
========================================================= */

const dangerBtnLarge = {

  display:
    "flex",

  alignItems:
    "center",

  justifyContent:
    "center",

  gap:
    7,

  width:
    "100%",

  minHeight:
    46,

  padding:
    "12px 18px",

  background:
    "#dc2626",

  color:
    "white",

  border:
    "none",

  borderRadius:
    10,

  cursor:
    "pointer",

  fontWeight:
    700,

};


/* =========================================================
   INPUT
========================================================= */

const input = (theme) => ({

  display:
    "block",

  width:
    "100%",

  padding:
    12,

  border:
    `1px solid ${theme.border}`,

  borderRadius:
    9,

  background:
    theme.input ||
    theme.card,

  color:
    theme.text,

  boxSizing:
    "border-box",

  outline:
    "none",

  fontSize:
    15,

  minHeight:
    46,

});


/* =========================================================
   INPUT LABEL
========================================================= */

const label = (theme) => ({

  display:
    "block",

  marginTop:
    14,

  color:
    theme.text,

  fontSize:
    13,

  fontWeight:
    700,

});


/* =========================================================
   FIELD ICON
========================================================= */

const fieldIcon = (theme) => ({

  position:
    "absolute",

  left:
    13,

  top:
    "50%",

  transform:
    "translateY(-50%)",

  color:
    theme.primary,

  pointerEvents:
    "none",

});


/* =========================================================
   AVATAR
========================================================= */

const avatar = (theme) => ({

  width:
    38,

  height:
    38,

  minWidth:
    38,

  borderRadius:
    "50%",

  display:
    "flex",

  alignItems:
    "center",

  justifyContent:
    "center",

  background:
    theme.primary,

  color:
    "white",

  fontWeight:
    700,

  fontSize:
    15,

});


/* =========================================================
   MODAL OVERLAY
========================================================= */

const overlay = {

  position:
    "fixed",

  inset:
    0,

  background:
    "rgba(0,0,0,.58)",

  backdropFilter:
    "blur(5px)",

  display:
    "flex",

  alignItems:
    "center",

  justifyContent:
    "center",

  zIndex:
    9999,

  padding:
    15,

  boxSizing:
    "border-box",

};


/* =========================================================
   MODAL
========================================================= */

const modal = (theme) => ({

  background:
    theme.card,

  color:
    theme.text,

  width:
    "100%",

  maxWidth:
    500,

  borderRadius:
    18,

  padding:
    "clamp(18px, 4vw, 25px)",

  boxSizing:
    "border-box",

  boxShadow:
    "0 20px 60px rgba(0,0,0,.3)",

  border:
    `1px solid ${theme.border}`,

  maxHeight:
    "92vh",

  overflowY:
    "auto",

});


/* =========================================================
   MODAL HEADING
========================================================= */

const modalHeading = (theme) => ({

  marginTop:
    0,

  marginBottom:
    0,

  color:
    theme.text,

  fontSize:
    21,

});


/* =========================================================
   MODAL TEXT
========================================================= */

const modalText = (theme) => ({

  color:
    theme.textSecondary ||
    theme.text,

});


/* =========================================================
   CLOSE BUTTON
========================================================= */

const closeBtn = (theme) => ({

  display:
    "flex",

  alignItems:
    "center",

  justifyContent:
    "center",

  gap:
    7,

  width:
    "100%",

  padding:
    12,

  background:
    theme.tableHeader ||
    "#111827",

  color:
    "white",

  border:
    "none",

  borderRadius:
    9,

  cursor:
    "pointer",

  minHeight:
    46,

  fontWeight:
    600,

});


/* =========================================================
   MESSAGE BOX
========================================================= */

const msgBox = (theme) => ({

  background:
    theme.tableHeader ||
    theme.input ||
    theme.card,

  color:
    theme.text,

  padding:
    12,

  borderRadius:
    9,

  marginBottom:
    15,

  border:
    `1px solid ${theme.border}`,

});


/* =========================================================
   CONFIRMATION ICON
========================================================= */

const confirmIconBox = (color) => ({

  width:
    60,

  height:
    60,

  borderRadius:
    "50%",

  display:
    "flex",

  alignItems:
    "center",

  justifyContent:
    "center",

  margin:
    "0 auto 16px",

  background:
    `${color}18`,

  color:
    color,

});


/* =========================================================
   LOADING
========================================================= */

const loadingStyle = (theme) => ({

  display:
    "flex",

  justifyContent:
    "center",

  alignItems:
    "center",

  minHeight:
    "60vh",

  color:
    theme.text,

  background:
    "transparent",

});


const loadingBox = (theme) => ({

  display:
    "flex",

  flexDirection:
    "column",

  alignItems:
    "center",

  justifyContent:
    "center",

  gap:
    12,

  color:
    theme.primary,

  fontWeight:
    600,

});


/* =========================================================
   EXPORT
========================================================= */
