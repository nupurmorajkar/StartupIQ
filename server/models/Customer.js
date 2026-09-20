import mongoose from "mongoose";

const PaymentRecordSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    amount: { type: Number, required: true },
    method: { type: String, enum: ["Cash", "UPI", "Card"], default: "UPI" },
    notes: { type: String, default: "" },
    saleId: { type: String, default: "" },
  },
  { _id: false }
);

const CustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true },
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    outstandingDue: { type: Number, default: 0 },
    paymentHistory: [PaymentRecordSchema],
    businessTypeId: { type: String, default: "baker", index: true },
  },
  { timestamps: true }
);

CustomerSchema.index({ businessTypeId: 1, name: 1 });
CustomerSchema.index({ businessTypeId: 1, outstandingDue: -1 });

export const Customer = mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);
