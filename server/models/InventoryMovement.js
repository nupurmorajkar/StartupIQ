import mongoose from "mongoose";

const InventoryMovementSchema = new mongoose.Schema(
  {
    materialId: { type: String, required: true },
    materialName: { type: String, required: true },
    quantityDelta: { type: Number, required: true }, // positive for additions, negative for deductions
    unit: { type: String, default: "pcs" },
    reason: {
      type: String,
      enum: ["RESTOCK", "SALE", "SALE_REVERSAL", "ADJUSTMENT", "WASTE"],
      default: "SALE",
    },
    referenceId: { type: String, default: "" }, // saleId or orderId or note
    timestamp: { type: Date, default: Date.now, index: true },
    businessTypeId: { type: String, default: "baker", index: true },
  },
  { timestamps: true }
);

InventoryMovementSchema.index({ businessTypeId: 1, materialId: 1, timestamp: -1 });

export const InventoryMovement =
  mongoose.models.InventoryMovement ||
  mongoose.model("InventoryMovement", InventoryMovementSchema);
