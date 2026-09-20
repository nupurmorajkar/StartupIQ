import { Sale } from "../models/Sale.js";
import { Product } from "../models/Product.js";
import { Stock } from "../models/Stock.js";
import { Customer } from "../models/Customer.js";
import { InventoryMovement } from "../models/InventoryMovement.js";
import { isDbConnected } from "../config/db.js";
import { memStore } from "../store/memStore.js";

export async function getSales(req, res) {
  try {
    const { businessTypeId, period, limit } = req.query;
    const craft = businessTypeId || memStore.currentBusinessType;

    if (isDbConnected()) {
      let query = { businessTypeId: craft };
      if (period === "daily") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        query.date = { $gte: today };
      } else if (period === "weekly") {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        query.date = { $gte: d };
      } else if (period === "monthly") {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        query.date = { $gte: d };
      }

      const sales = await Sale.find(query)
        .sort({ date: -1 })
        .limit(Number(limit) || 200);
      return res.json({ success: true, data: sales });
    }

    let list = memStore.sales.filter((s) => s.businessTypeId === craft);
    list.sort((a, b) => new Date(b.date) - new Date(a.date));
    if (limit) list = list.slice(0, Number(limit));

    return res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createSale(req, res) {
  try {
    const {
      productId,
      productName,
      quantity,
      unitPrice,
      amount,
      customerName,
      customerPhone,
      paymentMethod = "UPI",
      notes = "",
      autoDeductStock = true,
      businessTypeId,
    } = req.body;

    const craft = businessTypeId || memStore.currentBusinessType;
    const qty = Math.max(1, Number(quantity) || 1);
    const total = Number(amount);
    const isDue = paymentMethod === "Due";

    // 1. Validate Product & BOM Recipe Requirements
    let prod = null;
    let actualCost = 0;
    let recipeItems = [];

    if (isDbConnected()) {
      if (productId && productId !== "custom") {
        prod = await Product.findById(productId);
      }
      if (prod && Array.isArray(prod.recipe)) {
        recipeItems = prod.recipe;
      }

      // Check stock availability if auto-deduction is requested
      if (autoDeductStock && recipeItems.length > 0) {
        for (const r of recipeItems) {
          const needed = r.quantityNeeded * qty;
          const stockItem = await Stock.findById(r.stockId);
          if (!stockItem) continue;

          // Track actual COGS
          actualCost += (stockItem.costPerUnit || 0) * needed;

          // Negative inventory prevention
          if (stockItem.quantity < needed) {
            const shortage = (needed - stockItem.quantity).toFixed(2);
            return res.status(400).json({
              success: false,
              code: "INSUFFICIENT_STOCK",
              message: `Not enough ${stockItem.name} in stock. Required: ${needed} ${stockItem.unit} · Available: ${stockItem.quantity} ${stockItem.unit} · Shortage: ${shortage} ${stockItem.unit}. Please restock before recording this sale.`,
              details: {
                material: stockItem.name,
                required: needed,
                available: stockItem.quantity,
                shortage: Number(shortage),
                unit: stockItem.unit,
              },
            });
          }
        }
      }

      // If no BOM, estimate cost from product's set costPrice
      if (actualCost === 0 && prod?.costPrice) {
        actualCost = prod.costPrice * qty;
      }

      const profit = total - actualCost; // Can be negative if selling below cost

      // Create Sale Document
      const sale = await Sale.create({
        productId: productId || "custom",
        productName: productName || prod?.name || "Custom Item",
        quantity: qty,
        unitPrice: Number(unitPrice || total / qty),
        amount: total,
        costAmount: actualCost,
        profit,
        customerName: customerName?.trim() || "Walk-in Customer",
        customerPhone: customerPhone?.trim() || "",
        paymentMethod,
        isPaid: !isDue,
        amountPaid: isDue ? 0 : total,
        outstandingBalance: isDue ? total : 0,
        notes: notes?.trim() || "",
        date: new Date(),
        businessTypeId: craft,
      });

      // Deduct inventory & record movement audit log
      const deductedSummary = [];
      if (autoDeductStock && recipeItems.length > 0) {
        for (const r of recipeItems) {
          const needed = r.quantityNeeded * qty;
          await Stock.findByIdAndUpdate(r.stockId, { $inc: { quantity: -needed } });
          await InventoryMovement.create({
            materialId: r.stockId,
            materialName: r.stockName,
            quantityDelta: -needed,
            unit: r.unit,
            reason: "SALE",
            referenceId: sale._id.toString(),
            businessTypeId: craft,
          });
          deductedSummary.push(`${r.stockName}: -${needed} ${r.unit}`);
        }
      }

      // Update customer record / dues
      const custName = customerName?.trim() || "Walk-in Customer";
      let customer = await Customer.findOne({ businessTypeId: craft, name: custName });
      if (!customer && (isDue || custName !== "Walk-in Customer")) {
        customer = await Customer.create({
          name: custName,
          phone: customerPhone?.trim() || "",
          businessTypeId: craft,
          totalOrders: 1,
          totalSpent: total,
          outstandingDue: isDue ? total : 0,
        });
      } else if (customer) {
        customer.totalOrders += 1;
        customer.totalSpent += total;
        if (isDue) customer.outstandingDue += total;
        await customer.save();
      }

      return res.status(201).json({
        success: true,
        data: sale,
        deductions: deductedSummary,
        message: isDue ? `Sale recorded as Due (₹${total} pending)` : "Sale recorded successfully",
      });
    }

    // In-memory fallback
    prod = memStore.products.find((p) => p.id === productId || p._id === productId);
    if (prod && Array.isArray(prod.recipe)) {
      recipeItems = prod.recipe;
    }

    if (autoDeductStock && recipeItems.length > 0) {
      for (const r of recipeItems) {
        const needed = r.quantityNeeded * qty;
        const stockItem = memStore.stock.find((s) => s.id === r.stockId || s._id === r.stockId);
        if (!stockItem) continue;

        actualCost += (stockItem.costPerUnit || 0) * needed;

        if (stockItem.quantity < needed) {
          const shortage = (needed - stockItem.quantity).toFixed(2);
          return res.status(400).json({
            success: false,
            code: "INSUFFICIENT_STOCK",
            message: `Not enough ${stockItem.name} in stock. Required: ${needed} ${stockItem.unit} · Available: ${stockItem.quantity} ${stockItem.unit} · Shortage: ${shortage} ${stockItem.unit}. Please restock before recording this sale.`,
            details: {
              material: stockItem.name,
              required: needed,
              available: stockItem.quantity,
              shortage: Number(shortage),
              unit: stockItem.unit,
            },
          });
        }
      }
    }

    if (actualCost === 0 && prod?.costPrice) {
      actualCost = prod.costPrice * qty;
    }

    const profit = total - actualCost;
    const saleId = "sale_" + Date.now();

    const newSale = {
      id: saleId,
      productId: productId || "custom",
      productName: productName || prod?.name || "Custom Item",
      quantity: qty,
      unitPrice: Number(unitPrice || total / qty),
      amount: total,
      costAmount: actualCost,
      profit,
      customerName: customerName?.trim() || "Walk-in Customer",
      customerPhone: customerPhone?.trim() || "",
      paymentMethod,
      isPaid: !isDue,
      amountPaid: isDue ? 0 : total,
      outstandingBalance: isDue ? total : 0,
      notes: notes?.trim() || "",
      date: new Date().toISOString(),
      businessTypeId: craft,
    };

    memStore.sales.unshift(newSale);

    const deductedSummary = [];
    if (autoDeductStock && recipeItems.length > 0) {
      for (const r of recipeItems) {
        const needed = r.quantityNeeded * qty;
        const stockItem = memStore.stock.find((s) => s.id === r.stockId || s._id === r.stockId);
        if (stockItem) {
          stockItem.quantity = Math.max(0, Number((stockItem.quantity - needed).toFixed(2)));
          memStore.inventoryMovements.unshift({
            id: "mov_" + Date.now(),
            materialId: stockItem.id,
            materialName: stockItem.name,
            quantityDelta: -needed,
            unit: stockItem.unit,
            reason: "SALE",
            referenceId: saleId,
            timestamp: new Date().toISOString(),
            businessTypeId: craft,
          });
          deductedSummary.push(`${stockItem.name}: -${needed} ${stockItem.unit}`);
        }
      }
    }

    // Customer dues handling
    const custName = customerName?.trim() || "Walk-in Customer";
    let customer = memStore.customers.find((c) => c.name.toLowerCase() === custName.toLowerCase());
    if (customer) {
      customer.totalOrders += 1;
      customer.totalSpent += total;
      if (isDue) customer.outstandingDue += total;
    } else if (isDue || custName !== "Walk-in Customer") {
      memStore.customers.push({
        id: "cust_" + Date.now(),
        name: custName,
        phone: customerPhone?.trim() || "",
        email: "",
        totalOrders: 1,
        totalSpent: total,
        outstandingDue: isDue ? total : 0,
        paymentHistory: [],
        businessTypeId: craft,
      });
    }

    return res.status(201).json({
      success: true,
      data: newSale,
      deductions: deductedSummary,
      message: isDue ? `Sale recorded as Due (₹${total} pending)` : "Sale recorded successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteSale(req, res) {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const sale = await Sale.findById(id);
      if (!sale) return res.status(404).json({ success: false, message: "Sale not found" });

      // Reverse customer due if was Due
      if (!sale.isPaid && sale.customerName) {
        await Customer.findOneAndUpdate(
          { businessTypeId: sale.businessTypeId, name: sale.customerName },
          { $inc: { outstandingDue: -sale.outstandingBalance } }
        );
      }

      // Reversal of stock deduction if product had a recipe
      const prod = await Product.findById(sale.productId);
      if (prod && Array.isArray(prod.recipe)) {
        for (const r of prod.recipe) {
          const restoreQty = r.quantityNeeded * sale.quantity;
          await Stock.findByIdAndUpdate(r.stockId, { $inc: { quantity: restoreQty } });
          await InventoryMovement.create({
            materialId: r.stockId,
            materialName: r.stockName,
            quantityDelta: restoreQty,
            unit: r.unit,
            reason: "SALE_REVERSAL",
            referenceId: sale._id.toString(),
            businessTypeId: sale.businessTypeId,
          });
        }
      }

      await Sale.findByIdAndDelete(id);
      return res.json({ success: true, message: "Sale deleted and inventory restored" });
    }

    const saleIdx = memStore.sales.findIndex((s) => s.id === id || s._id === id);
    if (saleIdx === -1) return res.status(404).json({ success: false, message: "Sale not found" });

    const sale = memStore.sales[saleIdx];

    // Reverse due
    if (!sale.isPaid && sale.customerName) {
      const cust = memStore.customers.find((c) => c.name.toLowerCase() === sale.customerName.toLowerCase());
      if (cust) {
        cust.outstandingDue = Math.max(0, cust.outstandingDue - (sale.outstandingBalance || 0));
      }
    }

    // Reverse stock
    const prod = memStore.products.find((p) => p.id === sale.productId || p._id === sale.productId);
    if (prod && Array.isArray(prod.recipe)) {
      for (const r of prod.recipe) {
        const restoreQty = r.quantityNeeded * sale.quantity;
        const stk = memStore.stock.find((s) => s.id === r.stockId || s._id === r.stockId);
        if (stk) {
          stk.quantity = Number((stk.quantity + restoreQty).toFixed(2));
          memStore.inventoryMovements.unshift({
            id: "mov_" + Date.now(),
            materialId: stk.id,
            materialName: stk.name,
            quantityDelta: restoreQty,
            unit: stk.unit,
            reason: "SALE_REVERSAL",
            referenceId: id,
            timestamp: new Date().toISOString(),
            businessTypeId: sale.businessTypeId,
          });
        }
      }
    }

    memStore.sales.splice(saleIdx, 1);
    return res.json({ success: true, message: "Sale deleted and inventory restored" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
