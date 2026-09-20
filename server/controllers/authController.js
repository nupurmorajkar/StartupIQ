import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { isDbConnected } from "../config/db.js";
import { memStore } from "../store/memStore.js";
import { generateToken } from "../middleware/auth.js";
import { BUSINESS_TYPES } from "../../src/data/businessTypes.js";

function publicUser(user) {
  if (!user) return null;

  return {
    id: user._id?.toString?.() || user.id,
    name: user.name,
    email: user.email,
    businessName: user.businessName,
    businessType: user.businessType,
    currency: user.currency,
    theme: user.theme,
    taxPreference: user.taxPreference,
  };
}

export async function signup(req, res) {
  try {
    const { name, email, password, businessName, businessType, currency } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (isDbConnected()) {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "An account with this email already exists. Please log in.",
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await User.create({
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        businessName: businessName?.trim() || `${name}'s Studio`,
        businessType: businessType || "baker",
        currency: currency || "₹",
      });

      const token = generateToken({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      });

      return res.status(201).json({
        success: true,
        message: "Welcome to Startup IQ!",
        token,
        user: publicUser(user),
      });
    }

    const exists = memStore.users.find((u) => u.email === cleanEmail);
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists in this session.",
      });
    }

    const newUser = {
      id: "u_" + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      passwordHash: bcrypt.hashSync(password, 8),
      businessName: businessName?.trim() || `${name}'s Studio`,
      businessType: businessType || "baker",
      currency: currency || "₹",
      theme: "light",
      taxPreference: "Inclusive",
    };

    memStore.users.push(newUser);
    memStore.user = newUser;
    memStore.currentUserId = newUser.id;
    memStore.resetForCraft(newUser.businessType);

    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });

    return res.status(201).json({
      success: true,
      message: "Welcome to Startup IQ!",
      token,
      user: publicUser(newUser),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (isDbConnected()) {
      const user = await User.findOne({ email: cleanEmail });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "No account found with this email. Please check or sign up.",
        });
      }

      const match = await bcrypt.compare(password, user.passwordHash);

      if (!match) {
        return res.status(401).json({
          success: false,
          message: "Incorrect password. Please try again.",
        });
      }

      const token = generateToken({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      });

      return res.json({
        success: true,
        message: "Login successful",
        token,
        user: publicUser(user),
      });
    }

    const user = memStore.users.find((u) => u.email === cleanEmail);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const match = bcrypt.compareSync(password, user.passwordHash);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password. Please try again.",
      });
    }

    memStore.user = user;
    memStore.currentUserId = user.id;

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: publicUser(user),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getProfile(req, res) {
  try {
    if (isDbConnected()) {
      const user = await User.findById(req.user.id).select("-passwordHash");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User profile not found.",
        });
      }

      return res.json({
        success: true,
        data: publicUser(user),
      });
    }

    const user = memStore.users.find((u) => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
    }

    memStore.user = user;
    memStore.currentUserId = user.id;

    return res.json({
      success: true,
      data: publicUser(user),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const allowedFields = ["name", "businessName", "businessType", "currency", "theme", "taxPreference"];

    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
    );

    if (isDbConnected()) {
      const user = await User.findByIdAndUpdate(req.user.id, updates, {
        new: true,
      }).select("-passwordHash");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User profile not found.",
        });
      }

      return res.json({ success: true, data: user });
    }

    const idx = memStore.users.findIndex((u) => u.id === req.user.id);

    if (idx === -1) {
      return res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
    }

    memStore.users[idx] = { ...memStore.users[idx], ...updates };
    memStore.user = memStore.users[idx];

    return res.json({ success: true, data: memStore.user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function switchCraft(req, res) {
  try {
    const { craftId } = req.body;

    const craft = BUSINESS_TYPES.find((b) => b.id === craftId);

    if (!craft) {
      return res.status(400).json({
        success: false,
        message: "Invalid business type ID",
      });
    }

    memStore.resetForCraft(craftId);

    if (isDbConnected()) {
      await User.findByIdAndUpdate(req.user.id, {
        businessType: craftId,
      });
    } else {
      const user = memStore.users.find((u) => u.id === req.user.id);
      if (user) {
        user.businessType = craftId;
        memStore.user = user;
        memStore.currentUserId = user.id;
      }
    }

    return res.json({
      success: true,
      message: `Switched business workspace to ${craft.name}`,
      businessType: craft,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}