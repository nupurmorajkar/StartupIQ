// Resilient in-memory store for Startup IQ
import { BUSINESS_TYPES } from "../../src/data/businessTypes.js";
import { buildDemoDataset } from "../../src/data/seed.js";
import bcrypt from "bcryptjs";

class MemoryStore {
  constructor() {
    this.currentBusinessType = "baker";
    this.users = [
      {
        id: "u_demo",
        name: "Aarav Sharma",
        email: "founder@startapiq.com",
        passwordHash: bcrypt.hashSync("password123", 8),
        businessName: "Flour & Bloom Studio",
        businessType: "baker",
        currency: "₹",
        theme: "light",
        taxPreference: "Inclusive",
      },
    ];
    this.user = this.users[0];
    this.customers = [];
    this.inventoryMovements = [];
    this.resetForCraft("baker");
  }

  resetForCraft(craftId) {
    this.currentBusinessType = craftId;
    const craft = BUSINESS_TYPES.find((b) => b.id === craftId) || BUSINESS_TYPES[0];
    const demo = buildDemoDataset(craftId);

    this.stock = demo.stock.map((s, idx) => ({
      id: "stock_" + idx + "_" + Date.now(),
      name: s.name,
      unit: s.unit || "pcs",
      quantity: s.quantity,
      lowThreshold: s.low || 2,
      costPerUnit: Math.round(Math.random() * 80 + 30),
      supplier: "Local Wholesale Co.",
      businessTypeId: craftId,
      updatedAt: new Date().toISOString(),
    }));

    this.products = demo.products.map((p, idx) => {
      // Build a realistic BOM recipe from available stock items
      const recipe = [];
      if (this.stock.length >= 2) {
        recipe.push({
          stockId: this.stock[0].id,
          stockName: this.stock[0].name,
          quantityNeeded: 0.5,
          unit: this.stock[0].unit,
        });
        recipe.push({
          stockId: this.stock[1].id,
          stockName: this.stock[1].name,
          quantityNeeded: 1,
          unit: this.stock[1].unit,
        });
      }

      // Compute actual cost from BOM recipe
      const actualCost = recipe.reduce((acc, r) => {
        const mat = this.stock.find((st) => st.id === r.stockId);
        return acc + (mat ? mat.costPerUnit * r.quantityNeeded : 0);
      }, 0);

      return {
        id: "prod_" + idx + "_" + Date.now(),
        name: p.name,
        category: p.category,
        price: p.price,
        costPrice: Math.round(actualCost || p.price * 0.42),
        recipe,
        active: true,
        order: idx,
        businessTypeId: craftId,
        createdAt: new Date().toISOString(),
      };
    });

    this.customers = [
      {
        id: "cust_1",
        name: "Priya Mehta",
        phone: "+91 98200 11223",
        email: "priya@example.com",
        totalOrders: 4,
        totalSpent: 3400,
        outstandingDue: 450,
        paymentHistory: [
          { date: new Date(Date.now() - 5 * 86400000).toISOString(), amount: 950, method: "UPI", notes: "Red Velvet Cake" }
        ],
        businessTypeId: craftId,
      },
      {
        id: "cust_2",
        name: "Rohan Varma",
        phone: "+91 98111 22334",
        email: "rohan@example.com",
        totalOrders: 2,
        totalSpent: 1700,
        outstandingDue: 0,
        paymentHistory: [
          { date: new Date(Date.now() - 8 * 86400000).toISOString(), amount: 850, method: "Cash", notes: "Cookies box" }
        ],
        businessTypeId: craftId,
      },
      {
        id: "cust_3",
        name: "Ananya Iyer",
        phone: "+91 98444 55667",
        email: "ananya@example.com",
        totalOrders: 5,
        totalSpent: 4250,
        outstandingDue: 1200,
        paymentHistory: [
          { date: new Date(Date.now() - 2 * 86400000).toISOString(), amount: 1400, method: "UPI", notes: "Birthday Cake" }
        ],
        businessTypeId: craftId,
      },
    ];

    this.sales = demo.sales.map((sl, idx) => {
      const isDue = idx % 5 === 0;
      const amount = sl.amount;
      const costAmount = Math.round(amount * 0.42);
      return {
        id: "sale_" + idx + "_" + Date.now(),
        productId: this.products[0]?.id || "custom",
        productName: sl.productName,
        quantity: sl.quantity,
        unitPrice: Math.round(amount / sl.quantity),
        amount,
        costAmount,
        profit: amount - costAmount,
        customerName: isDue ? "Priya Mehta" : "Regular Customer",
        customerPhone: isDue ? "+91 98200 11223" : "+91 98765 43210",
        paymentMethod: isDue ? "Due" : ["UPI", "Cash", "Card"][idx % 3],
        isPaid: !isDue,
        amountPaid: isDue ? 0 : amount,
        outstandingBalance: isDue ? amount : 0,
        notes: isDue ? "Payment promised by Friday" : "",
        date: sl.date,
        businessTypeId: craftId,
      };
    });

    this.expenses = [
      {
        id: "exp_1",
        title: "Eco-friendly Cake Boxes (pack of 50)",
        category: "Packaging",
        amount: 850,
        date: new Date(Date.now() - 3 * 86400000).toISOString(),
        businessTypeId: craftId,
        notes: "Biodegradable craft boxes",
      },
      {
        id: "exp_2",
        title: "Commercial Baking Butter restock",
        category: "Raw Materials",
        amount: 1400,
        date: new Date(Date.now() - 7 * 86400000).toISOString(),
        businessTypeId: craftId,
        notes: "Local dairy delivery",
      },
      {
        id: "exp_3",
        title: "Instagram Promotional Boost",
        category: "Marketing",
        amount: 600,
        date: new Date(Date.now() - 12 * 86400000).toISOString(),
        businessTypeId: craftId,
        notes: "Targeted to 5km radius",
      },
    ];

    this.inventoryMovements = [
      {
        id: "mov_1",
        materialId: this.stock[0]?.id || "stk_1",
        materialName: this.stock[0]?.name || "Flour",
        quantityDelta: 10,
        unit: this.stock[0]?.unit || "kg",
        reason: "RESTOCK",
        referenceId: "Initial stock intake",
        timestamp: new Date(Date.now() - 14 * 86400000).toISOString(),
        businessTypeId: craftId,
      },
    ];
  }
}

export const memStore = new MemoryStore();
