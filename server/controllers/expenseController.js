import { Expense } from "../models/Expense.js";
import { isDbConnected } from "../config/db.js";
import { memStore } from "../store/memStore.js";

export async function getExpenses(req, res) {
  try {
    const { businessTypeId } = req.query;
    const craft = businessTypeId || memStore.currentBusinessType;

    if (isDbConnected()) {
      const expenses = await Expense.find({ businessTypeId: craft }).sort({ date: -1 });
      return res.json({ success: true, data: expenses });
    }

    const filtered = memStore.expenses.filter((e) => e.businessTypeId === craft);
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    return res.json({ success: true, data: filtered });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createExpense(req, res) {
  try {
    const { title, category, amount, notes, date, businessTypeId } = req.body;
    const craft = businessTypeId || memStore.currentBusinessType;

    if (!title || amount === undefined) {
      return res.status(400).json({ success: false, message: "Title and amount are required" });
    }

    if (isDbConnected()) {
      const expense = await Expense.create({
        title,
        category: category || "Other",
        amount: Number(amount),
        notes: notes || "",
        date: date ? new Date(date) : new Date(),
        businessTypeId: craft,
      });
      return res.status(201).json({ success: true, data: expense });
    }

    const newExp = {
      id: "exp_" + Date.now(),
      title,
      category: category || "Other",
      amount: Number(amount),
      notes: notes || "",
      date: date || new Date().toISOString(),
      businessTypeId: craft,
    };
    memStore.expenses.unshift(newExp);
    return res.status(201).json({ success: true, data: newExp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteExpense(req, res) {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      await Expense.findByIdAndDelete(id);
      return res.json({ success: true, message: "Expense deleted" });
    }

    memStore.expenses = memStore.expenses.filter((e) => e.id !== id && e._id !== id);
    return res.json({ success: true, message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
