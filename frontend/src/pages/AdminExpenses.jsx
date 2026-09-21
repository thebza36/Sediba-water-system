import React, {
  useContext,
  useEffect,
  useState,
} from "react";

import {
  Wallet,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  X,
  Save,
  Ban,
  FileText,
  Banknote,
  Tags,
  Receipt,
  CalendarDays,
  CircleDollarSign,
  ListChecks,
  LoaderCircle,
  CheckCircle2,
} from "lucide-react";

import { ThemeContext } from "../context/ThemeContext";

const API = import.meta.env.VITE_API_URL;

export default function AdminExpenses() {
  const { theme } = useContext(ThemeContext);

  const [expenses, setExpenses] = useState([]);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("general");

  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const [updating, setUpdating] = useState(false);
  const [deletingExpense, setDeletingExpense] =
    useState(false);
  const [adding, setAdding] = useState(false);

  /* =========================================================
     SUCCESS MODAL
  ========================================================= */

  const [successExpense, setSuccessExpense] =
    useState(null);

  /* =========================================================
     LOAD EXPENSES
  ========================================================= */

  const loadExpenses = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/expenses`);

      if (!res.ok) {
        throw new Error(
          `Failed to load expenses: ${res.status}`
        );
      }

      const data = await res.json();

      setExpenses(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "LOAD EXPENSES ERROR:",
        error
      );

      alert("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  /* =========================================================
     ADD EXPENSE
  ========================================================= */

  const addExpense = async () => {
    const cleanTitle = String(
      title || ""
    ).trim();

    const cleanAmount = Number(amount);

    if (!cleanTitle || amount === "") {
      alert(
        "Please enter expense name and amount"
      );

      return;
    }

    if (
      !Number.isFinite(cleanAmount) ||
      cleanAmount < 0
    ) {
      alert(
        "Please enter a valid expense amount"
      );

      return;
    }

    try {
      setAdding(true);

      const res = await fetch(
        `${API}/expenses`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            title: cleanTitle,
            amount: cleanAmount,
            category,
          }),
        }
      );

      const data = await res
        .json()
        .catch(() => null);

      if (!res.ok) {
        console.error(
          "ADD EXPENSE RESPONSE:",
          data
        );

        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to add expense"
        );
      }

      /* -----------------------------------------------
         SAVE INFORMATION FOR SUCCESS MODAL
      ------------------------------------------------ */

      const addedExpense = {
        title: cleanTitle,
        amount: cleanAmount,
        category:
          category || "general",
      };

      /* -----------------------------------------------
         CLEAR FORM
      ------------------------------------------------ */

      setTitle("");
      setAmount("");
      setCategory("general");

      /* -----------------------------------------------
         REFRESH EXPENSE LIST
      ------------------------------------------------ */

      await loadExpenses();

      /* -----------------------------------------------
         SHOW SUCCESS MODAL
      ------------------------------------------------ */

      setSuccessExpense(
        addedExpense
      );

    } catch (error) {
      console.error(
        "ADD EXPENSE ERROR:",
        error
      );

      alert(
        error.message ||
          "Failed to add expense"
      );
    } finally {
      setAdding(false);
    }
  };

  /* =========================================================
     DELETE EXPENSE
  ========================================================= */

  const deleteExpense = async () => {
    if (!deleting) return;

    try {
      setDeletingExpense(true);

      const res = await fetch(
        `${API}/expenses/${deleting}`,
        {
          method: "DELETE",
        }
      );

      const data = await res
        .json()
        .catch(() => null);

      if (!res.ok) {
        console.error(
          "DELETE EXPENSE RESPONSE:",
          data
        );

        throw new Error(
          data?.message ||
            data?.error ||
            "Delete failed"
        );
      }

      setDeleting(null);

      await loadExpenses();

    } catch (error) {
      console.error(
        "DELETE EXPENSE ERROR:",
        error
      );

      alert(
        error.message ||
          "Failed to delete expense"
      );
    } finally {
      setDeletingExpense(false);
    }
  };

  /* =========================================================
     EDIT EXPENSE
  ========================================================= */

  const updateExpense = async () => {
    if (!editing?._id) {
      alert(
        "Unable to update this expense because its ID is missing."
      );

      return;
    }

    const cleanTitle = String(
      editing.title || ""
    ).trim();

    const cleanAmount = Number(
      editing.amount
    );

    const cleanCategory =
      editing.category || "general";

    if (!cleanTitle) {
      alert(
        "Please enter an expense name"
      );

      return;
    }

    if (
      editing.amount === "" ||
      !Number.isFinite(cleanAmount) ||
      cleanAmount < 0
    ) {
      alert(
        "Please enter a valid expense amount"
      );

      return;
    }

    try {
      setUpdating(true);

      /*
        IMPORTANT:
        Only send editable fields.
      */

      const updateData = {
        title: cleanTitle,
        amount: cleanAmount,
        category: cleanCategory,
      };

      console.log(
        "UPDATING EXPENSE:",
        editing._id
      );

      console.log(
        "UPDATE DATA:",
        updateData
      );

      const res = await fetch(
        `${API}/expenses/${editing._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            updateData
          ),
        }
      );

      const data = await res
        .json()
        .catch(() => null);

      console.log(
        "UPDATE RESPONSE:",
        data
      );

      if (!res.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Update failed with status ${res.status}`
        );
      }

      setEditing(null);

      await loadExpenses();

    } catch (error) {
      console.error(
        "UPDATE EXPENSE ERROR:",
        error
      );

      alert(
        error.message ||
          "Failed to update expense. Please try again."
      );
    } finally {
      setUpdating(false);
    }
  };

  /* =========================================================
     TOTAL
  ========================================================= */

  const total = expenses.reduce(
    (sum, e) =>
      sum + Number(e.amount || 0),
    0
  );

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div style={center(theme)}>
        <div style={loadingBox(theme)}>
          <div style={spinner(theme)} />

          <div style={loadingText(theme)}>
            <ListChecks size={18} />

            <span>
              Loading expenses...
            </span>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div style={page(theme)}>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div style={header}>
        <div>
          <h1 style={titleStyle(theme)}>
            <Wallet
              size={30}
              strokeWidth={2.2}
              style={{
                flexShrink: 0,
              }}
            />

            <span>Expenses</span>
          </h1>

          <p style={subtitle(theme)}>
            Track and manage business expenses
          </p>
        </div>
      </div>

      {/* =====================================================
          SUMMARY CARD
      ===================================================== */}

      <div style={summaryCard(theme)}>
        <div style={summaryHeader}>
          <div style={summaryIcon}>
            <Wallet
              size={22}
              strokeWidth={2.2}
            />
          </div>

          <div style={summaryTitleWrapper}>
            <h3 style={summaryTitle}>
              Total Expenses
            </h3>

            <span style={summaryLabel}>
              All recorded business expenses
            </span>
          </div>
        </div>

        <div style={totalRow}>
          <CircleDollarSign
            size={25}
            strokeWidth={2}
          />

          <p style={totalText}>
            R{total.toFixed(2)}
          </p>
        </div>
      </div>

      {/* =====================================================
          ADD EXPENSE
      ===================================================== */}

      <div style={card(theme)}>
        <h3 style={sectionTitle(theme)}>
          <div style={sectionIcon(theme)}>
            <Plus
              size={18}
              strokeWidth={2.5}
            />
          </div>

          <span>Add Expense</span>
        </h3>

        <div
          className="expense-form-row"
          style={formRow}
        >

          {/* EXPENSE NAME */}

          <div style={fieldWrapper}>
            <label style={fieldLabel(theme)}>
              <FileText
                size={15}
                strokeWidth={2}
              />

              <span>
                Expense Name
              </span>
            </label>

            <div style={inputWrapper(theme)}>
              <FileText
                size={18}
                strokeWidth={2}
                style={inputIcon(theme)}
              />

              <input
                style={inputWithIcon(theme)}
                placeholder="Expense name"
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          {/* AMOUNT */}

          <div style={fieldWrapper}>
            <label style={fieldLabel(theme)}>
              <Banknote
                size={15}
                strokeWidth={2}
              />

              <span>Amount</span>
            </label>

            <div style={inputWrapper(theme)}>
              <Banknote
                size={18}
                strokeWidth={2}
                style={inputIcon(theme)}
              />

              <input
                style={inputWithIcon(theme)}
                type="number"
                min="0"
                step="0.01"
                placeholder="Amount"
                value={amount}
                onChange={(e) =>
                  setAmount(
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          {/* CATEGORY */}

          <div style={fieldWrapper}>
            <label style={fieldLabel(theme)}>
              <Tags
                size={15}
                strokeWidth={2}
              />

              <span>Category</span>
            </label>

            <div style={inputWrapper(theme)}>
              <Tags
                size={18}
                strokeWidth={2}
                style={inputIcon(theme)}
              />

              <select
                style={selectWithIcon(theme)}
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value
                  )
                }
              >
                <option value="general">
                  General
                </option>

                <option value="transport">
                  Transport
                </option>

                <option value="maintenance">
                  Maintenance
                </option>

                <option value="salary">
                  Salary
                </option>

                <option value="utilities">
                  Utilities
                </option>
              </select>
            </div>
          </div>

          {/* ADD BUTTON */}

          <div style={buttonField}>
            <label
              style={{
                ...fieldLabel(theme),
                visibility: "hidden",
              }}
            >
              Action
            </label>

            <button
              style={{
                ...addBtn(theme),
                opacity: adding
                  ? 0.7
                  : 1,
              }}
              onClick={addExpense}
              disabled={adding}
            >
              {adding ? (
                <LoaderCircle
                  size={19}
                  strokeWidth={2.6}
                  className="expense-spin"
                />
              ) : (
                <Plus
                  size={19}
                  strokeWidth={2.6}
                />
              )}

              <span>
                {adding
                  ? "Adding..."
                  : "Add Expense"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          EXPENSE RECORDS
      ===================================================== */}

      <div style={card(theme)}>
        <div style={tableHeading}>
          <div style={recordsHeading}>
            <div style={recordsIcon(theme)}>
              <Receipt
                size={20}
                strokeWidth={2.2}
              />
            </div>

            <div>
              <h3 style={tableTitle(theme)}>
                Expense Records
              </h3>

              <p style={recordCount(theme)}>
                <ListChecks
                  size={14}
                  strokeWidth={2}
                />

                <span>
                  {expenses.length} expense
                  {expenses.length === 1
                    ? ""
                    : "s"}{" "}
                  recorded
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            DESKTOP TABLE
        ================================================= */}

        <div
          className="expense-desktop-table"
          style={tableWrapper}
        >
          <table style={table}>
            <thead>
              <tr style={thead(theme)}>

                <th style={th(theme)}>
                  <div style={tableHeadContent}>
                    <FileText
                      size={16}
                      strokeWidth={2}
                    />

                    <span>
                      Expense
                    </span>
                  </div>
                </th>

                <th style={th(theme)}>
                  <div style={tableHeadContent}>
                    <Tags
                      size={16}
                      strokeWidth={2}
                    />

                    <span>
                      Category
                    </span>
                  </div>
                </th>

                <th style={th(theme)}>
                  <div style={tableHeadContent}>
                    <Banknote
                      size={16}
                      strokeWidth={2}
                    />

                    <span>
                      Amount
                    </span>
                  </div>
                </th>

                <th style={th(theme)}>
                  <div style={tableHeadContent}>
                    <CalendarDays
                      size={16}
                      strokeWidth={2}
                    />

                    <span>
                      Date
                    </span>
                  </div>
                </th>

                <th style={th(theme)}>
                  <div style={tableHeadContent}>
                    <Pencil
                      size={16}
                      strokeWidth={2}
                    />

                    <span>
                      Action
                    </span>
                  </div>
                </th>

              </tr>
            </thead>

            <tbody>
              {expenses.map((e) => (
                <tr
                  key={e._id}
                  style={row(theme)}
                >

                  <td style={td(theme)}>
                    <div
                      style={
                        tableExpenseName
                      }
                    >
                      <div
                        style={tableExpenseIcon(
                          theme
                        )}
                      >
                        <FileText
                          size={17}
                          strokeWidth={2}
                        />
                      </div>

                      <span>
                        {e.title}
                      </span>
                    </div>
                  </td>

                  <td style={td(theme)}>
                    <span
                      style={categoryBadge(
                        theme
                      )}
                    >
                      <Tags
                        size={13}
                        strokeWidth={2}
                      />

                      <span>
                        {e.category}
                      </span>
                    </span>
                  </td>

                  <td style={td(theme)}>
                    <div
                      style={
                        tableAmount
                      }
                    >
                      <Banknote
                        size={16}
                        strokeWidth={2}
                      />

                      <strong>
                        R
                        {Number(
                          e.amount || 0
                        ).toFixed(2)}
                      </strong>
                    </div>
                  </td>

                  <td style={td(theme)}>
                    <div
                      style={
                        tableDate
                      }
                    >
                      <CalendarDays
                        size={15}
                        strokeWidth={2}
                      />

                      <span>
                        {new Date(
                          e.createdAt
                        ).toLocaleDateString(
                          "en-ZA"
                        )}
                      </span>
                    </div>
                  </td>

                  <td style={actionCell}>

                    <button
                      style={editBtn}
                      onClick={() =>
                        setEditing({
                          _id: e._id,
                          title:
                            e.title ||
                            "",
                          amount:
                            e.amount ??
                            "",
                          category:
                            e.category ||
                            "general",
                        })
                      }
                      title="Edit expense"
                    >
                      <Pencil
                        size={16}
                        strokeWidth={2.2}
                      />

                      <span>
                        Edit
                      </span>
                    </button>

                    <button
                      style={deleteBtn}
                      onClick={() =>
                        setDeleting(
                          e._id
                        )
                      }
                      title="Delete expense"
                    >
                      <Trash2
                        size={16}
                        strokeWidth={2.2}
                      />

                      <span>
                        Delete
                      </span>
                    </button>

                  </td>
                </tr>
              ))}

              {expenses.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    style={emptyTableCell(
                      theme
                    )}
                  >
                    <Receipt
                      size={35}
                      strokeWidth={1.7}
                    />

                    <span>
                      No expenses recorded yet.
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* =================================================
            MOBILE EXPENSE CARDS
        ================================================= */}

        <div className="expense-mobile-list">

          {expenses.map((e) => (
            <div
              key={e._id}
              style={mobileExpenseCard(
                theme
              )}
            >

              {/* MOBILE CARD HEADER */}

              <div
                style={
                  mobileCardHeader
                }
              >
                <div
                  style={
                    mobileExpenseIcon(
                      theme
                    )
                  }
                >
                  <Wallet
                    size={20}
                    strokeWidth={2.2}
                  />
                </div>

                <div
                  style={
                    mobileExpenseInfo
                  }
                >
                  <h4
                    style={
                      mobileExpenseTitle(
                        theme
                      )
                    }
                  >
                    {e.title}
                  </h4>

                  <span
                    style={categoryBadge(
                      theme
                    )}
                  >
                    <Tags
                      size={12}
                      strokeWidth={2}
                    />

                    <span>
                      {e.category}
                    </span>
                  </span>
                </div>
              </div>

              {/* MOBILE DETAILS */}

              <div
                style={
                  mobileDetails
                }
              >

                <div
                  style={mobileDetailItem(
                    theme
                  )}
                >
                  <span
                    style={mobileLabel(
                      theme
                    )}
                  >
                    <Banknote
                      size={14}
                      strokeWidth={2}
                    />

                    <span>
                      Amount
                    </span>
                  </span>

                  <strong
                    style={mobileAmount(
                      theme
                    )}
                  >
                    R
                    {Number(
                      e.amount || 0
                    ).toFixed(2)}
                  </strong>
                </div>

                <div
                  style={mobileDetailItem(
                    theme
                  )}
                >
                  <span
                    style={mobileLabel(
                      theme
                    )}
                  >
                    <CalendarDays
                      size={14}
                      strokeWidth={2}
                    />

                    <span>
                      Date
                    </span>
                  </span>

                  <span
                    style={mobileValue(
                      theme
                    )}
                  >
                    {new Date(
                      e.createdAt
                    ).toLocaleDateString(
                      "en-ZA"
                    )}
                  </span>
                </div>

              </div>

              {/* MOBILE ACTIONS */}

              <div
                style={
                  mobileActions
                }
              >
                <button
                  style={
                    mobileEditBtn
                  }
                  onClick={() =>
                    setEditing({
                      _id: e._id,
                      title:
                        e.title ||
                        "",
                      amount:
                        e.amount ??
                        "",
                      category:
                        e.category ||
                        "general",
                    })
                  }
                >
                  <Pencil
                    size={17}
                    strokeWidth={2.2}
                  />

                  <span>
                    Edit
                  </span>
                </button>

                <button
                  style={
                    mobileDeleteBtn
                  }
                  onClick={() =>
                    setDeleting(
                      e._id
                    )
                  }
                >
                  <Trash2
                    size={17}
                    strokeWidth={2.2}
                  />

                  <span>
                    Delete
                  </span>
                </button>
              </div>

            </div>
          ))}

          {expenses.length === 0 && (
            <div
              style={emptyState(theme)}
            >
              <div
                style={emptyStateIcon(
                  theme
                )}
              >
                <Receipt
                  size={38}
                  strokeWidth={1.7}
                />
              </div>

              <p>
                No expenses recorded yet.
              </p>
            </div>
          )}

        </div>
      </div>

      {/* =====================================================
          SUCCESSFUL ADD MODAL
      ===================================================== */}

      {successExpense && (
        <div
          style={successModal}
          onClick={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              setSuccessExpense(null);
            }
          }}
        >
          <div
            style={successModalBox(
              theme
            )}
            className="expense-success-modal-box"
          >

            {/* SUCCESS ICON */}

            <div
              style={
                successIconWrapper
              }
            >
              <div
                style={
                  successIconCircle
                }
              >
                <CheckCircle2
                  size={52}
                  strokeWidth={2}
                />
              </div>
            </div>

            {/* SUCCESS TITLE */}

            <div
              style={
                successContent
              }
            >
              <h2
                style={
                  successTitle(
                    theme
                  )
                }
              >
                Expense Added Successfully
              </h2>

              <p
                style={
                  successSubtitle(
                    theme
                  )
                }
              >
                The expense has been successfully
                added to your records.
              </p>
            </div>

            {/* EXPENSE SUMMARY */}

            <div
              style={
                successExpenseCard(
                  theme
                )
              }
            >

              <div
                style={
                  successExpenseRow(
                    theme
                  )
                }
              >
                <div
                  style={
                    successRowLeft(
                      theme
                    )
                  }
                >
                  <FileText
                    size={17}
                    strokeWidth={2}
                  />

                  <span>
                    Expense
                  </span>
                </div>

                <strong
                  style={
                    successRowValue(
                      theme
                    )
                  }
                >
                  {successExpense.title}
                </strong>
              </div>

              <div
                style={
                  successDivider(
                    theme
                  )
                }
              />

              <div
                style={
                  successExpenseRow(
                    theme
                  )
                }
              >
                <div
                  style={
                    successRowLeft(
                      theme
                    )
                  }
                >
                  <Banknote
                    size={17}
                    strokeWidth={2}
                  />

                  <span>
                    Amount
                  </span>
                </div>

                <strong
                  style={
                    successAmount
                  }
                >
                  R
                  {Number(
                    successExpense.amount ||
                      0
                  ).toFixed(2)}
                </strong>
              </div>

              <div
                style={
                  successDivider(
                    theme
                  )
                }
              />

              <div
                style={
                  successExpenseRow(
                    theme
                  )
                }
              >
                <div
                  style={
                    successRowLeft(
                      theme
                    )
                  }
                >
                  <Tags
                    size={17}
                    strokeWidth={2}
                  />

                  <span>
                    Category
                  </span>
                </div>

                <span
                  style={
                    successCategory
                  }
                >
                  {successExpense.category}
                </span>
              </div>

            </div>

            {/* DONE BUTTON */}

            <button
              style={
                successDoneBtn
              }
              onClick={() =>
                setSuccessExpense(null)
              }
            >
              <CheckCircle2
                size={19}
                strokeWidth={2.4}
              />

              <span>
                Done
              </span>
            </button>

          </div>
        </div>
      )}

      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      {editing && (
        <div
          style={modal}
          onClick={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              if (!updating) {
                setEditing(null);
              }
            }
          }}
        >
          <div
            style={modalBox(theme)}
            className="expense-modal-box"
          >

            <div
              style={modalHeader}
            >
              <div>
                <h2
                  style={modalTitle(
                    theme
                  )}
                >
                  <div
                    style={modalTitleIcon(
                      theme
                    )}
                  >
                    <Pencil
                      size={18}
                      strokeWidth={2.2}
                    />
                  </div>

                  <span>
                    Edit Expense
                  </span>
                </h2>

                <p
                  style={modalSubtitle(
                    theme
                  )}
                >
                  Update the expense information
                </p>
              </div>

              <button
                style={{
                  ...modalClose(
                    theme
                  ),
                  opacity:
                    updating
                      ? 0.5
                      : 1,
                }}
                onClick={() => {
                  if (!updating) {
                    setEditing(
                      null
                    );
                  }
                }}
                disabled={updating}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* EDIT NAME */}

            <div
              style={modalField}
            >
              <label
                style={fieldLabel(
                  theme
                )}
              >
                <FileText
                  size={15}
                  strokeWidth={2}
                />

                <span>
                  Expense Name
                </span>
              </label>

              <div
                style={inputWrapper(
                  theme
                )}
              >
                <FileText
                  size={18}
                  strokeWidth={2}
                  style={inputIcon(
                    theme
                  )}
                />

                <input
                  style={inputWithIcon(
                    theme
                  )}
                  placeholder="Expense name"
                  value={
                    editing.title ||
                    ""
                  }
                  disabled={
                    updating
                  }
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      title:
                        e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* EDIT AMOUNT */}

            <div
              style={modalField}
            >
              <label
                style={fieldLabel(
                  theme
                )}
              >
                <Banknote
                  size={15}
                  strokeWidth={2}
                />

                <span>
                  Amount
                </span>
              </label>

              <div
                style={inputWrapper(
                  theme
                )}
              >
                <Banknote
                  size={18}
                  strokeWidth={2}
                  style={inputIcon(
                    theme
                  )}
                />

                <input
                  style={inputWithIcon(
                    theme
                  )}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Amount"
                  value={
                    editing.amount ??
                    ""
                  }
                  disabled={
                    updating
                  }
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      amount:
                        e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* EDIT CATEGORY */}

            <div
              style={modalField}
            >
              <label
                style={fieldLabel(
                  theme
                )}
              >
                <Tags
                  size={15}
                  strokeWidth={2}
                />

                <span>
                  Category
                </span>
              </label>

              <div
                style={inputWrapper(
                  theme
                )}
              >
                <Tags
                  size={18}
                  strokeWidth={2}
                  style={inputIcon(
                    theme
                  )}
                />

                <select
                  style={selectWithIcon(
                    theme
                  )}
                  value={
                    editing.category ||
                    "general"
                  }
                  disabled={
                    updating
                  }
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      category:
                        e.target.value,
                    })
                  }
                >
                  <option value="general">
                    General
                  </option>

                  <option value="transport">
                    Transport
                  </option>

                  <option value="maintenance">
                    Maintenance
                  </option>

                  <option value="salary">
                    Salary
                  </option>

                  <option value="utilities">
                    Utilities
                  </option>
                </select>
              </div>
            </div>

            {/* MODAL ACTIONS */}

            <div
              className="expense-modal-actions"
              style={modalActions}
            >
              <button
                style={{
                  ...cancelBtn,
                  opacity:
                    updating
                      ? 0.6
                      : 1,
                }}
                onClick={() => {
                  if (!updating) {
                    setEditing(
                      null
                    );
                  }
                }}
                disabled={updating}
              >
                <Ban
                  size={17}
                  strokeWidth={2.2}
                />

                <span>
                  Cancel
                </span>
              </button>

              <button
                style={{
                  ...saveBtn,
                  opacity:
                    updating
                      ? 0.7
                      : 1,
                }}
                onClick={
                  updateExpense
                }
                disabled={updating}
              >
                {updating ? (
                  <LoaderCircle
                    size={17}
                    strokeWidth={2.2}
                    className="expense-spin"
                  />
                ) : (
                  <Save
                    size={17}
                    strokeWidth={2.2}
                  />
                )}

                <span>
                  {updating
                    ? "Saving..."
                    : "Save Changes"}
                </span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {deleting && (
        <div
          style={modal}
          onClick={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              if (
                !deletingExpense
              ) {
                setDeleting(null);
              }
            }
          }}
        >
          <div
            style={modalBox(theme)}
            className="expense-modal-box"
          >

            <div
              style={modalHeader}
            >
              <div>
                <h2
                  style={modalTitle(
                    theme
                  )}
                >
                  <div
                    style={
                      deleteTitleIcon
                    }
                  >
                    <AlertTriangle
                      size={18}
                      strokeWidth={2.2}
                    />
                  </div>

                  <span>
                    Confirm Delete
                  </span>
                </h2>

                <p
                  style={modalSubtitle(
                    theme
                  )}
                >
                  This action cannot be undone.
                </p>
              </div>

              <button
                style={{
                  ...modalClose(
                    theme
                  ),
                  opacity:
                    deletingExpense
                      ? 0.5
                      : 1,
                }}
                onClick={() => {
                  if (
                    !deletingExpense
                  ) {
                    setDeleting(null);
                  }
                }}
                disabled={
                  deletingExpense
                }
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={deleteWarning(
                theme
              )}
            >
              <div
                style={warningIcon}
              >
                <AlertTriangle
                  size={25}
                  strokeWidth={2}
                />
              </div>

              <p
                style={modalText(
                  theme
                )}
              >
                Are you sure you want
                to delete this expense?
              </p>

              <p
                style={warningSmall(
                  theme
                )}
              >
                <Trash2
                  size={14}
                  strokeWidth={2}
                  style={{
                    verticalAlign:
                      "middle",
                    marginRight: 5,
                  }}
                />

                The expense will be
                permanently removed from
                your records.
              </p>
            </div>

            <div
              className="expense-modal-actions"
              style={modalActions}
            >
              <button
                style={{
                  ...cancelBtn,
                  opacity:
                    deletingExpense
                      ? 0.6
                      : 1,
                }}
                onClick={() => {
                  if (
                    !deletingExpense
                  ) {
                    setDeleting(null);
                  }
                }}
                disabled={
                  deletingExpense
                }
              >
                <Ban
                  size={17}
                  strokeWidth={2.2}
                />

                <span>
                  Cancel
                </span>
              </button>

              <button
                style={{
                  ...deleteConfirmBtn,
                  opacity:
                    deletingExpense
                      ? 0.7
                      : 1,
                }}
                onClick={
                  deleteExpense
                }
                disabled={
                  deletingExpense
                }
              >
                {deletingExpense ? (
                  <LoaderCircle
                    size={17}
                    strokeWidth={2.2}
                    className="expense-spin"
                  />
                ) : (
                  <Trash2
                    size={17}
                    strokeWidth={2.2}
                  />
                )}

                <span>
                  {deletingExpense
                    ? "Deleting..."
                    : "Delete"}
                </span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =====================================================
          RESPONSIVE STYLES
      ===================================================== */}

      <style>
        {`
          .expense-mobile-list {
            display: none;
          }

          .expense-desktop-table {
            display: block;
          }

          .expense-spin {
            animation: expenseSpin 0.8s linear infinite;
          }

          @keyframes expenseSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 767px) {
            .expense-desktop-table {
              display: none !important;
            }

            .expense-mobile-list {
              display: flex;
              flex-direction: column;
              gap: 12px;
              width: 100%;
            }

            .expense-form-row {
              grid-template-columns: 1fr !important;
              gap: 12px !important;
            }

            .expense-form-row input,
            .expense-form-row select,
            .expense-form-row button {
              width: 100% !important;
              min-width: 0 !important;
            }

            .expense-modal-box,
            .expense-success-modal-box {
              max-width: 100% !important;
              width: 100% !important;
              max-height: calc(100vh - 30px);
              overflow-y: auto;
            }

            .expense-modal-actions {
              flex-direction: column !important;
            }

            .expense-modal-actions button {
              width: 100% !important;
              flex: none !important;
            }
          }

          @media (max-width: 480px) {
            .expense-mobile-list {
              gap: 10px;
            }

            .expense-form-row {
              gap: 10px !important;
            }

            .expense-success-modal-box {
              padding: 18px !important;
              border-radius: 15px !important;
            }
          }

          @media (max-width: 350px) {
            .expense-success-modal-box {
              padding: 15px !important;
            }
          }
        `}
      </style>
    </div>
  );
}


/* =========================================================
   PAGE
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


/* =========================================================
   HEADER
========================================================= */

const header = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 15,
  marginBottom: 20,
};


const titleStyle = (theme) => ({
  fontSize: "clamp(24px, 5vw, 32px)",
  fontWeight: 700,
  margin: 0,
  color: theme.primary,
  display: "flex",
  alignItems: "center",
  gap: 9,
  flexWrap: "wrap",
});


const subtitle = (theme) => ({
  margin: "6px 0 0",
  color:
    theme.textSecondary ||
    theme.text,
  fontSize: 14,
});


/* =========================================================
   SUMMARY
========================================================= */

const summaryCard = (theme) => ({
  background:
    `linear-gradient(135deg, ${theme.primary}, #1d4ed8)`,
  color: "white",
  padding: 20,
  borderRadius: 16,
  boxShadow:
    "0 10px 30px rgba(0,0,0,.15)",
  marginBottom: 20,
  width: "100%",
  boxSizing: "border-box",
});


