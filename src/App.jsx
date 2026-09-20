import { useEffect, useState } from "react";
import { loadState, saveState, uid } from "./utils/storage.js";
import { getBusinessType, BUSINESS_TYPES } from "./data/businessTypes.js";
import { buildDemoDataset } from "./data/seed.js";
import { api } from "./services/api.js";

import Onboarding from "./components/Onboarding.jsx";
import Layout from "./components/Layout.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Stock from "./components/Stock.jsx";
import Products from "./components/Products.jsx";
import SalesLedger from "./components/SalesLedger.jsx";
import Expenses from "./components/Expenses.jsx";
import Customers from "./components/Customers.jsx";
import Insights from "./components/Insights.jsx";
import Settings from "./components/Settings.jsx";
import QuickAddSale from "./components/QuickAddSale.jsx";
import AuthModal from "./components/AuthModal.jsx";
import { CheckIcon } from "./components/icons.jsx";

export default function App() {
  const [businessTypeId, setBusinessTypeId] = useState(() => loadState("startup_iq_businessType", null));
  const [products, setProducts] = useState(() => loadState("startup_iq_products", []));
  const [stock, setStock] = useState(() => loadState("startup_iq_stock", []));
  const [sales, setSales] = useState(() => loadState("startup_iq_sales", []));
  const [movements, setMovements] = useState(() =>
    loadState("startup_iq_movements", [
      {
        id: "mov_init",
        materialName: "Primary Material",
        quantityDelta: 10,
        unit: "kg",
        reason: "RESTOCK",
        referenceId: "Initial workspace seed",
        timestamp: new Date().toISOString(),
      },
    ])
  );
  const [customers, setCustomers] = useState(() =>
    loadState("startup_iq_customers", [
      {
        id: "cust_1",
        name: "Priya Mehta",
        phone: "+91 98200 11223",
        email: "priya@example.com",
        totalOrders: 4,
        totalSpent: 3400,
        outstandingDue: 450,
        paymentHistory: [],
      },
      {
        id: "cust_2",
        name: "Ananya Iyer",
        phone: "+91 98444 55667",
        email: "ananya@example.com",
        totalOrders: 3,
        totalSpent: 2600,
        outstandingDue: 900,
        paymentHistory: [],
      },
    ])
  );
  const [expenses, setExpenses] = useState(() =>
    loadState("startup_iq_expenses", [
      {
        id: "exp_1",
        title: "Eco-friendly Packaging & Boxes",
        category: "Packaging",
        amount: 850,
        date: new Date(Date.now() - 3 * 86400000).toISOString(),
        notes: "Biodegradable craft boxes",
      },
      {
        id: "exp_2",
        title: "Raw Material & Ingredients Delivery",
        category: "Raw Materials",
        amount: 1400,
        date: new Date(Date.now() - 7 * 86400000).toISOString(),
        notes: "Wholesale vendor invoice #392",
      },
      {
        id: "exp_3",
        title: "Instagram Promotional Reel Boost",
        category: "Marketing",
        amount: 600,
        date: new Date(Date.now() - 12 * 86400000).toISOString(),
        notes: "Targeted 5km local radius",
      },
    ])
  );

  const [theme, setTheme] = useState(() => loadState("startup_iq_theme", "light"));
  const [user, setUser] = useState(() => loadState("startup_iq_user", null));
  const [backendOnline, setBackendOnline] = useState(false);
  const [view, setView] = useState("dashboard");
  const [showOnboarding, setShowOnboarding] = useState(businessTypeId === null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [toast, setToast] = useState(null);

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    saveState("startup_iq_theme", theme);
  }, [theme]);

  // Sync state to localStorage
  useEffect(() => saveState("startup_iq_businessType", businessTypeId), [businessTypeId]);
  useEffect(() => saveState("startup_iq_products", products), [products]);
  useEffect(() => saveState("startup_iq_stock", stock), [stock]);
  useEffect(() => saveState("startup_iq_sales", sales), [sales]);
  useEffect(() => saveState("startup_iq_movements", movements), [movements]);
  useEffect(() => saveState("startup_iq_customers", customers), [customers]);
  useEffect(() => saveState("startup_iq_expenses", expenses), [expenses]);
  useEffect(() => saveState("startup_iq_user", user), [user]);

  // Check backend & restore token session
  // Check backend & restore token session
