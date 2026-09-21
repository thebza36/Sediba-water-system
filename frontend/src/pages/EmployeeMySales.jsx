import React, {
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  FileText,
  DollarSign,
  Droplets,
  BarChart3,
  Search,
  RefreshCw,
  X,
  ShoppingCart,
  Receipt,
  Banknote,
  CreditCard,
  CircleHelp,
  CalendarDays,
  Package
} from "lucide-react";

import { ThemeContext } from "../context/ThemeContext";


/* =========================================================
   API
========================================================= */

const BASE_API =
  import.meta.env.VITE_API_URL;

const SALES_API =
  `${BASE_API}/sales-history`;

const PRODUCTS_API =
  `${BASE_API}/products`;


/* =========================================================
   PAYMENT METHOD
========================================================= */

const getPaymentMethod = (sale) => {

  const method =
    sale?.paymentMethod ||
    sale?.payment ||
    sale?.paymentType ||
    "";

  const normalized =
    String(method)
      .toLowerCase()
      .trim();


  if (
    normalized === "cash" ||
    normalized === "cash payment"
  ) {
    return "CASH";
  }


  if (
    normalized === "speedpoint" ||
    normalized === "card" ||
    normalized === "credit card" ||
    normalized === "debit card"
  ) {
    return "CARD";
  }


  return "N/A";
};


/* =========================================================
   PAYMENT ICON
========================================================= */

const PaymentIcon = ({
  method,
  size = 13
}) => {

  if (method === "CASH") {
    return (
      <Banknote
        size={size}
      />
    );
  }


  if (method === "CARD") {
    return (
      <CreditCard
        size={size}
      />
    );
  }


  return (
    <CircleHelp
      size={size}
    />
  );
};


/* =========================================================
   NORMALIZE PRODUCT ID
========================================================= */

const getProductId = (product) => {

  if (!product) {
    return "";
  }


  if (
    typeof product === "string"
  ) {
    return product;
  }


  return (
    product._id ||
    product.id ||
    product.productId ||
    ""
  )
    .toString();
};


/* =========================================================
   PRODUCT SIZE → LITERS
========================================================= */

/*
   IMPORTANT

   This converts ONE product unit
   into actual litres.

   WATER:

   500ml  → 0.5 L
   1L     → 1 L
   1.5L   → 1.5 L
   2L     → 2 L
   5L     → 5 L
   20L    → 20 L
   25L    → 25 L


   REFILL:

   Water Refill is sold PER LITER.

   1 quantity  → 1 L
   15 quantity → 15 L
   20 quantity → 20 L


   ICE:

   Does NOT contribute to water litres.


   OTHER:

   Does NOT contribute to water litres.
*/

const getProductLiters = (
  product
) => {

  if (!product) {
    return 0;
  }


  /* =======================================================
     CATEGORY
  ======================================================= */

  const category =
    String(
      product.category ||
      ""
    )
      .toLowerCase()
      .trim();


  /* =======================================================
     REFILL
  ======================================================= */

  if (
    category === "refill"
  ) {

    return 1;

  }


  /* =======================================================
     WATER
  ======================================================= */

  if (
    category === "water"
  ) {

    const possibleSize =
      product.size ||
      product.volume ||
      product.capacity ||
      "";


    const size =
      String(
        possibleSize
      )
        .replace(/,/g, ".")
        .trim()
        .toLowerCase();


    if (!size) {
      return 0;
    }


    const match =
      size.match(
        /(\d+(?:\.\d+)?)\s*(ml|milliliters?|l|liters?|litres?)/i
      );


    if (!match) {
      return 0;
    }


    const value =
      Number(
        match[1]
      );


    if (
      !Number.isFinite(
        value
      ) ||
      value <= 0
    ) {

      return 0;

    }


    const unit =
      String(
        match[2]
      )
        .toLowerCase();


    if (
      unit === "ml" ||
      unit.startsWith(
        "mill"
      )
    ) {

      return value / 1000;

    }


    return value;

  }


  /* =======================================================
     ICE / OTHER
  ======================================================= */

  return 0;
};


/* =========================================================
   PRODUCT NAME FALLBACK
========================================================= */

/*
   This is an additional safety net.

   If a refill comes back from the backend
   without category information, we can still
   recognise:

   "Water Refill per liter"
   "Water Refill"
   "Refill per liter"

   This does NOT override a real category.
*/