const summaryHeader = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};


const summaryIcon = {
  width: 40,
  height: 40,
  minWidth: 40,
  borderRadius: 10,
  background:
    "rgba(255,255,255,.15)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};


const summaryTitleWrapper = {
  minWidth: 0,
};


const summaryTitle = {
  margin: 0,
  fontSize: 17,
};


const summaryLabel = {
  display: "block",
  marginTop: 3,
  fontSize: 12,
  opacity: 0.8,
};


const totalRow = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  marginTop: 10,
};


const totalText = {
  fontSize:
    "clamp(25px, 7vw, 30px)",
  fontWeight: 700,
  margin: 0,
  wordBreak: "break-word",
};


/* =========================================================
   CARDS
========================================================= */

const card = (theme) => ({
  background: theme.card,
  color: theme.text,
  padding: 20,
  borderRadius: 16,
  boxShadow:
    "0 8px 25px rgba(0,0,0,.08)",
  marginBottom: 20,
  width: "100%",
  boxSizing: "border-box",
  border:
    `1px solid ${theme.border}`,
});


const sectionTitle = (theme) => ({
  marginTop: 0,
  marginBottom: 15,
  color: theme.text,
  fontSize: 19,
  display: "flex",
  alignItems: "center",
  gap: 9,
});


const sectionIcon = (theme) => ({
  width: 32,
  height: 32,
  minWidth: 32,
  borderRadius: 8,
  background:
    theme.tableHeader ||
    theme.input ||
    theme.card,
  color: theme.primary,
  border:
    `1px solid ${theme.border}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});


/* =========================================================
   FORM
========================================================= */

const formRow = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
  gap: 15,
  width: "100%",
};


const fieldWrapper = {
  width: "100%",
  minWidth: 0,
};


const buttonField = {
  width: "100%",
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
};


const fieldLabel = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: 5,
  color:
    theme.textSecondary ||
    theme.text,
  fontSize: 12,
  fontWeight: 600,
  marginBottom: 6,
});


const inputWrapper = (theme) => ({
  width: "100%",
  minHeight: 44,
  display: "flex",
  alignItems: "center",
  position: "relative",
  boxSizing: "border-box",
});


const inputIcon = (theme) => ({
  position: "absolute",
  left: 12,
  color:
    theme.textSecondary ||
    theme.text,
  opacity: 0.75,
  pointerEvents: "none",
  zIndex: 1,
});


const inputWithIcon = (theme) => ({
  width: "100%",
  height: 44,
  padding:
    "10px 12px 10px 40px",
  border:
    `1px solid ${theme.border}`,
  borderRadius: 9,
  background:
    theme.input ||
    theme.card,
  color: theme.text,
  boxSizing: "border-box",
  fontSize: 15,
  outline: "none",
});


const selectWithIcon = (theme) => ({
  width: "100%",
  height: 44,
  padding:
    "10px 35px 10px 40px",
  border:
    `1px solid ${theme.border}`,
  borderRadius: 9,
  background:
    theme.input ||
    theme.card,
  color: theme.text,
  boxSizing: "border-box",
  fontSize: 15,
  outline: "none",
  cursor: "pointer",
});


const addBtn = (theme) => ({
  background:
    `linear-gradient(135deg, ${theme.primary}, #1d4ed8)`,
  color: "white",
  border: "none",
  padding: "12px 18px",
  borderRadius: 9,
  cursor: "pointer",
  fontWeight: 600,
  width: "100%",
  minHeight: 44,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  boxSizing: "border-box",
});


/* =========================================================
   RECORDS HEADER
========================================================= */

const tableHeading = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 15,
};


