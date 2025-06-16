// backend/server.js
// This line MUST be at the very top to load your .env file.
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const passport = require("passport");

// --- Import Middleware & Routes ---
const {
  authenticateToken,
  authorizeRole,
} = require("./middleware/authMiddleware");
const authRoutes = require("./routes/auth");
const facultyRoutes = require("./routes/facultyRoutes");
const apiRoutes = require("./routes/apiRoutes"); // Contains admin routes like /teachers
const profileRoutes = require("./routes/profileRoutes");

const app = express();

// --- Main Middleware Setup ---
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(passport.initialize());
require("./config/passport-setup");

// =================================================================================
// --- API ROUTE DEFINITIONS ---
// The order of the routes below is CRITICAL for security to work.
// Express matches routes from top to bottom. More specific routes MUST come first.
// =================================================================================

// --- Group 1: Public Routes (No security token needed) ---
// Handles login, registration, etc.
app.use("/api/auth", authRoutes);

// --- Group 2: Authenticated User Routes (Requires login, but any role is fine) ---
// Handles fetching a user's own profile.
app.use("/api/profile", authenticateToken, profileRoutes);

// --- Group 3: Protected FACULTY Routes (Requires 'faculty' role) ---
// This block MUST come before the general Admin block below.
// It ensures that any request starting with `/api/faculty/` is handled here and ONLY here.
app.use(
  "/api/faculty",
  authenticateToken,
  authorizeRole(["faculty"]), // SECURITY: Only allows the 'faculty' role.
  facultyRoutes
);

// --- Group 4: Protected ADMIN Routes (Requires 'admin' or 'super' role) ---
// This is a general "catch-all" for other `/api` routes, so it MUST come LAST.
// It will handle admin actions like `/api/teachers` or `/api/subjects`.
// It will NOT handle `/api/faculty/*` because that was already matched and handled by the block above.
app.use(
  "/api",
  authenticateToken,
  authorizeRole(["admin", "super"]), // SECURITY: Only allows 'admin' and 'super' roles.
  apiRoutes
);

// --- Server Startup ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