const looksLikeRefill = (
  product
) => {

  if (!product) {
    return false;
  }


  const category =
    String(
      product.category ||
      ""
    )
      .toLowerCase()
      .trim();


  if (
    category === "refill"
  ) {

    return true;

  }


  const name =
    String(
      product.name ||
      ""
    )
      .toLowerCase()
      .trim();


  return (
    name.includes(
      "water refill"
    ) ||
    name.includes(
      "refill per liter"
    ) ||
    name.includes(
      "refill per litre"
    )
  );
};


/* =========================================================
   SALE MODE
========================================================= */

const isPOSSale = (
  sale
) => {

  const mode =
    String(
      sale?.saleMode ||
      ""
    )
      .toLowerCase()
      .trim();


  return (
    mode === "pos" ||
    Array.isArray(
      sale?.items
    )
  );
};


/* =========================================================
   FIND PRODUCT
========================================================= */

/*
   A POS sale may contain:

   item.product = populated object

   OR

   item.product = ObjectId/string

   OR

   the product may be missing entirely.

   We handle all three cases.
*/

const findProductForItem = (
  item,
  products
) => {

  if (!item) {
    return null;
  }


  const embeddedProduct =
    item.product;


  /* -------------------------------------------------------
     Already populated
  ------------------------------------------------------- */

  if (
    embeddedProduct &&
    typeof embeddedProduct === "object"
  ) {

    return embeddedProduct;

  }


  /* -------------------------------------------------------
     Product ID
  ------------------------------------------------------- */

  const productId =
    getProductId(
      embeddedProduct
    );


  if (!productId) {
    return null;
  }


  /* -------------------------------------------------------
     Find from loaded products
  ------------------------------------------------------- */

  const found =
    products.find(
      (product) =>
        getProductId(
          product
        ) === productId
    );


  return found || null;
};


/* =========================================================
   EXACT SALE LITERS
========================================================= */

/*
   THIS IS THE MAIN CALCULATION.

   POS:

   Product is inspected.

   Refill:
   quantity × 1 L

   500ml:
   quantity × 0.5 L

   1.5L:
   quantity × 1.5 L

   2L:
   quantity × 2 L

   Ice:
   0 L

   Meter:

   sale.totalSold is already actual litres.
*/

const getSaleLiters = (
  sale,
  products = []
) => {

  if (!sale) {
    return 0;
  }


  /* =======================================================
     POS SALE
  ======================================================= */

  if (
    isPOSSale(sale) &&
    Array.isArray(
      sale.items
    ) &&
    sale.items.length > 0
  ) {

    let liters = 0;

    let foundVolumeProduct =
      false;


    sale.items.forEach(
      (item) => {

        const quantity =
          Number(
            item?.quantity || 0
          );


        if (
          !Number.isFinite(
            quantity
          ) ||
          quantity <= 0
        ) {

          return;

        }


        const product =
          findProductForItem(
            item,
            products
          );


        /* -------------------------------------------------
           REFILL
        ------------------------------------------------- */

        if (
          looksLikeRefill(
            product
          )
        ) {

          liters +=
            quantity;

          foundVolumeProduct =
            true;

          return;

        }


        /* -------------------------------------------------
           NORMAL PRODUCT
        ------------------------------------------------- */

        const litersPerUnit =
          getProductLiters(
            product
          );


        if (
          litersPerUnit > 0
        ) {

          foundVolumeProduct =
            true;

          liters +=
            quantity *
            litersPerUnit;

        }

      }
    );


    /* =====================================================
       RETURN CALCULATED POS VOLUME
    ===================================================== */

    if (
      foundVolumeProduct
    ) {

      return liters;

    }


    /* =====================================================
       FALLBACK TO BACKEND TOTAL

       This protects existing records
       where product information is unavailable.
    ===================================================== */

    return Number(
      sale.totalSold || 0
    );

  }


  /* =======================================================
     METER SALE
  ======================================================= */

  return Number(
    sale.totalSold || 0
  );
};


/* =========================================================
   FORMAT LITERS
========================================================= */

const formatLiters = (
  value
) => {

  const number =
    Number(
      value || 0
    );


  if (
    !Number.isFinite(
      number
    ) ||
    number <= 0
  ) {

    return "-";

  }


  const rounded =
    Number(
      number.toFixed(6)
    );


  return `${rounded} L`;
};


