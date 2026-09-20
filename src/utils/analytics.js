const DAY = 86400000;

export const PERIODS = [
  { id: "daily", label: "Daily", heroDays: 1, bucketDays: 1, bucketCount: 14 },
  { id: "weekly", label: "Weekly", heroDays: 7, bucketDays: 7, bucketCount: 8 },
  { id: "monthly", label: "Monthly", heroDays: 30, bucketDays: 30, bucketCount: 6 },
  { id: "yearly", label: "Yearly", heroDays: 365, bucketDays: 30, bucketCount: 12 },
];

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function sumInWindow(sales, fromMs, toMs) {
  let total = 0;
  let orders = 0;
  let items = 0;
  for (const s of sales) {
    const t = new Date(s.date).getTime();
    if (t >= fromMs && t < toMs) {
      total += s.amount;
      orders += 1;
      items += s.quantity;
    }
  }
  return { total, orders, items };
}

export function periodSummary(sales, periodId) {
  const period = PERIODS.find((p) => p.id === periodId) || PERIODS[0];
  const now = startOfToday() + DAY; // end-exclusive boundary = start of tomorrow
  const currentFrom = now - period.heroDays * DAY;
  const prevFrom = currentFrom - period.heroDays * DAY;

  const current = sumInWindow(sales, currentFrom, now);
  const previous = sumInWindow(sales, prevFrom, currentFrom);

  const delta = previous.total > 0
    ? Math.round(((current.total - previous.total) / previous.total) * 100)
    : current.total > 0 ? 100 : 0;

  const series = [];
  for (let i = period.bucketCount - 1; i >= 0; i--) {
    const bucketTo = now - i * period.bucketDays * DAY;
    const bucketFrom = bucketTo - period.bucketDays * DAY;
    const { total } = sumInWindow(sales, bucketFrom, bucketTo);
    series.push({ label: bucketTo - DAY, value: total });
  }

  return {
    period,
    total: current.total,
    orders: current.orders,
    items: current.items,
    avg: current.orders ? current.total / current.orders : 0,
    delta,
    series,
  };
}

export function productLeaderboard(sales, sinceDays = 30) {
  const now = startOfToday() + DAY;
  const from = now - sinceDays * DAY;
  const map = new Map();
  for (const s of sales) {
    const t = new Date(s.date).getTime();
    if (t < from || t >= now) continue;
    const entry = map.get(s.productName) || { name: s.productName, revenue: 0, orders: 0 };
    entry.revenue += s.amount;
    entry.orders += s.quantity;
    map.set(s.productName, entry);
  }
  return [...map.values()].sort((a, b) => b.revenue - a.revenue);
}
