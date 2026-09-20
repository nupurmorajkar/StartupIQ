import { useMemo, useState } from "react";
import Modal from "./Modal.jsx";
import { money } from "../utils/format.js";
import { BoxOpenIcon } from "./icons.jsx";

const PAYMENT_METHODS = ["UPI", "Cash", "Card", "Due"];

export default function QuickAddSale({
  products = [],
  stock = [],
  customers = [],
  onSave,
  onClose,
  onNavigateToStock,
}) {
  const activeProducts = useMemo(() => products.filter((p) => p.active), [products]);
  const [productId, setProductId] = useState(activeProducts[0]?.id || activeProducts[0]?._id || "");
  const [quantity, setQuantity] = useState(1);
  const [amount, setAmount] = useState(activeProducts[0]?.price || 0);
  const [amountTouched, setAmountTouched] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [autoDeduct, setAutoDeduct] = useState(true);

  const product = activeProducts.find((p) => (p.id || p._id) === productId);

  function selectProduct(p) {
    const id = p.id || p._id;
    setProductId(id);
    if (!amountTouched) setAmount(p.price * quantity);
  }

  function changeQty(delta) {
    const next = Math.max(1, quantity + delta);
    setQuantity(next);
    if (!amountTouched && product) setAmount(product.price * next);
  }

  // Real-time BOM Requirement & Shortage Verification
  const inventoryCheck = useMemo(() => {
    if (!product || !Array.isArray(product.recipe) || product.recipe.length === 0) {
      return { hasBOM: false, canFulfill: true, shortages: [] };
    }

    const shortages = [];
    for (const r of product.recipe) {
      const needed = r.quantityNeeded * quantity;
      const stk = stock.find((s) => (s.id || s._id) === r.stockId);
      const available = stk ? stk.quantity : 0;
      if (available < needed) {
        shortages.push({
          name: r.stockName,
          required: needed,
          available,
          shortage: Number((needed - available).toFixed(2)),
          unit: r.unit,
        });
      }
    }

    return {
      hasBOM: true,
      canFulfill: shortages.length === 0,
      shortages,
    };
  }, [product, quantity, stock]);

  const canSave =
    Boolean(product) &&
    Number(amount) > 0 &&
    (!autoDeduct || inventoryCheck.canFulfill);

  function handleSave() {
    if (!canSave) return;
    onSave({
      productId: product.id || product._id,
      productName: product.name,
      quantity,
      unitPrice: product.price,
      amount: Number(amount),
      customerName: customerName.trim() || "Walk-in Customer",
      customerPhone: customerPhone.trim(),
      paymentMethod,
      notes: notes.trim(),
      autoDeductStock: autoDeduct,
      date: new Date().toISOString(),
    });
  }

  function handleCustomerSelect(nameVal) {
    setCustomerName(nameVal);
    const existing = customers.find((c) => c.name.toLowerCase() === nameVal.toLowerCase());
    if (existing && existing.phone) {
      setCustomerPhone(existing.phone);
    }
  }

  if (activeProducts.length === 0) {
    return (
      <Modal title="Record Sale" onClose={onClose}>
        <p style={{ color: "var(--ink-soft)" }}>
          You don't have any active products yet. Add items in the Products catalog first.
        </p>
      </Modal>
    );
  }

  return (
    <Modal
      title="Record New Sale"
      onClose={onClose}
      footer={
        <div style={{ width: "100%" }}>
          {!inventoryCheck.canFulfill && autoDeduct && (
            <div className="shortage-notice-box">
              <div style={{ fontWeight: 700, marginBottom: 4 }}>
                ⚠️ Insufficient Material Stock:
              </div>
              {inventoryCheck.shortages.map((s, i) => (
                <div key={i} style={{ fontSize: "0.82rem" }}>
                  • <strong>{s.name}</strong>: Required {s.required} {s.unit}, Available {s.available} {s.unit} (Shortage: {s.shortage} {s.unit})
                </div>
              ))}
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    onClose();
                    if (onNavigateToStock) onNavigateToStock();
                  }}
                >
                  Restock Now →
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setAutoDeduct(false)}
                >
                  Skip Stock Deduction
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            className="btn btn-primary btn-block"
            disabled={!canSave}
            onClick={handleSave}
            style={{ marginTop: 8 }}
          >
            {paymentMethod === "Due"
              ? `Record Credit Order (₹${amount || 0} Due)`
              : `Complete Sale · ${money(amount || 0)}`}
          </button>
        </div>
      }
    >
      <div className="field">
        <label className="field-label">Select product</label>
        <div className="chip-select">
          {activeProducts.map((p) => {
            const id = p.id || p._id;
            return (
              <button
                key={id}
                type="button"
                className={productId === id ? "is-active" : ""}
                onClick={() => selectProduct(p)}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="form-grid-2">
        <div className="field" style={{ margin: 0 }}>
          <label className="field-label">Quantity</label>
          <div className="stepper">
            <button
              type="button"
              className="stepper-btn"
              onClick={() => changeQty(-1)}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="stepper-value">{quantity}</span>
            <button
              type="button"
              className="stepper-btn"
              onClick={() => changeQty(1)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        <div className="field" style={{ margin: 0 }}>
          <label className="field-label" htmlFor="sale-amount">
            Total Selling Price (₹)
          </label>
          <input
            id="sale-amount"
            type="number"
            inputMode="decimal"
            min="0"
            value={amount}
            onChange={(e) => {
              setAmountTouched(true);
              setAmount(e.target.value === "" ? "" : Number(e.target.value));
            }}
          />
        </div>
      </div>

      {product && (
        <p className="helper-text">
          Standard catalog price {money(product.price)} × {quantity} = {money(product.price * quantity)}
        </p>
      )}

      {/* Payment Method */}
      <div className="field" style={{ marginTop: 16 }}>
        <label className="field-label">Payment Method</label>
        <div className="segmented-control">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method}
              type="button"
              className={`segmented-btn ${paymentMethod === method ? "is-active" : ""}`}
              onClick={() => setPaymentMethod(method)}
            >
              {method}
            </button>
          ))}
        </div>
        {paymentMethod === "Due" && (
          <p className="helper-text" style={{ color: "var(--alert-ink)", fontWeight: 600, marginTop: 6 }}>
            ℹ️ This sale will be tracked as a receivable under <strong>Customers & Receivables</strong> until settled.
          </p>
        )}
      </div>

      {/* Customer Info */}
      <div className="form-grid-2" style={{ marginTop: 14 }}>
        <div className="field" style={{ margin: 0 }}>
          <label className="field-label" htmlFor="cust-name">
            Customer Name {paymentMethod === "Due" ? "(Required for Due)" : "(Optional)"}
          </label>
          <input
            id="cust-name"
            list="customer-suggestions"
            placeholder="e.g. Priya Sharma"
            value={customerName}
            onChange={(e) => handleCustomerSelect(e.target.value)}
          />
          <datalist id="customer-suggestions">
            {customers.map((c) => (
              <option key={c.id || c._id} value={c.name} />
            ))}
          </datalist>
        </div>

        <div className="field" style={{ margin: 0 }}>
          <label className="field-label" htmlFor="cust-phone">
            Phone / Contact
          </label>
          <input
            id="cust-phone"
            type="tel"
            placeholder="+91 98200 11223"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="field" style={{ marginTop: 14 }}>
        <label className="field-label" htmlFor="sale-notes">
          Order Instructions / Customization
        </label>
        <input
          id="sale-notes"
          placeholder="e.g. Less sugar, pickup scheduled at 5 PM"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Stock Auto-Deduct Checkbox */}
      {inventoryCheck.hasBOM && (
        <div className="checkbox-row" style={{ marginTop: 14 }}>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={autoDeduct}
              onChange={(e) => setAutoDeduct(e.target.checked)}
            />
            <span>Auto-deduct raw materials from inventory based on BOM recipe</span>
          </label>
        </div>
      )}
    </Modal>
  );
}
