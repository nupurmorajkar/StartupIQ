import mongoose from "mongoose";

const RecipeItemSchema = new mongoose.Schema(
  {
    stockId: { type: String, required: true },
    stockName: { type: String, required: true },
    quantityNeeded: { type: Number, required: true, min: 0 },
    unit: { type: String, default: "pcs" },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, default: 0, min: 0 },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    recipe: [RecipeItemSchema],
    businessTypeId: { type: String, default: "baker", index: true },
  },
  { timestamps: true }
);

ProductSchema.index({ businessTypeId: 1, category: 1 });

export const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
