// backend/middleware/authMiddleware.js

const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * Middleware to verify the JWT token from the Authorization header.
 * If valid, it attaches the decoded user payload to req.user.
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  // Expecting "Bearer TOKEN"
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    // No token provided
    return res.status(401).json({ msg: "Unauthorized: No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // Token is invalid or expired
      return res.status(403).json({ msg: "Forbidden: Invalid token" });
    }
    req.user = user; // Add user payload to request object
    next();
  });
};

/**
 * Middleware factory to authorize users based on their role.
 * @param {Array<string>} allowedRoles - An array of roles that are allowed to access the route.
 * @returns A middleware function that checks if the req.user.role is in the allowedRoles array.
 */
const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    // Ensure user is attached to request and has a role
    if (!req.user || !req.user.role) {
      return res.status(403).json({ msg: "Forbidden: No user role found" });
    }

    // Check if the user's role is included in the list of allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ msg: "Forbidden: You do not have the required permissions" });
    }

    // User has the required role, proceed to the next middleware/route handler
    next();
  };
};


const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "super") {
    return res.status(403).send({ msg: "Forbidden: Admins only" });
  }
  next();
};

module.exports = { authenticateToken, authorizeRole, authorizeAdmin };
