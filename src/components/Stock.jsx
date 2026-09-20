import { useMemo, useState } from "react";
import { SearchIcon, BoxOpenIcon, PlusIcon } from "./icons.jsx";
import StockModal from "./StockModal.jsx";
import { relativeDay } from "../utils/format.js";

export default function Stock({
  stock = [],
  movements = [],
  onAdd,
  onUpdate,
  onAdjust,
  onDelete,
}) {
  const [tab, setTab] = useState("materials"); // 'materials' or 'movements'
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);

  const lowCount = useMemo(
    () => stock.filter((s) => s.quantity <= (s.lowThreshold || 2)).length,
    [stock]
  );

  const filteredStock = useMemo(() => {
    return stock
      .filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
      .filter((s) => (filter === "low" ? s.quantity <= (s.lowThreshold || 2) : true));
  }, [stock, query, filter]);

  const filteredMovements = useMemo(() => {
    return movements.filter(
      (m) =>
        m.materialName?.toLowerCase().includes(query.toLowerCase()) ||
        m.reason?.toLowerCase().includes(query.toLowerCase())
    );
  }, [movements, query]);

  function handleSave(data) {
    if (data.id || data._id) onUpdate(data);
    else onAdd(data);
    setEditing(null);
    setAdding(false);
  }

  function handleDelete(id) {
    onDelete(id);
    setEditing(null);
  }

  return (
    <>
      <div className="view-header">
        <div>
          <h1 className="view-heading">Inventory & Materials</h1>
          <p className="view-sub">
            {stock.length} materials tracked · {lowCount} low-stock alerts
          </p>
        </div>
        <div className="view-header-actions">
          <div className="segmented-control" style={{ padding: 2 }}>
            <button
              type="button"
              className={`segmented-btn ${tab === "materials" ? "is-active" : ""}`}
              onClick={() => setTab("materials")}
              style={{ padding: "6px 12px" }}
            >
              Material Balances
            </button>
            <button
              type="button"
              className={`segmented-btn ${tab === "movements" ? "is-active" : ""}`}
              onClick={() => setTab("movements")}
              style={{ padding: "6px 12px" }}
            >
              Movement History
            </button>
          </div>

          <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}>
            <PlusIcon /> Add Material
          </button>
        </div>
      </div>

      <div className="search-field">
        <SearchIcon />
        <input
          placeholder={
            tab === "materials"
              ? "Search materials (flour, polish, resin, packaging...)"
              : "Search movements (Restock, Sale, Material)..."
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {tab === "materials" ? (
        <>
          <div className="filter-row">
            <button
              type="button"
              className={`filter-chip${filter === "all" ? " is-active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All Items ({stock.length})
            </button>
            <button
              type="button"
              className={`filter-chip${filter === "low" ? " is-active" : ""}`}
              onClick={() => setFilter("low")}
            >
              Running Low{lowCount ? ` (${lowCount})` : ""}
            </button>
          </div>

          {filteredStock.length === 0 ? (
            <div className="empty-state">
              <BoxOpenIcon />
              <p className="empty-state-title">No materials found</p>
              <p className="empty-state-body">
                {query
                  ? "No materials match your search."
                  : "Add raw materials and stock to track inventory levels."}
              </p>
              {!query && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setAdding(true)}
                  style={{ marginTop: 12 }}
                >
                  <PlusIcon /> Add First Material
                </button>
              )}
            </div>
          ) : (
            <div className="list-card">
              {filteredStock.map((item) => {
                const id = item.id || item._id;
                const isLow = item.quantity <= (item.lowThreshold || 2);

                return (
                  <div key={id} className="stock-row">
                    <div
                      className="stock-click-area"
                      onClick={() => setEditing(item)}
                      role="button"
                      tabIndex={0}
                    >
                      <span className="item-icon">
                        <BoxOpenIcon />
                      </span>
                      <div className="item-main">
                        <div className="item-name">{item.name}</div>
                        <div className="item-sub">
                          Alert threshold: {item.lowThreshold || 2} {item.unit}
                          {item.costPerUnit ? ` · Unit Cost: ₹${item.costPerUnit}/${item.unit}` : ""}
                          {item.supplier ? ` · ${item.supplier}` : ""}
                        </div>
                      </div>
                    </div>

                    <div className="stock-actions">
                      {isLow && <span className="tag tag-alert">Low stock</span>}

                      <div className="stock-count">
                        <span className="stock-value">{item.quantity}</span>
                        <span className="stock-unit">{item.unit}</span>
                      </div>

                      <div className="quick-stepper" title="Quick restock adjustments">
                        <button
                          type="button"
                          className="stepper-mini-btn"
                          onClick={() => onAdjust && onAdjust(id, -1, "Manual deduction")}
                          disabled={item.quantity <= 0}
                          title="Deduct 1"
                        >
                          −
                        </button>
                        <button
                          type="button"
                          className="stepper-mini-btn"
                          onClick={() => onAdjust && onAdjust(id, 1, "Quick restock (+1)")}
                          title="Add 1"
                        >
                          +1
                        </button>
                        <button
                          type="button"
                          className="stepper-mini-btn"
                          onClick={() => onAdjust && onAdjust(id, 5, "Bulk restock (+5)")}
                          title="Add 5"
                        >
                          +5
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* Inventory Movements Audit Trail */
        <div className="list-card">
          {filteredMovements.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-title">No inventory movements recorded yet</p>
              <p className="empty-state-body">
                Stock changes from sales, manual adjustments, and restocks will appear here automatically.
              </p>
            </div>
          ) : (
            filteredMovements.map((m, i) => {
              const isAddition = m.quantityDelta > 0;
              return (
                <div key={m.id || i} className="movement-row">
                  <div
                    className={`movement-badge ${isAddition ? "is-addition" : "is-deduction"}`}
                  >
                    {isAddition ? `+${m.quantityDelta}` : m.quantityDelta} {m.unit}
                  </div>
                  <div className="movement-info">
                    <div className="movement-name-row">
                      <span className="movement-material">{m.materialName}</span>
                      <span className="badge badge-subtle">{m.reason}</span>
                    </div>
                    <div className="movement-meta">
                      {relativeDay(m.timestamp || m.date)}
                      {m.referenceId ? ` · Ref: ${m.referenceId}` : ""}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {adding && (
        <StockModal
          onClose={() => setAdding(false)}
          onSave={handleSave}
          onDelete={() => {}}
        />
      )}
      {editing && (
        <StockModal
          item={editing}
          onClose={() => setEditing(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}
