import {
  HomeIcon,
  OrdersIcon,
  ProductsIcon,
  StockIcon,
  ExpenseIcon,
  InsightsIcon,
  SettingsIcon,
  PlusIcon,
  SwitchIcon,
  SunIcon,
  MoonIcon,
} from "./icons.jsx";

const NAV_GROUPS = [
  {
    title: null, // Top level
    items: [{ id: "dashboard", label: "Dashboard", icon: HomeIcon }],
  },
  {
    title: "BUSINESS",
    items: [
      { id: "products", label: "Products & Menu", icon: ProductsIcon },
      { id: "stock", label: "Inventory & Stock", icon: StockIcon },
      { id: "orders", label: "Sales & Orders", icon: OrdersIcon },
      { id: "expenses", label: "Expenses & Overhead", icon: ExpenseIcon },
      { id: "customers", label: "Customers & Dues", icon: OrdersIcon },
    ],
  },
  {
    title: "INSIGHTS",
    items: [{ id: "insights", label: "Growth Insights", icon: InsightsIcon }],
  },
  {
    title: "SETTINGS",
    items: [{ id: "settings", label: "Studio Settings", icon: SettingsIcon }],
  },
];

export default function Layout({
  view,
  onNavigate,
  businessType,
  theme,
  onToggleTheme,
  onSwitchBusiness,
  onQuickAdd,
  backendOnline,
  user,
  onOpenAuth,
  onLogout,
  children,
}) {
  return (
    <div className="app-shell">
      <div className="app-body">
        {/* Desktop Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">IQ</div>
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-name">Startup IQ</span>
              <span className="sidebar-brand-badge">Smart Workspace</span>
            </div>
          </div>

          <div className="sidebar-quick-add">
            <button type="button" className="btn btn-primary btn-block" onClick={onQuickAdd}>
              <PlusIcon /> Record Sale
            </button>
          </div>

          <nav className="sidebar-nav">
            {NAV_GROUPS.map((grp, gIdx) => (
              <div key={gIdx} className="sidebar-group">
                {grp.title && <div className="sidebar-group-title">{grp.title}</div>}
                {grp.items.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    className={`sidebar-item${view === id ? " is-active" : ""}`}
                    onClick={() => onNavigate(id)}
                  >
                    <Icon />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            ))}
          </nav>

          {/* User Account / Session Profile */}
          <div className="sidebar-user-card">
            {user ? (
              <div className="user-profile-row">
                <div className="user-avatar">{user.name ? user.name.charAt(0).toUpperCase() : "U"}</div>
                <div className="user-details">
                  <div className="user-name">{user.name}</div>
                  <div className="user-business">{user.businessName || "My Studio"}</div>
                </div>
                <button
                  type="button"
                  className="icon-btn-sm text-faint"
                  onClick={onLogout}
                  title="Sign out of workspace"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-secondary btn-block btn-sm"
                onClick={onOpenAuth}
              >
                Sign In / Register
              </button>
            )}
          </div>

          <div className="sidebar-foot">
            <div className="status-row">
              <span className={`status-dot ${backendOnline ? "is-online" : "is-offline"}`} />
              <span className="status-text">
                {backendOnline ? "Online (Express API)" : "Offline Local Cache"}
              </span>
            </div>

            <div className="sidebar-foot-actions">
              <button
                type="button"
                className="sidebar-switch"
                onClick={onSwitchBusiness}
                title="Switch business workspace profile"
              >
                <SwitchIcon style={{ verticalAlign: "-3px", marginRight: 6 }} />
                {businessType?.name || "Workspace Profile"}
              </button>

              <button
                type="button"
                className="icon-btn"
                onClick={onToggleTheme}
                title={theme === "dark" ? "Light theme" : "Dark theme"}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>
          </div>
        </aside>

        {/* Topbar (Mobile & Tablet) */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <header className="topbar">
            <div className="topbar-brand">
              <span className="topbar-brand-icon">IQ</span>
              <span className="topbar-title">Startup IQ</span>
              <span className={`topbar-chip ${backendOnline ? "is-online" : "is-offline"}`}>
                {backendOnline ? "Online" : "Local"}
              </span>
            </div>

            <div className="topbar-actions">
              {!user && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={onOpenAuth}
                  style={{ marginRight: 6 }}
                >
                  Sign In
                </button>
              )}
              <button
                type="button"
                className="icon-btn"
                onClick={onToggleTheme}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <SunIcon /> : <MoonIcon />}
              </button>
              <button
                type="button"
                className="icon-btn"
                onClick={onSwitchBusiness}
                aria-label="Switch business workspace"
              >
                <SwitchIcon />
              </button>
            </div>
          </header>

          <main className="view">{children}</main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav" aria-label="Primary Mobile Navigation">
        {[
          { id: "dashboard", label: "Home", icon: HomeIcon },
          { id: "products", label: "Catalog", icon: ProductsIcon },
          { id: "stock", label: "Stock", icon: StockIcon },
          { id: "orders", label: "Orders", icon: OrdersIcon },
          { id: "customers", label: "Dues", icon: OrdersIcon },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`nav-item${view === id ? " is-active" : ""}`}
            onClick={() => onNavigate(id)}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <button type="button" className="fab" onClick={onQuickAdd} aria-label="Record Sale">
        <PlusIcon />
      </button>
    </div>
  );
}