useEffect(() => {
  let cancelled = false;

  async function checkApi() {
    await api.checkBackend();
    if (cancelled) return;

    setBackendOnline(api.backendAvailable);

    if (api.backendAvailable && localStorage.getItem("startup_iq_token")) {
      const profile = await api.getMe();
      if (!cancelled && profile?.data && !user) {
        setUser(profile.data);
      }
    }

    if (!cancelled) setAuthChecked(true);
  }

  checkApi();
  const interval = setInterval(checkApi, 10000);

  return () => {
    cancelled = true;
    clearInterval(interval);
  };
}, []);

  // Toast timer
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  function handleToggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  function handleOnboardingComplete(id) {
    if (id !== businessTypeId || products.length === 0) {
      const dataset = buildDemoDataset(id);
      setProducts(dataset.products);
      setStock(dataset.stock);
      setSales(dataset.sales);
    }
    setBusinessTypeId(id);
    setShowOnboarding(false);
    setView("dashboard");
    setToast(`Loaded ${getBusinessType(id).name} workspace`);
  }

  function handleAuthSuccess(userData, token) {
  setUser(userData);
  setShowOnboarding(true);
  setToast(`Welcome back, ${userData.name}!`);
}

  function handleLogout() {
  setUser(null);
  setBusinessTypeId(null);
  setShowOnboarding(false);
  localStorage.removeItem("startup_iq_token");
  localStorage.removeItem("startup_iq_user");
  localStorage.removeItem("startup_iq_businessType");
  setToast("Signed out of workspace.");
}

  if (!authChecked) {
  return null;
}

