import mongoose from "mongoose";

const StockSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    unit: { type: String, required: true, default: "pcs" },
    quantity: { type: Number, required: true, min: 0 },
    lowThreshold: { type: Number, default: 2, min: 0 },
    costPerUnit: { type: Number, default: 0, min: 0 },
    supplier: { type: String, default: "" },
    businessTypeId: { type: String, default: "baker", index: true },
  },
  { timestamps: true }
);

StockSchema.index({ businessTypeId: 1, name: 1 });

export const Stock = mongoose.models.Stock || mongoose.model("Stock", StockSchema);
