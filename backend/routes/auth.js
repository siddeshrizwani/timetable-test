// backend/routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const pool = require("../config/db");

/**
 * @route   POST /api/auth/login
 * @desc    Handles login for users with a local email and password.
 * @access  Public
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res
      .status(400)
      .json({ msg: "Please provide both email and password." });
  }

  try {
    // --- THIS IS THE CRITICAL FIX ---
    // The query now joins with the 'roles' table to fetch the role name (e.g., 'faculty', 'admin').
    const query = `
      SELECT u.*, r.name as role 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE u.email = $1 AND u.provider = 'local'
    `;
    const userResult = await pool.query(query, [email]);

    // Check if a user with that email and 'local' provider exists.
    if (userResult.rows.length === 0) {
      return res.status(401).json({ msg: "Invalid credentials." });
    }

    const user = userResult.rows[0];

    // Check if the account has a password. If not, it's likely a Google-only account.
    if (!user.password_hash) {
      return res
        .status(401)
        .json({
          msg: "This account uses Google Sign-In. Please log in with Google.",
        });
    }

    // Compare the provided password with the stored hash.
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ msg: "Invalid credentials." });
    }

    // --- TOKEN CREATION FIX ---
    // The payload for the JWT now correctly includes the 'role' we fetched.
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role, // This value now comes directly from the database query
    };

    // Sign the token with the secret key and set an expiration time.
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h", // Token expires in 1 hour
    });

    // Send the token and user details (excluding password) back to the client.
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res
      .status(500)
      .json({ msg: "An internal server error occurred during login." });
  }
});

// --- Google OAuth Routes (No changes needed here) ---

/**
 * @route   GET /api/auth/google
 * @desc    Initiates the Google OAuth login flow.
 * @access  Public
 */
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/**
 * @route   GET /api/auth/google/callback
 * @desc    The callback URL that Google redirects to after successful authentication.
 * @access  Public
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    // Redirect to the frontend login page on failure.
    failureRedirect: `${
      process.env.CLIENT_URL || "http://localhost:5173"
    }/login?error=google_auth_failed`,
    session: false, // We are using JWTs, so no server session is needed.
  }),
  (req, res) => {
    // The 'user' object is attached by the passport-setup strategy.
    const user = req.user;

    // The passport strategy already provides the role name correctly.
    const payload = { id: user.id, email: user.email, role: user.role_name };

    // Sign a token for the Google user.
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Redirect the user back to a special frontend route to handle the token.
    res.redirect(
      `${
        process.env.CLIENT_URL || "http://localhost:5173"
      }/auth/callback?token=${token}`
    );
  }
);

module.exports = router;