/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function EmployeeMySales() {

  const {
    theme
  } = useContext(
    ThemeContext
  );


  /* =======================================================
     SALES
  ======================================================= */

  const [
    sales,
    setSales
  ] = useState([]);


  const [
    filtered,
    setFiltered
  ] = useState([]);


  /* =======================================================
     PRODUCTS

     IMPORTANT:

     We load products separately because
     some historical POS sales may only
     contain the product ID.
  ======================================================= */

  const [
    products,
    setProducts
  ] = useState([]);


  /* =======================================================
     FILTERS
  ======================================================= */

  const [
    date,
    setDate
  ] = useState("");


  const [
    meterSearch,
    setMeterSearch
  ] = useState("");


  /* =======================================================
     STATUS
  ======================================================= */

  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    error,
    setError
  ] = useState("");


  /* =======================================================
     MONEY FORMAT
  ======================================================= */

  const formatMoney = (
    amount
  ) => {

    return new Intl.NumberFormat(
      "en-ZA",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    ).format(
      Number(
        amount
      ) || 0
    );

  };


  /* =======================================================
     LOAD SALES + PRODUCTS
  ======================================================= */

  const loadSales = async () => {

    try {

      setLoading(true);

      setError("");


      const token =
        localStorage.getItem(
          "token"
        );


      const headers = {
        Authorization:
          `Bearer ${token}`
      };


      /* ===================================================
         LOAD BOTH AT THE SAME TIME
      =================================================== */

      const [
        salesResponse,
        productsResponse
      ] = await Promise.all([
        fetch(
          `${SALES_API}/my-sales`,
          {
            headers
          }
        ),

        fetch(
          PRODUCTS_API,
          {
            headers
          }
        )
      ]);


      /* ===================================================
         SALES RESPONSE
      =================================================== */

      if (
        !salesResponse.ok
      ) {

        throw new Error(
          "Failed to load sales"
        );

      }


      const salesData =
        await salesResponse.json();


      /* ===================================================
         PRODUCTS RESPONSE

         Products are useful for exact
         POS volume calculation.

         If product loading fails, we
         still keep the sales working.
      =================================================== */

      let productsData =
        [];


      if (
        productsResponse.ok
      ) {

        const parsedProducts =
          await productsResponse.json();


        productsData =
          Array.isArray(
            parsedProducts
          )
            ? parsedProducts
            : [];

      }


      /* ===================================================
         NORMALIZE SALES
      =================================================== */

      const normalizedSales =
        Array.isArray(
          salesData
        )
          ? salesData
          : [];


      setProducts(
        productsData
      );


      setSales(
        normalizedSales
      );


      setFiltered(
        normalizedSales
      );

    } catch (
      fetchError
    ) {

      console.error(
        "Failed to load sales:",
        fetchError
      );


      setError(
        "Unable to load your sales records."
      );

    } finally {

      setLoading(false);

    }

  };


  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {

    loadSales();

  }, []);


  /* =======================================================
     FILTER SALES
  ======================================================= */

  useEffect(() => {

    let result = [
      ...sales
    ];


    /* =====================================================
       DATE FILTER
    ===================================================== */

    if (
      date
    ) {

      result =
        result.filter(
          (sale) => {

            const rawDate =
              sale?.createdAt ||
              sale?.date ||
              sale?.saleDate;


            if (!rawDate) {
              return false;
            }


            const saleDate =
              new Date(
                rawDate
              );


            if (
              Number.isNaN(
                saleDate.getTime()
              )
            ) {

              return false;

            }


            return (
              saleDate
                .toISOString()
                .split("T")[0] ===
              date
            );

          }
        );

    }


    /* =====================================================
       METER SEARCH
    ===================================================== */

    if (
      meterSearch.trim()
    ) {

      result =
        result.filter(
          (sale) => {

            const meterNumber =
              sale?.meter
                ?.meterNumber ||
              "";


            return String(
              meterNumber
            )
              .toLowerCase()
              .includes(
                meterSearch
                  .toLowerCase()
                  .trim()
              );

          }
        );

    }


    setFiltered(
      result
    );

  }, [
    date,
    meterSearch,
    sales
  ]);


  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const clearFilters =
    () => {

      setDate("");

      setMeterSearch("");

      setFiltered(
        sales
      );

    };


  /* =======================================================
     TOTAL REVENUE
  ======================================================= */

  const totalRevenue =
    useMemo(() => {

      return filtered.reduce(
        (
          sum,
          sale
        ) => {

          return (
            sum +
            Number(
              sale?.revenue ||
              0
            )
          );

        },
        0
      );

    }, [
      filtered
    ]);


  /* =======================================================
     TOTAL LITERS
  ======================================================= */

  const totalLiters =
    useMemo(() => {

      return filtered.reduce(
        (
          sum,
          sale
        ) => {

          return (
            sum +
            getSaleLiters(
              sale,
              products
            )
          );

        },
        0
      );

    }, [
      filtered,
      products
    ]);


  /* =======================================================
     LOADING
  ======================================================= */

  if (
    loading
  ) {

    return (

      <div
        style={{
          ...center,
          color:
            theme.text,
          background:
            theme.background
        }}
      >

        <RefreshCw
          size={22}
          style={
            loadingIcon
          }
        />

        <span>
          Loading sales...
        </span>


        <style>{`

          @keyframes employeeSalesSpin {

            from {
              transform:
                rotate(0deg);
            }

            to {
              transform:
                rotate(360deg);
            }

          }

        `}</style>

      </div>

    );

  }


  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <div
      style={{
        ...page(theme),
        className:
          "employee-sales-page"
      }}
      className="employee-sales-page"
    >

      {/* ===================================================
          HEADER
      =================================================== */}

      <div
        style={header}
      >

        <div
          style={
            titleIcon(theme)
          }
        >

          <FileText
            size={22}
            strokeWidth={2.2}
          />

        </div>


        <div
          style={
            titleContent
          }
        >

          <h1
            style={
              title(theme)
            }
          >
            My Sales History
          </h1>


          <p
            style={
              subtitle(theme)
            }
          >
            Review your sales records,
            revenue and exact water
            volume.
          </p>

        </div>

      </div>


      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (

        <div
          style={
            errorCard(theme)
          }
        >

          <CircleHelp
            size={20}
          />

          <span>
            {error}
          </span>

          <button
            type="button"
            style={
              retryButton(theme)
            }
            onClick={
              loadSales
            }
          >

            <RefreshCw
              size={15}
            />

            Retry

          </button>

        </div>

      )}


      {/* ===================================================
          SUMMARY
      =================================================== */}

      <div
        style={
          summaryGrid
        }
      >

        {/* =================================================
            REVENUE
        ================================================= */}

        <div
          style={
            summaryCard(theme)
          }
        >

          <div
            style={
              summaryIcon
            }
          >

            <DollarSign
              size={19}
              strokeWidth={2.2}
            />

          </div>


          <div
            style={
              summaryTitle
            }
          >
            Total Revenue
          </div>


          <div
            style={
              totalText
            }
          >
            R{" "}
            {formatMoney(
              totalRevenue
            )}
          </div>


          <div
            style={
              summarySubtext
            }
          >
            Filtered sales
          </div>

        </div>


        {/* =================================================
            WATER
        ================================================= */}

        <div
          style={
            summaryCard(theme)
          }
        >

          <div
            style={
              summaryIcon
            }
          >

            <Droplets
              size={19}
              strokeWidth={2.2}
            />

          </div>


          <div
            style={
              summaryTitle
            }
          >
            Total Water Sold
          </div>


          <div
            style={
              totalText
            }
          >
            {formatLiters(
              totalLiters
            )}
          </div>


          <div
            style={
              summarySubtext
            }
          >
            Exact water volume
          </div>

        </div>


        {/* =================================================
            SALES
        ================================================= */}

        <div
          style={
            summaryCard(theme)
          }
        >

          <div
            style={
              summaryIcon
            }
          >

            <BarChart3
              size={19}
              strokeWidth={2.2}
            />

          </div>


          <div
            style={
              summaryTitle
            }
          >
            Total Sales
          </div>


          <div
            style={
              totalText
            }
          >
            {filtered.length}
          </div>


          <div
            style={
              summarySubtext
            }
          >
            Records found
          </div>

        </div>

      </div>


      {/* ===================================================
          FILTERS
      =================================================== */}

      <div
        style={
          filterCard(theme)
        }
      >

        <div
          style={
            filterHeader
          }
        >

          <div
            style={
              filterTitleRow
            }
          >

            <div
              style={
                filterIcon(theme)
              }
            >

              <Search
                size={18}
                strokeWidth={2.2}
              />

            </div>


            <div>

              <h3
                style={
                  sectionTitle(theme)
                }
              >
                Sales Filters
              </h3>


              <p
                style={
                  sectionSubtitle(theme)
                }
              >
                Filter your sales history
              </p>

            </div>

          </div>

        </div>


        <div
          style={
            filterGrid
          }
        >

          {/* =================================================
              DATE
          ================================================= */}

          <div
            style={
              filterGroup
            }
          >

            <label
              style={
                label(theme)
              }
            >
              Date
            </label>


            <div
              style={
                inputWrapper(theme)
              }
            >

              <input
                type="date"
                style={
                  input(theme)
                }
                value={
                  date
                }
                onChange={
                  (event) =>
                    setDate(
                      event.target.value
                    )
                }
              />

            </div>

          </div>


          {/* =================================================
              METER
          ================================================= */}

          <div
            style={
              filterGroup
            }
          >

            <label
              style={
                label(theme)
              }
            >
              Search Meter
            </label>


            <div
              style={
                inputWrapper(theme)
              }
            >

              <Search
                size={16}
                color={
                  theme.textSecondary
                }
              />


              <input
                type="text"
                placeholder="Meter number..."
                style={
                  searchInput(theme)
                }
                value={
                  meterSearch
                }
                onChange={
                  (event) =>
                    setMeterSearch(
                      event.target.value
                    )
                }
              />

            </div>

          </div>


          {/* =================================================
              REFRESH
          ================================================= */}

          <button
            type="button"
            style={
              refreshBtn(theme)
            }
            onClick={
              loadSales
            }
          >

            <RefreshCw
              size={17}
            />

            <span>
              Refresh
            </span>

          </button>


          {/* =================================================
              CLEAR
          ================================================= */}

          <button
            type="button"
            style={
              clearBtn(theme)
            }
            onClick={
              clearFilters
            }
          >

            <X
              size={17}
            />

            <span>
              Clear
            </span>

          </button>

        </div>

      </div>


      {/* ===================================================
          SALES TABLE
      =================================================== */}

      <div
        style={
          tableCard(theme)
        }
      >

        {/* =================================================
            TABLE HEADER
        ================================================= */}

        <div
          style={
            tableHeader
          }
        >

          <div
            style={
              tableTitleRow
            }
          >

            <div
              style={
                tableIcon(theme)
              }
            >

              <Receipt
                size={18}
                strokeWidth={2.2}
              />

            </div>


            <div>

              <h3
                style={
                  sectionTitle(theme)
                }
              >
                Sales Records
              </h3>


              <p
                style={
                  sectionSubtitle(theme)
                }
              >
                Showing{" "}
                {filtered.length}{" "}
                sales record
                {filtered.length !== 1
                  ? "s"
                  : ""}
              </p>

            </div>

          </div>

        </div>


        {/* =================================================
            EMPTY
        ================================================= */}

        {filtered.length === 0 ? (

          <div
            style={
              empty(theme)
            }
          >

            <div
              style={
                emptyIcon(theme)
              }
            >

              <ShoppingCart
                size={34}
                strokeWidth={1.8}
              />

            </div>


            <div
              style={
                emptyTitle(theme)
              }
            >
              No sales found
            </div>


            <div
              style={
                emptyText(theme)
              }
            >
              Try changing your filters
              or refresh the page.
            </div>

          </div>

        ) : (

          <div
            className=
              "employee-sales-table-wrapper"
            style={
              tableWrapper
            }
          >

            <table
              style={
                table
              }
            >

              <thead>

                <tr
                  style={
                    thead(theme)
                  }
                >

                  <th
                    style={
                      th(theme)
                    }
                  >
                    Type
                  </th>


                  <th
                    style={
                      th(theme)
                    }
                  >
                    Liters
                  </th>


                  <th
                    style={
                      th(theme)
                    }
                  >
                    Revenue
                  </th>


                  <th
                    style={
                      th(theme)
                    }
                  >
                    Date
                  </th>

                </tr>

              </thead>


              <tbody>

                {filtered.map(
                  (
                    sale,
                    index
                  ) => {

                    /* =====================================
                       PAYMENT
                    ===================================== */

                    const paymentMethod =
                      getPaymentMethod(
                        sale
                      );


                    /* =====================================
                       EXACT LITERS

                       SAME FUNCTION USED BY
                       THE TOTAL AT THE TOP.
                    ===================================== */

                    const saleLiters =
                      getSaleLiters(
                        sale,
                        products
                      );


                    /* =====================================
                       DATE
                    ===================================== */

                    const saleDate =
                      sale?.createdAt ||
                      sale?.date ||
                      sale?.saleDate;


                    return (

                      <tr
                        key={
                          sale?._id ||
                          sale?.id ||
                          index
                        }
                        style={
                          row(theme)
                        }
                      >

                        {/* =================================
                            TYPE
                        ================================= */}

                        <td
                          style={
                            td(theme)
                          }
                        >

                          <span
                            style={
                              paymentBadge(
                                theme,
                                paymentMethod
                              )
                            }
                          >

                            <PaymentIcon
                              method={
                                paymentMethod
                              }
                              size={13}
                            />

                            <span>
                              {
                                paymentMethod
                              }
                            </span>

                          </span>

                        </td>


                        {/* =================================
                            LITERS
                        ================================= */}

                        <td
                          style={
                            td(theme)
                          }
                        >

                          <span
                            style={{
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              gap: 6,
                              fontWeight: 600
                            }}
                          >

                            <Droplets
                              size={14}
                              strokeWidth={2}
                            />

                            {formatLiters(
                              saleLiters
                            )}

                          </span>

                        </td>


                        {/* =================================
                            REVENUE
                        ================================= */}

                        <td
                          style={{
                            ...td(theme),
                            fontWeight: 700
                          }}
                        >

                          <span
                            style={
                              revenue(theme)
                            }
                          >

                            R{" "}
                            {formatMoney(
                              sale?.revenue
                            )}

                          </span>

                        </td>


                        {/* =================================
                            DATE
                        ================================= */}

                        <td
                          style={
                            td(theme)
                          }
                        >

                          <div
                            style={{
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              gap: 6
                            }}
                          >

                            <CalendarDays
                              size={14}
                            />

                            {saleDate
                              ? new Date(
                                  saleDate
                                ).toLocaleDateString(
                                  "en-ZA",
                                  {
                                    day:
                                      "2-digit",
                                    month:
                                      "short",
                                    year:
                                      "numeric"
                                  }
                                )
                              : "-"}

                          </div>

                        </td>

                      </tr>

                    );

                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* ===================================================
          MOBILE STYLES
      =================================================== */}

      <style>{`

        .employee-sales-page {
          width: 100%;
          box-sizing: border-box;
        }


        .employee-sales-table-wrapper {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }


        @media (max-width: 900px) {

          .employee-sales-page {
            padding: 18px !important;
          }

        }


        @media (max-width: 700px) {

          .employee-sales-page {
            padding: 14px !important;
          }


          .employee-sales-page table {
            min-width: 520px;
          }

        }


        @media (max-width: 520px) {

          .employee-sales-page {
            padding: 10px !important;
          }


          .employee-sales-page table {
            min-width: 500px;
          }

        }

      `}</style>

    </div>

  );

}


/* =========================================================
   PAGE
========================================================= */

const page = (theme) => ({
  width: "100%",
  minHeight: "100vh",
  padding:
    "clamp(10px, 3vw, 30px)",
  boxSizing: "border-box",
  color:
    theme.text,
  background:
    "transparent",
  overflowX:
    "hidden"
});


/* =========================================================
   HEADER
========================================================= */

const header = {
  display: "flex",
  alignItems: "flex-start",
  gap: 14,
  marginBottom: 25,
  width: "100%",
  boxSizing: "border-box"
};


const titleIcon = (
  theme
) => ({
  width: 42,
  height: 42,
  minWidth: 42,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    theme.darkMode
      ? "rgba(255,255,255,.10)"
      : "#e0f2fe",
  border:
    theme.darkMode
      ? "1px solid rgba(255,255,255,.12)"
      : "1px solid #bae6fd",
  color:
    theme.primary,
  boxSizing:
    "border-box",
  boxShadow:
    theme.darkMode
      ? "0 3px 10px rgba(0,0,0,.20)"
      : "0 3px 10px rgba(14,116,144,.12)"
});


const titleContent = {
  minWidth: 0,
  flex: 1
};


/* =========================================================
   TITLE
========================================================= */

const title = (
  theme
) => ({
  margin: 0,
  fontSize:
    "clamp(24px, 5vw, 32px)",
  lineHeight: 1.2,
  fontWeight: 800,
  color:
    theme.darkMode
      ? "#f8fafc"
      : "#0f172a",
  letterSpacing:
    "-0.5px",
  wordBreak:
    "break-word"
});


const subtitle = (
  theme
) => ({
  margin:
    "7px 0 0",
  color:
    theme.darkMode
      ? "#cbd5e1"
      : "#64748b",
  fontSize: 14,
  lineHeight: 1.5,
  maxWidth: 700
});


/* =========================================================
   SUMMARY
========================================================= */

const summaryGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 16,
  width: "100%",
  marginBottom: 25
};


const summaryCard = (
  theme
) => ({
  background:
    "linear-gradient(135deg, #2563eb, #1e3a8a)",
  color: "#ffffff",
  padding: 20,
  borderRadius: 16,
  boxSizing: "border-box",
  width: "100%",
  minWidth: 0,
  boxShadow:
    "0 8px 20px rgba(37,99,235,.20)"
});


const summaryIcon = {
  width: 38,
  height: 38,
  borderRadius: 10,
  background:
    "rgba(255,255,255,.18)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#ffffff",
  marginBottom: 12
};


const summaryTitle = {
  fontSize: 13,
  fontWeight: 600,
  color:
    "rgba(255,255,255,.85)"
};


const totalText = {
  fontSize:
    "clamp(24px, 6vw, 32px)",
  fontWeight: 800,
  marginTop: 6,
  lineHeight: 1.2,
  wordBreak:
    "break-word",
  color: "#ffffff"
};


const summarySubtext = {
  marginTop: 7,
  fontSize: 12,
  color:
    "rgba(255,255,255,.7)"
};


/* =========================================================
   ERROR
========================================================= */

const errorCard = (
  theme
) => ({
  display: "flex",
  alignItems: "center",
  gap: 10,
  width: "100%",
  marginBottom: 18,
  padding: "12px 14px",
  borderRadius: 12,
  boxSizing: "border-box",
  background:
    theme.darkMode
      ? "rgba(239,68,68,.14)"
      : "#fef2f2",
  border:
    theme.darkMode
      ? "1px solid rgba(239,68,68,.30)"
      : "1px solid #fecaca",
  color:
    theme.darkMode
      ? "#fca5a5"
      : "#991b1b"
});


const retryButton = (
  theme
) => ({
  marginLeft: "auto",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  border: "none",
  borderRadius: 8,
  padding: "8px 12px",
  background:
    theme.primary,
  color: "#ffffff",
  cursor: "pointer",
  fontWeight: 600
});


/* =========================================================
   FILTER CARD
========================================================= */

const filterCard = (
  theme
) => ({
  background:
    theme.card,
  border:
    `1px solid ${theme.border}`,
  padding:
    "clamp(15px, 3vw, 20px)",
  borderRadius: 16,
  boxShadow:
    "0 6px 18px rgba(0,0,0,.06)",
  marginBottom: 25,
  boxSizing:
    "border-box",
  width: "100%"
});


const filterHeader = {
  marginBottom: 16
};


const filterTitleRow = {
  display: "flex",
  alignItems: "center",
  gap: 11
};


const filterIcon = (
  theme
) => ({
  width: 38,
  height: 38,
  minWidth: 38,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    theme.cardSecondary,
  color:
    theme.primary,
  border:
    `1px solid ${theme.border}`
});


const filterGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
  width: "100%",
  alignItems: "end"
};


