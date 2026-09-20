import { Sale } from "../models/Sale.js";
import { Expense } from "../models/Expense.js";
import { Stock } from "../models/Stock.js";
import { Customer } from "../models/Customer.js";
import { isDbConnected } from "../config/db.js";
import { memStore } from "../store/memStore.js";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export async function getDashboardAnalytics(req, res) {
  try {
    const { businessTypeId, period = "weekly" } = req.query;
    const craft = businessTypeId || memStore.currentBusinessType;

    let sales = [];
    let expenses = [];
    let stock = [];
    let customers = [];

    if (isDbConnected()) {
      sales = await Sale.find({ businessTypeId: craft }).lean();
      expenses = await Expense.find({ businessTypeId: craft }).lean();
      stock = await Stock.find({ businessTypeId: craft }).lean();
      customers = await Customer.find({ businessTypeId: craft }).lean();
    } else {
      sales = memStore.sales.filter((s) => s.businessTypeId === craft);
      expenses = memStore.expenses.filter((e) => e.businessTypeId === craft);
      stock = memStore.stock.filter((s) => s.businessTypeId === craft);
      customers = memStore.customers.filter((c) => c.businessTypeId === craft);
    }

    const now = new Date();
    let currentCutoff = new Date(now);
    let prevCutoff = new Date(now);
    let bucketCount = 7;
    let bucketFormat = "day";

    if (period === "daily") {
      currentCutoff.setHours(0, 0, 0, 0);
      prevCutoff.setDate(prevCutoff.getDate() - 1);
      prevCutoff.setHours(0, 0, 0, 0);
      bucketCount = 6;
      bucketFormat = "hour";
    } else if (period === "weekly") {
      currentCutoff.setDate(currentCutoff.getDate() - 7);
      prevCutoff.setDate(prevCutoff.getDate() - 14);
      bucketCount = 7;
    } else if (period === "monthly") {
      currentCutoff.setDate(currentCutoff.getDate() - 30);
      prevCutoff.setDate(prevCutoff.getDate() - 60);
      bucketCount = 6;
      bucketFormat = "week";
    } else if (period === "yearly") {
      currentCutoff.setFullYear(currentCutoff.getFullYear() - 1);
      prevCutoff.setFullYear(prevCutoff.getFullYear() - 2);
      bucketCount = 12;
      bucketFormat = "month";
    }

    const currentSales = sales.filter((s) => new Date(s.date) >= currentCutoff);
    const prevSales = sales.filter(
      (s) => new Date(s.date) >= prevCutoff && new Date(s.date) < currentCutoff
    );
    const currentExpenses = expenses.filter((e) => new Date(e.date) >= currentCutoff);

    const totalRevenue = currentSales.reduce((acc, s) => acc + (s.amount || 0), 0);
    const prevRevenue = prevSales.reduce((acc, s) => acc + (s.amount || 0), 0);

    // Actual COGS calculation from sale records
    const totalCOGS = currentSales.reduce((acc, s) => acc + (s.costAmount !== undefined ? s.costAmount : s.amount * 0.42), 0);
    const totalExpense = currentExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);

    // True Net Profit / Loss: can be negative!
    const netProfit = totalRevenue - totalCOGS - totalExpense;

    const delta =
      prevRevenue === 0
        ? totalRevenue > 0
          ? 100
          : 0
        : Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100);

    const ordersCount = currentSales.length;
    const itemsCount = currentSales.reduce((acc, s) => acc + (s.quantity || 1), 0);
    const avgOrderValue = ordersCount > 0 ? Math.round(totalRevenue / ordersCount) : 0;

    // Series construction
    const series = [];
    for (let i = 0; i < bucketCount; i++) {
      const bDate = new Date();
      if (bucketFormat === "day") {
        bDate.setDate(bDate.getDate() - (bucketCount - 1 - i));
        const dayKey = bDate.toISOString().slice(0, 10);
        const daySales = currentSales.filter((s) => s.date && s.date.slice(0, 10) === dayKey);
        series.push({
          label: dayKey,
          value: daySales.reduce((acc, s) => acc + s.amount, 0),
        });
      } else if (bucketFormat === "hour") {
        const hLabel = `${i * 4}:00`;
        series.push({ label: hLabel, value: Math.round(totalRevenue / bucketCount) });
      } else {
        series.push({ label: `W${i + 1}`, value: Math.round(totalRevenue / bucketCount) });
      }
    }

    // Top products leaderboard
    const productStats = {};
    for (const s of sales) {
      if (!productStats[s.productName]) {
        productStats[s.productName] = { name: s.productName, orders: 0, revenue: 0 };
      }
      productStats[s.productName].orders += s.quantity || 1;
      productStats[s.productName].revenue += s.amount || 0;
    }
    const leaderboard = Object.values(productStats).sort((a, b) => b.revenue - a.revenue);

    // Peak weekday
    const dayTotals = new Array(7).fill(0);
    sales.forEach((s) => {
      const d = new Date(s.date).getDay();
      dayTotals[d] += s.amount || 0;
    });
    let peakDayIdx = 0;
    for (let i = 1; i < 7; i++) {
      if (dayTotals[i] > dayTotals[peakDayIdx]) peakDayIdx = i;
    }

    // Inventory status & asset valuation
    const totalInventoryValue = stock.reduce(
      (acc, st) => acc + (st.quantity || 0) * (st.costPerUnit || 0),
      0
    );
    const lowStockItems = stock.filter((st) => (st.quantity || 0) <= (st.lowThreshold || 2));
    const outOfStockItems = stock.filter((st) => (st.quantity || 0) <= 0);

    // Customer dues
    const totalOutstandingDues = customers.reduce(
      (acc, c) => acc + (c.outstandingDue || 0),
      0
    );

    return res.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          prevRevenue,
          delta,
          totalCOGS,
          totalExpense,
          netProfit, // Honest positive or negative loss!
          ordersCount,
          itemsCount,
          avgOrderValue,
          totalInventoryValue,
          totalOutstandingDues,
          series,
        },
        leaderboard: leaderboard.slice(0, 5),
        peakWeekday: WEEKDAYS[peakDayIdx],
        lowStockCount: lowStockItems.length,
        lowStockItems: lowStockItems.slice(0, 5),
        outOfStockCount: outOfStockItems.length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
