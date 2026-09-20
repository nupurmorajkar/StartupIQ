import { getBusinessType } from "./businessTypes.js";
import { uid } from "../utils/storage.js";

// Deterministic-ish pseudo-random so the demo data feels alive but stable
// within a session (re-seeding on business switch is expected).
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seedProducts(businessTypeId) {
  const type = getBusinessType(businessTypeId);
  return type.products.map((p, i) => ({
    id: uid(),
    name: p.name,
    price: p.price,
    category: p.category,
    active: true,
    order: i,
  }));
}

export function seedStock(businessTypeId) {
  const type = getBusinessType(businessTypeId);
  return type.stock.map((s) => ({
    id: uid(),
    name: s.name,
    unit: s.unit,
    quantity: s.quantity,
    lowThreshold: s.low,
  }));
}

export function seedSales(businessTypeId, products) {
  const rand = mulberry32(
    businessTypeId.split("").reduce((a, c) => a + c.charCodeAt(0), 7)
  );
  const sales = [];
  const days = 42;
  const today = new Date();

  for (let d = days; d >= 0; d--) {
    const day = new Date(today);
    day.setDate(day.getDate() - d);
    // weekday-shaped demand: weekends a little busier for most crafts
    const weekday = day.getDay();
    const weekendBoost = weekday === 0 || weekday === 6 ? 1.35 : 1;
    const baseCount = Math.round((rand() * 2.4 + 0.6) * weekendBoost);

    for (let i = 0; i < baseCount; i++) {
      const product = products[Math.floor(rand() * products.length)];
      if (!product) continue;
      const qty = 1 + Math.floor(rand() * 2.2);
      const hour = 9 + Math.floor(rand() * 10);
      const minute = Math.floor(rand() * 60);
      const saleDate = new Date(day);
      saleDate.setHours(hour, minute, 0, 0);
      sales.push({
        id: uid(),
        productId: product.id,
        productName: product.name,
        quantity: qty,
        amount: product.price * qty,
        date: saleDate.toISOString(),
      });
    }
  }
  return sales.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function buildDemoDataset(businessTypeId) {
  const products = seedProducts(businessTypeId);
  const stock = seedStock(businessTypeId);
  const sales = seedSales(businessTypeId, products);
  return { products, stock, sales };
}
