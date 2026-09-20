import { useState } from "react";
import Modal from "./Modal.jsx";
import { TrashIcon, PlusIcon } from "./icons.jsx";

export default function ProductModal({
  product,
  categories = [],
  stock = [],
  onSave,
  onDelete,
  onClose,
}) {
  const isEdit = Boolean(product);
  const [name, setName] = useState(product?.name || "");
  const [price, setPrice] = useState(product?.price ?? "");
  const [costPrice, setCostPrice] = useState(product?.costPrice ?? "");
  const [category, setCategory] = useState(product?.category || categories[0] || "General");
  const [active, setActive] = useState(product?.active ?? true);
  const [recipe, setRecipe] = useState(product?.recipe || []);

  const canSave = name.trim().length > 0 && price !== "" && !Number.isNaN(Number(price));

  function addRecipeItem() {
    if (stock.length === 0) return;
    const firstStock = stock[0];
    setRecipe((prev) => [
      ...prev,
      {
        stockId: firstStock.id || firstStock._id,
        stockName: firstStock.name,
        quantityNeeded: 1,
        unit: firstStock.unit || "pcs",
      },
    ]);
  }

  function updateRecipeItem(index, key, val) {
    setRecipe((prev) => {
      const copy = [...prev];
      if (key === "stockId") {
        const item = stock.find((s) => (s.id || s._id) === val);
        if (item) {
          copy[index] = {
            ...copy[index],
            stockId: val,
            stockName: item.name,
            unit: item.unit,
          };
        }
      } else {
        copy[index] = { ...copy[index], [key]: val };
      }
      return copy;
    });
  }

  function removeRecipeItem(index) {
    setRecipe((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSave() {
    if (!canSave) return;
    onSave({
      id: product?.id || product?._id,
      name: name.trim(),
      price: Number(price),
      costPrice: costPrice !== "" ? Number(costPrice) : 0,
      category: category.trim() || "General",
      active,
      recipe: recipe.filter((r) => r.quantityNeeded > 0),
    });
  }

  return (
    <Modal
      title={isEdit ? "Edit product" : "Add product"}
      onClose={onClose}
      footer={
        <div style={{ display: "flex", gap: 10, width: "100%" }}>
          {isEdit && (
            <button
              type="button"
              className="btn btn-ghost btn-danger"
              onClick={() => onDelete(product.id || product._id)}
            >
              <TrashIcon /> Delete
            </button>
          )}
          <button
            type="button"
            className="btn btn-primary btn-block"
            disabled={!canSave}
            onClick={handleSave}
          >
            {isEdit ? "Save changes" : "Create Product"}
          </button>
        </div>
      }
    >
      <div className="field">
        <label className="field-label" htmlFor="product-name">
          Product or service name
        </label>
        <input
          id="product-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Chocolate Truffle Cake"
          autoFocus
        />
      </div>

      <div className="form-grid-2">
        <div className="field" style={{ margin: 0 }}>
          <label className="field-label" htmlFor="product-price">
            Selling Price (₹)
          </label>
          <input
            id="product-price"
            type="number"
            inputMode="decimal"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="850"
          />
        </div>

        <div className="field" style={{ margin: 0 }}>
          <label className="field-label" htmlFor="product-cost">
            Cost of Goods (₹)
          </label>
          <input
            id="product-cost"
            type="number"
            inputMode="decimal"
            min="0"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            placeholder="e.g. 350"
          />
        </div>
      </div>

      <div className="field" style={{ marginTop: 16 }}>
        <label className="field-label" htmlFor="product-cat">
          Category
        </label>
        <input
          id="product-cat"
          list="category-options"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g. Cakes, Cookies, Decor"
        />
        <datalist id="category-options">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>

      <div className="field" style={{ marginTop: 16 }}>
        <label className="field-label">Availability</label>
        <div className="chip-select">
          <button
            type="button"
            className={active ? "is-active" : ""}
            onClick={() => setActive(true)}
          >
            Active (Listed in POS)
          </button>
          <button
            type="button"
            className={!active ? "is-active" : ""}
            onClick={() => setActive(false)}
          >
            Paused / Seasonal
          </button>
        </div>
      </div>

      {stock.length > 0 && (
        <div className="field" style={{ marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <label className="field-label" style={{ margin: 0 }}>
              Bill of Materials / Stock Deduction
            </label>
            <button type="button" className="text-btn" onClick={addRecipeItem}>
              <PlusIcon style={{ width: 14, height: 14 }} /> Link Material
            </button>
          </div>
          <p className="helper-text" style={{ marginBottom: 10 }}>
            Materials listed here will automatically deduct from inventory when you sell this item.
          </p>

          {recipe.map((r, idx) => (
            <div key={idx} className="recipe-builder-row">
              <select
                value={r.stockId}
                onChange={(e) => updateRecipeItem(idx, "stockId", e.target.value)}
                style={{ flex: 2 }}
              >
                {stock.map((s) => (
                  <option key={s.id || s._id} value={s.id || s._id}>
                    {s.name} ({s.unit})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={r.quantityNeeded}
                onChange={(e) => updateRecipeItem(idx, "quantityNeeded", Number(e.target.value))}
                style={{ width: 80 }}
                placeholder="Qty"
              />
              <span style={{ fontSize: "0.85rem", color: "var(--ink-soft)" }}>{r.unit}</span>
              <button
                type="button"
                className="icon-btn-sm text-danger"
                onClick={() => removeRecipeItem(idx)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
