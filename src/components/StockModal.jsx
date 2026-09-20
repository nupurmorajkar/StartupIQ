import { useState } from "react";
import Modal from "./Modal";
import { TrashIcon } from "./icons";

const UNITS = ["pcs", "kg", "g", "L", "ml", "m", "packs", "rolls", "sets", "cans", "jars", "bottles"];

export default function StockModal({ item, onSave, onDelete, onClose }) {
  const isEdit = Boolean(item);
  const [name, setName] = useState(item?.name || "");
  const [unit, setUnit] = useState(item?.unit || "pcs");
  const [quantity, setQuantity] = useState(item?.quantity ?? "");
  const [lowThreshold, setLowThreshold] = useState(item?.lowThreshold ?? "");

  const canSave = name.trim().length > 0 && quantity !== "" && !Number.isNaN(Number(quantity));

  function handleSave() {
    if (!canSave) return;
    onSave({
      id: item?.id,
      name: name.trim(),
      unit,
      quantity: Number(quantity),
      lowThreshold: lowThreshold === "" ? 0 : Number(lowThreshold),
    });
  }

  return (
    <Modal
      title={isEdit ? "Edit stock item" : "Add stock item"}
      onClose={onClose}
      footer={
        <div style={{ display: "flex", gap: 10 }}>
          {isEdit && (
            <button type="button" className="btn btn-ghost btn-danger" onClick={() => onDelete(item.id)}>
              <TrashIcon /> Delete
            </button>
          )}
          <button type="button" className="btn btn-primary btn-block" disabled={!canSave} onClick={handleSave}>
            {isEdit ? "Save changes" : "Add to stock"}
          </button>
        </div>
      }
    >
      <div className="field">
        <label className="field-label" htmlFor="stock-name">Material name</label>
        <input id="stock-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. All-purpose flour" autoFocus />
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <div className="field" style={{ flex: 1 }}>
          <label className="field-label" htmlFor="stock-qty">Quantity on hand</label>
          <input id="stock-qty" type="number" inputMode="decimal" min="0" step="0.1" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0" />
        </div>
        <div className="field" style={{ width: 110 }}>
          <label className="field-label" htmlFor="stock-unit">Unit</label>
          <select id="stock-unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
            {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="stock-low">Low stock alert below</label>
        <input id="stock-low" type="number" inputMode="decimal" min="0" step="0.1" value={lowThreshold} onChange={(e) => setLowThreshold(e.target.value)} placeholder="0" />
      </div>
    </Modal>
  );
}
