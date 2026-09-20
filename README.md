# Startup IQ — Smart Business Management Workspace

> **A production-grade, full-stack business management platform engineered for solo makers, artisan studios, and growing startups.**  
> Effortlessly track sales, inventory, BOM recipes, operational expenses, customer credit dues, and true net profit across mobile and desktop.

---

## 🌟 What is Startup IQ?

Startup IQ replaces fragmented paper notebooks, chaotic spreadsheets, and bloated ERP tools with a clean, high-speed, intelligent workspace.

### Core Subsystems:
1. **Authentication & Session System**:
   - Secure registration & login with password hashing via **bcrypt** and **JWT session tokens**.
   - Multi-tenant business workspace isolation.
   - Protected routes and instant session restoration.

2. **Inventory Engine & BOM Traceability**:
   - Track raw materials with units, threshold alerts, unit costs, and suppliers.
   - **Bill of Materials (BOM) Linker**: Associate recipes/materials with catalog products.
   - **Negative Inventory Prevention**: Sales are validated against required stock; detailed shortage reports prevent overselling.
   - **Traceable Movement Audit Trail**: Every stock addition, sale deduction, manual adjustment, or cancellation reversal is permanently logged with timestamps and references.

3. **Smart Point of Sale (POS)**:
   - One-tap sale entry on desktop sidebar or mobile Floating Action Button (FAB).
   - Payment method support: **Cash**, **UPI**, **Card**, and **Due** (Credit).
   - Customer selection with auto-fill phone contact.
   - Automatic atomic stock deduction based on product BOM recipes.

4. **Customers & Receivables (Dues Management)**:
   - Dedicated customer directory tracking lifetime orders, total spend, and outstanding balances.
   - When a sale is marked as "Due", it automatically links to customer receivables.
   - In-app payment settlement modal for recording partial or full due payments.

5. **Financial Engine: Actual COGS & True Net Profit / Loss**:
   - Replaces arbitrary percentage estimations with real BOM material costs.
   - True Net Profit: `Gross Revenue − Actual COGS − Operating Overhead Expenses`.
   - **Honest Loss Reporting**: Displays true negative operational losses (e.g., `-₹2,400`) instead of clamping to zero.

6. **Sales Ledger & RFC 4180 CSV Export**:
   - Complete transaction history with filters for All Time, Today, This Week, and This Month.
   - Search by customer name, product, or note.
   - One-click **Export to CSV** for tax accountants and external spreadsheets.

7. **Executive Dashboard & Interactive SVG Data Visualization**:
   - Answers three critical business questions immediately:
     1. *How is my business doing?* (Gross Revenue, Net Profit/Loss, Orders count, Inventory Asset Value, Pending Receivables)
     2. *What needs attention?* (Low-stock warning banner, Pending customer credit alerts)
     3. *What should I do next?* (Quick Actions bar: Record Sale, Add Material, Log Expense, Add Product)
   - Zero-dependency custom SVG charts with interactive hover/touch tooltips.

8. **Appearance & Theming**:
   - **Warm Ivory** (Daylight artisanal aesthetic) & **Dark Velvet** (Charcoal focus mode).
   - Ergonomic 44px+ touch targets and accessible modal focus trapping (WCAG 2.1 AA compliant).

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Fullstack Application
In your terminal, start the React client and Express backend:

**Start React Client (Vite)**:
```bash
npm run dev
```

**Start Backend Server (Express + Mongoose)**:
```bash
npm run server
```

Open `http://localhost:5173` in your browser.

> **Zero-Configuration Fallback**: If MongoDB is not running locally, Startup IQ automatically boots with a high-performance in-memory fallback store with full persistence simulation.

---

## 📁 Project Architecture

```
startup-iq/
├── server/                      # Node.js + Express + MongoDB Backend
│   ├── config/
│   │   └── db.js                # MongoDB connection + resilient in-memory fallback
│   ├── controllers/             # Business logic & financial engines
│   │   ├── authController.js    # Signup, login, bcrypt, JWT sessions
│   │   ├── productController.js # Catalog & BOM recipes
│   │   ├── stockController.js   # Materials & movement audit trail
│   │   ├── saleController.js    # Atomic BOM deduction & dues linkage
│   │   ├── expenseController.js # Operational overhead
│   │   ├── customerController.js# Receivables & dues settlement
│   │   └── analyticsController.js # Financial KPI aggregation
│   ├── middleware/
│   │   └── auth.js              # JWT verification middleware
│   ├── models/                  # Mongoose Schemas & Compound Indexes
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Stock.js
│   │   ├── Sale.js
│   │   ├── Expense.js
│   │   ├── Customer.js
│   │   └── InventoryMovement.js
│   ├── routes/                  # Express RESTful endpoints
│   ├── store/
│   │   └── memStore.js          # In-memory resilient fallback store
│   └── server.js                # Express app entry point
│
├── src/                         # React 18 Frontend
│   ├── components/
│   │   ├── Layout.jsx           # Grouped SaaS navigation (Overview, Business, Insights, Settings)
│   │   ├── Dashboard.jsx        # Dual-metric hero, quick actions, attention banners
│   │   ├── QuickAddSale.jsx     # POS modal with shortage prevention & credit due alerts
│   │   ├── SalesLedger.jsx      # Searchable orders ledger & CSV spreadsheet export
│   │   ├── Products.jsx         # Catalog with BOM recipe linker & cost pricing
│   │   ├── Stock.jsx            # Inventory balances & Movement History audit tab
│   │   ├── Expenses.jsx         # Overhead cost categories & breakdown
│   │   ├── Customers.jsx        # Receivables ledger & due settlement modal
│   │   ├── Insights.jsx         # Plain-language rule-based growth engine
│   │   ├── Settings.jsx         # Branding, dark theme, JSON backup/restore
│   │   ├── AuthModal.jsx        # Login & Signup with password strength & demo login
│   │   ├── Charts.jsx           # Interactive SVG charts with hover tooltips
│   │   ├── Modal.jsx            # Accessible focus-trapped dialog
│   │   └── icons.jsx            # Handcrafted pixel-perfect SVG icons
│   ├── services/
│   │   └── api.js               # Hybrid API client with token management
│   ├── data/                    # Craft domain archetypes & demo datasets
│   ├── utils/                   # Financial analytics, formatting, storage
│   ├── App.jsx                  # Main application state container
│   └── index.css                # Design tokens & responsive styling
│
├── SRS_DOCUMENT.md              # Complete IEEE 830 / ISO 29148 Specification
├── Startup_IQ_SRS.docx          # Formatted Microsoft Word SRS Document
└── package.json                 # Project configuration & scripts
```

---

## 📑 Software Requirements Specification (SRS)

A comprehensive IEEE 830 / ISO 29148 Software Requirements Specification document is included:
- **Markdown Specification**: [`SRS_DOCUMENT.md`](./SRS_DOCUMENT.md)
- **Microsoft Word Document**: [`Startup_IQ_SRS.docx`](./Startup_IQ_SRS.docx)

It details:
- Complete functional requirements (`F-01` through `F-10`)
- Mongoose data dictionaries and compound indexes
- In-depth **Technology Mapping** for **M** (MongoDB), **E** (Express.js), **R** (React 18), and **N** (Node.js)
- Requirements Traceability Matrix (RTM)

---

## 📜 License
MIT License. Built for solo artisans, makers, and growing startups.
