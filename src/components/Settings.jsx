import { useState, useRef } from "react";
import { BUSINESS_TYPES } from "../data/businessTypes.js";
import { SettingsIcon, DownloadIcon, SwitchIcon, SunIcon, MoonIcon, CheckIcon } from "./icons.jsx";

export default function Settings({
  businessType,
  theme,
  user,
  onToggleTheme,
  onSwitchCraft,
  onExportBackup,
  onImportBackup,
  onResetDemo,
  backendOnline,
}) {
  const [shopName, setShopName] = useState(
    () => user?.businessName || localStorage.getItem("startup_iq_shop_name") || "My Studio"
  );
  const [ownerName, setOwnerName] = useState(
    () => user?.name || localStorage.getItem("startup_iq_owner_name") || "Founder"
  );
  const [currency, setCurrency] = useState(
    () => user?.currency || localStorage.getItem("startup_iq_currency") || "₹"
  );
  const [taxPreference, setTaxPreference] = useState(
    () => user?.taxPreference || "Inclusive"
  );
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);

  function handleSaveProfile(e) {
    e.preventDefault();
    localStorage.setItem("startup_iq_shop_name", shopName);
    localStorage.setItem("startup_iq_owner_name", ownerName);
    localStorage.setItem("startup_iq_currency", currency);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        onImportBackup(json);
      } catch {
        alert("Invalid Startup IQ JSON backup file.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <>
      <div className="view-header">
        <div>
          <h1 className="view-heading">Settings & Workspace</h1>
          <p className="view-sub">Manage your studio preferences, currency, theme, and data backups</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Studio Profile */}
        <div className="card-box">
          <h2 className="card-box-title">Business Profile</h2>
          <form onSubmit={handleSaveProfile}>
            <div className="field">
              <label className="field-label" htmlFor="shop-name">
                Business / Studio Name
              </label>
              <input
                id="shop-name"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. Flour & Bloom"
              />
            </div>

            <div className="form-grid-2">
              <div className="field" style={{ margin: 0 }}>
                <label className="field-label" htmlFor="owner-name">
                  Founder Name
                </label>
                <input
                  id="owner-name"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                />
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label className="field-label" htmlFor="pref-currency">
                  Currency Symbol
                </label>
                <select
                  id="pref-currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="₹">₹ (INR)</option>
                  <option value="$">$ (USD)</option>
                  <option value="€">€ (EUR)</option>
                  <option value="£">£ (GBP)</option>
                  <option value="AED">AED</option>
                </select>
              </div>
            </div>

            <div className="field" style={{ marginTop: 14 }}>
              <label className="field-label">Tax Display Preference</label>
              <div className="chip-select">
                {["Inclusive", "Exclusive", "No Tax"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={taxPreference === t ? "is-active" : ""}
                    onClick={() => setTaxPreference(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-secondary" style={{ marginTop: 14 }}>
              {saved ? (
                <>
                  <CheckIcon /> Preferences Saved!
                </>
              ) : (
                "Save Preferences"
              )}
            </button>
          </form>
        </div>

        {/* Craft Archetype Switcher */}
        <div className="card-box">
          <h2 className="card-box-title">Active Domain Preset</h2>
          <p className="card-box-sub">
            Active: <strong>{businessType?.name}</strong> ({businessType?.desc})
          </p>
          <div className="craft-switcher-list">
            {BUSINESS_TYPES.map((b) => (
              <button
                key={b.id}
                type="button"
                className={`craft-switch-item ${b.id === businessType?.id ? "is-active" : ""}`}
                onClick={() => onSwitchCraft(b.id)}
              >
                <span>{b.name}</span>
                {b.id === businessType?.id && <span className="tag tag-success">Active</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Display & Theming */}
        <div className="card-box">
          <h2 className="card-box-title">Appearance & Theme</h2>
          <p className="card-box-sub">
            Choose a visual style tailored for bright daylight or evening workshop focus.
          </p>
          <div className="theme-toggle-row">
            <button
              type="button"
              className={`theme-pick-btn ${theme === "light" ? "is-active" : ""}`}
              onClick={onToggleTheme}
            >
              <SunIcon />
              <span>Warm Ivory (Light)</span>
            </button>
            <button
              type="button"
              className={`theme-pick-btn ${theme === "dark" ? "is-active" : ""}`}
              onClick={onToggleTheme}
            >
              <MoonIcon />
              <span>Dark Velvet (Dark)</span>
            </button>
          </div>
        </div>

        {/* Data Backup & Migration */}
        <div className="card-box">
          <h2 className="card-box-title">Data Backup & Export</h2>
          <p className="card-box-sub">
            Export a full JSON archive of your catalog, materials, sales, expenses, and customer dues.
          </p>
          <div className="btn-group-wrap">
            <button type="button" className="btn btn-secondary" onClick={onExportBackup}>
              <DownloadIcon /> Export JSON Backup
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              Restore from Backup
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>

          <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
            <button
              type="button"
              className="btn btn-ghost btn-danger"
              onClick={onResetDemo}
            >
              Reset to Preset Starter Data
            </button>
          </div>
        </div>

        {/* System Architecture */}
        <div className="card-box" style={{ gridColumn: "1 / -1" }}>
          <h2 className="card-box-title">System Architecture</h2>
          <div className="sys-info-row">
            <span className="sys-label">Application</span>
            <span className="sys-val">Startup IQ — Production Workspace v3.0</span>
          </div>
          <div className="sys-info-row">
            <span className="sys-label">Technology Stack</span>
            <span className="sys-val">MERN (MongoDB, Express.js, React 18, Node.js)</span>
          </div>
          <div className="sys-info-row">
            <span className="sys-label">Backend Gateway</span>
            <span className="sys-val">
              {backendOnline ? "🟢 Online (http://localhost:5000)" : "🟡 Resilient In-Memory Fallback"}
            </span>
          </div>
          <div className="sys-info-row">
            <span className="sys-label">Persistence</span>
            <span className="sys-val">
              {backendOnline ? "Mongoose ODM with ACID BOM Movements" : "Client Offline LocalStorage"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