const filterGroup = {
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  width: "100%"
};


const label = (
  theme
) => ({
  marginBottom: 6,
  color:
    theme.text,
  fontSize: 13,
  fontWeight: 600
});


/* =========================================================
   INPUT
========================================================= */

const input = (
  theme
) => ({
  width: "100%",
  minWidth: 0,
  padding: "12px 13px",
  border:
    `1px solid ${theme.border}`,
  borderRadius: 9,
  fontSize: 15,
  boxSizing: "border-box",
  outline: "none",
  background:
    theme.input,
  color:
    theme.text
});


const inputWrapper = (
  theme
) => ({
  display: "flex",
  alignItems: "center",
  gap: 8,
  width: "100%",
  minWidth: 0,
  padding: "0 12px",
  border:
    `1px solid ${theme.border}`,
  borderRadius: 9,
  background:
    theme.input,
  boxSizing:
    "border-box"
});


const searchInput = (
  theme
) => ({
  flex: 1,
  width: "100%",
  minWidth: 0,
  padding:
    "12px 0",
  border: "none",
  outline: "none",
  background:
    "transparent",
  color:
    theme.text,
  fontSize: 15,
  boxSizing:
    "border-box"
});


/* =========================================================
   BUTTONS
========================================================= */

const refreshBtn = (
  theme
) => ({
  width: "100%",
  minWidth: 0,
  background:
    theme.primary,
  color: "#ffffff",
  border: "none",
  padding:
    "12px 18px",
  borderRadius: 9,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
  boxSizing:
    "border-box",
  display: "flex",
  alignItems: "center",
  justifyContent:
    "center",
  gap: 8
});


