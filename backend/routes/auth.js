const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../server"); // Import the PostgreSQL pool
const { authenticateToken } = require("../middleware/authMiddleware");
const { v4: uuidv4 } = require("uuid"); // For generating unique refresh tokens

// The /register route is commented out, assuming user creation is handled elsewhere.
// router.post("/register", ...);

router.post("/login", async (req, res) => {
  console.log("Reached the /login route");
  // MODIFIED: We now expect 'email' instead of 'username' from the frontend.
  const { email, password } = req.body;
  console.log("Login attempt for email:", email);

  // MODIFIED: Check for email and password.
  if (!email || !password) {
    return res.status(400).send({ msg: "Email and password are required" });
  }

  try {
    // MODIFIED: The SQL query now searches for a user by their email.
    const userResult = await pool.query(
      `
            SELECT u.id, u.username, u.password_hash, u.email, r.name as role
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.email = $1
        `,
      [email] // Search parameter is now email
    );

    console.log("Database query result:", userResult.rows);
    if (userResult.rows.length === 0) {
      return res.status(401).send({ msg: "Invalid credentials" });
    }

    const user = userResult.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    console.log("Password comparison result:", isValidPassword);
    if (!isValidPassword) {
      return res.status(401).send({ msg: "Invalid credentials" });
    }

    console.log("Login successful, token generated");
    // MODIFIED: Added email to the token payload for potential future use.
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const refreshToken = uuidv4();
    const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await pool.query(
      "INSERT INTO refresh_tokens (refresh_token_id, user_id, refresh_token, expiry_date) VALUES ($1, $2, $3, $4)",
      [refreshToken, user.id, refreshToken, expiryDate]
    );

    res.send({ accessToken, refreshToken, role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: "Error logging in" });
  }
});

router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ msg: "Refresh token is required" });
  }

  try {
    const refreshTokenResult = await pool.query(
      "SELECT rt.refresh_token_id, rt.user_id, rt.expiry_date, rt.revoked, u.username, u.email, r.name as role FROM refresh_tokens rt JOIN users u ON rt.user_id = u.id JOIN roles r ON u.role_id = r.id WHERE rt.refresh_token = $1",
      [refreshToken]
    );

    if (refreshTokenResult.rows.length === 0) {
      return res.status(401).json({ msg: "Invalid refresh token" });
    }

    const tokenData = refreshTokenResult.rows[0];

    if (tokenData.revoked) {
      return res.status(401).json({ msg: "Refresh token has been revoked" });
    }

    if (new Date(tokenData.expiry_date) < new Date()) {
      return res.status(401).json({ msg: "Refresh token has expired" });
    }

    const payload = {
      id: tokenData.user_id,
      username: tokenData.username,
      email: tokenData.email,
      role: tokenData.role,
    };

    const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ accessToken: newAccessToken, refreshToken });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(500).json({ msg: "Error refreshing token" });
  }
});

module.exports = router;
