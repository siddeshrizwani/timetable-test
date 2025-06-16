// backend/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

// This line is essential for loading variables from your .env file.
require("dotenv").config();

// Get the JWT_SECRET from environment variables.
const JWT_SECRET = process.env.JWT_SECRET;

// --- CRITICAL DIAGNOSTIC CHECK ---
// If the JWT_SECRET is missing, your application is insecure and will fail.
// This block will print a clear error in your terminal and stop the server.
if (!JWT_SECRET) {
  console.error("\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  console.error("!!! FATAL: JWT_SECRET is not defined in .env file !!!");
  console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  console.error("Please create a file named .env in the /backend directory.");
  console.error("Add this line to it: JWT_SECRET=your_super_secret_key_here");
  console.error("Then, restart the server.");
  process.exit(1); // Exit the process with an error code
}

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "Unauthorized: No token provided" });
  }

  // Verify the token using the secret key that was loaded at startup.
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error("JWT Verification Failed:", err.message);
      return res.status(403).json({ msg: "Forbidden: Invalid token" });
    }
    req.user = user;
    next();
  });
};

const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    // --- START OF DEBUGGING LOGS ---
    // This will print every time a protected route is hit.
    console.log("\n--- AUTHORIZATION CHECK ---");
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`Route being accessed: ${req.originalUrl}`);
    console.log("Route requires one of these roles:", allowedRoles);
    console.log("User's token contains this payload:", req.user);
    // --- END OF DEBUGGING LOGS ---

    if (!req.user || !req.user.role) {
      console.error(">>> Authorization FAILED: No role found in token.");
      return res
        .status(403)
        .json({ msg: "Forbidden: No user role found in token" });
    }

    const hasPermission = allowedRoles.includes(req.user.role);

    if (!hasPermission) {
      console.error(
        `>>> Authorization FAILED: User role "${
          req.user.role
        }" is not in the allowed list [${allowedRoles.join(", ")}].`
      );
      return res
        .status(403)
        .json({ msg: "Forbidden: You do not have the required permissions" });
    }

    // If the check passes, log it and continue.
    console.log(">>> Authorization successful.");
    console.log("---------------------------\n");
    next();
  };
};

const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "super") {
    return res.status(403).json({ msg: "Forbidden: Admin access required" });
  }
  next();
};

module.exports = {
  authenticateToken,
  authorizeRole,
  authorizeAdmin,
};
