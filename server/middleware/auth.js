import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "startup_iq_secure_dev_secret_key_2026";

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      code: "AUTH_REQUIRED",
      message: "Please log in to access this resource.",
    });
  }

  try {
    const token = authHeader.split(" ")[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({
      success: false,
      code: "AUTH_EXPIRED",
      message: "Your session has expired. Please log in again.",
    });
  }
}