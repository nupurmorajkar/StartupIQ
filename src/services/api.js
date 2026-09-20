// API Client for Startup IQ
// Seamlessly connects to Express + MongoDB backend when available,
// with resilient localStorage offline-queue fallback.

const BACKEND_URL = "http://localhost:5000/api";

class StartupIQApi {
  constructor() {
    this.backendAvailable = false;
    this.checkBackend();
  }

  async checkBackend() {
    try {
      const res = await fetch(`${BACKEND_URL}/health`, { signal: AbortSignal.timeout(1200) });
      if (res.ok) {
        this.backendAvailable = true;
      }
    } catch {
      this.backendAvailable = false;
    }
  }

  getAuthHeaders() {
    const token = localStorage.getItem("startup_iq_token");
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    if (!this.backendAvailable) return null;
    try {
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        headers: this.getAuthHeaders(),
        signal: AbortSignal.timeout(3000),
        ...options,
      });
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch {
      return null;
    }
  }

  // Auth
  async login(email, password) {
    return await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async signup(userData) {
    return await this.request("/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async getMe() {
    return await this.request("/auth/profile");
  }

  // Products
  async getProducts(craftId) {
    const res = await this.request(`/products?businessTypeId=${craftId}`);
    return res?.data || null;
  }

  async saveProduct(product) {
    if (product.id && !product.id.startsWith("local_")) {
      return await this.request(`/products/${product.id}`, {
        method: "PUT",
        body: JSON.stringify(product),
      });
    }
    return await this.request("/products", {
      method: "POST",
      body: JSON.stringify(product),
    });
  }

  // Stock
  async getStock(craftId) {
    const res = await this.request(`/stock?businessTypeId=${craftId}`);
    return res?.data || null;
  }

  async adjustStock(stockId, delta, reason = "RESTOCK") {
    return await this.request(`/stock/${stockId}/adjust`, {
      method: "PATCH",
      body: JSON.stringify({ delta, reason }),
    });
  }

  async getMovements(craftId) {
    const res = await this.request(`/stock/movements?businessTypeId=${craftId}`);
    return res?.data || null;
  }

  // Sales
  async getSales(craftId) {
    const res = await this.request(`/sales?businessTypeId=${craftId}`);
    return res?.data || null;
  }

  async createSale(saleData) {
    return await this.request("/sales", {
      method: "POST",
      body: JSON.stringify(saleData),
    });
  }

  async deleteSale(saleId) {
    return await this.request(`/sales/${saleId}`, {
      method: "DELETE",
    });
  }

  // Expenses
  async getExpenses(craftId) {
    const res = await this.request(`/expenses?businessTypeId=${craftId}`);
    return res?.data || null;
  }

  async createExpense(expenseData) {
    return await this.request("/expenses", {
      method: "POST",
      body: JSON.stringify(expenseData),
    });
  }

  // Customers / Dues
  async getCustomers(craftId) {
    const res = await this.request(`/customers?businessTypeId=${craftId}`);
    return res?.data || null;
  }

  async createCustomer(customerData) {
    return await this.request("/customers", {
      method: "POST",
      body: JSON.stringify(customerData),
    });
  }

  async recordCustomerPayment(customerId, paymentData) {
    return await this.request(`/customers/${customerId}/payment`, {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
  }
}

export const api = new StartupIQApi();
