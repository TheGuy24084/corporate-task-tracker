const jwt = require("jsonwebtoken");

/**
 * Middleware to verify JWT token from Authorization header.
 * Attaches decoded user payload to req.user on success.
 */
const verifyToken = (req, res, next) => {
  const authHeader =
    (typeof req.header === "function" ? req.header("Authorization") : null) ||
    req.headers?.authorization ||
    req.headers?.Authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Access denied: No token provided" });
  }

  if (!authHeader.startsWith("Bearer ") && !authHeader.startsWith("bearer ")) {
    return res.status(401).json({ message: "Access denied: Invalid token format" });
  }

  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return res.status(401).json({ message: "Access denied: No token provided" });
  }

  try {
    const secret = process.env.JWT_SECRET || "supersecretjwtkey123";
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

/**
 * Middleware to restrict access to Admin users only.
 * Checks if req.user.role === 'Admin'.
 */
const authorizeAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "Admin") {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
  next();
};

module.exports = {
  verifyToken,
  authorizeAdmin,
};
