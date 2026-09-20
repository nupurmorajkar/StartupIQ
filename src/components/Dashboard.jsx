import { useMemo, useState } from "react";
import { PERIODS, periodSummary } from "../utils/analytics.js";
import { money, compactMoney, relativeDay, shortDate } from "../utils/format.js";
import { SparkArea, BarChart } from "./Charts.jsx";
import { PlusIcon, ExpenseIcon, BoxOpenIcon, OrdersIcon, ProductsIcon } from "./icons.jsx";

function initial(name) {
  return name ? name.trim().charAt(0).toUpperCase() : "•";
}

export default function Dashboard({
  sales = [],
  expenses = [],
  stock = [],
  customers = [],
  products = [],
  businessType,
  onQuickAdd,
  onNavigate,
}) {
  const [periodId, setPeriodId] = useState("weekly");
  const [metricMode, setMetricMode] = useState("revenue"); // "revenue" or "profit"

  const summary = useMemo(() => periodSummary(sales, periodId), [sales, periodId]);
  const recent = useMemo(() => sales.slice(0, 6), [sales]);

  // Financial Calculations with True BOM COGS & Operating Expenses
  const { periodExpense, periodCOGS, netProfit, isLoss, profitMargin } = useMemo(() => {
    const totalExp = expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

    // Filter sales to selected period
    const now = new Date();
    let cutoff = new Date(now);
    if (periodId === "daily") {
      cutoff.setHours(0, 0, 0, 0);
    } else if (periodId === "weekly") {
      cutoff.setDate(cutoff.getDate() - 7);
    } else if (periodId === "monthly") {
      cutoff.setDate(cutoff.getDate() - 30);
    } else {
      cutoff.setFullYear(cutoff.getFullYear() - 1);
    }

    const periodSales = sales.filter((s) => new Date(s.date) >= cutoff);
    const cogs = periodSales.reduce(
      (acc, s) => acc + (s.costAmount !== undefined ? s.costAmount : s.amount * 0.42),
      0
    );

    // True Net Profit: Can be negative!
    const profit = summary.total - cogs - totalExp * (periodId === "daily" ? 0.05 : periodId === "weekly" ? 0.25 : 1);
    const roundedProfit = Math.round(profit);
    const margin = summary.total > 0 ? Math.round((roundedProfit / summary.total) * 100) : 0;

    return {
      periodExpense: Math.round(totalExp),
      periodCOGS: Math.round(cogs),
      netProfit: roundedProfit,
      isLoss: roundedProfit < 0,
      profitMargin: margin,
    };
  }, [summary.total, sales, expenses, periodId]);

  // Alerts & Metrics
  const lowStockCount = useMemo(
    () => stock.filter((s) => (s.quantity || 0) <= (s.lowThreshold || 2)).length,
    [stock]
  );

  const totalOutstandingDue = useMemo(
    () => customers.reduce((acc, c) => acc + (Number(c.outstandingDue) || 0), 0),
    [customers]
  );

  const totalInventoryValuation = useMemo(
    () => stock.reduce((acc, s) => acc + (s.quantity || 0) * (s.costPerUnit || 0), 0),
    [stock]
  );

  const captionFirst = summary.series[0] ? shortDate(summary.series[0].label) : "";
  const captionLast = summary.series[summary.series.length - 1]
    ? shortDate(summary.series[summary.series.length - 1].label)
    : "";

  const periodNoun = {
    daily: "today",
    weekly: "this week",
    monthly: "this month",
    yearly: "this year",
  }[periodId];

  return (
    <>
      <div className="view-header">
        <div>
          <h1 className="view-heading">Dashboard</h1>
          <p className="view-sub">
            {businessType?.name || "Workspace"} · Performance overview {periodNoun}
          </p>
        </div>
        <div className="view-header-actions">
          <button type="button" className="btn btn-secondary" onClick={() => onNavigate("expenses")}>
            <ExpenseIcon /> Log Expense
          </button>
          <button type="button" className="btn btn-primary" onClick={onQuickAdd}>
            <PlusIcon /> Quick Add Sale
          </button>
        </div>
      </div>

      {/* 2. What needs attention? (Alerts Bar) */}
      <div className="attention-bar">
        {lowStockCount > 0 && (
          <div
            className="alert-banner"
            onClick={() => onNavigate("stock")}
            role="button"
            tabIndex={0}
            style={{ cursor: "pointer", margin: 0 }}
          >
            <BoxOpenIcon />
            <span>
              <strong>Inventory Alert:</strong> {lowStockCount} material{lowStockCount > 1 ? "s are" : " is"} running low.
            </span>
            <span className="alert-link">Restock Stock →</span>
          </div>
        )}

        {totalOutstandingDue > 0 && (
          <div
            className="alert-banner alert-banner-due"
            onClick={() => onNavigate("customers")}
            role="button"
            tabIndex={0}
            style={{ cursor: "pointer", margin: 0 }}
          >
            <OrdersIcon />
            <span>
              <strong>Receivables Notice:</strong> {money(totalOutstandingDue)} in pending customer dues.
            </span>
            <span className="alert-link">Collect Dues →</span>
          </div>
        )}
      </div>

      {/* 3. What should I do next? (Quick Actions Bar) */}
      <div className="quick-actions-bar">
        <span className="quick-actions-label">Quick Actions:</span>
        <button type="button" className="quick-action-btn" onClick={onQuickAdd}>
          <PlusIcon /> Record Sale
        </button>
        <button type="button" className="quick-action-btn" onClick={() => onNavigate("stock")}>
          <BoxOpenIcon /> Add Material
        </button>
        <button type="button" className="quick-action-btn" onClick={() => onNavigate("expenses")}>
          <ExpenseIcon /> Add Expense
        </button>
        <button type="button" className="quick-action-btn" onClick={() => onNavigate("products")}>
          <ProductsIcon /> Add Product
        </button>
      </div>

      {/* 1. How is my business doing? (Main Grid) */}
      <div className="dashboard-grid">
        <div>
          <div className="hero">
            <div className="hero-top">
              <div className="hero-mode-toggles">
                <button
                  type="button"
                  className={`hero-toggle-btn ${metricMode === "revenue" ? "is-active" : ""}`}
                  onClick={() => setMetricMode("revenue")}
                >
                  Gross Revenue
                </button>
                <button
                  type="button"
                  className={`hero-toggle-btn ${metricMode === "profit" ? "is-active" : ""}`}
                  onClick={() => setMetricMode("profit")}
                >
                  True Net Profit / Loss
                </button>
              </div>

              <span className={`hero-delta${summary.delta < 0 ? " is-down" : ""}`}>
                {summary.delta >= 0 ? "▲" : "▼"} {Math.abs(summary.delta)}% vs prev
              </span>
            </div>

            <div
              className="hero-amount"
              style={{
                color: metricMode === "profit" && isLoss ? "var(--danger-tint)" : undefined,
              }}
            >
              {metricMode === "revenue" ? money(summary.total) : money(netProfit)}
            </div>

            <div className="hero-subline">
              {metricMode === "revenue" ? (
                `${summary.orders} transactions recorded ${periodNoun}`
              ) : isLoss ? (
                `⚠️ Operating at a Net Loss of ${money(Math.abs(netProfit))} after BOM COGS & expenses.`
              ) : (
                `~${profitMargin}% net margin after subtracting actual BOM COGS & overhead expenses.`
              )}
            </div>

            <div className="hero-chart">
              <SparkArea series={summary.series} />
            </div>

            <div className="period-row" role="tablist" aria-label="Time period">
              {PERIODS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={periodId === p.id}
                  className={`period-pill${periodId === p.id ? " is-active" : ""}`}
                  onClick={() => setPeriodId(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="section">
            <div className="section-head">
              <h2 className="section-title">Sales trend</h2>
              <span className="eyebrow">Hover bars for dates & amounts</span>
            </div>
            <div className="bar-chart">
              <BarChart series={summary.series} />
              <div className="bar-chart-caption">
                <span>{captionFirst}</span>
                <span>{captionLast}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Business Key Indicators */}
        <div className="stat-row">
          <div className="stat-chip">
            <div className="stat-chip-value">{summary.orders}</div>
            <div className="stat-chip-label">
              {businessType?.unitPlural || "orders"} {periodNoun}
            </div>
          </div>

          <div className="stat-chip">
            <div className="stat-chip-value">{compactMoney(summary.avg)}</div>
            <div className="stat-chip-label">Average order value</div>
          </div>

          <div className="stat-chip" onClick={() => onNavigate("stock")} style={{ cursor: "pointer" }}>
            <div className="stat-chip-value">{compactMoney(totalInventoryValuation)}</div>
            <div className="stat-chip-label">Inventory asset value</div>
          </div>

          <div className="stat-chip" onClick={() => onNavigate("customers")} style={{ cursor: "pointer" }}>
            <div
              className="stat-chip-value"
              style={{ color: totalOutstandingDue > 0 ? "var(--alert)" : undefined }}
            >
              {compactMoney(totalOutstandingDue)}
            </div>
            <div className="stat-chip-label">Pending customer dues</div>
          </div>

          <div className="stat-chip" onClick={() => onNavigate("expenses")} style={{ cursor: "pointer" }}>
            <div className="stat-chip-value">{compactMoney(periodExpense)}</div>
            <div className="stat-chip-label">Total recorded overhead</div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="section">
        <div className="section-head">
          <h2 className="section-title">Recent sales</h2>
          {recent.length > 0 && (
            <button
              type="button"
              className="text-btn"
              onClick={() => onNavigate("orders")}
            >
              View all orders ({sales.length}) →
            </button>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-title">No transactions recorded yet</p>
            <p className="empty-state-body">
              Log your first customer order or credit sale to populate your live metrics.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onQuickAdd}
              style={{ marginTop: 12 }}
            >
              <PlusIcon /> Quick Add Sale
            </button>
          </div>
        ) : (
          <div className="list-card">
            {recent.map((s) => (
              <div className="sale-row" key={s.id || s._id}>
                <div className="sale-avatar">{initial(s.productName)}</div>
                <div className="sale-info">
                  <div className="sale-name-row">
                    <span className="sale-name">{s.productName}</span>
                    <span className={`badge ${s.paymentMethod === "Due" ? "badge-alert" : "badge-subtle"}`}>
                      {s.paymentMethod || "UPI"}
                    </span>
                  </div>
                  <div className="sale-meta">
                    {relativeDay(s.date)} · Qty {s.quantity} · {s.customerName || "Walk-in"}
                  </div>
                </div>
                <div className="sale-amount">{money(s.amount)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