const clearBtn = (
  theme
) => ({
  width: "100%",
  minWidth: 0,
  background:
    theme.cardSecondary,
  color:
    theme.text,
  border:
    `1px solid ${theme.border}`,
  padding:
    "12px 18px",
  borderRadius: 9,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
  boxSizing:
    "border-box",
  display: "flex",
  alignItems: "center",
  justifyContent:
    "center",
  gap: 8
});


/* =========================================================
   SECTION TITLES
========================================================= */

const sectionTitle = (
  theme
) => ({
  margin: 0,
  fontSize: 18,
  fontWeight: 700,
  color:
    theme.text
});


const sectionSubtitle = (
  theme
) => ({
  margin:
    "5px 0 0",
  color:
    theme.textSecondary,
  fontSize: 13
});


/* =========================================================
   TABLE CARD
========================================================= */

const tableCard = (
  theme
) => ({
  background:
    theme.card,
  border:
    `1px solid ${theme.border}`,
  padding:
    "clamp(15px, 3vw, 20px)",
  borderRadius: 16,
  boxShadow:
    "0 8px 22px rgba(0,0,0,.07)",
  boxSizing:
    "border-box",
  width: "100%",
  overflow: "hidden"
});


const tableHeader = {
  marginBottom: 18
};


const tableTitleRow = {
  display: "flex",
  alignItems: "center",
  gap: 11
};