const recordsHeading = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};


const recordsIcon = (theme) => ({
  width: 40,
  height: 40,
  minWidth: 40,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.primary,
  background:
    theme.tableHeader ||
    theme.input ||
    theme.card,
  border:
    `1px solid ${theme.border}`,
});


const tableTitle = (theme) => ({
  margin: 0,
  color: theme.text,
  fontSize: 19,
});


const recordCount = (theme) => ({
  margin: "4px 0 0",
  color:
    theme.textSecondary ||
    theme.text,
  fontSize: 13,
  display: "flex",
  alignItems: "center",
  gap: 5,
});


/* =========================================================
   TABLE
========================================================= */

const tableWrapper = {
  width: "100%",
  overflowX: "auto",
  WebkitOverflowScrolling:
    "touch",
  borderRadius: 10,
};


const table = {
  width: "100%",
  minWidth: 650,
  borderCollapse: "collapse",
};


const thead = (theme) => ({
  background: theme.primary,
  color: "white",
});


const th = (theme) => ({
  padding: 14,
  textAlign: "left",
  fontWeight: 600,
  whiteSpace: "nowrap",
  color: "white",
});


const tableHeadContent = {
  display: "flex",
  alignItems: "center",
  gap: 7,
};


const td = (theme) => ({
  padding: 14,
  borderBottom:
    `1px solid ${theme.border}`,
  color: theme.text,
  whiteSpace: "nowrap",
});


