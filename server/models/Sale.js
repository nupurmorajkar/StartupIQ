import mongoose from "mongoose";

const SaleSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
    costAmount: { type: Number, default: 0, min: 0 },
    profit: { type: Number, default: 0 },
    customerName: { type: String, default: "Walk-in" },
    customerPhone: { type: String, default: "" },
    customerId: { type: String, default: "" },
    paymentMethod: {
      type: String,
      enum: ["Cash", "UPI", "Card", "Due"],
      default: "UPI",
    },
    isPaid: { type: Boolean, default: true },
    amountPaid: { type: Number, default: 0 },
    outstandingBalance: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    date: { type: Date, default: Date.now, index: true },
    businessTypeId: { type: String, default: "baker", index: true },
  },
  { timestamps: true }
);

SaleSchema.index({ businessTypeId: 1, date: -1 });
SaleSchema.index({ businessTypeId: 1, paymentMethod: 1 });

export const Sale = mongoose.models.Sale || mongoose.model("Sale", SaleSchema);