const tableIcon = (
  theme
) => ({
  width: 38,
  height: 38,
  minWidth: 38,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    theme.cardSecondary,
  color:
    theme.primary,
  border:
    `1px solid ${theme.border}`
});


/* =========================================================
   TABLE
========================================================= */

const tableWrapper = {
  width: "100%",
  overflowX: "auto",
  WebkitOverflowScrolling:
    "touch"
};


const table = {
  width: "100%",
  minWidth: 560,
  borderCollapse:
    "collapse"
};


const thead = (
  theme
) => ({
  background:
    theme.cardSecondary
});


const th = (
  theme
) => ({
  padding:
    "12px 10px",
  textAlign:
    "left",
  fontWeight: 700,
  fontSize: 13,
  color:
    theme.text,
  whiteSpace:
    "nowrap",
  borderBottom:
    `1px solid ${theme.border}`
});


const td = (
  theme
) => ({
  padding:
    "13px 10px",
  fontSize: 14,
  color:
    theme.text,
  borderTop:
    `1px solid ${theme.border}`,
  whiteSpace:
    "nowrap"
});


const row = (
  theme
) => ({
  transition:
    "background .2s"
});


/* =========================================================
   PAYMENT BADGE
========================================================= */

const paymentBadge = (
  theme,
  method
) => {

  let background;

  let color;


  /* =======================================================
     CASH
  ======================================================= */

  if (
    method === "CASH"
  ) {

    background =
      theme.darkMode
        ? "rgba(34,197,94,.18)"
        : "#dcfce7";

    color =
      theme.darkMode
        ? "#86efac"
        : "#166534";

  }


  /* =======================================================
     CARD
  ======================================================= */

  else if (
    method === "CARD"
  ) {

    background =
      theme.darkMode
        ? "rgba(59,130,246,.20)"
        : "#dbeafe";

    color =
      theme.darkMode
        ? "#93c5fd"
        : "#1e3a8a";

  }


  /* =======================================================
     UNKNOWN
  ======================================================= */

  else {

    background =
      theme.darkMode
        ? "rgba(148,163,184,.16)"
        : "#f1f5f9";

    color =
      theme.darkMode
        ? "#cbd5e1"
        : "#64748b";

  }


  return {

    display:
      "inline-flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    gap: 5,

    background,

    color,

    padding:
      "5px 10px",

    borderRadius:
      999,

    fontSize: 12,

    fontWeight: 700,

    whiteSpace:
      "nowrap"

  };

};


