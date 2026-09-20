import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["Raw Materials", "Packaging", "Rent & Utilities", "Marketing", "Equipment", "Delivery", "Other"],
      default: "Packaging",
    },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now, index: true },
    notes: { type: String, default: "" },
    businessTypeId: { type: String, default: "baker", index: true },
  },
  { timestamps: true }
);

ExpenseSchema.index({ businessTypeId: 1, date: -1 });

export const Expense = mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);
