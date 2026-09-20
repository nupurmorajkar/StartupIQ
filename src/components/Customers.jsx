import { useMemo, useState } from "react";
import { SearchIcon, PlusIcon, TrashIcon, CheckIcon } from "./icons.jsx";
import { money, relativeDay } from "../utils/format.js";
import Modal from "./Modal.jsx";

export default function Customers({
  customers = [],
  onAddCustomer,
  onRecordPayment,
  onDeleteCustomer,
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all"); // 'all' or 'due'
  const [adding, setAdding] = useState(false);
  const [payingCustomer, setPayingCustomer] = useState(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("UPI");
  const [payNotes, setPayNotes] = useState("");

  // New customer form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const totalOutstanding = useMemo(
    () => customers.reduce((acc, c) => acc + (Number(c.outstandingDue) || 0), 0),
    [customers]
  );

  const dueCount = useMemo(
    () => customers.filter((c) => (c.outstandingDue || 0) > 0).length,
    [customers]
  );

  const filtered = useMemo(() => {
    return customers
      .filter((c) => {
        const matchesQuery =
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          (c.phone && c.phone.includes(query)) ||
          (c.email && c.email.toLowerCase().includes(query.toLowerCase()));

        const matchesFilter = filter === "all" || (filter === "due" && (c.outstandingDue || 0) > 0);
        return matchesQuery && matchesFilter;
      })
      .sort((a, b) => (b.outstandingDue || 0) - (a.outstandingDue || 0));
  }, [customers, query, filter]);

  function handleSaveCustomer() {
    if (!name.trim()) return;
    onAddCustomer({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
    });
    setName("");
    setPhone("");
    setEmail("");
    setAdding(false);
  }

  function handleSettlePayment() {
    if (!payingCustomer || !payAmount || Number(payAmount) <= 0) return;
    onRecordPayment(payingCustomer.id || payingCustomer._id, {
      amount: Number(payAmount),
      method: payMethod,
      notes: payNotes.trim(),
    });
    setPayingCustomer(null);
    setPayAmount("");
    setPayNotes("");
  }

  return (
    <>
      <div className="view-header">
        <div>
          <h1 className="view-heading">Customers & Receivables</h1>
          <p className="view-sub">
            {customers.length} customer profiles · Outstanding dues:{" "}
            <strong style={{ color: totalOutstanding > 0 ? "var(--alert-ink)" : "var(--growth-ink)" }}>
              {money(totalOutstanding)}
            </strong>
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}>
          <PlusIcon /> Add Customer
        </button>
      </div>

      {totalOutstanding > 0 && (
        <div className="alert-banner">
          <span>
            <strong>Receivables Alert:</strong> You have <strong>{money(totalOutstanding)}</strong> in outstanding dues across {dueCount} customer{dueCount > 1 ? "s" : ""}.
          </span>
          <button
            type="button"
            className="text-btn"
            style={{ fontWeight: 700 }}
            onClick={() => setFilter("due")}
          >
            Show Pending Only →
          </button>
        </div>
      )}

      <div className="search-field">
        <SearchIcon />
        <input
          placeholder="Search customer by name or phone..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="filter-row">
        <button
          type="button"
          className={`filter-chip${filter === "all" ? " is-active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All Customers ({customers.length})
        </button>
        <button
          type="button"
          className={`filter-chip${filter === "due" ? " is-active" : ""}`}
          onClick={() => setFilter("due")}
        >
          Pending Dues ({dueCount})
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">No customers found</p>
          <p className="empty-state-body">
            {query || filter === "due"
              ? "No customers match your active filter."
              : "Customers are automatically saved when you record sales or credit orders."}
          </p>
          {!query && filter === "all" && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setAdding(true)}
              style={{ marginTop: 12 }}
            >
              <PlusIcon /> Add First Customer
            </button>
          )}
        </div>
      ) : (
        <div className="list-card">
          {filtered.map((c) => {
            const id = c.id || c._id;
            const hasDue = (c.outstandingDue || 0) > 0;

            return (
              <div key={id} className="customer-row">
                <div className="customer-avatar">
                  {c.name ? c.name.charAt(0).toUpperCase() : "C"}
                </div>
                <div className="customer-info">
                  <div className="customer-name-row">
                    <span className="customer-name">{c.name}</span>
                    {hasDue ? (
                      <span className="tag tag-alert">Due: {money(c.outstandingDue)}</span>
                    ) : (
                      <span className="tag tag-success">All Clear</span>
                    )}
                  </div>
                  <div className="customer-meta">
                    {c.phone ? `${c.phone} · ` : ""}
                    {c.totalOrders || 0} orders · {money(c.totalSpent || 0)} lifetime spend
                  </div>
                </div>

                <div className="customer-actions">
                  {hasDue && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setPayingCustomer(c);
                        setPayAmount(c.outstandingDue);
                      }}
                    >
                      Record Payment
                    </button>
                  )}
                  {onDeleteCustomer && (
                    <button
                      type="button"
                      className="icon-btn-sm text-faint"
                      onClick={() => onDeleteCustomer(id)}
                      title="Delete customer"
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

      {/* Add Customer Modal */}
      {adding && (
        <Modal
          title="Add Customer Profile"
          onClose={() => setAdding(false)}
          footer={
            <button
              type="button"
              className="btn btn-primary btn-block"
              disabled={!name.trim()}
              onClick={handleSaveCustomer}
            >
              Save Customer
            </button>
          }
        >
          <div className="field">
            <label className="field-label" htmlFor="new-cust-name">
              Customer Full Name
            </label>
            <input
              id="new-cust-name"
              placeholder="e.g. Priya Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-grid-2">
            <div className="field" style={{ margin: 0 }}>
              <label className="field-label" htmlFor="new-cust-phone">
                Phone Number
              </label>
              <input
                id="new-cust-phone"
                type="tel"
                placeholder="+91 98200 11223"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="field" style={{ margin: 0 }}>
              <label className="field-label" htmlFor="new-cust-email">
                Email (Optional)
              </label>
              <input
                id="new-cust-email"
                type="email"
                placeholder="priya@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Record Payment / Settle Due Modal */}
      {payingCustomer && (
        <Modal
          title={`Settle Due: ${payingCustomer.name}`}
          onClose={() => setPayingCustomer(null)}
          footer={
            <button
              type="button"
              className="btn btn-primary btn-block"
              disabled={!payAmount || Number(payAmount) <= 0}
              onClick={handleSettlePayment}
            >
              Confirm Payment · {money(payAmount || 0)}
            </button>
          }
        >
          <div className="stat-chip" style={{ marginBottom: 16 }}>
            <div className="stat-chip-label">Current Outstanding Balance</div>
            <div className="stat-chip-value" style={{ color: "var(--danger)" }}>
              {money(payingCustomer.outstandingDue)}
            </div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="pay-amt">
              Amount to Settle (₹)
            </label>
            <input
              id="pay-amt"
              type="number"
              min="1"
              max={payingCustomer.outstandingDue}
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              autoFocus
            />
          </div>

          <div className="field">
            <label className="field-label">Payment Method Received</label>
            <div className="segmented-control">
              {["UPI", "Cash", "Card"].map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`segmented-btn ${payMethod === m ? "is-active" : ""}`}
                  onClick={() => setPayMethod(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="field" style={{ marginTop: 14 }}>
            <label className="field-label" htmlFor="pay-notes">
              Payment Reference / Notes
            </label>
            <input
              id="pay-notes"
              placeholder="e.g. GPay UPI Ref #482910"
              value={payNotes}
              onChange={(e) => setPayNotes(e.target.value)}
            />
          </div>
        </Modal>
      )}
    </>
  );
}