if (!user) {
  return (
    <AuthModal
      isOpen
      canClose={false}
      initialMode="login"
      onClose={() => {}}
      onAuthSuccess={handleAuthSuccess}
    />
  );
}

  if (showOnboarding || !businessTypeId) {
    return <Onboarding initialId={businessTypeId} onComplete={handleOnboardingComplete} />;
  }

  const businessType = getBusinessType(businessTypeId);

  // Sales Management with BOM Stock Deduction & Movement Logging
  function addSale(sale) {
    const saleId = uid();
    const isDue = sale.paymentMethod === "Due";
    const newSale = {
      id: saleId,
      ...sale,
      isPaid: !isDue,
      amountPaid: isDue ? 0 : sale.amount,
      outstandingBalance: isDue ? sale.amount : 0,
    };

    setSales((prev) => [newSale, ...prev]);

    // Perform atomic stock deduction & log movement
    if (sale.autoDeductStock) {
      const product = products.find((p) => (p.id || p._id) === sale.productId);
      if (product && Array.isArray(product.recipe) && product.recipe.length > 0) {
        setStock((prevStock) =>
          prevStock.map((s) => {
            const recipeItem = product.recipe.find((r) => r.stockId === (s.id || s._id));
            if (recipeItem) {
              const deductQty = recipeItem.quantityNeeded * sale.quantity;
              return {
                ...s,
                quantity: Math.max(0, Number((s.quantity - deductQty).toFixed(2))),
              };
            }
            return s;
          })
        );

        // Record movements
        const newMovements = product.recipe.map((r) => ({
          id: uid(),
          materialId: r.stockId,
          materialName: r.stockName,
          quantityDelta: -Number((r.quantityNeeded * sale.quantity).toFixed(2)),
          unit: r.unit,
          reason: "SALE",
          referenceId: `Sale #${saleId.slice(-4)}`,
          timestamp: new Date().toISOString(),
        }));
        setMovements((prev) => [...newMovements, ...prev]);
      }
    }

    // Customer dues handling
    if (sale.customerName && sale.customerName !== "Walk-in Customer") {
      setCustomers((prev) => {
        const idx = prev.findIndex(
          (c) => c.name.toLowerCase() === sale.customerName.toLowerCase()
        );
        if (idx !== -1) {
          const copy = [...prev];
          copy[idx] = {
            ...copy[idx],
            totalOrders: copy[idx].totalOrders + 1,
            totalSpent: copy[idx].totalSpent + sale.amount,
            outstandingDue: isDue
              ? copy[idx].outstandingDue + sale.amount
              : copy[idx].outstandingDue,
          };
          return copy;
        } else {
          return [
            {
              id: uid(),
              name: sale.customerName,
              phone: sale.customerPhone || "",
              email: "",
              totalOrders: 1,
              totalSpent: sale.amount,
              outstandingDue: isDue ? sale.amount : 0,
              paymentHistory: [],
            },
            ...prev,
          ];
        }
      });
    }

    // Sync with backend API
    api.createSale(sale);

    setShowQuickAdd(false);
    setToast(
      isDue
        ? `Credit order recorded: ₹${sale.amount} pending from ${sale.customerName}`
        : `Sale recorded: ${sale.productName} · Qty ${sale.quantity}`
    );
  }

  function deleteSale(id) {
    if (!window.confirm("Are you sure you want to delete this order? Inventory and customer dues will be reversed.")) {
      return;
    }

    const sale = sales.find((s) => (s.id || s._id) === id);
    if (sale) {
      // Reverse stock
      const product = products.find((p) => (p.id || p._id) === sale.productId);
      if (product && Array.isArray(product.recipe)) {
        for (const r of product.recipe) {
          const restoreQty = r.quantityNeeded * sale.quantity;
          adjustStock(r.stockId, restoreQty, "SALE_REVERSAL");
        }
      }
      // Reverse customer due
      if (!sale.isPaid && sale.customerName) {
        setCustomers((prev) =>
          prev.map((c) =>
            c.name.toLowerCase() === sale.customerName.toLowerCase()
              ? {
                  ...c,
                  outstandingDue: Math.max(0, c.outstandingDue - (sale.outstandingBalance || 0)),
                }
              : c
          )
        );
      }
    }

    setSales((prev) => prev.filter((s) => (s.id || s._id) !== id));
    api.deleteSale(id);
    setToast("Order deleted and stock restored");
  }

  // Stock Management
  function addStock(item) {
    const newItem = { id: uid(), ...item };
    setStock((prev) => [...prev, newItem]);
    setMovements((prev) => [
      {
        id: uid(),
        materialId: newItem.id,
        materialName: newItem.name,
        quantityDelta: Number(item.quantity),
        unit: item.unit,
        reason: "RESTOCK",
        referenceId: "Initial registration",
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
    setToast(`Added material: ${item.name}`);
  }

  function updateStock(item) {
    setStock((prev) => prev.map((s) => ((s.id || s._id) === (item.id || item._id) ? item : s)));
    setToast(`Updated ${item.name}`);
  }

  function adjustStock(id, delta, reason = "ADJUSTMENT") {
    setStock((prev) =>
      prev.map((s) => {
        if ((s.id || s._id) === id) {
          const newQty = Math.max(0, Number((Number(s.quantity) + delta).toFixed(2)));
          // Log movement
          setMovements((mPrev) => [
            {
              id: uid(),
              materialId: id,
              materialName: s.name,
              quantityDelta: delta,
              unit: s.unit,
              reason: delta > 0 ? "RESTOCK" : "ADJUSTMENT",
              referenceId: reason,
              timestamp: new Date().toISOString(),
            },
            ...mPrev,
          ]);
          return { ...s, quantity: newQty };
        }
        return s;
      })
    );
    api.adjustStock(id, delta, reason);
  }

  function deleteStock(id) {
    if (!window.confirm("Delete this material from inventory?")) return;
    setStock((prev) => prev.filter((s) => (s.id || s._id) !== id));
    setToast("Material deleted");
  }

  // Product Management
  function addProduct(product) {
    const newProd = { id: uid(), order: products.length, ...product };
    setProducts((prev) => [...prev, newProd]);
    api.saveProduct(newProd);
    setToast(`Added product: ${product.name}`);
  }

  function updateProduct(product) {
    setProducts((prev) =>
      prev.map((p) => ((p.id || p._id) === (product.id || product._id) ? { ...p, ...product } : p))
    );
    api.saveProduct(product);
    setToast(`Updated ${product.name}`);
  }

  function deleteProduct(id) {
    if (!window.confirm("Remove this product from your catalog?")) return;
    setProducts((prev) => prev.filter((p) => (p.id || p._id) !== id));
    setToast("Product removed from catalog");
  }

  // Customer Management
  function addCustomer(customer) {
    const newCust = {
      id: uid(),
      totalOrders: 0,
      totalSpent: 0,
      outstandingDue: 0,
      paymentHistory: [],
      ...customer,
    };
    setCustomers((prev) => [newCust, ...prev]);
    api.createCustomer(newCust);
    setToast(`Added customer profile: ${customer.name}`);
  }

  function recordCustomerPayment(id, payment) {
    setCustomers((prev) =>
      prev.map((c) => {
        if ((c.id || c._id) === id) {
          const nextDue = Math.max(0, c.outstandingDue - payment.amount);
          return {
            ...c,
            outstandingDue: nextDue,
            paymentHistory: [
              {
                date: new Date().toISOString(),
                ...payment,
              },
              ...c.paymentHistory,
            ],
          };
        }
        return c;
      })
    );
    api.recordCustomerPayment(id, payment);
    setToast(`Recorded payment of ₹${payment.amount}`);
  }

  function deleteCustomer(id) {
    if (!window.confirm("Delete this customer profile?")) return;
    setCustomers((prev) => prev.filter((c) => (c.id || c._id) !== id));
    setToast("Customer deleted");
  }

  // Expense Management
  function addExpense(expense) {
    const newExp = { id: uid(), ...expense };
    setExpenses((prev) => [newExp, ...prev]);
    api.createExpense(expense);
    setToast(`Expense logged: ${expense.title}`);
  }

  function deleteExpense(id) {
    if (!window.confirm("Delete this expense entry?")) return;
    setExpenses((prev) => prev.filter((e) => (e.id || e._id) !== id));
    setToast("Expense entry deleted");
  }

  // Backup & Restore
  function handleExportBackup() {
    const backupData = {
      app: "Startup IQ",
      version: "3.0.0",
      exportDate: new Date().toISOString(),
      businessType: businessTypeId,
      products,
      stock,
      sales,
      expenses,
      customers,
      movements,
      theme,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Startup_IQ_Backup_${businessTypeId}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setToast("Backup JSON exported successfully");
  }

  function handleImportBackup(jsonData) {
    if (!jsonData || !jsonData.products || !jsonData.stock) {
      alert("Invalid Startup IQ backup file format.");
      return;
    }
    if (jsonData.businessType) setBusinessTypeId(jsonData.businessType);
    if (Array.isArray(jsonData.products)) setProducts(jsonData.products);
    if (Array.isArray(jsonData.stock)) setStock(jsonData.stock);
    if (Array.isArray(jsonData.sales)) setSales(jsonData.sales);
    if (Array.isArray(jsonData.expenses)) setExpenses(jsonData.expenses);
    if (Array.isArray(jsonData.customers)) setCustomers(jsonData.customers);
    if (Array.isArray(jsonData.movements)) setMovements(jsonData.movements);
    if (jsonData.theme) setTheme(jsonData.theme);
    setToast("Backup restored successfully!");
  }

  function handleResetDemo() {
    if (window.confirm("Reset all products, stock, and sales to initial craft starter data?")) {
      const dataset = buildDemoDataset(businessTypeId);
      setProducts(dataset.products);
      setStock(dataset.stock);
      setSales(dataset.sales);
      setToast("Workspace reset to starter state");
    }
  }

  return (
    <Layout
      view={view}
      onNavigate={setView}
      businessType={businessType}
      theme={theme}
      user={user}
      onOpenAuth={() => setShowAuthModal(true)}
      onLogout={handleLogout}
      onToggleTheme={handleToggleTheme}
      onSwitchBusiness={() => setShowOnboarding(true)}
      onQuickAdd={() => setShowQuickAdd(true)}
      backendOnline={backendOnline}
    >
      {view === "dashboard" && (
        <Dashboard
          sales={sales}
          expenses={expenses}
          stock={stock}
          customers={customers}
          products={products}
          businessType={businessType}
          onQuickAdd={() => setShowQuickAdd(true)}
          onNavigate={setView}
        />
      )}

      {view === "products" && (
        <Products
          products={products}
          stock={stock}
          onAdd={addProduct}
          onUpdate={updateProduct}
          onDelete={deleteProduct}
        />
      )}

      {view === "stock" && (
        <Stock
          stock={stock}
          movements={movements}
          onAdd={addStock}
          onUpdate={updateStock}
          onAdjust={adjustStock}
          onDelete={deleteStock}
        />
      )}

      {view === "orders" && (
        <SalesLedger
          sales={sales}
          onDeleteSale={deleteSale}
          onQuickAdd={() => setShowQuickAdd(true)}
        />
      )}

      {view === "expenses" && (
        <Expenses
          expenses={expenses}
          onAddExpense={addExpense}
          onDeleteExpense={deleteExpense}
        />
      )}

      {view === "customers" && (
        <Customers
          customers={customers}
          onAddCustomer={addCustomer}
          onRecordPayment={recordCustomerPayment}
          onDeleteCustomer={deleteCustomer}
        />
      )}

      {view === "insights" && (
        <Insights
          sales={sales}
          stock={stock}
          products={products}
          expenses={expenses}
          businessType={businessType}
        />
      )}

      {view === "settings" && (
        <Settings
          businessType={businessType}
          theme={theme}
          user={user}
          onToggleTheme={handleToggleTheme}
          onSwitchCraft={handleOnboardingComplete}
          onExportBackup={handleExportBackup}
          onImportBackup={handleImportBackup}
          onResetDemo={handleResetDemo}
          backendOnline={backendOnline}
        />
      )}

      {showQuickAdd && (
        <QuickAddSale
          products={products}
          stock={stock}
          customers={customers}
          onSave={addSale}
          onClose={() => setShowQuickAdd(false)}
          onNavigateToStock={() => setView("stock")}
        />
      )}

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {toast && (
        <div className="toast" role="status">
          <CheckIcon /> {toast}
        </div>
      )}
    </Layout>
  );
}
