import { Stock } from "../models/Stock.js";
import { InventoryMovement } from "../models/InventoryMovement.js";
import { isDbConnected } from "../config/db.js";
import { memStore } from "../store/memStore.js";

export async function getStock(req, res) {
  try {
    const { businessTypeId } = req.query;
    const craft = businessTypeId || memStore.currentBusinessType;

    if (isDbConnected()) {
      const stock = await Stock.find({ businessTypeId: craft }).sort({ name: 1 });
      return res.json({ success: true, data: stock });
    }

    const filtered = memStore.stock.filter((s) => s.businessTypeId === craft);
    return res.json({ success: true, data: filtered });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createStock(req, res) {
  try {
    const { name, unit, quantity, lowThreshold, costPerUnit, supplier, businessTypeId } = req.body;
    const craft = businessTypeId || memStore.currentBusinessType;

    if (!name || quantity === undefined) {
      return res.status(400).json({ success: false, message: "Name and quantity are required" });
    }

    const qty = Number(quantity);

    if (isDbConnected()) {
      const item = await Stock.create({
        name: name.trim(),
        unit: unit || "pcs",
        quantity: qty,
        lowThreshold: Number(lowThreshold || 2),
        costPerUnit: Number(costPerUnit || 0),
        supplier: supplier || "",
        businessTypeId: craft,
      });

      await InventoryMovement.create({
        materialId: item._id.toString(),
        materialName: item.name,
        quantityDelta: qty,
        unit: item.unit,
        reason: "RESTOCK",
        referenceId: "Initial stock registration",
        businessTypeId: craft,
      });

      return res.status(201).json({ success: true, data: item });
    }

    const newItem = {
      id: "stock_" + Date.now(),
      name: name.trim(),
      unit: unit || "pcs",
      quantity: qty,
      lowThreshold: Number(lowThreshold || 2),
      costPerUnit: Number(costPerUnit || 0),
      supplier: supplier || "",
      businessTypeId: craft,
      updatedAt: new Date().toISOString(),
    };
    memStore.stock.push(newItem);
    memStore.inventoryMovements.unshift({
      id: "mov_" + Date.now(),
      materialId: newItem.id,
      materialName: newItem.name,
      quantityDelta: qty,
      unit: newItem.unit,
      reason: "RESTOCK",
      referenceId: "Initial stock registration",
      timestamp: new Date().toISOString(),
      businessTypeId: craft,
    });
    return res.status(201).json({ success: true, data: newItem });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateStock(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (isDbConnected()) {
      const updated = await Stock.findByIdAndUpdate(id, updates, { new: true });
      return res.json({ success: true, data: updated });
    }

    const idx = memStore.stock.findIndex((s) => s.id === id || s._id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: "Stock item not found" });

    memStore.stock[idx] = { ...memStore.stock[idx], ...updates, updatedAt: new Date().toISOString() };
    return res.json({ success: true, data: memStore.stock[idx] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function adjustStockQuantity(req, res) {
  try {
    const { id } = req.params;
    const { delta, reason = "RESTOCK", note = "" } = req.body;

    if (delta === undefined || isNaN(delta)) {
      return res.status(400).json({ success: false, message: "Valid delta number is required" });
    }

    const numDelta = Number(delta);

    if (isDbConnected()) {
      const item = await Stock.findById(id);
      if (!item) return res.status(404).json({ success: false, message: "Material not found" });

      const newQty = Math.max(0, item.quantity + numDelta);
      item.quantity = newQty;
      await item.save();

      await InventoryMovement.create({
        materialId: item._id.toString(),
        materialName: item.name,
        quantityDelta: numDelta,
        unit: item.unit,
        reason: numDelta > 0 ? "RESTOCK" : "ADJUSTMENT",
        referenceId: note || "Quick stepper adjustment",
        businessTypeId: item.businessTypeId,
      });

      return res.json({ success: true, data: item });
    }

    const idx = memStore.stock.findIndex((s) => s.id === id || s._id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: "Stock item not found" });

    const item = memStore.stock[idx];
    item.quantity = Math.max(0, Number((item.quantity + numDelta).toFixed(2)));
    item.updatedAt = new Date().toISOString();

    memStore.inventoryMovements.unshift({
      id: "mov_" + Date.now(),
      materialId: item.id,
      materialName: item.name,
      quantityDelta: numDelta,
      unit: item.unit,
      reason: numDelta > 0 ? "RESTOCK" : "ADJUSTMENT",
      referenceId: note || "Quick stepper adjustment",
      timestamp: new Date().toISOString(),
      businessTypeId: item.businessTypeId,
    });

    return res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getInventoryMovements(req, res) {
  try {
    const { businessTypeId } = req.query;
    const craft = businessTypeId || memStore.currentBusinessType;

    if (isDbConnected()) {
      const movements = await InventoryMovement.find({ businessTypeId: craft })
        .sort({ timestamp: -1 })
        .limit(100);
      return res.json({ success: true, data: movements });
    }

    const filtered = memStore.inventoryMovements.filter((m) => m.businessTypeId === craft);
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return res.json({ success: true, data: filtered.slice(0, 100) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteStock(req, res) {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      await Stock.findByIdAndDelete(id);
      return res.json({ success: true, message: "Stock deleted" });
    }

    memStore.stock = memStore.stock.filter((s) => s.id !== id && s._id !== id);
    return res.json({ success: true, message: "Stock deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
