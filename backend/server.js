const express = require("express");
const pg = require("pg");
const dotenv = require("dotenv");
const { Pool } = pg;
const cors = require("cors");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER || "timetable",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_DATABASE || "TimeTable",
  password: process.env.DB_PASSWORD || "admin",
  port: process.env.DB_PORT || 5432,
});

// Export pool for use in other files
module.exports = { pool };

// Middleware Imports
const {
  authenticateToken,
  authorizeAdmin,
} = require("./middleware/authMiddleware");

// Route Imports
const authRoutes = require("./routes/auth");
const apiRoutes = require("./routes/apiRoutes"); // <-- NEW: Import API routes

// General Middleware
app.use(cors());
app.use(express.json());

// --- Mount Route Handlers ---
app.use("/api/auth", authRoutes);

// NEW: Mount protected API routes for admin data
// Any request to /api/* will first be checked for a valid token,
// then for admin role, before being passed to apiRoutes.
app.use("/api", authenticateToken, authorizeAdmin, apiRoutes);

// --- Server Startup ---
app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);

// --- Old Example Routes (Can be removed later) ---
app.get("/", (req, res) => {
  res.send({ msg: "Hello, World!" });
});

app.get("/admin/dashboard", authenticateToken, authorizeAdmin, (req, res) => {
  res.send({ msg: `Welcome to the admin dashboard, ${req.user.username}!` });
});
