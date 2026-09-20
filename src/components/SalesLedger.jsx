import { useMemo, useState } from "react";
import { SearchIcon, DownloadIcon, TrashIcon, OrdersIcon, PlusIcon } from "./icons.jsx";
import { money, relativeDay } from "../utils/format.js";

const PAYMENT_FILTERS = ["All", "UPI", "Cash", "Card", "Due"];

export default function SalesLedger({ sales = [], onDeleteSale, onQuickAdd }) {
  const [query, setQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("all"); // all, today, week, month

  const filtered = useMemo(() => {
    const now = new Date();
    return sales
      .filter((s) => {
        const matchesQuery =
          s.productName.toLowerCase().includes(query.toLowerCase()) ||
          (s.customerName && s.customerName.toLowerCase().includes(query.toLowerCase())) ||
          (s.notes && s.notes.toLowerCase().includes(query.toLowerCase()));

        const matchesPayment =
          paymentFilter === "All" || (s.paymentMethod || "UPI") === paymentFilter;

        let matchesDate = true;
        const sDate = new Date(s.date);
        if (dateFilter === "today") {
          matchesDate = sDate.toDateString() === now.toDateString();
        } else if (dateFilter === "week") {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          matchesDate = sDate >= weekAgo;
        } else if (dateFilter === "month") {
          const monthAgo = new Date();
          monthAgo.setDate(monthAgo.getDate() - 30);
          matchesDate = sDate >= monthAgo;
        }

        return matchesQuery && matchesPayment && matchesDate;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [sales, query, paymentFilter, dateFilter]);

  const totalRevenue = useMemo(
    () => filtered.reduce((acc, s) => acc + (Number(s.amount) || 0), 0),
    [filtered]
  );

  function exportCSV() {
    if (filtered.length === 0) return;

    const headers = [
      "Order ID",
      "Date",
      "Product Name",
      "Quantity",
      "Total Amount",
      "Payment Method",
      "Customer Name",
      "Customer Phone",
      "Notes",
    ];

    const rows = filtered.map((s) => [
      `"${s.id || s._id || ""}"`,
      `"${new Date(s.date).toLocaleString()}"`,
      `"${s.productName.replace(/"/g, '""')}"`,
      s.quantity,
      s.amount,
      `"${s.paymentMethod || "UPI"}"`,
      `"${(s.customerName || "").replace(/"/g, '""')}"`,
      `"${s.customerPhone || ""}"`,
      `"${(s.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Growly_Sales_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <>
      <div className="view-header">
        <div>
          <h1 className="view-heading">Sales Ledger & Orders</h1>
          <p className="view-sub">
            {filtered.length} order{filtered.length === 1 ? "" : "s"} · Total revenue:{" "}
            <strong>{money(totalRevenue)}</strong>
          </p>
        </div>
        <div className="view-header-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={exportCSV}
            disabled={filtered.length === 0}
            title="Download CSV spreadsheet"
          >
            <DownloadIcon /> Export CSV
          </button>
          <button type="button" className="btn btn-primary" onClick={onQuickAdd}>
            <PlusIcon /> New Sale
          </button>
        </div>
      </div>

      <div className="search-field">
        <SearchIcon />
        <input
          placeholder="Search by customer, product, or note..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="filter-bar-combined">
        <div className="filter-row" style={{ margin: 0 }}>
          <button
            type="button"
            className={`filter-chip${dateFilter === "all" ? " is-active" : ""}`}
            onClick={() => setDateFilter("all")}
          >
            All Time
          </button>
          <button
            type="button"
            className={`filter-chip${dateFilter === "today" ? " is-active" : ""}`}
            onClick={() => setDateFilter("today")}
          >
            Today
          </button>
          <button
            type="button"
            className={`filter-chip${dateFilter === "week" ? " is-active" : ""}`}
            onClick={() => setDateFilter("week")}
          >
            This Week
          </button>
          <button
            type="button"
            className={`filter-chip${dateFilter === "month" ? " is-active" : ""}`}
            onClick={() => setDateFilter("month")}
          >
            This Month
          </button>
        </div>

        <div className="filter-row" style={{ margin: 0 }}>
          {PAYMENT_FILTERS.map((pm) => (
            <button
              key={pm}
              type="button"
              className={`filter-chip filter-chip-sm${paymentFilter === pm ? " is-active" : ""}`}
              onClick={() => setPaymentFilter(pm)}
            >
              {pm}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <OrdersIcon />
          <p className="empty-state-title">No orders found</p>
          <p className="empty-state-body">
            {query || paymentFilter !== "All" || dateFilter !== "all"
              ? "No transactions match your active filters."
              : "Record your first sale to start building your sales ledger."}
          </p>
          {!query && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={onQuickAdd}
              style={{ marginTop: 12 }}
            >
              <PlusIcon /> Quick Add Sale
            </button>
          )}
        </div>
      ) : (
        <div className="list-card">
          {filtered.map((s) => {
            const id = s.id || s._id;
            return (
              <div className="sale-row" key={id}>
                <div className="sale-avatar">
                  {s.productName ? s.productName.charAt(0).toUpperCase() : "•"}
                </div>
                <div className="sale-info">
                  <div className="sale-name-row">
                    <span className="sale-name">{s.productName}</span>
                    <span className="badge badge-subtle">{s.paymentMethod || "UPI"}</span>
                  </div>
                  <div className="sale-meta">
                    {relativeDay(s.date)} · Qty {s.quantity} · {s.customerName || "Walk-in"}
                    {s.customerPhone ? ` (${s.customerPhone})` : ""}
                  </div>
                  {s.notes && <div className="sale-notes-preview">“{s.notes}”</div>}
                </div>
                <div className="sale-amount-col">
                  <div className="sale-amount">{money(s.amount)}</div>
                  {onDeleteSale && (
                    <button
                      type="button"
                      className="icon-btn-sm text-faint"
                      onClick={() => onDeleteSale(id)}
                      title="Delete order"
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
