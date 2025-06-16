// backend/routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const pool = require("../config/db");

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ msg: "Email and password required." });
  try {
    const userRes = await pool.query(
      "SELECT u.*, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = $1 AND u.provider = 'local'",
      [email]
    );
    if (userRes.rows.length === 0)
      return res.status(401).json({ msg: "Invalid credentials." });
    const user = userRes.rows[0];
    if (!user.password_hash)
      return res.status(401).json({ msg: "Account uses Google Sign-In." });
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return res.status(401).json({ msg: "Invalid credentials." });
    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ accessToken, role: user.role });
  } catch (err) {
    res.status(500).json({ msg: "Server error." });
  }
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed`,
    session: false,
  }),
  (req, res) => {
    const user = req.user;
    const payload = { id: user.id, email: user.email, role: user.role_name };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.redirect(
      `${process.env.CLIENT_URL}/auth/callback?token=${accessToken}&role=${payload.role}`
    );
  }
);

module.exports = router;
