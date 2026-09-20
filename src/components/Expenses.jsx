import { useMemo, useState } from "react";
import { PlusIcon, TrashIcon, ExpenseIcon } from "./icons.jsx";
import { money, relativeDay } from "../utils/format.js";
import Modal from "./Modal.jsx";

const CATEGORIES = [
  "Raw Materials",
  "Packaging",
  "Rent & Utilities",
  "Marketing",
  "Equipment",
  "Delivery",
  "Other",
];

export default function Expenses({ expenses = [], onAddExpense, onDeleteExpense }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Packaging");
  const [notes, setNotes] = useState("");

  const totalExpense = useMemo(
    () => expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0),
    [expenses]
  );

  const categoryTotals = useMemo(() => {
    const map = {};
    for (const e of expenses) {
      map[e.category] = (map[e.category] || 0) + Number(e.amount);
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  function handleSave() {
    if (!title.trim() || !amount || Number(amount) <= 0) return;
    onAddExpense({
      title: title.trim(),
      amount: Number(amount),
      category,
      notes: notes.trim(),
      date: new Date().toISOString(),
    });
    setTitle("");
    setAmount("");
    setNotes("");
    setAdding(false);
  }

  return (
    <>
      <div className="view-header">
        <div>
          <h1 className="view-heading">Expenses & Overhead</h1>
          <p className="view-sub">
            {expenses.length} expense entries · Total spend: <strong>{money(totalExpense)}</strong>
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}>
          <PlusIcon /> Add Expense
        </button>
      </div>

      {categoryTotals.length > 0 && (
        <div className="category-chips-row">
          {categoryTotals.map(([cat, amt]) => (
            <div key={cat} className="stat-chip-sm">
              <span className="stat-cat-label">{cat}</span>
              <span className="stat-cat-val">{money(amt)}</span>
            </div>
          ))}
        </div>
      )}

      {expenses.length === 0 ? (
        <div className="empty-state">
          <ExpenseIcon />
          <p className="empty-state-title">No expenses recorded</p>
          <p className="empty-state-body">
            Log your operational expenses (packaging, raw materials, rent) to calculate true net profit.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setAdding(true)}
            style={{ marginTop: 12 }}
          >
            <PlusIcon /> Log First Expense
          </button>
        </div>
      ) : (
        <div className="list-card">
          {expenses.map((e) => {
            const id = e.id || e._id;
            return (
              <div className="expense-row" key={id}>
                <div className="expense-avatar">
                  <ExpenseIcon style={{ width: 20, height: 20 }} />
                </div>
                <div className="expense-info">
                  <div className="expense-title-row">
                    <span className="expense-title">{e.title}</span>
                    <span className="badge badge-subtle">{e.category}</span>
                  </div>
                  <div className="expense-meta">
                    {relativeDay(e.date)}
                    {e.notes ? ` · “${e.notes}”` : ""}
                  </div>
                </div>
                <div className="expense-actions">
                  <div className="expense-amount">-{money(e.amount)}</div>
                  <button
                    type="button"
                    className="icon-btn-sm text-faint"
                    onClick={() => onDeleteExpense(id)}
                    title="Delete expense"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {adding && (
        <Modal
          title="Log an Expense"
          onClose={() => setAdding(false)}
          footer={
            <button
              type="button"
              className="btn btn-primary btn-block"
              disabled={!title.trim() || !amount}
              onClick={handleSave}
            >
              Save Expense
            </button>
          }
        >
          <div className="field">
            <label className="field-label" htmlFor="exp-title">
              What was this expense for?
            </label>
            <input
              id="exp-title"
              placeholder="e.g. 50 Cake Boxes, Butter bulk delivery"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-grid-2">
            <div className="field" style={{ margin: 0 }}>
              <label className="field-label" htmlFor="exp-amount">
                Amount (₹)
              </label>
              <input
                id="exp-amount"
                type="number"
                inputMode="decimal"
                min="0"
                placeholder="450"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="field" style={{ margin: 0 }}>
              <label className="field-label">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field" style={{ marginTop: 16 }}>
            <label className="field-label" htmlFor="exp-notes">
              Notes / Vendor (Optional)
            </label>
            <input
              id="exp-notes"
              placeholder="e.g. Local packaging supplier invoice #481"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </Modal>
      )}
    </>
  );
}
