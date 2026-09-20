import { useMemo } from "react";
import { periodSummary, productLeaderboard } from "../utils/analytics.js";
import { money, compactMoney } from "../utils/format.js";
import { InsightsIcon } from "./icons.jsx";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function bestWeekday(sales) {
  if (!sales.length) return null;
  const totals = new Array(7).fill(0);
  const counts = new Array(7).fill(0);
  for (const s of sales) {
    const day = new Date(s.date).getDay();
    totals[day] += s.amount;
    counts[day] += 1;
  }
  let bestIdx = 0;
  for (let i = 1; i < 7; i++) {
    if (totals[i] > totals[bestIdx]) bestIdx = i;
  }
  return counts[bestIdx] ? WEEKDAYS[bestIdx] : null;
}

export default function Insights({ sales = [], stock = [], products = [], expenses = [], businessType }) {
  const week = useMemo(() => periodSummary(sales, "weekly"), [sales]);
  const month = useMemo(() => periodSummary(sales, "monthly"), [sales]);
  const leaderboard = useMemo(() => productLeaderboard(sales, 30), [sales]);
  const lowStock = useMemo(() => stock.filter((s) => s.quantity <= (s.lowThreshold || 2)), [stock]);
  const bestDay = useMemo(() => bestWeekday(sales), [sales]);

  const soldNames = new Set(leaderboard.map((l) => l.name));
  const slowMovers = products.filter((p) => p.active && !soldNames.has(p.name));

  const totalExpenses = useMemo(
    () => expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0),
    [expenses]
  );

  const cards = [];

  if (week.delta !== 0) {
    cards.push({
      type: week.delta > 0 ? "growth" : "alert",
      title: week.delta > 0
        ? `Revenue is up ${week.delta}% this week`
        : `Revenue is down ${Math.abs(week.delta)}% this week`,
      body: `You've made ${money(week.total)} across ${week.orders} ${
        businessType?.unitPlural || "orders"
      } this week, compared with the preceding 7 days.`,
    });
  }

  if (leaderboard[0]) {
    cards.push({
      type: "info",
      title: `${leaderboard[0].name} is your #1 best seller`,
      body: `It generated ${money(leaderboard[0].revenue)} across ${
        leaderboard[0].orders
      } units over the last 30 days. Consider featuring it prominently.`,
    });
  }

  if (lowStock.length) {
    cards.push({
      type: "alert",
      title:
        lowStock.length === 1
          ? `${lowStock[0].name} is running low on stock`
          : `${lowStock.length} materials need restocking soon`,
      body:
        lowStock.length === 1
          ? `Only ${lowStock[0].quantity} ${lowStock[0].unit} remaining (alert threshold: ${lowStock[0].lowThreshold || 2} ${lowStock[0].unit}). Restock now to prevent fulfilling delays.`
          : `${lowStock
              .slice(0, 3)
              .map((s) => s.name)
              .join(", ")}${lowStock.length > 3 ? ` and ${lowStock.length - 3} others` : ""} are below critical thresholds.`,
    });
  }

  if (bestDay) {
    cards.push({
      type: "info",
      title: `${bestDay} is your peak sales day`,
      body: `Revenue historically clusters around ${bestDay}s. Schedule your social posts, promotional updates, and stock prep 24 hours prior.`,
    });
  }

  if (month.total > 0 && totalExpenses > 0) {
    const expenseRatio = Math.round((totalExpenses / month.total) * 100);
    cards.push({
      type: expenseRatio < 40 ? "growth" : "alert",
      title: `Expense ratio is at ~${expenseRatio}% of revenue`,
      body: `Recorded operational overhead is ${money(totalExpenses)} against ${money(
        month.total
      )} monthly gross revenue. Maintaining this ratio preserves healthy cash reserves.`,
    });
  }

  if (slowMovers.length) {
    cards.push({
      type: "info",
      title:
        slowMovers.length === 1
          ? `"${slowMovers[0].name}" hasn't sold this month`
          : `${slowMovers.length} catalog items haven't sold recently`,
      body: "Try testing a bundled offer, a price refresh, or highlighting these items in your upcoming showcase.",
    });
  }

  return (
    <>
      <div className="view-header">
        <div>
          <h1 className="view-heading">Intelligent Growth Insights</h1>
          <p className="view-sub">Heuristics & data-driven patterns from the last 30 days</p>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="empty-state">
          <InsightsIcon />
          <p className="empty-state-title">Not enough transaction history</p>
          <p className="empty-state-body">
            Log a few sales and operational expenses, and Growly will automatically compute trends.
          </p>
        </div>
      ) : (
        cards.map((c, i) => (
          <div className="insight-card" key={i}>
            <span className={`insight-icon ${c.type}`}>
              <InsightsIcon />
            </span>
            <div>
              <div className="insight-title">{c.title}</div>
              <div className="insight-body">{c.body}</div>
            </div>
          </div>
        ))
      )}

      {leaderboard.length > 0 && (
        <div className="section">
          <div className="section-head">
            <h2 className="section-title">Top products by 30-day revenue</h2>
          </div>
          <div className="list-card">
            {leaderboard.slice(0, 5).map((p) => (
              <div className="item-row" key={p.name}>
                <div className="item-main">
                  <div className="item-name">{p.name}</div>
                  <div className="item-sub">{p.orders} units sold</div>
                </div>
                <div className="item-value">{compactMoney(p.revenue)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
