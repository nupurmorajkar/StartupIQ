import { useMemo, useState } from "react";
import { PlusIcon, ProductsIcon, SearchIcon } from "./icons.jsx";
import { money } from "../utils/format.js";
import ProductModal from "./ProductModal.jsx";

const SWATCHES = ["#C65332", "#4B7A5D", "#B4791C", "#7A5AA6", "#3E6E8E", "#A8431F"];

function swatchFor(index) {
  return SWATCHES[index % SWATCHES.length];
}

export default function Products({ products = [], stock = [], onAdd, onUpdate, onDelete }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))].filter(Boolean),
    [products]
  );

  const filtered = useMemo(() => {
    return products
      .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
      .filter((p) => (category === "all" ? true : p.category === category));
  }, [products, query, category]);

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
          <h1 className="view-heading">Products & Menu</h1>
          <p className="view-sub">
            {products.length} items in catalog · {products.filter((p) => p.active).length} active
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}>
          <PlusIcon /> Add Product
        </button>
      </div>

      <div className="search-field">
        <SearchIcon />
        <input
          placeholder="Search product catalog..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {categories.length > 0 && (
        <div className="filter-row">
          <button
            type="button"
            className={`filter-chip${category === "all" ? " is-active" : ""}`}
            onClick={() => setCategory("all")}
          >
            All ({products.length})
          </button>
          {categories.map((c) => {
            const count = products.filter((p) => p.category === c).length;
            return (
              <button
                key={c}
                type="button"
                className={`filter-chip${category === c ? " is-active" : ""}`}
                onClick={() => setCategory(c)}
              >
                {c} ({count})
              </button>
            );
          })}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <ProductsIcon />
          <p className="empty-state-title">No products found</p>
          <p className="empty-state-body">
            {query
              ? "Try searching for a different product name."
              : "Add your items so they appear in Quick Add Sale and analytics."}
          </p>
          {!query && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setAdding(true)}
              style={{ marginTop: 12 }}
            >
              <PlusIcon /> Add First Product
            </button>
          )}
        </div>
      ) : (
        <div className="product-grid">
          {filtered.map((p, i) => {
            const id = p.id || p._id;
            const hasRecipe = Array.isArray(p.recipe) && p.recipe.length > 0;
            const profit = p.costPrice ? p.price - p.costPrice : null;

            return (
              <button
                type="button"
                key={id}
                className={`product-card${p.active ? "" : " is-inactive"}`}
                onClick={() => setEditing(p)}
              >
                {!p.active && <span className="tag tag-muted product-status">Paused</span>}
                <span className="product-swatch" style={{ background: swatchFor(i) }}>
                  {p.name.charAt(0).toUpperCase()}
                </span>
                <div className="product-name">{p.name}</div>
                <div className="product-cat">{p.category}</div>
                <div className="product-pricing-row">
                  <span className="product-price">{money(p.price)}</span>
                  {profit !== null && (
                    <span className="product-profit" title="Estimated gross margin">
                      +{money(profit)}
                    </span>
                  )}
                </div>
                {hasRecipe && (
                  <div className="product-recipe-tag">
                    {p.recipe.length} raw material{p.recipe.length > 1 ? "s" : ""} linked
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {adding && (
        <ProductModal
          categories={categories}
          stock={stock}
          onClose={() => setAdding(false)}
          onSave={handleSave}
          onDelete={() => {}}
        />
      )}
      {editing && (
        <ProductModal
          product={editing}
          categories={categories}
          stock={stock}
          onClose={() => setEditing(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}
