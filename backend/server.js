const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pg = require("pg");
const dotenv = require("dotenv");
const { Pool } = pg;
const cors = require("cors");

dotenv.config();

const app = express();
const PORT = 3000;

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER || "timetable",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_DATABASE || "TimeTable",
  password: process.env.DB_PASSWORD || "admin",
  port: process.env.DB_PORT || 5432,
});

// Export pool
module.exports = { pool };

// Import authRoutes AFTER pool is exported
const authRoutes = require("./routes/auth");
const {
  authenticateToken,
  authorizeAdmin,
} = require("./middleware/authMiddleware");

app.use(express.json());

// Use the cors middleware - ADD THIS LINE HERE, BEFORE mounting routes
app.use(cors());

// Mount route handlers
app.use("/api/auth", authRoutes);

app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);

app.get("/", (req, res) => {
  res.send({ msg: "Hello, World!" });
});

// Admin route with middleware
app.get("/admin/dashboard", authenticateToken, authorizeAdmin, (req, res) => {
  res.send({ msg: `Welcome to the admin dashboard, ${req.user.username}!` });
});

// Get all users - only for super users
app.get("/admin/users", authenticateToken, async (req, res) => {
  if (req.user.role !== "super") {
    return res
      .status(403)
      .send({ msg: "Forbidden: Only super users can view all users" });
  }

  try {
    const usersResult = await pool.query(`
      SELECT u.id, u.username, r.name as role
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ORDER BY u.id
    `);

    res.send(usersResult.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send({ msg: "Error retrieving users" });
  }
});
