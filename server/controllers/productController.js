import { Product } from "../models/Product.js";
import { isDbConnected } from "../config/db.js";
import { memStore } from "../store/memStore.js";

export async function getProducts(req, res) {
  try {
    const { businessTypeId } = req.query;
    const craft = businessTypeId || memStore.currentBusinessType;

    if (isDbConnected()) {
      const products = await Product.find({ businessTypeId: craft }).sort({ order: 1, createdAt: -1 });
      return res.json({ success: true, data: products });
    }

    const filtered = memStore.products.filter((p) => p.businessTypeId === craft);
    return res.json({ success: true, data: filtered });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createProduct(req, res) {
  try {
    const { name, category, price, costPrice, recipe, active, businessTypeId } = req.body;
    const craft = businessTypeId || memStore.currentBusinessType;

    if (!name || price === undefined) {
      return res.status(400).json({ success: false, message: "Name and price are required" });
    }

    if (isDbConnected()) {
      const product = await Product.create({
        name,
        category: category || "General",
        price: Number(price),
        costPrice: Number(costPrice || 0),
        recipe: recipe || [],
        active: active !== false,
        businessTypeId: craft,
      });
      return res.status(201).json({ success: true, data: product });
    }

    const newProd = {
      id: "prod_" + Date.now(),
      name,
      category: category || "General",
      price: Number(price),
      costPrice: Number(costPrice || 0),
      recipe: recipe || [],
      active: active !== false,
      businessTypeId: craft,
      createdAt: new Date().toISOString(),
    };
    memStore.products.unshift(newProd);
    return res.status(201).json({ success: true, data: newProd });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (isDbConnected()) {
      const updated = await Product.findByIdAndUpdate(id, updates, { new: true });
      return res.json({ success: true, data: updated });
    }

    const idx = memStore.products.findIndex((p) => p.id === id || p._id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: "Product not found" });

    memStore.products[idx] = { ...memStore.products[idx], ...updates };
    return res.json({ success: true, data: memStore.products[idx] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteProduct(req, res) {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      await Product.findByIdAndDelete(id);
      return res.json({ success: true, message: "Deleted successfully" });
    }

    memStore.products = memStore.products.filter((p) => p.id !== id && p._id !== id);
    return res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
