import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    businessName: { type: String, default: "My Startup" },
    businessType: { type: String, default: "baker" },
    currency: { type: String, default: "₹" },
    theme: { type: String, enum: ["light", "dark"], default: "light" },
    taxPreference: { type: String, default: "Inclusive" },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model("User", UserSchema);