const row = (theme) => ({
  background: theme.card,
});


const tableExpenseName = {
  display: "flex",
  alignItems: "center",
  gap: 9,
};


const tableExpenseIcon = (theme) => ({
  width: 32,
  height: 32,
  minWidth: 32,
  borderRadius: 8,
  background:
    theme.tableHeader ||
    theme.input ||
    theme.card,
  color: theme.primary,
  border:
    `1px solid ${theme.border}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});


const categoryBadge = (theme) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  padding: "5px 9px",
  borderRadius: 8,
  background:
    theme.tableHeader ||
    theme.input ||
    theme.card,
  border:
    `1px solid ${theme.border}`,
  color: theme.text,
  fontSize: 12,
  fontWeight: 600,
  textTransform: "capitalize",
});


const tableAmount = {
  display: "flex",
  alignItems: "center",
  gap: 6,
};


const tableDate = {
  display: "flex",
  alignItems: "center",
  gap: 6,
};


const actionCell = {
  padding: 14,
  borderBottom:
    "1px solid transparent",
  display: "flex",
  flexWrap: "wrap",
  gap: 7,
  alignItems: "center",
};


const editBtn = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "9px 12px",
  borderRadius: 8,
  cursor: "pointer",
  marginRight: 2,
  fontWeight: 600,
  minWidth: 75,
  minHeight: 38,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
};


const deleteBtn = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "9px 12px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
  minWidth: 80,
  minHeight: 38,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
};


const emptyTableCell = (theme) => ({
  padding: 40,
  textAlign: "center",
  color:
    theme.textSecondary ||
    theme.text,
  display: "table-cell",
});


/* =========================================================
   MOBILE EXPENSE CARDS
========================================================= */

const mobileExpenseCard = (theme) => ({
  width: "100%",
  boxSizing: "border-box",
  padding: 15,
  borderRadius: 13,
  background: theme.card,
  border:
    `1px solid ${theme.border}`,
  boxShadow:
    "0 5px 16px rgba(0,0,0,.06)",
});


const mobileCardHeader = {
  display: "flex",
  alignItems: "flex-start",
  gap: 11,
};


const mobileExpenseIcon = (theme) => ({
  width: 40,
  height: 40,
  minWidth: 40,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    theme.tableHeader ||
    theme.input ||
    theme.card,
  color: theme.primary,
  border:
    `1px solid ${theme.border}`,
});


const mobileExpenseInfo = {
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: 7,
};


const mobileExpenseTitle = (theme) => ({
  margin: 0,
  color: theme.text,
  fontSize: 16,
  fontWeight: 700,
  lineHeight: 1.3,
  overflowWrap: "anywhere",
});


const mobileDetails = {
  display: "grid",
  gridTemplateColumns:
    "1fr 1fr",
  gap: 10,
  marginTop: 15,
  paddingTop: 13,
  borderTop:
    "1px solid rgba(128,128,128,.15)",
};


const mobileDetailItem = (theme) => ({
  display: "flex",
  flexDirection: "column",
  gap: 5,
  minWidth: 0,
});


const mobileLabel = (theme) => ({
  color:
    theme.textSecondary ||
    theme.text,
  fontSize: 12,
  fontWeight: 500,
  display: "flex",
  alignItems: "center",
  gap: 5,
});


const mobileValue = (theme) => ({
  color: theme.text,
  fontSize: 14,
  fontWeight: 600,
  overflowWrap: "anywhere",
});


const mobileAmount = (theme) => ({
  color: theme.primary,
  fontSize: 16,
  overflowWrap: "anywhere",
});


const mobileActions = {
  display: "grid",
  gridTemplateColumns:
    "1fr 1fr",
  gap: 9,
  marginTop: 15,
};


const mobileEditBtn = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "10px 12px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
  minHeight: 42,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
};


const mobileDeleteBtn = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "10px 12px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
  minHeight: 42,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
};


const emptyState = (theme) => ({
  width: "100%",
  padding: "35px 15px",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  color:
    theme.textSecondary ||
    theme.text,
  textAlign: "center",
});


const emptyStateIcon = (theme) => ({
  width: 60,
  height: 60,
  borderRadius: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    theme.tableHeader ||
    theme.input ||
    theme.card,
  color: theme.primary,
  border:
    `1px solid ${theme.border}`,
});


/* =========================================================
   SUCCESS MODAL
========================================================= */

const successModal = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background:
    "rgba(0,0,0,0.68)",
  backdropFilter: "blur(5px)",
  WebkitBackdropFilter:
    "blur(5px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1100,
  padding: 15,
  boxSizing: "border-box",
};


const successModalBox = (theme) => ({
  background: theme.card,
  color: theme.text,
  padding: 24,
  borderRadius: 18,
  width: "100%",
  maxWidth: 430,
  display: "flex",
  flexDirection: "column",
  gap: 16,
  boxSizing: "border-box",
  boxShadow:
    "0 25px 70px rgba(0,0,0,.35)",
  border:
    `1px solid ${theme.border}`,
  textAlign: "center",
  animation:
    "expenseSuccessPop .22s ease-out",
});


const successIconWrapper = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginTop: 2,
};


const successIconCircle = {
  width: 88,
  height: 88,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    "rgba(34,197,94,.13)",
  color: "#16a34a",
  border:
    "1px solid rgba(34,197,94,.25)",
  boxShadow:
    "0 8px 25px rgba(34,197,94,.12)",
};


const successContent = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
};


const successTitle = (theme) => ({
  margin: 0,
  color: theme.text,
  fontSize:
    "clamp(19px, 5vw, 23px)",
  fontWeight: 700,
  lineHeight: 1.25,
});


const successSubtitle = (theme) => ({
  margin: 0,
  color:
    theme.textSecondary ||
    theme.text,
  fontSize: 13,
  lineHeight: 1.5,
});


const successExpenseCard = (
  theme
) => ({
  width: "100%",
  padding: 14,
  boxSizing: "border-box",
  borderRadius: 12,
  background:
    theme.tableHeader ||
    theme.input ||
    theme.card,
  border:
    `1px solid ${theme.border}`,
  textAlign: "left",
});


const successExpenseRow = (
  theme
) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  minWidth: 0,
});


const successRowLeft = (
  theme
) => ({
  display: "flex",
  alignItems: "center",
  gap: 7,
  color:
    theme.textSecondary ||
    theme.text,
  fontSize: 13,
  fontWeight: 600,
  minWidth: 0,
});


const successRowValue = (
  theme
) => ({
  color: theme.text,
  fontSize: 14,
  fontWeight: 700,
  textAlign: "right",
  overflowWrap: "anywhere",
});


const successAmount = {
  color: "#16a34a",
  fontSize: 15,
  fontWeight: 800,
  textAlign: "right",
};


const successCategory = {
  color: "#2563eb",
  fontSize: 13,
  fontWeight: 700,
  textTransform: "capitalize",
  textAlign: "right",
};


const successDivider = (
  theme
) => ({
  width: "100%",
  height: 1,
  background: theme.border,
  opacity: 0.7,
  margin:
    "11px 0",
});


const successDoneBtn = {
  width: "100%",
  minHeight: 44,
  border: "none",
  borderRadius: 9,
  background:
    "linear-gradient(135deg, #16a34a, #15803d)",
  color: "white",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  boxShadow:
    "0 7px 18px rgba(22,163,74,.22)",
};


/* =========================================================
   MODALS
========================================================= */

const modal = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background:
    "rgba(0,0,0,0.6)",
  backdropFilter: "blur(4px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
  padding: 15,
  boxSizing: "border-box",
};


const modalBox = (theme) => ({
  background: theme.card,
  color: theme.text,
  padding: 20,
  borderRadius: 16,
  width: "100%",
  maxWidth: 400,
  display: "flex",
  flexDirection: "column",
  gap: 13,
  boxSizing: "border-box",
  boxShadow:
    "0 10px 30px rgba(0,0,0,.2)",
  border:
    `1px solid ${theme.border}`,
});


const modalHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 15,
};


const modalTitle = (theme) => ({
  margin: 0,
  color: theme.text,
  fontSize: 20,
  display: "flex",
  alignItems: "center",
  gap: 8,
  lineHeight: 1.3,
});


const modalTitleIcon = (
  theme
) => ({
  width: 34,
  height: 34,
  minWidth: 34,
  borderRadius: 9,
  background:
    theme.tableHeader ||
    theme.input ||
    theme.card,
  color: theme.primary,
  border:
    `1px solid ${theme.border}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});