/* =========================================================
   REVENUE
========================================================= */

const revenue = (
  theme
) => ({
  color:
    theme.primary
});


/* =========================================================
   EMPTY STATE
========================================================= */

const empty = (
  theme
) => ({
  padding:
    "40px 20px",
  textAlign:
    "center",
  background:
    theme.cardSecondary,
  borderRadius: 12,
  color:
    theme.textSecondary
});


const emptyIcon = (
  theme
) => ({
  width: 52,
  height: 52,
  margin:
    "0 auto 12px",
  borderRadius: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    theme.input,
  color:
    theme.primary,
  border:
    `1px solid ${theme.border}`
});


const emptyTitle = (
  theme
) => ({
  fontSize: 16,
  fontWeight: 700,
  color:
    theme.text
});


const emptyText = (
  theme
) => ({
  marginTop: 5,
  fontSize: 13,
  color:
    theme.textSecondary
});


/* =========================================================
   LOADING
========================================================= */

const center = {
  display: "flex",
  justifyContent:
    "center",
  alignItems:
    "center",
  gap: 10,
  minHeight:
    "60vh",
  width: "100%",
  fontSize: 18,
  boxSizing:
    "border-box"
};


const loadingIcon = {
  animation:
    "employeeSalesSpin 1s linear infinite"
};