const deleteTitleIcon = {
  width: 34,
  height: 34,
  minWidth: 34,
  borderRadius: 9,
  background:
    "rgba(220,38,38,.12)",
  color: "#dc2626",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};


const modalSubtitle = (
  theme
) => ({
  margin: "5px 0 0",
  color:
    theme.textSecondary ||
    theme.text,
  fontSize: 13,
});


const modalClose = (theme) => ({
  width: 34,
  height: 34,
  minWidth: 34,
  borderRadius: "50%",
  border:
    `1px solid ${theme.border}`,
  background:
    theme.tableHeader ||
    theme.input ||
    theme.card,
  color: theme.text,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});


const modalField = {
  width: "100%",
};


const modalText = (theme) => ({
  color:
    theme.textSecondary ||
    theme.text,
  margin: 0,
  fontWeight: 600,
  lineHeight: 1.5,
});


const deleteWarning = (
  theme
) => ({
  padding: 15,
  borderRadius: 10,
  background:
    theme.tableHeader ||
    theme.input ||
    theme.card,
  border:
    `1px solid ${theme.border}`,
});


const warningIcon = {
  width: 42,
  height: 42,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 10,
  background:
    "rgba(220,38,38,.12)",
  color: "#dc2626",
};


const warningSmall = (
  theme
) => ({
  color:
    theme.textSecondary ||
    theme.text,
  margin: "8px 0 0",
  fontSize: 13,
  lineHeight: 1.5,
  display: "flex",
  alignItems: "flex-start",
});


const modalActions = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  width: "100%",
};

const saveBtn = {
  background: "#16a34a",
  color: "white",
  border: "none",
  padding: "10px",
  borderRadius: 8,
  flex: 1,
  cursor: "pointer",
  fontWeight: 600,
  minHeight: 42,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
};


const cancelBtn = {
  background: "#64748b",
  color: "white",
  border: "none",
  padding: "10px",
  borderRadius: 8,
  flex: 1,
  cursor: "pointer",
  fontWeight: 600,
  minHeight: 42,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
};


const deleteConfirmBtn = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "10px",
  borderRadius: 8,
  flex: 1,
  cursor: "pointer",
  fontWeight: 600,
  minHeight: 42,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
};


/* =========================================================
   LOADING
========================================================= */

const center = (theme) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "60vh",
  color: theme.text,
  background: "transparent",
});


const loadingBox = (theme) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 12,
  color: theme.text,
  fontWeight: 600,
});


const loadingText = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: 7,
  color: theme.text,
});


const spinner = (theme) => ({
  width: 30,
  height: 30,
  borderRadius: "50%",
  border:
    `3px solid ${theme.border}`,
  borderTopColor:
    theme.primary,
  animation:
    "spin 0.8s linear infinite",
});